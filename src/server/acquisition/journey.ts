import "server-only";
import { REPEATABLE_STEPS, shortName, type Journey, type JourneyStep } from "@/lib/journey";
import { getSql } from "@/server/db";

/**
 * Micro-étapes du parcours (cf. ads/pilotage/plan-de-mesure.md) : enregistrées
 * une fois par compte, sauf les erreurs et paiements échoués (plafonnés par jour).
 * Ne lèvent jamais : la mesure ne doit pas casser le parcours.
 */
const DAILY_CAP = 20;

export async function recordJourney(userId: string, step: JourneyStep, detail: string | null = null): Promise<void> {
  try {
    const sql = getSql();
    const clean = detail ? detail.replace(/\s+/g, " ").trim().slice(0, 160) : null;
    if (REPEATABLE_STEPS.has(step)) {
      await sql`
        insert into journey_events (user_id, name, detail)
        select ${userId}, ${step}, ${clean}
        where (select count(*) from journey_events where user_id = ${userId} and name = ${step} and created_at > now() - interval '1 day') < ${DAILY_CAP}`;
    } else {
      await sql`
        insert into journey_events (user_id, name, detail)
        select ${userId}, ${step}, ${clean}
        where not exists (select 1 from journey_events where user_id = ${userId} and name = ${step})`;
    }
  } catch (error) {
    console.error("[parcours]", step, error instanceof Error ? error.message : error);
  }
}

/** Même chose à partir d'un établissement (webhooks, page publique). */
export async function recordJourneyForEstablishment(establishmentId: string, step: JourneyStep, detail: string | null = null, exceptUserId?: string | null): Promise<void> {
  try {
    const [owner] = await getSql()<Array<{ id: string }>>`select owner_user_id as id from establishments where id = ${establishmentId}`;
    if (owner && owner.id !== exceptUserId) await recordJourney(owner.id, step, detail);
  } catch (error) {
    console.error("[parcours]", step, error instanceof Error ? error.message : error);
  }
}

type Row = {
  full_name: string;
  source: string | null;
  signup_at: Date;
  establishment_at: Date | null;
  google_place_id: string | null;
  google_import: string | null;
  first_service_at: Date | null;
  hours_at: Date | null;
  published: boolean;
  link_copied_at: Date | null;
  page_visited_at: Date | null;
  activation_at: Date | null;
  billing_viewed_at: Date | null;
  checkout_at: Date | null;
  paid_at: Date | null;
  payment_failures: number;
  errors: number;
  last_error: string | null;
};

const d = (v: Date | string | null) => (v ? new Date(v) : null);

/** Parcours des comptes créés depuis `days` jours (les plus récents d'abord). */
export async function loadJourneys(days: number, limit = 200, now = new Date()): Promise<Journey[]> {
  const from = new Date(now.getTime() - days * 24 * 3600_000);
  const rows = await getSql()<Row[]>`
    with u as (
      select u.id, u.full_name, u.created_at,
        nullif(concat_ws(' · ', a.utm_source, a.utm_campaign, a.utm_content), '') as source
      from users u left join acquisition_attributions a on a.user_id = u.id
      where u.created_at >= ${from}
      order by u.created_at desc limit ${limit}
    ), e as (
      select distinct on (owner_user_id) id, owner_user_id, created_at, booking_enabled, google_place_id
      from establishments where owner_user_id in (select id from u) order by owner_user_id, created_at
    ), j as (
      select user_id,
        min(created_at) filter (where name = 'first_service') as first_service_at,
        min(created_at) filter (where name = 'hours_set') as hours_at,
        min(created_at) filter (where name = 'link_copied') as link_copied_at,
        min(created_at) filter (where name = 'page_visited') as page_visited_at,
        min(created_at) filter (where name = 'billing_viewed') as billing_viewed_at,
        min(created_at) filter (where name = 'checkout_started') as checkout_at,
        (array_agg(detail order by created_at) filter (where name = 'google_import'))[1] as google_import,
        count(*) filter (where name = 'payment_failed')::int as payment_failures,
        count(*) filter (where name = 'error')::int as errors,
        (array_agg(detail order by created_at desc) filter (where name = 'error'))[1] as last_error
      from journey_events where user_id in (select id from u) group by user_id
    ), a as (
      select user_id,
        min(created_at) filter (where name = 'activation') as activation_at,
        min(created_at) filter (where name = 'subscribe') as paid_at
      from acquisition_events where user_id in (select id from u) group by user_id
    )
    select u.full_name, u.source, u.created_at as signup_at, e.created_at as establishment_at, e.google_place_id,
      j.google_import,
      -- Comptes antérieurs au suivi détaillé : repli sur l'état réel en base.
      coalesce(j.first_service_at, (select min(s.created_at) from services s where s.establishment_id = e.id)) as first_service_at,
      coalesce(j.hours_at, case when exists (select 1 from opening_hours h where h.establishment_id = e.id) then e.created_at end) as hours_at, j.link_copied_at, j.page_visited_at, j.billing_viewed_at, j.checkout_at,
      coalesce(j.payment_failures, 0) as payment_failures, coalesce(j.errors, 0) as errors, j.last_error,
      a.activation_at, a.paid_at,
      coalesce(e.booking_enabled
        and exists (select 1 from services s where s.establishment_id = e.id and s.active)
        and exists (select 1 from practitioners p where p.establishment_id = e.id and p.active
          and exists (select 1 from opening_hours h where h.establishment_id = e.id and (h.practitioner_id = p.id or h.practitioner_id is null))), false) as published
    from u left join e on e.owner_user_id = u.id left join j on j.user_id = u.id left join a on a.user_id = u.id
    order by u.created_at desc`;
  return rows.map((r) => ({
    name: shortName(r.full_name),
    source: r.source,
    signupAt: new Date(r.signup_at),
    establishmentAt: d(r.establishment_at),
    googleImport: r.google_import ?? (r.establishment_at ? (r.google_place_id ? "fiche importée" : "sans import") : null),
    firstServiceAt: d(r.first_service_at),
    hoursAt: d(r.hours_at),
    published: r.published,
    linkCopiedAt: d(r.link_copied_at),
    pageVisitedAt: d(r.page_visited_at),
    activationAt: d(r.activation_at),
    billingViewedAt: d(r.billing_viewed_at),
    checkoutAt: d(r.checkout_at),
    paidAt: d(r.paid_at),
    paymentFailures: r.payment_failures,
    errors: r.errors,
    lastError: r.last_error,
  }));
}
