import "server-only";
import { randomBytes } from "node:crypto";
import { offer } from "@/config/offer";
import { isProspectionEnabled, prospectionCategories, prospectionCities, prospectionSettings } from "@/config/prospection";
import {
  detectBookingProvider,
  extractEmails,
  findContactLinks,
  formatProspectionReport,
  isBookingPlatformUrl,
  isBusinessDayParis,
  pickBestEmail,
  planQueries,
  type BookingProvider,
  type ProspectionSummary,
} from "@/lib/prospection";
import { getSql } from "@/server/db";
import { getEmailSender } from "@/server/email";
import { isGoogleImportEnabled, searchPlaces } from "@/server/google/places";
import { notifyTelegram } from "@/server/telegram";
import { prospectionFirstEmail, prospectionFollowUpEmail, type ProspectForEmail } from "./emails";

type ProspectRow = {
  id: string;
  google_place_id: string;
  name: string;
  category: string;
  city: string;
  address: string | null;
  postal_code: string | null;
  phone: string | null;
  website: string | null;
  booking_provider: BookingProvider | null;
  rating: string | number | null;
  rating_count: number | null;
  maps_url: string | null;
  email: string | null;
  email_source: string | null;
  status: string;
  unsubscribe_token: string;
  enriched_at: Date | null;
  first_email_at: Date | null;
  follow_up_at: Date | null;
  created_at: Date;
};

const PAGE_TIMEOUT_MS = 6000;
const PAGE_MAX_BYTES = 400_000;
const USER_AGENT = `Mozilla/5.0 (compatible; ResoBot/1.0; +${offer.siteUrl})`;

export class ProspectionDisabledError extends Error {}

/** Lit une page HTML publique (accueil ou contact) avec délai et taille bornés ; null si indisponible. */
async function fetchPage(url: string, fetchImpl: typeof fetch): Promise<string | null> {
  try {
    const response = await fetchImpl(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "text/html,application/xhtml+xml" },
      redirect: "follow",
      signal: AbortSignal.timeout(PAGE_TIMEOUT_MS),
    });
    if (!response.ok) return null;
    const type = response.headers.get("content-type") ?? "";
    if (type && !/text\/html|application\/xhtml/i.test(type)) return null;
    const text = await response.text();
    return text.slice(0, PAGE_MAX_BYTES);
  } catch {
    return null;
  }
}

async function isOptedOut(email: string): Promise<boolean> {
  const [row] = await getSql()`select 1 as ok from prospect_optouts where email = ${email} limit 1`;
  return Boolean(row);
}

async function isExistingUser(email: string): Promise<boolean> {
  const [row] = await getSql()`select 1 as ok from users where email = ${email} limit 1`;
  return Boolean(row);
}

/** 1. Découverte : recherches Google du jour, insertion des établissements inconnus. */
export async function discoverProspects(now: Date, fetchImpl: typeof fetch = fetch): Promise<{ queries: string[]; found: number; created: number; errors: string[] }> {
  const sql = getSql();
  const settings = prospectionSettings();
  const queries = planQueries(now, prospectionCategories, prospectionCities, settings.searchesPerDay);
  const result = { queries: queries.map((q) => q.text), found: 0, created: 0, errors: [] as string[] };
  for (const q of queries) {
    let candidates;
    try {
      candidates = await searchPlaces(q.text, undefined, fetchImpl, 20);
    } catch (error) {
      result.errors.push(`${q.text} : ${error instanceof Error ? error.message : String(error)}`);
      continue;
    }
    result.found += candidates.length;
    for (const c of candidates) {
      const [inserted] = await sql`
        insert into prospects (google_place_id, name, category, city, address, postal_code, phone, website, rating, rating_count, maps_url, unsubscribe_token)
        values (${c.placeId}, ${c.name}, ${q.category.key}, ${c.city ?? q.city}, ${c.formattedAddress || null}, ${c.postalCode}, ${c.phone}, ${c.website}, ${c.rating}, ${c.ratingCount}, ${c.mapsUrl}, ${randomBytes(16).toString("hex")})
        on conflict (google_place_id) do nothing returning id`;
      if (inserted) result.created += 1;
    }
  }
  return result;
}

