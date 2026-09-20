import { describe, expect, it } from "vitest";
import { computeSlots } from "@/server/app/availability";
import { zonedToUtc } from "@/lib/time";

const TZ = "Europe/Paris";
const day = "2026-09-29"; // mardi, heure d'été (UTC+2)
const at = (min: number) => zonedToUtc(day, min, TZ);
const base = {
  dateKey: day,
  timeZone: TZ,
  ranges: [{ weekday: 2, startMin: 9 * 60, endMin: 12 * 60 }],
  busy: [],
  durationMin: 60,
  bufferMin: 0,
  stepMin: 30,
  now: new Date("2026-09-01T00:00:00Z"),
  minLeadMin: 0,
};

describe("computeSlots", () => {
  it("propose des créneaux au pas demandé qui tiennent dans la plage", () => {
    const slots = computeSlots(base);
    expect(slots.map((s) => s.label)).toEqual(["09:00", "09:30", "10:00", "10:30", "11:00"]);
    expect(slots[0].start.toISOString()).toBe("2026-09-29T07:00:00.000Z");
  });

  it("retire les créneaux qui chevauchent un rendez-vous (tampon compris)", () => {
    const slots = computeSlots({ ...base, busy: [{ start: at(10 * 60), end: at(10 * 60 + 45) }] });
    expect(slots.map((s) => s.label)).toEqual(["09:00", "11:00"]);
  });

  it("réserve le tampon de la prestation après le créneau", () => {
    const slots = computeSlots({ ...base, bufferMin: 15, busy: [{ start: at(11 * 60), end: at(12 * 60) }] });
    // 10:00 → fin 11:00 + 15 min de tampon chevauche 11:00.
    expect(slots.map((s) => s.label)).toEqual(["09:00", "09:30"]);
  });

  it("respecte le délai minimal de prévenance", () => {
    const slots = computeSlots({ ...base, now: at(9 * 60 + 10), minLeadMin: 60 });
    expect(slots.map((s) => s.label)).toEqual(["10:30", "11:00"]);
  });

  it("dédoublonne deux plages qui se recouvrent et trie le résultat", () => {
    const slots = computeSlots({
      ...base,
      ranges: [
        { weekday: 2, startMin: 10 * 60, endMin: 12 * 60 },
        { weekday: 2, startMin: 9 * 60, endMin: 11 * 60 },
      ],
    });
    expect(slots.map((s) => s.label)).toEqual(["09:00", "09:30", "10:00", "10:30", "11:00"]);
  });

  it("ne propose rien sans horaires", () => {
    expect(computeSlots({ ...base, ranges: [] })).toEqual([]);
  });
});
