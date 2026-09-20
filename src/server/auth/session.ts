import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { getSql } from "@/server/db";
import { generateToken, hashToken } from "@/server/waitlist/tokens";

export const SESSION_COOKIE = "reso_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const TOUCH_INTERVAL_MS = 60 * 60 * 1000;

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  emailVerifiedAt: Date | null;
}

type UserRow = { id: string; email: string; full_name: string; email_verified_at: Date | null };

function cookieOptions(expires: Date) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  };
}

/** Crée une session en base et pose le cookie (jeton brut dans le cookie, empreinte en base). */
export async function createSession(userId: string): Promise<void> {
  const sql = getSql();
  const raw = generateToken();
  const expires = new Date(Date.now() + SESSION_TTL_MS);
  const userAgent = (await headers()).get("user-agent")?.slice(0, 200) ?? null;
  await sql`
    insert into sessions (user_id, token_hash, expires_at, user_agent)
    values (${userId}, ${hashToken(raw)}, ${expires}, ${userAgent})`;
  (await cookies()).set(SESSION_COOKIE, raw, cookieOptions(expires));
}

/** Supprime la session courante (base + cookie). */
export async function destroySession(): Promise<void> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (raw) {
    try {
      await getSql()`delete from sessions where token_hash = ${hashToken(raw)}`;
    } catch {
      // La déconnexion doit aboutir même si la base est indisponible.
    }
  }
  store.set(SESSION_COOKIE, "", { ...cookieOptions(new Date(0)), maxAge: 0 });
}

/** Révoque toutes les sessions d'un utilisateur (changement de mot de passe). */
export async function revokeAllSessions(userId: string): Promise<void> {
  await getSql()`delete from sessions where user_id = ${userId}`;
}

/**
 * Utilisateur courant, mis en cache pour la durée de la requête.
 * Prolonge discrètement la session au plus une fois par heure.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const raw = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!raw || raw.length < 40) return null;
  const sql = getSql();
  const rows = await sql<Array<UserRow & { session_id: string; last_seen_at: Date }>>`
    select u.id, u.email, u.full_name, u.email_verified_at, s.id as session_id, s.last_seen_at
    from sessions s join users u on u.id = s.user_id
    where s.token_hash = ${hashToken(raw)} and s.expires_at > now()
    limit 1`;
  const row = rows[0];
  if (!row) return null;
  if (Date.now() - new Date(row.last_seen_at).getTime() > TOUCH_INTERVAL_MS) {
    void sql`update sessions set last_seen_at = now(), expires_at = ${new Date(Date.now() + SESSION_TTL_MS)} where id = ${row.session_id}`.catch(() => undefined);
  }
  return { id: row.id, email: row.email, fullName: row.full_name, emailVerifiedAt: row.email_verified_at };
});
