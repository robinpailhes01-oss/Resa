import { alertOps } from "@/server/alerts";
import { absoluteUrl, getEmailSender } from "@/server/email";
import { confirmationEmail } from "@/server/email/templates";
import { EmailProviderError } from "@/server/email/types";
import { normalizeEmail } from "./email-normalize";
import type { WaitlistRequest } from "./schema";
import { getWaitlistStore } from "./store";
import { generateToken, hashToken, looksLikeToken } from "./tokens";
import type { Attribution, NewEntryInput, WaitlistStore } from "./types";

export const CONFIRM_TOKEN_TTL_MS = 48 * 60 * 60 * 1000;
const EMAILS_PER_ADDRESS_PER_HOUR = Number.parseInt(process.env.RATE_LIMIT_EMAIL_MAX ?? "3", 10) || 3;
const IDEMPOTENCY_TTL_MS = 10 * 60 * 1000;
const MAX_EMAIL_ATTEMPTS = 5;
const BACKOFF_MS = [60_000, 5 * 60_000, 30 * 60_000, 2 * 60 * 60_000];

export type RequestOutcome = { kind: "accepted"; taskCreated: boolean };

type Deps = { store?: WaitlistStore; now?: () => Date };

async function resolveStore(deps: Deps): Promise<WaitlistStore> {
  return deps.store ?? getWaitlistStore();
}

function sanitizeAttribution(input: WaitlistRequest["attribution"]): Attribution | null {
  if (!input) return null;
  const out: Attribution = {};
  for (const [key, value] of Object.entries(input)) {
    if (typeof value === "string" && value.trim()) out[key as keyof Attribution] = value.trim().slice(0, 64);
  }
  return Object.keys(out).length > 0 ? out : null;
}

/**
 * Enregistre une demande d'inscription (§10) :
 * - une seule fiche par email normalisé ;
 * - la demande et la tâche d'envoi sont créées dans une même transaction ;
 * - un doublon reçoit la même réponse publique ; les envois sont plafonnés ;
 * - la clé d'idempotence neutralise les réessais navigateur.
 */
export async function requestWaitlistSignup(input: WaitlistRequest, deps: Deps = {}): Promise<RequestOutcome> {
  const store = await resolveStore(deps);
  const now = deps.now?.() ?? new Date();

  if (input.idempotencyKey) {
    const fresh = await store.rememberIdempotencyKey(input.idempotencyKey, new Date(now.getTime() + IDEMPOTENCY_TTL_MS), now);
    if (!fresh) return { kind: "accepted", taskCreated: false };
  }

  try {
    return await registerRequest(store, input, now);
  } catch (error) {
    // La demande n'a pas été enregistrée : un réessai avec la même clé doit pouvoir aboutir.
    if (input.idempotencyKey) await store.forgetIdempotencyKey(input.idempotencyKey).catch(() => undefined);
    throw error;
  }
}

async function registerRequest(store: WaitlistStore, input: WaitlistRequest, now: Date): Promise<RequestOutcome> {
  const emailOriginal = input.email.trim();
  const emailNormalized = normalizeEmail(emailOriginal);
  const entryInput: NewEntryInput = {
    emailNormalized,
    emailOriginal,
    businessType: input.businessType ?? null,
    teamSize: input.teamSize ?? null,
    privacyVersion: input.privacyVersion,
    source: input.source,
    attribution: sanitizeAttribution(input.attribution),
  };

  const existing = await store.findByEmail(emailNormalized);

  if (!existing) {
    await store.createEntryWithTask(entryInput, now);
    return { kind: "accepted", taskCreated: true };
  }

  if (existing.status === "confirmed") {
    // Déjà inscrit : même réponse publique, aucun nouvel email.
    return { kind: "accepted", taskCreated: false };
  }

  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const recent = await store.countTasksSince(existing.id, oneHourAgo);
  if (recent >= EMAILS_PER_ADDRESS_PER_HOUR) {
    return { kind: "accepted", taskCreated: false };
  }

  if (existing.status === "unsubscribed") {
    await store.reopenEntryWithTask(existing.id, entryInput, now);
    return { kind: "accepted", taskCreated: true };
  }

  // En attente : renvoi d'un email de confirmation, plafonné.
  await store.createTask(existing.id, "confirmation", now);
  return { kind: "accepted", taskCreated: true };
}

export type ProcessSummary = { claimed: number; sent: number; failed: number };

/**
 * Traite les tâches d'envoi dues : génère le jeton (stocké haché), envoie
 * l'email, marque la tâche. En cas d'échec, réessai avec backoff puis
 * alerte après le nombre maximal de tentatives.
 */