/** Analyse d'un site : outil de réservation utilisé et email public (accueil puis page contact). */
async function analyseWebsite(website: string, fetchImpl: typeof fetch): Promise<{ provider: BookingProvider | null; email: string | null; source: string | null }> {
  const home = await fetchPage(website, fetchImpl);
  if (home === null) return { provider: detectBookingProvider(website), email: null, source: null };
  let emails = extractEmails(home);
  let source: string | null = emails.length ? "site" : null;
  let provider = detectBookingProvider(website, home);
  if (emails.length === 0 || !provider) {
    for (const link of findContactLinks(home, website)) {
      const page = await fetchPage(link, fetchImpl);
      if (page === null) continue;
      if (emails.length === 0) {
        emails = extractEmails(page);
        if (emails.length) source = "site-contact";
      }
      provider ??= detectBookingProvider(page);
      if (emails.length && provider) break;
    }
  }
  return { provider, email: pickBestEmail(emails, website), source };
}

/** 2. Enrichissement : pour chaque nouveau prospect, outil de réservation et email ; statut résultant. */
export async function enrichProspects(now: Date, fetchImpl: typeof fetch = fetch, limit = prospectionSettings().enrichPerRun): Promise<{ enriched: number; emailsFound: number }> {
  const sql = getSql();
  const rows = await sql<ProspectRow[]>`select * from prospects where enriched_at is null order by created_at limit ${limit}`;
  const result = { enriched: 0, emailsFound: 0 };
  const worker = async (row: ProspectRow) => {
    let provider: BookingProvider | null = null;
    let email: string | null = null;
    let source: string | null = null;
    if (row.website && isBookingPlatformUrl(row.website)) {
      provider = detectBookingProvider(row.website) ?? "autre";
    } else if (row.website) {
      ({ provider, email, source } = await analyseWebsite(row.website, fetchImpl));
    }
    let status = email ? "a_contacter" : "sans_email";
    if (email && (await isOptedOut(email))) status = "desinscrit";
    else if (email && (await isExistingUser(email))) status = "inscrit";
    await sql`update prospects set booking_provider = ${provider}, email = ${email}, email_source = ${source}, status = ${status}, enriched_at = ${now}, updated_at = ${now} where id = ${row.id}`;
    result.enriched += 1;
    if (email) result.emailsFound += 1;
  };
  // Six sites à la fois : assez rapide pour tenir dans une exécution, assez doux pour les petits hébergements.
  const queue = [...rows];
  await Promise.all(Array.from({ length: 6 }, async () => {
    for (let row = queue.shift(); row; row = queue.shift()) await worker(row);
  }));
  return result;
}

const categoryPlural = (key: string) => prospectionCategories.find((c) => c.key === key)?.pluralLabel ?? "professionnels de la beauté";

function toEmailProspect(row: ProspectRow): ProspectForEmail {
  return { name: row.name, email: row.email as string, categoryPlural: categoryPlural(row.category), categoryKey: row.category, bookingProvider: row.booking_provider, unsubscribeToken: row.unsubscribe_token };
}

