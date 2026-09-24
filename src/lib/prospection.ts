/**
 * Prospection sortante : fonctions pures (rotation des recherches, détection de
 * l'outil de réservation, extraction d'emails, mise en forme du récap).
 */

import type { ProspectionCategory } from "@/config/prospection";

export interface PlannedQuery {
  category: ProspectionCategory;
  city: string;
  /** Texte envoyé à Google Places. */
  text: string;
}

/** Numéro du jour (UTC) depuis l'époque : sert d'index de rotation stable. */
export function dayIndex(now: Date): number {
  return Math.floor(now.getTime() / 86_400_000);
}

/**
 * Recherches du jour : on avance de `perDay` couples (catégorie, ville) par
 * jour, en parcourant toutes les villes d'une catégorie avant la suivante,
 * puis on recommence (les nouveaux établissements apparaissent avec le temps).
 */
export function planQueries(now: Date, categories: ProspectionCategory[], cities: string[], perDay: number): PlannedQuery[] {
  const total = categories.length * cities.length;
  if (total === 0 || perDay <= 0) return [];
  const start = (dayIndex(now) * perDay) % total;
  const out: PlannedQuery[] = [];
  for (let k = 0; k < Math.min(perDay, total); k += 1) {
    const idx = (start + k) % total;
    const category = categories[Math.floor(idx / cities.length)]!;
    const city = cities[idx % cities.length]!;
    out.push({ category, city, text: `${category.query} ${city}` });
  }
  return out;
}

export type BookingProvider = "planity" | "treatwell" | "kiute" | "flexybeauty" | "fresha" | "autre";

const PROVIDER_PATTERNS: Array<[BookingProvider, RegExp]> = [
  ["planity", /planity\.com/i],
  ["treatwell", /treatwell\.(fr|com)/i],
  ["kiute", /kiute\.(fr|com)|kiute-widget/i],
  ["flexybeauty", /flexybeauty\.com/i],
  ["fresha", /fresha\.com/i],
  ["autre", /wavy\.co|setmore\.com|simplybook\.(me|it)|bookingsoft|zenchef|calendly\.com|resamania|shortcuts\.fr|bewe\.io|salonkee|beautyplanner|agendize|rdv360|jeprendsrdv|clicrdv/i],
];

export const providerLabels: Record<BookingProvider, string> = {
  planity: "Planity",
  treatwell: "Treatwell",
  kiute: "Kiute",
  flexybeauty: "Flexy Beauty",
  fresha: "Fresha",
  autre: "votre outil actuel",
};

/** Outil de réservation reconnu dans une URL de site ou dans le HTML d'une page. */
export function detectBookingProvider(...sources: Array<string | null | undefined>): BookingProvider | null {
  const text = sources.filter(Boolean).join("\n");
  for (const [provider, pattern] of PROVIDER_PATTERNS) if (pattern.test(text)) return provider;
  return null;
}

/** Le site déclaré sur la fiche Google est-il directement une page d'un outil de réservation (pas de site propre) ? */
export function isBookingPlatformUrl(website: string | null | undefined): boolean {
  if (!website) return false;
  try {
    const host = new URL(website).hostname;
    return /(^|\.)(planity\.com|treatwell\.(fr|com)|kiute\.(fr|com)|flexybeauty\.com|fresha\.com|wavy\.co|salonkee\.(fr|com)|bewe\.io)$/i.test(host);
  } catch {
    return false;
  }
}

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const IGNORED_DOMAINS = /(^|\.)(example\.com|sentry\.io|wixpress\.com|wix\.com|squarespace\.com|shopify\.com|godaddy\.com|jimdo\.com|domain\.com|email\.com|yourdomain\.com|planity\.com|treatwell\.(fr|com)|google\.com|facebook\.com|instagram\.com|apple\.com|w3\.org|schema\.org|2x\.png)$/i;
const IGNORED_LOCAL = /^(no-?reply|ne-?pas-?repondre|donotreply|mailer-daemon|postmaster|abuse|webmaster|dpo|rgpd|privacy|support|jobs?|recrutement|presse|press|admin|test|user|email|name|nom|prenom|firstname|lastname|votre|your|info@example)$/i;

