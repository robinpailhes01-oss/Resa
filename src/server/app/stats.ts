import "server-only";
import { getSql } from "@/server/db";
import {
  aggregate,
  openMinutes,
  resolvePeriod,
  type Aggregates,
  type PeriodKey,
  type PeriodRange,
  type StatBooking,
} from "@/lib/stats";
import { effectiveRanges } from "./hours";
import { listPractitioners } from "./practitioners";

export interface DashboardStats {
  period: PeriodRange;
  current: Aggregates;
  previous: Pick<
    Aggregates,
    "bookings" | "revenueDoneCents" | "revenueUpcomingCents"
  >;
  /** Minutes d'ouverture cumulées des praticiens actifs sur la période. */
  openMinutes: number;
  /** bookedMinutes / openMinutes, null sans horaires. */
  fillRate: number | null;
  newClients: number;
  perPractitioner: Array<{
    id: string;
    name: string;
    count: number;
    bookedMinutes: number;
    fillRate: number | null;
  }>;
}

type Row = {
  id: string;
  status: StatBooking["status"];
  source: StatBooking["source"];
  starts_at: Date;
  ends_at: Date;
  duration_min: number;
  price_cents: number;
  service_name: string;
  practitioner_id: string;
  p_name: string;
  client_id: string | null;
};

async function loadBookings(
  establishmentId: string,
  start: Date,
  end: Date,
): Promise<StatBooking[]> {
  const rows = await getSql()<Row[]>`
    select b.id, b.status, b.source, b.starts_at, b.ends_at, b.duration_min, b.price_cents, b.service_name, b.practitioner_id, b.client_id, p.name as p_name
    from bookings b join practitioners p on p.id = b.practitioner_id
    where b.establishment_id = ${establishmentId} and b.starts_at >= ${start} and b.starts_at < ${end}`;
  return rows.map((r) => ({
    id: r.id,
    status: r.status,
    source: r.source,
    startsAt: r.starts_at,
    endsAt: r.ends_at,
    durationMin: r.duration_min,
    priceCents: r.price_cents,
    serviceName: r.service_name,
    practitionerId: r.practitioner_id,
    practitionerName: r.p_name,
    clientId: r.client_id,
  }));
}

export async function getDashboardStats(
  establishmentId: string,
  timeZone: string,
  key: PeriodKey,
  now = new Date(),
): Promise<DashboardStats> {
  const period = resolvePeriod(key, timeZone, now);
  const [currentRows, previousRows, practitioners, newClientRows] =
    await Promise.all([
      loadBookings(establishmentId, period.start, period.end),
      loadBookings(establishmentId, period.previous.start, period.previous.end),
      listPractitioners(establishmentId),
      getSql()<Array<{ n: number }>>`
      select count(*)::int as n from clients
      where establishment_id = ${establishmentId} and created_at >= ${period.start} and created_at < ${period.end}`,
    ]);
  const current = aggregate(currentRows, period, timeZone, now);
  const previous = aggregate(previousRows, period.previous, timeZone, now);

  const openByPractitioner = new Map<string, number>();
  for (const p of practitioners) {
    const ranges = await effectiveRanges(establishmentId, p.id);
    openByPractitioner.set(p.id, openMinutes(ranges, period));
  }
  const totalOpen = [...openByPractitioner.values()].reduce((a, b) => a + b, 0);

  const perPractitioner = practitioners.map((p) => {
    const agg = current.perPractitioner.find((x) => x.id === p.id);
    const open = openByPractitioner.get(p.id) ?? 0;
    const booked = agg?.bookedMinutes ?? 0;
    return {
      id: p.id,
      name: p.name,
      count: agg?.count ?? 0,
      bookedMinutes: booked,
      fillRate: open > 0 ? Math.min(1, booked / open) : null,
    };
  });

  return {
    period,
    current,
    previous: {
      bookings: previous.bookings,
      revenueDoneCents: previous.revenueDoneCents,
      revenueUpcomingCents: previous.revenueUpcomingCents,
    },
    openMinutes: totalOpen,
    fillRate:
      totalOpen > 0 ? Math.min(1, current.bookedMinutes / totalOpen) : null,
    newClients: newClientRows[0]?.n ?? 0,
    perPractitioner,
  };
}