/** 3. Envois : premiers contacts (Planity d'abord) puis relances, jours ouvrés, dans la limite quotidienne. */
export async function sendOutreach(now: Date, dryRun: boolean): Promise<{ sent: number; followUps: number; skipped: string | null }> {
  const sql = getSql();
  const settings = prospectionSettings();
  // Une même adresse trouvée sur plusieurs sites est celle d'une agence web, pas d'un salon : on ne l'écrit pas.
  await sql`update prospects set status = 'sans_email', email_source = 'partagee', updated_at = ${now}
    where status = 'a_contacter' and email in (select email from prospects where email is not null group by email having count(*) > 1)`;
  // Un prospect qui a créé un compte n'est plus relancé.
  await sql`update prospects set status = 'inscrit', updated_at = ${now} where status in ('a_contacter','contacte','relance') and email is not null and exists (select 1 from users u where u.email = prospects.email)`;
  if (!isBusinessDayParis(now)) return { sent: 0, followUps: 0, skipped: "week-end : envois reportés à lundi" };
  const sender = getEmailSender();
  const result = { sent: 0, followUps: 0, skipped: null as string | null };

  const firsts = await sql<ProspectRow[]>`
    select * from prospects where status = 'a_contacter' and email is not null
    order by coalesce(booking_provider = 'planity', false) desc, (booking_provider is not null) desc, created_at limit ${settings.dailyEmailLimit}`;
  for (const row of firsts) {
    if (await isOptedOut(row.email as string)) {
      await sql`update prospects set status = 'desinscrit', updated_at = ${now} where id = ${row.id}`;
      continue;
    }
    if (!dryRun) {
      await sender.send(prospectionFirstEmail(toEmailProspect(row)));
      await sql`update prospects set status = 'contacte', first_email_at = ${now}, updated_at = ${now} where id = ${row.id}`;
    }
    result.sent += 1;
  }

  const due = new Date(now.getTime() - settings.followUpAfterDays * 86_400_000);
  const followUps = await sql<ProspectRow[]>`
    select * from prospects where status = 'contacte' and follow_up_at is null and first_email_at <= ${due} and email is not null
    order by first_email_at limit ${settings.dailyEmailLimit}`;
  for (const row of followUps) {
    if (await isOptedOut(row.email as string)) {
      await sql`update prospects set status = 'desinscrit', updated_at = ${now} where id = ${row.id}`;
      continue;
    }
    if (!dryRun) {
      await sender.send(prospectionFollowUpEmail(toEmailProspect(row)));
      await sql`update prospects set status = 'relance', follow_up_at = ${now}, updated_at = ${now} where id = ${row.id}`;
    }
    result.followUps += 1;
  }
  return result;
}

async function totals(): Promise<ProspectionSummary["totals"]> {
  const [row] = await getSql()<Array<{ prospects: number; to_contact: number; contacted: number; signed_up: number; unsubscribed: number }>>`
    select count(*)::int as prospects,
      count(*) filter (where status = 'a_contacter')::int as to_contact,
      count(*) filter (where status in ('contacte','relance'))::int as contacted,
      count(*) filter (where status = 'inscrit')::int as signed_up,
      count(*) filter (where status = 'desinscrit')::int as unsubscribed
    from prospects`;
  return { prospects: row.prospects, toContact: row.to_contact, contacted: row.contacted, signedUp: row.signed_up, unsubscribed: row.unsubscribed };
}

/**
 * Cycle quotidien complet. `dryRun` : découverte et analyse réelles, aucun email envoyé.
 * Désactivé tant que PROSPECTION_ENABLED=1 n'est pas posé (et sans clé Google).
 */