/** Emails plausibles trouvés dans un HTML : filtre les images, faux positifs et adresses techniques. */
export function extractEmails(html: string): string[] {
  const decoded = html.replace(/&#64;|&commat;/gi, "@").replace(/\[at\]|\(at\)|\s+at\s+/gi, "@").replace(/%40/g, "@");
  const found = new Set<string>();
  for (const raw of decoded.match(EMAIL_RE) ?? []) {
    const email = raw.toLowerCase().replace(/^[._-]+/, "").replace(/\.+$/, "");
    const [local, domain] = email.split("@");
    if (!local || !domain) continue;
    if (/\.(png|jpe?g|gif|svg|webp|css|js|woff2?)$/i.test(domain)) continue;
    if (IGNORED_DOMAINS.test(domain)) continue;
    if (IGNORED_LOCAL.test(local)) continue;
    if (local.length > 64 || email.length > 254) continue;
    found.add(email);
  }
  return [...found];
}

/** Choisit l'adresse la plus pertinente : même domaine que le site d'abord, puis contact@ / bonjour@ / hello@, puis la première. */
export function pickBestEmail(emails: string[], website: string | null): string | null {
  if (emails.length === 0) return null;
  let host: string | null = null;
  try {
    host = website ? new URL(website).hostname.replace(/^www\./, "") : null;
  } catch {
    host = null;
  }
  const score = (email: string): number => {
    const [local, domain] = email.split("@") as [string, string];
    let s = 0;
    if (host && domain === host) s += 10;
    if (/^(contact|bonjour|hello|salon|institut|rdv|reservation|info)$/.test(local)) s += 3;
    if (/gmail|hotmail|outlook|yahoo|orange|free|sfr|wanadoo|laposte|icloud/.test(domain)) s += 1;
    return s;
  };
  return [...emails].sort((a, b) => score(b) - score(a))[0] ?? null;
}

/** Liens de contact d'une page d'accueil (chemins relatifs résolus), pour y chercher un email. */
export function findContactLinks(html: string, baseUrl: string): string[] {
  const out = new Set<string>();
  for (const match of html.matchAll(/href=["']([^"'#]+)["']/gi)) {
    const href = match[1]!;
    if (!/contact|nous-?trouver|infos?-?pratiques|a-?propos|about|mentions/i.test(href)) continue;
    try {
      const url = new URL(href, baseUrl);
      if (url.hostname !== new URL(baseUrl).hostname) continue;
      if (!/^https?:$/.test(url.protocol)) continue;
      out.add(url.toString());
    } catch {
      /* lien invalide ignoré */
    }
    if (out.size >= 2) break;
  }
  return [...out];
}

/** Jour ouvré à Paris (lundi à vendredi) : on n'envoie pas d'email de prospection le week-end. */
export function isBusinessDayParis(now: Date): boolean {
  const day = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "Europe/Paris" }).format(now);
  return day !== "Sat" && day !== "Sun";
}

export interface ProspectionSummary {
  queries: string[];
  found: number;
  created: number;
  enriched: number;
  emailsFound: number;
  sent: number;
  followUps: number;
  skipped: string | null;
  dryRun: boolean;
  totals: { prospects: number; toContact: number; contacted: number; signedUp: number; unsubscribed: number };
}

const esc = (v: string) => v.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c] ?? c);

export function formatProspectionReport(s: ProspectionSummary): string {
  const lines = [
    `🎯 <b>Prospection du jour</b>${s.dryRun ? " (simulation)" : ""}`,
    `🔎 Recherches : ${s.queries.map(esc).join(" · ") || "aucune"}`,
    `🏪 Établissements vus : ${s.found} · nouveaux : <b>${s.created}</b>`,
    `🌐 Sites analysés : ${s.enriched} · emails trouvés : <b>${s.emailsFound}</b>`,
    `✉️ Emails envoyés : <b>${s.sent}</b> · relances : ${s.followUps}${s.skipped ? ` (${esc(s.skipped)})` : ""}`,
    "",
    `📚 Base : ${s.totals.prospects} prospects · à contacter : ${s.totals.toContact} · contactés : ${s.totals.contacted} · inscrits : <b>${s.totals.signedUp}</b> · désinscrits : ${s.totals.unsubscribed}`,
  ];
  return lines.join("\n");
}
