import { offer } from "@/config/offer";

const MAX_BODY_BYTES = 8 * 1024;

/**
 * Vérifie que la requête navigateur provient bien de notre origine (§13).
 * Les clients sans en-tête Origin ni Referer (rares navigateurs anciens,
 * outils) sont refusés pour les POST publics.
 */
export function isSameOrigin(request: Request): boolean {
  const allowed = new Set<string>([new URL(offer.siteUrl).origin]);
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (host) {
    const proto = request.headers.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
    allowed.add(`${proto}://${host}`);
  }
  const origin = request.headers.get("origin");
  if (origin) return allowed.has(origin);
  const referer = request.headers.get("referer");
  if (referer) {
    try {
      return allowed.has(new URL(referer).origin);
    } catch {
      return false;
    }
  }
  return false;
}

/** Adresse IP cliente approximative pour la limitation de débit. */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export class BodyTooLargeError extends Error {}

/** Lit le corps en limitant sa taille à 8 Ko (§10). */
export async function readLimitedBody(request: Request): Promise<string> {
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (declared > MAX_BODY_BYTES) throw new BodyTooLargeError();
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) throw new BodyTooLargeError();
  return text;
}

export function isFormEncoded(request: Request): boolean {
  return (request.headers.get("content-type") ?? "").includes("application/x-www-form-urlencoded");
}

export function isAuthorizedInternal(request: Request): boolean {
  // INTERNAL_TASKS_SECRET (cron externe) ou CRON_SECRET (crons Vercel, en-tête ajouté automatiquement).
  const secrets = [process.env.INTERNAL_TASKS_SECRET?.trim(), process.env.CRON_SECRET?.trim()].filter((s): s is string => Boolean(s));
  if (secrets.length === 0) return false;
  const header = request.headers.get("authorization") ?? "";
  return secrets.some((secret) => header === `Bearer ${secret}`);
}
