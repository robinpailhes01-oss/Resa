/**
 * Outils de fuseau horaire sans dépendance : conversions entre l'heure locale
 * d'un établissement (ex. Europe/Paris) et l'UTC stocké en base.
 */

const dtfCache = new Map<string, Intl.DateTimeFormat>();

function partsFormatter(timeZone: string): Intl.DateTimeFormat {
  let dtf = dtfCache.get(timeZone);
  if (!dtf) {
    dtf = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      weekday: "short",
    });
    dtfCache.set(timeZone, dtf);
  }
  return dtf;
}

export interface ZonedParts {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number;
  minute: number;
  second: number;
  weekday: number; // 0 = dimanche
  /** Minutes écoulées depuis minuit local. */
  minutesOfDay: number;
  /** « AAAA-MM-JJ » local. */
  dateKey: string;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Décompose un instant UTC en composantes locales du fuseau. */
export function toZonedParts(date: Date, timeZone: string): ZonedParts {
  const parts = partsFormatter(timeZone).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "0";
  const year = Number(get("year"));
  const month = Number(get("month"));
  const day = Number(get("day"));
  const hour = Number(get("hour")) % 24;
  const minute = Number(get("minute"));
  const second = Number(get("second"));
  const weekday = WEEKDAYS.indexOf(get("weekday"));
  return {
    year,
    month,
    day,
    hour,
    minute,
    second,
    weekday,
    minutesOfDay: hour * 60 + minute,
    dateKey: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
  };
}

/** Décalage du fuseau (minutes à ajouter à l'UTC pour obtenir l'heure locale) à un instant donné. */
export function tzOffsetMinutes(date: Date, timeZone: string): number {
  const p = toZonedParts(date, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return Math.round((asUtc - date.getTime()) / 60_000);
}

/**
 * Instant UTC correspondant à une date locale (AAAA-MM-JJ) et un nombre de
 * minutes depuis minuit dans le fuseau. Gère les changements d'heure par
 * double approximation.
 */
export function zonedToUtc(dateKey: string, minutesOfDay: number, timeZone: string): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  const naive = Date.UTC(y, m - 1, d, 0, 0, 0) + minutesOfDay * 60_000;
  let guess = naive - tzOffsetMinutes(new Date(naive), timeZone) * 60_000;
  guess = naive - tzOffsetMinutes(new Date(guess), timeZone) * 60_000;
  return new Date(guess);
}

export function isDateKey(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

export function addDaysToDateKey(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return date.toISOString().slice(0, 10);
}

export function todayDateKey(timeZone: string, now = new Date()): string {
  return toZonedParts(now, timeZone).dateKey;
}

export function weekdayOfDateKey(dateKey: string): number {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function minutesToHHMM(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function hhmmToMinutes(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h > 24 || m > 59 || (h === 24 && m > 0)) return null;
  return h * 60 + m;
}

const FR_DAYS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
const FR_DAYS_SHORT = ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."];
const FR_MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

/** « lundi 21 septembre 2026 » */
export function formatDateKeyLong(dateKey: string, withYear = true): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const wd = weekdayOfDateKey(dateKey);
  return `${FR_DAYS[wd]} ${d} ${FR_MONTHS[m - 1]}${withYear ? ` ${y}` : ""}`;
}

/** « Lun. 21 sept. » */
export function formatDateKeyShort(dateKey: string): string {
  const [, m, d] = dateKey.split("-").map(Number);
  const wd = weekdayOfDateKey(dateKey);
  const month = FR_MONTHS[m - 1];
  const short = month.length > 4 ? `${month.slice(0, 4)}.` : month;
  return `${FR_DAYS_SHORT[wd]} ${d} ${short}`;
}

export function frenchWeekdayName(weekday: number): string {
  return FR_DAYS[weekday];
}

/** « lundi 21 septembre 2026 à 14:00 » dans le fuseau donné. */
export function formatDateTimeFr(date: Date, timeZone: string): string {
  const p = toZonedParts(date, timeZone);
  return `${formatDateKeyLong(p.dateKey)} à ${minutesToHHMM(p.minutesOfDay)}`;
}

export function formatTimeFr(date: Date, timeZone: string): string {
  return minutesToHHMM(toZonedParts(date, timeZone).minutesOfDay);
}

export function formatPriceCents(cents: number): string {
  const amount = cents / 100;
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: Number.isInteger(amount) ? 0 : 2 }).format(amount);
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${String(m).padStart(2, "0")}`;
}
