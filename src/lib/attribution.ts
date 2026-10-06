/**
 * Origine d'une visite (UTM, identifiant de clic Meta), conservée dans un cookie
 * propriétaire pour être rattachée au compte à l'inscription. Premier contact :
 * un cookie existant n'est jamais écrasé. Aucune donnée personnelle ici.
 */

export const ATTRIBUTION_COOKIE = "reso_src";
export const ATTRIBUTION_MAX_AGE_S = 30 * 24 * 3600;

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
type UtmKey = (typeof UTM_KEYS)[number];

export type Attribution = Partial<Record<UtmKey, string>> & {
  fbclid?: string;
  /** Horodatage du clic Meta (ms), pour le format `fbc`. */
  fbclidAt?: number;
  landingPath?: string;
  referrerHost?: string;
  firstSeenAt?: string;
};

function clean(value: string | null | undefined, max = 80): string | undefined {
  const v = value?.trim();
  if (!v) return undefined;
  // Valeurs de campagne : lettres, chiffres et quelques séparateurs ; le reste est retiré.
  const safe = v.replace(/[^\p{L}\p{N}_.\-+ ]/gu, "").slice(0, max);
  return safe || undefined;
}

/** Lit l'origine dans l'adresse de la page. `null` si aucun paramètre de campagne. */
export function attributionFromUrl(url: URL, referrer: string | null, now: Date): Attribution | null {
  const out: Attribution = {};
  for (const key of UTM_KEYS) {
    const value = clean(url.searchParams.get(key));
    if (value) out[key] = value;
  }
  const fbclid = url.searchParams.get("fbclid")?.trim();
  if (fbclid && /^[\w-]{10,500}$/.test(fbclid)) {
    out.fbclid = fbclid;
    out.fbclidAt = now.getTime();
  }
  if (Object.keys(out).length === 0) return null;
  // Un clic Meta sans UTM reste attribué à Meta.
  if (out.fbclid && !out.utm_source) out.utm_source = "meta";
  out.landingPath = url.pathname.slice(0, 120);
  out.referrerHost = referrerHostOf(referrer);
  out.firstSeenAt = now.toISOString();
  return out;
}

export function referrerHostOf(referrer: string | null): string | undefined {
  if (!referrer) return undefined;
  try {
    return new URL(referrer).hostname.slice(0, 120) || undefined;
  } catch {
    return undefined;
  }
}

/** Identifiant de clic au format attendu par Meta (`fb.1.<horodatage>.<fbclid>`). */
export function fbcFrom(attribution: Attribution): string | undefined {
  return attribution.fbclid && attribution.fbclidAt ? `fb.1.${attribution.fbclidAt}.${attribution.fbclid}` : undefined;
}

/** Sans consentement publicitaire, l'identifiant de clic Meta n'est pas conservé. */
export function withoutAdIds(attribution: Attribution): Attribution {
  const rest = { ...attribution };
  delete rest.fbclid;
  delete rest.fbclidAt;
  return rest;
}

export function encodeAttribution(attribution: Attribution): string {
  return encodeURIComponent(JSON.stringify(attribution));
}

export function decodeAttribution(raw: string | undefined | null): Attribution | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(decodeURIComponent(raw));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    const p = parsed as Record<string, unknown>;
    const out: Attribution = {};
    for (const key of UTM_KEYS) {
      const value = clean(typeof p[key] === "string" ? (p[key] as string) : undefined);
      if (value) out[key] = value;
    }
    if (typeof p.fbclid === "string" && /^[\w-]{10,500}$/.test(p.fbclid)) out.fbclid = p.fbclid;
    if (typeof p.fbclidAt === "number" && Number.isFinite(p.fbclidAt)) out.fbclidAt = p.fbclidAt;
    if (typeof p.landingPath === "string") out.landingPath = p.landingPath.slice(0, 120);
    if (typeof p.referrerHost === "string") out.referrerHost = p.referrerHost.slice(0, 120);
    if (typeof p.firstSeenAt === "string" && !Number.isNaN(Date.parse(p.firstSeenAt))) out.firstSeenAt = p.firstSeenAt;
    return out;
  } catch {
    return null;
  }
}

/** Pages où le site Reso mesure : jamais l'espace pro, l'admin, ni les pages des salons et de leurs clients. */
export function isTrackedPath(pathname: string): boolean {
  return !/^\/(app|admin|r|rdv|api)(\/|$)/.test(pathname);
}
