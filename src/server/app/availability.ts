/**
 * Calcul des créneaux disponibles (fonction pure, testée sans base).
 * Tous les instants sont en UTC ; les horaires d'ouverture sont locaux.
 */
import { zonedToUtc } from "@/lib/time";

export interface OpeningRange {
  weekday: number;
  startMin: number;
  endMin: number;
}

export interface BusyInterval {
  /** UTC */
  start: Date;
  /** UTC, fin d'occupation (tampon inclus) */
  end: Date;
}

export interface AvailabilityInput {
  dateKey: string;
  timeZone: string;
  /** Horaires applicables au praticien ce jour-là (déjà filtrés par weekday). */
  ranges: OpeningRange[];
  busy: BusyInterval[];
  durationMin: number;
  bufferMin: number;
  stepMin: number;
  /** Instant courant, pour le délai minimal. */
  now: Date;
  minLeadMin: number;
}

export interface Slot {
  start: Date;
  end: Date;
  /** « HH:MM » local */
  label: string;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function computeSlots(input: AvailabilityInput): Slot[] {
  const { dateKey, timeZone, ranges, busy, durationMin, bufferMin, stepMin, now, minLeadMin } = input;
  const earliest = now.getTime() + minLeadMin * 60_000;
  const slots: Slot[] = [];
  const sortedBusy = [...busy].sort((a, b) => a.start.getTime() - b.start.getTime());

  for (const range of ranges) {
    // Le créneau et son tampon doivent tenir dans la plage d'ouverture.
    for (let m = range.startMin; m + durationMin <= range.endMin; m += stepMin) {
      const start = zonedToUtc(dateKey, m, timeZone);
      const end = new Date(start.getTime() + durationMin * 60_000);
      const blocksUntil = new Date(end.getTime() + bufferMin * 60_000);
      if (start.getTime() < earliest) continue;
      const overlaps = sortedBusy.some((b) => b.start < blocksUntil && b.end > start);
      if (overlaps) continue;
      slots.push({ start, end, label: `${pad(Math.floor(m / 60))}:${pad(m % 60)}` });
    }
  }
  slots.sort((a, b) => a.start.getTime() - b.start.getTime());
  // Dédoublonne si deux plages se chevauchent.
  return slots.filter((s, i) => i === 0 || s.start.getTime() !== slots[i - 1].start.getTime());
}
