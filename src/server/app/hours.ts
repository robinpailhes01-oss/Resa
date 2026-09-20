import "server-only";
import { getSql } from "@/server/db";
import type { OpeningRange } from "./availability";

export interface OpeningHourRow {
  id: string;
  practitionerId: string | null;
  weekday: number;
  startMin: number;
  endMin: number;
}

type Row = { id: string; practitioner_id: string | null; weekday: number; start_min: number; end_min: number };

export async function listOpeningHours(establishmentId: string, practitionerId: string | null): Promise<OpeningHourRow[]> {
  const sql = getSql();
  const rows = await sql<Row[]>`
    select id, practitioner_id, weekday, start_min, end_min from opening_hours
    where establishment_id = ${establishmentId}
      and ${practitionerId === null ? sql`practitioner_id is null` : sql`practitioner_id = ${practitionerId}`}
    order by weekday, start_min`;
  return rows.map((r) => ({ id: r.id, practitionerId: r.practitioner_id, weekday: r.weekday, startMin: r.start_min, endMin: r.end_min }));
}

/**
 * Horaires effectifs d'un praticien : ses propres horaires s'il en a,
 * sinon ceux de l'établissement.
 */
export async function effectiveRanges(establishmentId: string, practitionerId: string): Promise<OpeningRange[]> {
  const own = await listOpeningHours(establishmentId, practitionerId);
  const source = own.length > 0 ? own : await listOpeningHours(establishmentId, null);
  return source.map((h) => ({ weekday: h.weekday, startMin: h.startMin, endMin: h.endMin }));
}

export interface WeekInput {
  /** Par jour (0–6), liste de plages [start, end] en minutes. Jour absent = fermé. */
  days: Record<number, Array<[number, number]>>;
}

/** Remplace l'ensemble des horaires (établissement ou praticien) en une transaction. */
export async function replaceOpeningHours(establishmentId: string, practitionerId: string | null, input: WeekInput): Promise<void> {
  const sql = getSql();
  await sql.begin(async (tx) => {
    await tx`
      delete from opening_hours where establishment_id = ${establishmentId}
        and ${practitionerId === null ? tx`practitioner_id is null` : tx`practitioner_id = ${practitionerId}`}`;
    for (const [weekdayKey, ranges] of Object.entries(input.days)) {
      const weekday = Number(weekdayKey);
      for (const [startMin, endMin] of ranges) {
        if (endMin <= startMin) continue;
        await tx`insert into opening_hours (establishment_id, practitioner_id, weekday, start_min, end_min)
          values (${establishmentId}, ${practitionerId}, ${weekday}, ${startMin}, ${endMin})`;
      }
    }
  });
}
