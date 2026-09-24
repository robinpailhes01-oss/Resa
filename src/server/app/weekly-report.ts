import "server-only";
import { getSql } from "@/server/db";
import type { WeeklyStats } from "@/lib/weekly-report";

/** Agrégats des 7 derniers jours pour le récapitulatif Telegram. */
export async function collectWeeklyStats(now = new Date()): Promise<WeeklyStats> {
  const from = new Date(now.getTime() - 7 * 24 * 3600_000);
  const soon = new Date(now.getTime() + 7 * 24 * 3600_000);
  const sql = getSql();
  const [row] = await sql<
    Array<{
      new_users: number;
      new_establishments: number;
      bookings_online: number;
      bookings_manual: number;
      cancellations: number;
      feedback_count: number;
      active_subscriptions: number;
      trials_active: number;
      trials_ending_soon: number;
      trials_expired: number;
      total_establishments: number;
    }>
  >`
    select
      (select count(*) from users where created_at >= ${from})::int as new_users,
      (select count(*) from establishments where created_at >= ${from})::int as new_establishments,
      (select count(*) from bookings where created_at >= ${from} and source = 'online')::int as bookings_online,
      (select count(*) from bookings where created_at >= ${from} and source = 'manual')::int as bookings_manual,
      (select count(*) from bookings where cancelled_at >= ${from})::int as cancellations,
      (select count(*) from feedback where created_at >= ${from})::int as feedback_count,
      (select count(*) from establishments where subscription_status = 'active')::int as active_subscriptions,
      (select count(*) from establishments where subscription_status = 'trial' and trial_ends_at > ${now})::int as trials_active,
      (select count(*) from establishments where subscription_status = 'trial' and trial_ends_at > ${now} and trial_ends_at <= ${soon})::int as trials_ending_soon,
      (select count(*) from establishments where subscription_status = 'trial' and trial_ends_at <= ${now})::int as trials_expired,
      (select count(*) from establishments)::int as total_establishments`;
  return {
    from,
    to: now,
    newUsers: row.new_users,
    newEstablishments: row.new_establishments,
    bookingsOnline: row.bookings_online,
    bookingsManual: row.bookings_manual,
    cancellations: row.cancellations,
    feedbackCount: row.feedback_count,
    activeSubscriptions: row.active_subscriptions,
    trialsActive: row.trials_active,
    trialsEndingSoon: row.trials_ending_soon,
    trialsExpired: row.trials_expired,
    totalEstablishments: row.total_establishments,
  };
}
