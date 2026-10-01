import "server-only";
import { campaignExclusions, prospectionCampaigns, prospectionCategories, isProspectionEnabled } from "@/config/prospection";
import { isBusinessDayParis } from "@/lib/prospection";
import { getSql } from "@/server/db";
import { getEmailSender } from "@/server/email";
import { isGoogleImportEnabled, searchPlaces } from "@/server/google/places";
import { escapeHtml, notifyTelegram } from "@/server/telegram";
import { prospectionCampaignEmail } from "./emails";
import {
  ProspectionDisabledError,
  enrichProspectRows,
  insertProspectCandidates,
  isExistingUser,
  isOptedOut,
  prospectionReplyTo,
  type ProspectRow,
} from "./index";

/**
 * Campagne ponctuelle (ex. Hérault, salons hors Planity) : cherche des salons
 * du département, analyse leurs sites (email public, outil de réservation),
 * puis envoie le texte de la campagne aux premiers prêts, jusqu'au total prévu.
 * Chaque appel travaille dans un temps borné et reprend là où le précédent
 * s'est arrêté ; `dryRun` montre la liste sans rien envoyer.
 */
export interface CampaignResult {
  campaign: string;
  alreadySent: number;
  searches: string[];
  enriched: number;
  ready: Array<{ name: string; city: string; email: string; provider: string | null }>;
  sent: string[];
  remainingQueries: number;
  skipped: string | null;
}

const BUDGET_MS = 40_000;

export async function runCampaign(id: string, options: { dryRun: boolean; now?: Date; fetchImpl?: typeof fetch; budgetMs?: number }): Promise<CampaignResult> {
  const campaign = prospectionCampaigns[id];
  if (!campaign) throw new Error(`Campagne inconnue : ${id}`);
  if (!options.dryRun && !isProspectionEnabled()) throw new ProspectionDisabledError("PROSPECTION_ENABLED n'est pas à 1.");
  const now = options.now ?? new Date();
  const fetchImpl = options.fetchImpl ?? fetch;
  const deadline = Date.now() + (options.budgetMs ?? BUDGET_MS);
  const sql = getSql();
  const inDepartment = sql`(postal_code like ${`${campaign.postalPrefix}%`} or (postal_code is null and city = any(${campaign.cities})))`;

  const [{ n: alreadySent }] = await sql<Array<{ n: number }>>`select count(*)::int as n from prospects where campaign = ${campaign.key}`;
  const remaining = Math.max(0, campaign.total - alreadySent);
  const result: CampaignResult = { campaign: campaign.key, alreadySent, searches: [], enriched: 0, ready: [], sent: [], remainingQueries: 0, skipped: null };
  if (remaining === 0) return { ...result, skipped: "campagne terminée" };

  // Enseignes et adresses de plateforme : écartées une fois pour toutes (jamais contactées par une campagne).
  const excluded = (r: ProspectRow) =>
    campaignExclusions.names.test(r.name) || campaignExclusions.emailDomains.test(r.email ?? "") || campaignExclusions.emailLocalParts.test(r.email ?? "");
  const readyRows = async () => {
    const rows = await candidateRows();
    const kept: ProspectRow[] = [];
    for (const r of rows) {
      if (excluded(r)) await sql`update prospects set status = 'sans_email', email_source = 'exclu-campagne', updated_at = ${now} where id = ${r.id}`;
      else kept.push(r);
    }
    return kept.slice(0, remaining);
  };
  const candidateRows = () => sql<ProspectRow[]>`
    select * from prospects
    where status = 'a_contacter' and email is not null and campaign is null and first_email_at is null and ${inDepartment}
      and (booking_provider is null or not (booking_provider = any(${campaign.excludeProviders})))
      -- Une adresse présente sur plusieurs fiches est celle d'une agence ou d'une chaîne : jamais contactée.
      and email not in (select email from prospects where email is not null group by email having count(*) > 1)
    order by created_at limit ${remaining * 3}`;

  // Recherches de la campagne, ville par ville (les plus proches de Montpellier d'abord).
  const queries = campaign.cities.flatMap((city) => prospectionCategories.map((category) => ({ text: `${category.query} ${city}`, category, city })));
  const done = new Set((await sql<Array<{ query: string }>>`select query from prospection_campaign_queries where campaign = ${campaign.key}`).map((r) => r.query));

  let ready = await readyRows();
  while (ready.length < remaining && Date.now() < deadline) {
    const pending = await sql<ProspectRow[]>`select * from prospects where enriched_at is null and ${inDepartment} order by created_at limit 12`;
    if (pending.length > 0) {
      result.enriched += (await enrichProspectRows(pending, now, fetchImpl)).enriched;
    } else {
      const next = queries.find((q) => !done.has(q.text));
      if (!next || !isGoogleImportEnabled()) break;
      done.add(next.text);
      let found = 0;
      try {
        const candidates = await searchPlaces(next.text, undefined, fetchImpl, 20);
        found = candidates.length;
        await insertProspectCandidates(candidates, next.category.key, next.city);
      } catch (error) {
        console.error("[campagne] recherche", next.text, error instanceof Error ? error.message : error);
      }
      await sql`insert into prospection_campaign_queries (campaign, query, found) values (${campaign.key}, ${next.text}, ${found}) on conflict do nothing`;
      result.searches.push(next.text);
    }
    ready = await readyRows();
  }
  result.remainingQueries = queries.filter((q) => !done.has(q.text)).length;
  result.ready = ready.map((r) => ({ name: r.name, city: r.city, email: r.email as string, provider: r.booking_provider }));

  if (options.dryRun) return result;
  if (!isBusinessDayParis(now)) return { ...result, skipped: "week-end : envoi reporté" };
  if (ready.length < remaining && result.remainingQueries > 0) return { ...result, skipped: `${ready.length}/${remaining} salons prêts : relancez pour continuer la recherche avant l'envoi` };

  const sender = getEmailSender();
  const { address: replyTo } = await prospectionReplyTo();
  for (const row of ready) {
    const email = row.email as string;
    if ((await isOptedOut(email)) || (await isExistingUser(email))) {
      await sql`update prospects set status = ${(await isOptedOut(email)) ? "desinscrit" : "inscrit"}, updated_at = ${now} where id = ${row.id}`;
      continue;
    }
    // Réservation de la ligne avant l'envoi : deux appels simultanés ne peuvent pas écrire deux fois au même salon.
    const claimed = await sql`update prospects set status = 'contacte', campaign = ${campaign.key}, first_email_at = ${now}, follow_up_allowed = false, updated_at = ${now}
      where id = ${row.id} and status = 'a_contacter' and campaign is null returning id`;
    if (claimed.length === 0) continue;
    try {
      await sender.send(prospectionCampaignEmail(campaign.key, { name: row.name, email }, replyTo));
      result.sent.push(`${row.name} · ${row.city} · ${email}`);
    } catch (error) {
      console.error("[campagne] envoi", row.name, error instanceof Error ? error.message : error);
      await sql`update prospects set status = 'a_contacter', campaign = null, first_email_at = null, updated_at = ${now} where id = ${row.id}`;
    }
  }
  if (result.sent.length > 0) {
    await notifyTelegram(
      `<b>Campagne ${escapeHtml(campaign.key)}</b> : ${result.sent.length} email${result.sent.length > 1 ? "s" : ""} envoyé${result.sent.length > 1 ? "s" : ""}\n${result.sent
        .map((s) => `• ${escapeHtml(s.split(" · ").slice(0, 2).join(" · "))}`)
        .join("\n")}`,
    ).catch(() => false);
  }
  return result;
}
