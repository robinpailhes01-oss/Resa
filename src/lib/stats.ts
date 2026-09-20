/**
 * Indicateurs du tableau de bord : fonctions pures (testées sans base).
 * Les rendez-vous arrivent déjà filtrés sur la période ; les horaires sont locaux.
 */
import {
  addDaysToDateKey,
  todayDateKey,
  weekdayOfDateKey,
  zonedToUtc,
} from "@/lib/time";

export type PeriodKey = "mois" | "mois-precedent" | "30j";

export const PERIODS: ReadonlyArray<{ key: PeriodKey; label: string }> = [
  { key: "mois", label: "Ce mois-ci" },
  { key: "mois-precedent", label: "Mois dernier" },
  { key: "30j", label: "30 derniers jours" },
];

export function isPeriodKey(value: string): value is PeriodKey {
  return PERIODS.some((p) => p.key === value);
}

export interface PeriodRange {
  key: PeriodKey;
  /** Premier jour (clé locale, inclus). */
  startKey: string;
  /** Dernier jour (clé locale, inclus). */
  endKey: string;
  /** Bornes UTC : [start, end). */
  start: Date;
  end: Date;
  /** Période précédente de même nature, pour la comparaison. */
  previous: { startKey: string; endKey: string; start: Date; end: Date };
}

function monthBounds(
  year: number,
  monthIndex: number,
): { startKey: string; endKey: string } {
  const pad = (n: number) => String(n).padStart(2, "0");
  const lastDay = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  return {
    startKey: `${year}-${pad(monthIndex + 1)}-01`,
    endKey: `${year}-${pad(monthIndex + 1)}-${pad(lastDay)}`,
  };
}

/** Bornes locales puis UTC de la période demandée. */
export function resolvePeriod(
  key: PeriodKey,
  timeZone: string,
  now = new Date(),
): PeriodRange {
  const today = todayDateKey(timeZone, now);
  const year = Number(today.slice(0, 4));
  const month = Number(today.slice(5, 7)) - 1;
  const toUtc = (startKey: string, endKey: string) => ({
    start: zonedToUtc(startKey, 0, timeZone),
    end: zonedToUtc(addDaysToDateKey(endKey, 1), 0, timeZone),
  });

  let current: { startKey: string; endKey: string };
  let previous: { startKey: string; endKey: string };
  if (key === "mois") {
    current = monthBounds(year, month);
    previous = monthBounds(
      month === 0 ? year - 1 : year,
      month === 0 ? 11 : month - 1,
    );
  } else if (key === "mois-precedent") {
    current = monthBounds(
      month === 0 ? year - 1 : year,
      month === 0 ? 11 : month - 1,
    );
    previous = monthBounds(month <= 1 ? year - 1 : year, (month + 10) % 12);
  } else {
    current = { startKey: addDaysToDateKey(today, -29), endKey: today };
    previous = {
      startKey: addDaysToDateKey(today, -59),
      endKey: addDaysToDateKey(today, -30),
    };
  }
  return {
    key,
    ...current,
    ...toUtc(current.startKey, current.endKey),
    previous: { ...previous, ...toUtc(previous.startKey, previous.endKey) },
  };
}

export interface StatBooking {
  id: string;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
  source: "online" | "manual";
  startsAt: Date;
  endsAt: Date;
  durationMin: number;
  priceCents: number;
  serviceName: string;
  practitionerId: string;
  practitionerName: string;
  clientId: string | null;
}

export interface Aggregates {
  /** Rendez-vous tenus ou à venir (hors annulés et absences). */
  bookings: number;
  /** Chiffre d'affaires des rendez-vous passés (terminés ou confirmés dont l'heure est passée). */
  revenueDoneCents: number;
  /** Chiffre d'affaires des rendez-vous confirmés à venir. */
  revenueUpcomingCents: number;
  bookedMinutes: number;
  cancelled: number;
  noShows: number;
  online: number;
  manual: number;
  /** Part des rendez-vous perdus (annulés + absences) sur l'ensemble des rendez-vous pris. */
  lossRate: number | null;
  perDay: Array<{ dateKey: string; count: number }>;
  topServices: Array<{ name: string; count: number; revenueCents: number }>;
  perPractitioner: Array<{
    id: string;
    name: string;
    count: number;
    bookedMinutes: number;
  }>;
}

