import { describe, expect, it } from "vitest";
import { aggregate, delta, openMinutes, resolvePeriod, type StatBooking } from "@/lib/stats";
import { composeFrom } from "@/server/email/resend-sender";

const TZ = "Europe/Paris";
const now = new Date("2026-09-20T10:00:00Z");

describe("resolvePeriod", () => {
  it("borne le mois courant et le mois précédent dans le fuseau", () => {
    const p = resolvePeriod("mois", TZ, now);
    expect(p.startKey).toBe("2026-09-01");
    expect(p.endKey).toBe("2026-09-30");
    expect(p.start.toISOString()).toBe("2026-08-31T22:00:00.000Z");
    expect(p.end.toISOString()).toBe("2026-09-30T22:00:00.000Z");
    expect(p.previous.startKey).toBe("2026-08-01");
    expect(p.previous.endKey).toBe("2026-08-31");
  });

  it("gère le passage d'année et les 30 derniers jours", () => {
    const jan = resolvePeriod("mois-precedent", TZ, new Date("2026-01-10T12:00:00Z"));
    expect(jan.startKey).toBe("2025-12-01");
    expect(jan.previous.startKey).toBe("2025-11-01");
    const d30 = resolvePeriod("30j", TZ, now);
    expect(d30.startKey).toBe("2026-08-22");
    expect(d30.endKey).toBe("2026-09-20");
    expect(d30.previous.endKey).toBe("2026-08-21");
  });
});

const booking = (over: Partial<StatBooking>): StatBooking => ({
  id: Math.random().toString(36).slice(2),
  status: "confirmed",
  source: "online",
  startsAt: new Date("2026-09-10T08:00:00Z"),
  endsAt: new Date("2026-09-10T09:00:00Z"),
  durationMin: 60,
  priceCents: 4500,
  serviceName: "Coupe",
  practitionerId: "p1",
  practitionerName: "Camille",
  clientId: null,
  ...over,
});

describe("aggregate", () => {
  const range = { startKey: "2026-09-01", endKey: "2026-09-30" };
  it("sépare réalisé, à venir, annulations et absences", () => {
    const agg = aggregate(
      [
        booking({}),
        booking({ status: "completed", priceCents: 3000, serviceName: "Soin", practitionerId: "p2", practitionerName: "Sophie", source: "manual" }),
        booking({ startsAt: new Date("2026-09-25T08:00:00Z"), endsAt: new Date("2026-09-25T09:00:00Z"), priceCents: 8000 }),
        booking({ status: "cancelled" }),
        booking({ status: "no_show" }),
      ],
      range,
      TZ,
      now,
    );
    expect(agg.bookings).toBe(3);
    expect(agg.revenueDoneCents).toBe(7500);
    expect(agg.revenueUpcomingCents).toBe(8000);
    expect(agg.bookedMinutes).toBe(180);
    expect(agg.cancelled).toBe(1);
    expect(agg.noShows).toBe(1);
    expect(agg.online).toBe(2);
    expect(agg.manual).toBe(1);
    expect(agg.lossRate).toBeCloseTo(2 / 5);
    expect(agg.perDay).toHaveLength(30);
    expect(agg.perDay.find((d) => d.dateKey === "2026-09-10")?.count).toBe(2);
    expect(agg.topServices[0]).toEqual({ name: "Coupe", count: 2, revenueCents: 12500 });
    expect(agg.perPractitioner.map((p) => p.name)).toEqual(["Camille", "Sophie"]);
  });

  it("reste stable sans rendez-vous", () => {
    const agg = aggregate([], range, TZ, now);
    expect(agg.bookings).toBe(0);
    expect(agg.lossRate).toBeNull();
    expect(agg.perDay.every((d) => d.count === 0)).toBe(true);
  });
});

describe("openMinutes et delta", () => {
  it("cumule les horaires hebdomadaires sur la période", () => {
    // Septembre 2026 : 4 lundis (7, 14, 21, 28) et 4 mardis (1, 8, 15, 22, 29 → 5).
    const minutes = openMinutes(
      [
        { weekday: 1, startMin: 9 * 60, endMin: 12 * 60 },
        { weekday: 2, startMin: 9 * 60, endMin: 10 * 60 },
      ],
      { startKey: "2026-09-01", endKey: "2026-09-30" },
    );
    expect(minutes).toBe(4 * 180 + 5 * 60);
  });

  it("calcule la variation relative", () => {
    expect(delta(12, 10)).toBeCloseTo(0.2);
    expect(delta(0, 10)).toBe(-1);
    expect(delta(5, 0)).toBeNull();
  });
});

describe("composeFrom", () => {
  it("remplace le nom affiché en conservant l'adresse", () => {
    expect(composeFrom("Reso <bonjour@reso.fr>", "Maison Alba via Reso")).toBe("Maison Alba via Reso <bonjour@reso.fr>");
    expect(composeFrom("bonjour@reso.fr", "Maison Alba via Reso")).toBe("Maison Alba via Reso <bonjour@reso.fr>");
    expect(composeFrom("Reso <bonjour@reso.fr>")).toBe("Reso <bonjour@reso.fr>");
  });

  it("neutralise les caractères dangereux du nom", () => {
    expect(composeFrom("Reso <bonjour@reso.fr>", 'Salon "X" <evil@x>\r\nBcc: a@b')).toBe("Salon X evil@xBcc: a@b <bonjour@reso.fr>");
  });
});
