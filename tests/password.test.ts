import { describe, expect, it } from "vitest";
import { hashPassword, isAcceptablePassword, verifyPassword } from "@/server/auth/password";

describe("mots de passe", () => {
  it("hache avec un sel aléatoire et vérifie", async () => {
    const a = await hashPassword("motdepasse-solide-42");
    const b = await hashPassword("motdepasse-solide-42");
    expect(a).not.toBe(b);
    expect(a.startsWith("scrypt$")).toBe(true);
    expect(await verifyPassword("motdepasse-solide-42", a)).toBe(true);
    expect(await verifyPassword("autre", a)).toBe(false);
  });

  it("refuse un format inconnu sans lever d'erreur", async () => {
    expect(await verifyPassword("x", "n-importe-quoi")).toBe(false);
    expect(await verifyPassword("x", "")).toBe(false);
  });

  it("exige au moins 8 caractères", () => {
    expect(isAcceptablePassword("court")).toBe(false);
    expect(isAcceptablePassword("assez-long")).toBe(true);
  });
});