const ACTIVE = new Set(["pending", "confirmed", "completed"]);

export function aggregate(
  bookings: StatBooking[],
  range: { startKey: string; endKey: string },
  timeZone: string,
  now = new Date(),
): Aggregates {
  const perDay = new Map<string, number>();
  for (let d = range.startKey; d <= range.endKey; d = addDaysToDateKey(d, 1))
    perDay.set(d, 0);
  const services = new Map<string, { count: number; revenueCents: number }>();
  const practitioners = new Map<
    string,
    { name: string; count: number; bookedMinutes: number }
  >();
  const out: Aggregates = {
    bookings: 0,
    revenueDoneCents: 0,
    revenueUpcomingCents: 0,
    bookedMinutes: 0,
    cancelled: 0,
    noShows: 0,
    online: 0,
    manual: 0,
    lossRate: null,
    perDay: [],
    topServices: [],
    perPractitioner: [],
  };

  for (const b of bookings) {
    if (b.status === "cancelled") {
      out.cancelled += 1;
      continue;
    }
    if (b.status === "no_show") {
      out.noShows += 1;
      continue;
    }
    if (!ACTIVE.has(b.status)) continue;
    out.bookings += 1;
    out.bookedMinutes += b.durationMin;
    if (b.source === "online") out.online += 1;
    else out.manual += 1;
    const done =
      b.status === "completed" || b.endsAt.getTime() <= now.getTime();
    if (done) out.revenueDoneCents += b.priceCents;
    else out.revenueUpcomingCents += b.priceCents;

    const day = todayDateKey(timeZone, b.startsAt);
    if (perDay.has(day)) perDay.set(day, (perDay.get(day) ?? 0) + 1);
    const s = services.get(b.serviceName) ?? { count: 0, revenueCents: 0 };
    s.count += 1;
    s.revenueCents += b.priceCents;
    services.set(b.serviceName, s);
    const p = practitioners.get(b.practitionerId) ?? {
      name: b.practitionerName,
      count: 0,
      bookedMinutes: 0,
    };
    p.count += 1;
    p.bookedMinutes += b.durationMin;
    practitioners.set(b.practitionerId, p);
  }

  const taken = out.bookings + out.cancelled + out.noShows;
  out.lossRate = taken > 0 ? (out.cancelled + out.noShows) / taken : null;
  out.perDay = [...perDay.entries()].map(([dateKey, count]) => ({
    dateKey,
    count,
  }));
  out.topServices = [...services.entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.count - a.count || b.revenueCents - a.revenueCents)
    .slice(0, 5);
  out.perPractitioner = [...practitioners.entries()]
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.count - a.count);
  return out;
}

/** Minutes d'ouverture d'un praticien sur la période, d'après ses horaires hebdomadaires. */
export function openMinutes(
  ranges: Array<{ weekday: number; startMin: number; endMin: number }>,
  range: { startKey: string; endKey: string },
): number {
  const perWeekday = new Map<number, number>();
  for (const r of ranges)
    perWeekday.set(
      r.weekday,
      (perWeekday.get(r.weekday) ?? 0) + Math.max(0, r.endMin - r.startMin),
    );
  let total = 0;
  for (let d = range.startKey; d <= range.endKey; d = addDaysToDateKey(d, 1))
    total += perWeekday.get(weekdayOfDateKey(d)) ?? 0;
  return total;
}

/** Variation relative (ex. +0,12), null si la base est nulle. */
export function delta(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return (current - previous) / previous;
}
