"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getSql } from "@/server/db";
import { absoluteUrl, getEmailSender } from "@/server/email";
import { getRateLimiters } from "@/server/rate-limit";
import { isValidEmail, normalizeEmail } from "@/server/waitlist/email-normalize";
import { generateToken, hashToken, looksLikeToken } from "@/server/waitlist/tokens";
import { passwordResetEmail, verifyEmailEmail } from "./emails";
import { hashPassword, isAcceptablePassword, verifyPassword } from "./password";
import { createSession, destroySession, getCurrentUser, revokeAllSessions } from "./session";

export type AuthState = { error?: string; fieldErrors?: Record<string, string>; success?: string } | null;

const GENERIC_ERROR = "Une erreur est survenue. Réessayez dans quelques instants.";

async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "unknown";
}

function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/app";
}

const emailSchema = z.string().trim().max(254).refine((v) => isValidEmail(v), "Saisissez une adresse email valide.");

// ------------------------------------------------------------------ inscription
const signUpSchema = z.object({
  fullName: z.string().trim().min(2, "Indiquez votre nom.").max(120),
  email: emailSchema,
  password: z.string().refine(isAcceptablePassword, "8 caractères minimum."),
});

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!getRateLimiters().auth.hit(`signup:${await clientIp()}`)) {
    return { error: "Trop de tentatives. Réessayez un peu plus tard." };
  }
  const parsed = signUpSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { fieldErrors };
  }
  const email = normalizeEmail(parsed.data.email);
  const sql = getSql();
  let userId: string;
  try {
    const existing = await sql`select id from users where email = ${email}`;
    if (existing.length > 0) {
      return { fieldErrors: { email: "Un compte existe déjà avec cette adresse. Connectez-vous." } };
    }
    const passwordHash = await hashPassword(parsed.data.password);
    const [row] = await sql<Array<{ id: string }>>`
      insert into users (email, password_hash, full_name) values (${email}, ${passwordHash}, ${parsed.data.fullName}) returning id`;
    userId = row.id;
  } catch (error) {
    console.error("[auth] inscription échouée", error instanceof Error ? error.message : error);
    return { error: GENERIC_ERROR };
  }
  await sendVerificationEmail(userId, email).catch(() => undefined);
  await createSession(userId);
  redirect("/app/bienvenue");
}

async function sendVerificationEmail(userId: string, email: string): Promise<void> {
  const raw = generateToken();
  await getSql()`
    insert into auth_tokens (token_hash, user_id, purpose, expires_at)
    values (${hashToken(raw)}, ${userId}, 'verify_email', ${new Date(Date.now() + 48 * 3600_000)})`;
  await getEmailSender().send(verifyEmailEmail(email, absoluteUrl(`/verifier-email?token=${raw}`)));
}

// ------------------------------------------------------------------ connexion
export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const ip = await clientIp();
  if (!getRateLimiters().auth.hit(`signin:${ip}`)) {
    return { error: "Trop de tentatives. Réessayez un peu plus tard." };
  }
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));
  if (!isValidEmail(email) || !password) {
    return { error: "Email ou mot de passe incorrect." };
  }
  let userId: string | null = null;
  try {
    const rows = await getSql()<Array<{ id: string; password_hash: string }>>`
      select id, password_hash from users where email = ${email}`;
    const row = rows[0];
    const ok = row ? await verifyPassword(password, row.password_hash) : await verifyPassword(password, DUMMY_HASH);
    if (row && ok) userId = row.id;
  } catch (error) {
    console.error("[auth] connexion échouée", error instanceof Error ? error.message : error);
    return { error: GENERIC_ERROR };
  }
  if (!userId) return { error: "Email ou mot de passe incorrect." };
  await createSession(userId);
  redirect(next);
}

/** Empreinte factice pour garder un temps de réponse constant quand l'email est inconnu. */
const DUMMY_HASH =
  "scrypt$16384$8$1$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

export async function signOut(): Promise<void> {
  await destroySession();
  redirect("/connexion");
}

// ------------------------------------------------------------------ mot de passe oublié
const SENT_MESSAGE = "Si un compte existe avec cette adresse, un email vient de vous être envoyé.";

export async function requestPasswordReset(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!getRateLimiters().auth.hit(`reset:${await clientIp()}`)) {
    return { error: "Trop de tentatives. Réessayez un peu plus tard." };
  }
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  if (!isValidEmail(email)) return { fieldErrors: { email: "Saisissez une adresse email valide." } };
  try {
    const sql = getSql();
    const rows = await sql<Array<{ id: string }>>`select id from users where email = ${email}`;
    if (rows[0]) {
      const raw = generateToken();
      await sql`
        insert into auth_tokens (token_hash, user_id, purpose, expires_at)
        values (${hashToken(raw)}, ${rows[0].id}, 'reset_password', ${new Date(Date.now() + 3600_000)})`;
      await getEmailSender().send(passwordResetEmail(email, absoluteUrl(`/reinitialiser?token=${raw}`)));
    }
  } catch (error) {
    console.error("[auth] demande de réinitialisation échouée", error instanceof Error ? error.message : error);
    return { error: GENERIC_ERROR };
  }
  return { success: SENT_MESSAGE };
}

export async function resetPassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!looksLikeToken(token)) return { error: "Ce lien n’est pas valide. Demandez un nouvel email." };
  if (!isAcceptablePassword(password)) return { fieldErrors: { password: "8 caractères minimum." } };
  const sql = getSql();
  try {
    const rows = await sql<Array<{ user_id: string }>>`
      update auth_tokens set used_at = now()
      where token_hash = ${hashToken(token)} and purpose = 'reset_password' and used_at is null and expires_at > now()
      returning user_id`;
    const row = rows[0];
    if (!row) return { error: "Ce lien a expiré ou a déjà été utilisé. Demandez un nouvel email." };
    await sql`update users set password_hash = ${await hashPassword(password)} where id = ${row.user_id}`;
    await revokeAllSessions(row.user_id);
    await createSession(row.user_id);
  } catch (error) {
    console.error("[auth] réinitialisation échouée", error instanceof Error ? error.message : error);
    return { error: GENERIC_ERROR };
  }
  redirect("/app");
}

// ------------------------------------------------------------------ vérification d'email
export async function verifyEmailToken(token: string): Promise<"ok" | "invalid"> {
  if (!looksLikeToken(token)) return "invalid";
  const sql = getSql();
  const rows = await sql<Array<{ user_id: string }>>`
    update auth_tokens set used_at = now()
    where token_hash = ${hashToken(token)} and purpose = 'verify_email' and used_at is null and expires_at > now()
    returning user_id`;
  if (!rows[0]) return "invalid";
  await sql`update users set email_verified_at = coalesce(email_verified_at, now()) where id = ${rows[0].user_id}`;
  return "ok";
}

export async function resendVerification(): Promise<void> {
  const user = await getCurrentUser();
  if (!user || user.emailVerifiedAt) return;
  if (!getRateLimiters().auth.hit(`verify:${user.id}`)) return;
  await sendVerificationEmail(user.id, user.email).catch(() => undefined);
}

