import { describe, expect, it } from "vitest";
import { addDaysToDateKey, formatDuration, formatPriceCents, hhmmToMinutes, isDateKey, minutesToHHMM, todayDateKey, weekdayOfDateKey, zonedToUtc } from "@/lib/time";
import { slugify } from "@/lib/slug";

describe("fuseaux horaires", () => {
  it("convertit une heure locale de Paris en UTC, été comme hiver", () => {
    expect(zonedToUtc("2026-07-01", 9 * 60, "Europe/Paris").toISOString()).toBe("2026-07-01T07:00:00.000Z");
    expect(zonedToUtc("2026-01-15", 9 * 60, "Europe/Paris").toISOString()).toBe("2026-01-15T08:00:00.000Z");
  });

  it("gère le passage à l'heure d'hiver", () => {
    // 25 octobre 2026 : 3 h locales redeviennent 2 h ; 12:00 local = 11:00 UTC.
    expect(zonedToUtc("2026-10-25", 12 * 60, "Europe/Paris").toISOString()).toBe("2026-10-25T11:00:00.000Z");
  });

  it("calcule la date du jour dans le fuseau", () => {
    expect(todayDateKey("Europe/Paris", new Date("2026-09-20T22:30:00Z"))).toBe("2026-09-21");
    expect(todayDateKey("UTC", new Date("2026-09-20T22:30:00Z"))).toBe("2026-09-20");
  });
});

describe("clés de date", () => {
  it("valide, décale et donne le jour de la semaine", () => {
    expect(isDateKey("2026-02-29")).toBe(false);
    expect(isDateKey("2026-09-29")).toBe(true);
    expect(addDaysToDateKey("2026-12-31", 1)).toBe("2027-01-01");
    expect(weekdayOfDateKey("2026-09-20")).toBe(0);
    expect(weekdayOfDateKey("2026-09-29")).toBe(2);
  });

  it("convertit HH:MM", () => {
    expect(minutesToHHMM(9 * 60 + 5)).toBe("09:05");
    expect(hhmmToMinutes("19:30")).toBe(19 * 60 + 30);
    expect(hhmmToMinutes("25:00")).toBeNull();
    expect(hhmmToMinutes("")).toBeNull();
  });
});

describe("formats", () => {
  it("prix et durées en français", () => {
    expect(formatPriceCents(4500).replace(/ | /g, " ")).toBe("45 €");
    expect(formatPriceCents(4550).replace(/ | /g, " ")).toBe("45,50 €");
    expect(formatDuration(60).replace(/ | /g, " ")).toBe("1 h");
    expect(formatDuration(90).replace(/ | /g, " ")).toBe("1 h 30");
    expect(formatDuration(45)).toBe("45 min");
  });

  it("slugifie les noms d'établissement", () => {
    expect(slugify("Maison Alba")).toBe("maison-alba");
    expect(slugify("  L'Atelier d'Émilie & Co !! ")).toBe("l-atelier-d-emilie-co");
    expect(slugify("---")).toBe("");
  });
});
