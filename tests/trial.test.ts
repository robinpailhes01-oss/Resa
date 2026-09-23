import { describe, expect, it } from "vitest";
import { canAcceptOnlineBookings, daysLeft, resolveAccess, trialEndDate } from "@/lib/trial";

const now = new Date("2026-09-23T10:00:00Z");

describe("resolveAccess", () => {
  it("essai en cours : accès complet et jours restants arrondis vers le haut", () => {
    const access = resolveAccess({ subscriptionStatus: "trial", trialEndsAt: new Date("2026-09-30T10:00:00Z") }, now);
    expect(access).toMatchObject({ state: "trial", daysLeft: 7 });
    expect(canAcceptOnlineBookings(access)).toBe(true);
    const lastDay = resolveAccess({ subscriptionStatus: "trial", trialEndsAt: new Date("2026-09-23T18:00:00Z") }, now);
    expect(lastDay).toMatchObject({ state: "trial", daysLeft: 1 });
  });

  it("essai terminé : réservation en ligne suspendue", () => {
    const access = resolveAccess({ subscriptionStatus: "trial", trialEndsAt: new Date("2026-09-23T09:59:00Z") }, now);
    expect(access.state).toBe("expired");
    expect(canAcceptOnlineBookings(access)).toBe(false);
    expect(resolveAccess({ subscriptionStatus: "trial", trialEndsAt: null }, now).state).toBe("expired");
  });

  it("abonnement actif ou arrêté", () => {
    expect(resolveAccess({ subscriptionStatus: "active", trialEndsAt: null }, now)).toEqual({ state: "active" });
    const cancelled = resolveAccess({ subscriptionStatus: "cancelled", trialEndsAt: new Date("2030-01-01") }, now);
    expect(cancelled.state).toBe("cancelled");
    expect(canAcceptOnlineBookings(cancelled)).toBe(false);
  });

  it("date de fin d'essai et compte des jours", () => {
    const end = trialEndDate(7, now);
    expect(end.toISOString()).toBe("2026-09-30T10:00:00.000Z");
    expect(daysLeft(end, now)).toBe(7);
    expect(daysLeft(now, now)).toBe(0);
  });
});
