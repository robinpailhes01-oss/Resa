import { describe, expect, it } from "vitest";
import { waitlistRequestSchema } from "@/server/waitlist/schema";

const valid = { email: "marie@institut.fr", privacyVersion: "2026-09-18" };

describe("contrat du formulaire", () => {
  it("accepte une demande minimale et applique les défauts", () => {
    const parsed = waitlistRequestSchema.parse(valid);
    expect(parsed.locale).toBe("fr");
    expect(parsed.source).toBe("landing");
    expect(parsed.businessType).toBeUndefined();
  });

  it("accepte les listes fermées et ignore les chaînes vides", () => {
    const parsed = waitlistRequestSchema.parse({ ...valid, businessType: "onglerie", teamSize: "" });
    expect(parsed.businessType).toBe("onglerie");
    expect(parsed.teamSize).toBeUndefined();
  });

  it("rejette une valeur hors liste, un champ inattendu et un email invalide (F13)", () => {
    expect(waitlistRequestSchema.safeParse({ ...valid, businessType: "pharmacie" }).success).toBe(false);
    expect(waitlistRequestSchema.safeParse({ ...valid, phone: "0600000000" }).success).toBe(false);
    expect(waitlistRequestSchema.safeParse({ ...valid, email: "marie" }).success).toBe(false);
  });

  it("rejette un champ piège rempli", () => {
    const result = waitlistRequestSchema.safeParse({ ...valid, website: "http://spam" });
    expect(result.success).toBe(false);
    expect(result.error?.issues.some((i) => i.path[0] === "website")).toBe(true);
  });

  it("limite les attributions aux clés autorisées", () => {
    expect(waitlistRequestSchema.safeParse({ ...valid, attribution: { utm_source: "instagram" } }).success).toBe(true);
    expect(waitlistRequestSchema.safeParse({ ...valid, attribution: { gclid: "x" } }).success).toBe(false);
  });
});
