import { describe, expect, it } from "vitest";
import { isValidEmail, normalizeEmail } from "@/server/waitlist/email-normalize";

describe("normalizeEmail", () => {
  it("supprime les espaces périphériques et passe en minuscules", () => {
    expect(normalizeEmail("  Marie.Dupont@Institut.FR ")).toBe("marie.dupont@institut.fr");
  });
  it("conserve les points et les suffixes +", () => {
    expect(normalizeEmail("marie.dupont+reso@gmail.com")).toBe("marie.dupont+reso@gmail.com");
  });
});

describe("isValidEmail", () => {
  it("accepte des adresses courantes", () => {
    expect(isValidEmail("marie@institut.fr")).toBe(true);
    expect(isValidEmail("m.d+tag@sous.domaine.co.uk")).toBe(true);
  });
  it("refuse les adresses incomplètes ou trop longues", () => {
    expect(isValidEmail("marie")).toBe(false);
    expect(isValidEmail("marie@institut")).toBe(false);
    expect(isValidEmail("ma rie@institut.fr")).toBe(false);
    expect(isValidEmail(`${"a".repeat(64)}@${"b".repeat(190)}.fr`)).toBe(false);
  });
});
