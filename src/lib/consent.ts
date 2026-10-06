/**
 * Choix de consentement aux cookies publicitaires (Meta Pixel).
 * « ads » : accepté ; « none » : refusé. Absent : on demande.
 * Le choix est conservé 6 mois (recommandation CNIL), puis redemandé.
 */

export const CONSENT_COOKIE = "reso_consent";
export const CONSENT_MAX_AGE_S = 182 * 24 * 3600;
/** Événement émis sur `window` quand le choix change, ou pour rouvrir le bandeau. */
export const CONSENT_EVENT = "reso:consent";
export const CONSENT_OPEN_EVENT = "reso:consent-open";

export type ConsentChoice = "ads" | "none";

export function parseConsent(raw: string | undefined | null): ConsentChoice | null {
  return raw === "ads" || raw === "none" ? raw : null;
}

export function hasAdsConsent(raw: string | undefined | null): boolean {
  return parseConsent(raw) === "ads";
}

/** Lecture d'un cookie dans `document.cookie` (côté navigateur). */
export function readCookie(cookieHeader: string, name: string): string | undefined {
  for (const part of cookieHeader.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return v.join("=");
  }
  return undefined;
}
