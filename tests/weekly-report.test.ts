import { describe, expect, it } from "vitest";
import { formatWeeklyReport } from "@/lib/weekly-report";

describe("formatWeeklyReport", () => {
  it("met en forme le récap avec les bons pluriels et l'alerte essais", () => {
    const text = formatWeeklyReport({
      from: new Date("2026-09-17T07:00:00Z"),
      to: new Date("2026-09-24T07:00:00Z"),
      newUsers: 3,
      newEstablishments: 2,
      bookingsOnline: 10,
      bookingsManual: 4,
      cancellations: 1,
      feedbackCount: 2,
      activeSubscriptions: 1,
      trialsActive: 2,
      trialsEndingSoon: 2,
      trialsExpired: 0,
      totalEstablishments: 5,
      prospection: { contacted: 40, followedUp: 12, signedUp: 3, total: 300 },
    });
    expect(text).toContain("Nouveaux comptes : <b>3</b>");
    expect(text).toContain("<b>14</b> (10 en ligne, 4 à la main) · 1 annulation");
    expect(text).toContain("2 établissements à recontacter");
    expect(text).toContain("17 septembre → 24 septembre");
    expect(text).toContain("Prospection : 40 emails envoyés, 12 relances · inscrits via prospection : <b>3</b>");
  });
});