export async function processEmailTasks(limit = 20, deps: Deps = {}): Promise<ProcessSummary> {
  const store = await resolveStore(deps);
  const now = deps.now?.() ?? new Date();
  const summary: ProcessSummary = { claimed: 0, sent: 0, failed: 0 };

  let sender;
  try {
    sender = getEmailSender();
  } catch (error) {
    await alertOps("Fournisseur email non configuré : tâches laissées en attente", { error: String(error) });
    return summary;
  }

  const claimed = await store.claimDueTasks(limit, now);
  summary.claimed = claimed.length;

  for (const { task, entry } of claimed) {
    if (entry.status !== "pending") {
      await store.markTaskSent(task.id, now); // plus rien à envoyer
      continue;
    }
    try {
      const raw = generateToken();
      await store.saveToken({
        tokenHash: hashToken(raw),
        entryId: entry.id,
        purpose: "confirm",
        createdAt: now,
        expiresAt: new Date(now.getTime() + CONFIRM_TOKEN_TTL_MS),
        usedAt: null,
      });
      const url = absoluteUrl(`/confirmer-inscription?token=${raw}`);
      await sender.send(confirmationEmail(entry.emailOriginal, url));
      await store.markTaskSent(task.id, now);
      summary.sent += 1;
    } catch (error) {
      const attempts = task.attempts + 1;
      const retryable = !(error instanceof EmailProviderError) || error.retryable;
      const message = error instanceof Error ? error.message : String(error);
      const next = retryable && attempts < MAX_EMAIL_ATTEMPTS ? new Date(now.getTime() + BACKOFF_MS[Math.min(attempts - 1, BACKOFF_MS.length - 1)]) : null;
      await store.markTaskFailed(task.id, message.slice(0, 500), next, now);
      summary.failed += 1;
      if (!next) {
        await alertOps("Envoi email abandonné après échecs répétés", { taskId: task.id, attempts, provider: sender.name });
      }
    }
  }
  return summary;
}

export type ConfirmOutcome = "confirmed" | "already_confirmed" | "expired" | "invalid";

/** POST /confirmer-inscription : consomme le jeton une seule fois (§10). */
export async function confirmWaitlistSignup(rawToken: string, deps: Deps = {}): Promise<ConfirmOutcome> {
  if (!looksLikeToken(rawToken)) return "invalid";
  const store = await resolveStore(deps);
  const now = deps.now?.() ?? new Date();
  const lookup = await store.findToken(hashToken(rawToken));
  if (!lookup || lookup.token.purpose !== "confirm") return "invalid";
  if (lookup.token.usedAt) return lookup.entry.status === "confirmed" ? "already_confirmed" : "invalid";
  if (lookup.token.expiresAt && lookup.token.expiresAt < now) return "expired";
  const ok = await store.confirmEntry(lookup.entry.id, lookup.token.tokenHash, now);
  if (!ok) return "already_confirmed";

  // Jeton de désinscription distinct, sans expiration, pour les emails futurs.
  const unsubscribeRaw = generateToken();
  await store.saveToken({
    tokenHash: hashToken(unsubscribeRaw),
    entryId: lookup.entry.id,
    purpose: "unsubscribe",
    createdAt: now,
    expiresAt: null,
    usedAt: null,
  });
  return "confirmed";
}

/** Aperçu non destructif du jeton pour l'écran GET de confirmation. */
export async function peekConfirmToken(rawToken: string, deps: Deps = {}): Promise<ConfirmOutcome | "valid"> {
  if (!looksLikeToken(rawToken)) return "invalid";
  const store = await resolveStore(deps);
  const now = deps.now?.() ?? new Date();
  const lookup = await store.findToken(hashToken(rawToken));
  if (!lookup || lookup.token.purpose !== "confirm") return "invalid";
  if (lookup.token.usedAt) return lookup.entry.status === "confirmed" ? "already_confirmed" : "invalid";
  if (lookup.token.expiresAt && lookup.token.expiresAt < now) return "expired";
  return "valid";
}

export type UnsubscribeOutcome = "unsubscribed" | "invalid";

/** POST /desinscription : retire l'inscription sans compte (§10, §16). */
export async function unsubscribeFromWaitlist(rawToken: string, deps: Deps = {}): Promise<UnsubscribeOutcome> {
  if (!looksLikeToken(rawToken)) return "invalid";
  const store = await resolveStore(deps);
  const now = deps.now?.() ?? new Date();
  const lookup = await store.findToken(hashToken(rawToken));
  if (!lookup || lookup.token.purpose !== "unsubscribe") return "invalid";
  const ok = await store.unsubscribeEntry(lookup.entry.id, lookup.token.tokenHash, now);
  return ok ? "unsubscribed" : "invalid";
}

export async function peekUnsubscribeToken(rawToken: string, deps: Deps = {}): Promise<"valid" | "invalid"> {
  if (!looksLikeToken(rawToken)) return "invalid";
  const store = await resolveStore(deps);
  const lookup = await store.findToken(hashToken(rawToken));
  return lookup && lookup.token.purpose === "unsubscribe" ? "valid" : "invalid";
}

/** Purge documentée (§15) : 7 jours pour les demandes non confirmées, 12 mois pour la liste confirmée. */
export async function purgeWaitlist(deps: Deps = {}): Promise<number> {
  const store = await resolveStore(deps);
  const now = deps.now?.() ?? new Date();
  const pendingDays = Number.parseInt(process.env.WAITLIST_PENDING_RETENTION_DAYS ?? "7", 10) || 7;
  const confirmedMonths = Number.parseInt(process.env.WAITLIST_CONFIRMED_RETENTION_MONTHS ?? "12", 10) || 12;
  const pendingBefore = new Date(now.getTime() - pendingDays * 24 * 60 * 60 * 1000);
  const confirmedBefore = new Date(now);
  confirmedBefore.setMonth(confirmedBefore.getMonth() - confirmedMonths);
  return store.purge({ pendingBefore, confirmedBefore, now });
}
