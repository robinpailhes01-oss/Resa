import "server-only";
import { getSql } from "@/server/db";
import { metaConfig } from "./meta";

/**
 * Tunnel d'acquisition par origine (page interne /admin/acquisition).
 * « Abonnés payants » = 1er paiement payé dans payments (abonnements Reso).
 * Les paiements des clients des salons (booking_payments) sont rapportés à part.
 */

export type FunnelRow = {
  source: string;
  campaign: string;
  content: string;
  visits: number;
  signups: number;
  onboarded: number;
  published: number;
  activated: number;
  paid: number;
};

export type AcquisitionReport = {
  rows: FunnelRow[];
  total: FunnelRow;
  meta: { pixel: boolean; capi: boolean; testMode: boolean; sent: number; skipped: number; errors: number; lastError: string | null };
  salonPayments: { count: number; amountCents: number; feeCents: number };
  latest: Array<{ createdAt: Date; name: string; email: string; source: string | null; establishment: string | null; stage: string }>;
};

const key = (r: { source: string; campaign: string; content: string }) => `${r.source}|${r.campaign}|${r.content}`;
const empty = (source: string, campaign: string, content: string): FunnelRow => ({ source, campaign, content, visits: 0, signups: 0, onboarded: 0, published: 0, activated: 0, paid: 0 });

export async function acquisitionReport(days: number, now = new Date()): Promise<AcquisitionReport> {
  const sql = getSql();
  const from = days > 0 ? new Date(now.getTime() - days * 24 * 3600_000) : new Date(0);
  const fromDay = from.toISOString().slice(0, 10);

  const [visits, cohort, meta, salon, latest] = await Promise.all([
    sql<Array<{ source: string; campaign: string; content: string; visits: number }>>`
      select utm_source as source, utm_campaign as campaign, utm_content as content, sum(visits)::int as visits
      from acquisition_visits where day >= ${fromDay} group by 1, 2, 3`,
    // Cohorte : comptes créés sur la période, et jusqu'où chacun est allé (à ce jour).
    sql<Array<Omit<FunnelRow, "visits">>>`
      with u as (
        select u.id, coalesce(a.utm_source, '') as source, coalesce(a.utm_campaign, '') as campaign, coalesce(a.utm_content, '') as content
        from users u left join acquisition_attributions a on a.user_id = u.id
        where u.created_at >= ${from}
      ), e as (
        select e.id, e.owner_user_id, e.booking_enabled from establishments e join u on u.id = e.owner_user_id
      )
      select u.source, u.campaign, u.content,
        count(distinct u.id)::int as signups,
        count(distinct e.owner_user_id)::int as onboarded,
        count(distinct e.owner_user_id) filter (where e.booking_enabled
          and exists (select 1 from services s where s.establishment_id = e.id and s.active)
          and exists (select 1 from practitioners p where p.establishment_id = e.id and p.active
            and exists (select 1 from opening_hours h where h.establishment_id = e.id and (h.practitioner_id = p.id or h.practitioner_id is null))))::int as published,
        count(distinct ev_a.user_id)::int as activated,
        count(distinct ev_s.user_id)::int as paid
      from u
      left join e on e.owner_user_id = u.id
      left join acquisition_events ev_a on ev_a.user_id = u.id and ev_a.name = 'activation'
      left join acquisition_events ev_s on ev_s.user_id = u.id and ev_s.name = 'subscribe'
      group by 1, 2, 3`,
    sql<Array<{ sent: number; skipped: number; errors: number; last_error: string | null }>>`
      select count(*) filter (where meta_status = 'sent')::int as sent, count(*) filter (where meta_status = 'skipped')::int as skipped,
        count(*) filter (where meta_status = 'error')::int as errors,
        (select meta_error from acquisition_events where meta_status = 'error' order by created_at desc limit 1) as last_error
      from acquisition_events where created_at >= ${from}`,
    sql<Array<{ count: number; amount: number; fee: number }>>`
      select count(*)::int as count, coalesce(sum(amount_cents), 0)::int as amount, coalesce(sum(application_fee_cents), 0)::int as fee
      from booking_payments where status = 'paid' and not testmode and paid_at >= ${from}`,
    sql<Array<{ created_at: Date; full_name: string; email: string; source: string | null; establishment: string | null; stage: string }>>`
      select u.created_at, u.full_name, u.email,
        nullif(concat_ws(' · ', a.utm_source, a.utm_campaign, a.utm_content), '') as source,
        (select name from establishments where owner_user_id = u.id order by created_at limit 1) as establishment,
        coalesce((select name from acquisition_events where user_id = u.id
          order by array_position(array['subscribe','activation','start_trial','signup'], name) limit 1), 'signup') as stage
      from users u left join acquisition_attributions a on a.user_id = u.id
      where u.created_at >= ${from} order by u.created_at desc limit 20`,
  ]);

  const map = new Map<string, FunnelRow>();
  for (const v of visits) map.set(key(v), { ...empty(v.source, v.campaign, v.content), visits: v.visits });
  for (const c of cohort) {
    const row = map.get(key(c)) ?? empty(c.source, c.campaign, c.content);
    map.set(key(c), { ...row, signups: c.signups, onboarded: c.onboarded, published: c.published, activated: c.activated, paid: c.paid });
  }
  const rows = [...map.values()].sort((a, b) => b.signups - a.signups || b.visits - a.visits);
  const total = rows.reduce(
    (t, r) => ({ ...t, visits: t.visits + r.visits, signups: t.signups + r.signups, onboarded: t.onboarded + r.onboarded, published: t.published + r.published, activated: t.activated + r.activated, paid: t.paid + r.paid }),
    empty("", "", ""),
  );
  const cfg = metaConfig();
  const m = meta[0];
  return {
    rows,
    total,
    meta: { pixel: Boolean(cfg.pixelId), capi: cfg.enabled, testMode: Boolean(cfg.testCode), sent: m?.sent ?? 0, skipped: m?.skipped ?? 0, errors: m?.errors ?? 0, lastError: m?.last_error ?? null },
    salonPayments: { count: salon[0]?.count ?? 0, amountCents: salon[0]?.amount ?? 0, feeCents: salon[0]?.fee ?? 0 },
    latest: latest.map((l) => ({ createdAt: new Date(l.created_at), name: l.full_name, email: l.email, source: l.source, establishment: l.establishment, stage: l.stage })),
  };
}