export async function runProspection(options: { now?: Date; dryRun?: boolean; fetchImpl?: typeof fetch; notify?: boolean } = {}): Promise<ProspectionSummary> {
  const now = options.now ?? new Date();
  const dryRun = options.dryRun ?? false;
  const fetchImpl = options.fetchImpl ?? fetch;
  // Une simulation (aucun envoi) est toujours possible ; les envois réels exigent PROSPECTION_ENABLED=1.
  if (!dryRun && !isProspectionEnabled()) throw new ProspectionDisabledError("Prospection désactivée : posez PROSPECTION_ENABLED=1 sur Vercel.");
  if (!isGoogleImportEnabled()) throw new ProspectionDisabledError("Prospection impossible sans GOOGLE_PLACES_API_KEY.");

  const discovery = await discoverProspects(now, fetchImpl);
  const enrichment = await enrichProspects(now, fetchImpl);
  const outreach = await sendOutreach(now, dryRun);
  const summary: ProspectionSummary = {
    queries: discovery.queries,
    found: discovery.found,
    created: discovery.created,
    enriched: enrichment.enriched,
    emailsFound: enrichment.emailsFound,
    sent: outreach.sent,
    followUps: outreach.followUps,
    skipped: outreach.skipped,
    dryRun,
    totals: await totals(),
  };
  await getSql()`insert into prospection_runs (ran_at, queries, found, created, enriched, emails_found, sent, follow_ups, dry_run, errors)
    values (${now}, ${JSON.stringify(summary.queries)}, ${summary.found}, ${summary.created}, ${summary.enriched}, ${summary.emailsFound}, ${summary.sent}, ${summary.followUps}, ${dryRun}, ${discovery.errors.length ? discovery.errors.join("\n").slice(0, 2000) : null})`;
  if (discovery.errors.length) console.error("[prospection] recherches en erreur", discovery.errors.join(" | "));
  if (options.notify !== false) await notifyTelegram(formatProspectionReport(summary));
  return summary;
}

/** Jeton de désinscription connu ? */
export async function peekProspectToken(token: string): Promise<boolean> {
  if (!/^[a-f0-9]{32}$/.test(token)) return false;
  const [row] = await getSql()`select 1 as ok from prospects where unsubscribe_token = ${token} limit 1`;
  return Boolean(row);
}

/** Désinscription en un clic : statut + liste d'exclusion durable. */
export async function unsubscribeProspect(token: string, now = new Date()): Promise<boolean> {
  if (!/^[a-f0-9]{32}$/.test(token)) return false;
  const sql = getSql();
  const [row] = await sql<Array<{ id: string; email: string | null }>>`update prospects set status = 'desinscrit', updated_at = ${now} where unsubscribe_token = ${token} returning id, email`;
  if (!row) return false;
  if (row.email) await sql`insert into prospect_optouts (email) values (${row.email}) on conflict (email) do nothing`;
  return true;
}

/** Export tableur (point-virgule, BOM UTF-8 pour Excel) : pour appeler ou écrire aux établissements sans email. */
export async function prospectsCsv(): Promise<string> {
  const rows = await getSql()<ProspectRow[]>`select * from prospects order by created_at desc`;
  const cell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const header = ["Nom", "Catégorie", "Ville", "Adresse", "Téléphone", "Site", "Outil de réservation", "Note", "Avis", "Email", "Statut", "Premier email", "Relance", "Fiche Google", "Ajouté le"];
  const lines = rows.map((r) =>
    [r.name, r.category, r.city, r.address, r.phone, r.website, r.booking_provider ?? "", r.rating ?? "", r.rating_count ?? "", r.email ?? "", r.status, r.first_email_at?.toISOString().slice(0, 10) ?? "", r.follow_up_at?.toISOString().slice(0, 10) ?? "", r.maps_url ?? "", r.created_at.toISOString().slice(0, 10)]
      .map(cell)
      .join(";"),
  );
  return `﻿${[header.map(cell).join(";"), ...lines].join("\r\n")}`;
}

/** Agrégats pour le récap hebdomadaire. */
export async function prospectionWeeklyStats(from: Date): Promise<{ contacted: number; followedUp: number; signedUp: number; total: number }> {
  const [row] = await getSql()<Array<{ contacted: number; followed_up: number; signed_up: number; total: number }>>`
    select count(*) filter (where first_email_at >= ${from})::int as contacted,
      count(*) filter (where follow_up_at >= ${from})::int as followed_up,
      count(*) filter (where status = 'inscrit')::int as signed_up,
      count(*)::int as total
    from prospects`;
  return { contacted: row.contacted, followedUp: row.followed_up, signedUp: row.signed_up, total: row.total };
}
