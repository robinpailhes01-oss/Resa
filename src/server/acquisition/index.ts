import "server-only";
import { randomUUID } from "node:crypto";
import { cookies, headers } from "next/headers";
import { offer } from "@/config/offer";
import { ATTRIBUTION_COOKIE, decodeAttribution, fbcFrom, withoutAdIds, type Attribution } from "@/lib/attribution";
import { CONSENT_COOKIE, hasAdsConsent } from "@/lib/consent";
import { getSql } from "@/server/db";
import { sendMetaEvent, type MetaEventName } from "./meta";

/**
 * Étapes du tunnel d'acquisition (cf. ads/pilotage/definitions.md).
 * Seuls les abonnements Reso (table payments) déclenchent « subscribe » ;
 * les paiements des clients des salons (booking_payments) ne sont jamais comptés ici.
 */
export type Milestone = "signup" | "start_trial" | "activation" | "subscribe";

const META_NAMES: Record<Milestone, MetaEventName> = {
  signup: "CompleteRegistration",
  start_trial: "StartTrial",
  activation: "Activation",
  subscribe: "Subscribe",
};

const SOURCE_PATHS: Record<Milestone, string> = {
  signup: "/inscription",
  start_trial: "/app/bienvenue",
  activation: "/app/agenda",
  subscribe: "/app/abonnement",
};

export type RequestContext = {
  attribution: Attribution | null;
  consentAds: boolean;
  fbp: string | null;
  ip: string | null;
  userAgent: string | null;
};

/** Origine et consentement lus sur la requête en cours (à appeler dans une action serveur). */
export async function readRequestContext(): Promise<RequestContext> {
  const [store, h] = await Promise.all([cookies(), headers()]);
  const consentAds = hasAdsConsent(store.get(CONSENT_COOKIE)?.value);
  const attribution = decodeAttribution(store.get(ATTRIBUTION_COOKIE)?.value);
  const fbp = store.get("_fbp")?.value ?? null;
  return {
    attribution: attribution && !consentAds ? withoutAdIds(attribution) : attribution,
    consentAds,
    fbp: consentAds && fbp && /^fb\.\d\.\d+\.\d+$/.test(fbp) ? fbp : null,
    ip: consentAds ? (h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? null) : null,
    userAgent: consentAds ? (h.get("user-agent")?.slice(0, 300) ?? null) : null,
  };
}

/** Rattache l'origine du premier contact au compte qui vient d'être créé. */
export async function saveSignupAttribution(userId: string, ctx: RequestContext): Promise<void> {
  const a = ctx.attribution ?? {};
  await getSql()`
    insert into acquisition_attributions (user_id, utm_source, utm_medium, utm_campaign, utm_content, utm_term, landing_path, referrer_host, first_seen_at, consent_ads, fbc, fbp)
    values (${userId}, ${a.utm_source ?? null}, ${a.utm_medium ?? null}, ${a.utm_campaign ?? null}, ${a.utm_content ?? null}, ${a.utm_term ?? null},
      ${a.landingPath ?? null}, ${a.referrerHost ?? null}, ${a.firstSeenAt ?? null}, ${ctx.consentAds}, ${ctx.consentAds ? (fbcFrom(a) ?? null) : null}, ${ctx.fbp})
    on conflict (user_id) do nothing`;
}

/** Libellé court de l'origine, pour la notification Telegram. */
export function sourceLabel(a: Attribution | null): string | null {
  if (!a?.utm_source && !a?.utm_campaign) return null;
  return [a.utm_source, a.utm_medium, a.utm_campaign, a.utm_content].filter(Boolean).join(" · ");
}

/**
 * Enregistre une étape (une seule fois par compte) et l'envoie à Meta si le compte
 * a donné son accord. Ne lève jamais : la mesure ne doit pas casser le parcours.
 */
export async function recordMilestone(input: { name: Milestone; userId: string; establishmentId?: string | null; valueCents?: number | null; ctx?: RequestContext }): Promise<void> {
  try {
    const sql = getSql();
    const eventId = `${input.name}-${randomUUID()}`;
    const [row] = await sql<Array<{ id: string; created_at: Date }>>`
      insert into acquisition_events (user_id, establishment_id, name, event_id, value_cents)
      values (${input.userId}, ${input.establishmentId ?? null}, ${input.name}, ${eventId}, ${input.valueCents ?? null})
      on conflict (user_id, name) do nothing
      returning id, created_at`;
    if (!row) return;
    const [info] = await sql<Array<{ email: string; consent_ads: boolean | null; fbc: string | null; fbp: string | null }>>`
      select u.email, a.consent_ads, a.fbc, a.fbp from users u left join acquisition_attributions a on a.user_id = u.id where u.id = ${input.userId}`;
    if (!info?.consent_ads) return;
    const result = await sendMetaEvent({
      name: META_NAMES[input.name],
      eventId,
      eventTime: new Date(row.created_at),
      sourceUrl: `${offer.siteUrl.replace(/\/$/, "")}${SOURCE_PATHS[input.name]}`,
      email: info.email,
      externalId: input.userId,
      fbc: info.fbc,
      fbp: info.fbp ?? input.ctx?.fbp ?? null,
      ip: input.ctx?.ip ?? null,
      userAgent: input.ctx?.userAgent ?? null,
      valueCents: input.valueCents ?? null,
    });
    if (result.status !== "skipped") {
      await sql`update acquisition_events set meta_status = ${result.status}, meta_error = ${result.error ?? null} where id = ${row.id}`;
    }
    if (result.status === "error") console.error("[acquisition] envoi Meta", input.name, result.error);
  } catch (error) {
    console.error("[acquisition] étape", input.name, error instanceof Error ? error.message : error);
  }
}

/** 1re réservation en ligne d'une cliente : les réservations faites avec l'email de la pro sont ignorées. */
export async function recordOnlineBooking(establishmentId: string, clientEmail: string | null): Promise<void> {
  try {
    const [owner] = await getSql()<Array<{ id: string; email: string }>>`
      select u.id, u.email from establishments e join users u on u.id = e.owner_user_id where e.id = ${establishmentId}`;
    if (!owner) return;
    if (clientEmail && clientEmail.trim().toLowerCase() === owner.email.trim().toLowerCase()) return;
    await recordMilestone({ name: "activation", userId: owner.id, establishmentId });
  } catch (error) {
    console.error("[acquisition] activation", error instanceof Error ? error.message : error);
  }
}

/** 1er abonnement Reso encaissé (table payments uniquement). */
export async function recordSubscription(establishmentId: string, amountCents: number): Promise<void> {
  try {
    const [owner] = await getSql()<Array<{ id: string }>>`select owner_user_id as id from establishments where id = ${establishmentId}`;
    if (owner) await recordMilestone({ name: "subscribe", userId: owner.id, establishmentId, valueCents: amountCents });
  } catch (error) {
    console.error("[acquisition] abonnement", error instanceof Error ? error.message : error);
  }
}

/** Visite agrégée (aucun identifiant de personne). */
export async function countVisit(day: string, source: { utm_source: string; utm_campaign: string; utm_content: string }): Promise<void> {
  await getSql()`
    insert into acquisition_visits (day, utm_source, utm_campaign, utm_content, visits)
    values (${day}, ${source.utm_source}, ${source.utm_campaign}, ${source.utm_content}, 1)
    on conflict (day, utm_source, utm_campaign, utm_content) do update set visits = acquisition_visits.visits + 1`;
}
