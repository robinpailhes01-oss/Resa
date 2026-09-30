import { describe, expect, it } from "vitest";
import { amountDue, describePaymentRule, normalizePaymentStatus, validatePaymentRule } from "@/lib/booking-payment";
import { open, seal } from "@/server/secret-box";

const euros = (c: number) => `${c / 100} €`;

describe("montant à régler en ligne", () => {
  it("aucun paiement : rien n'est dû", () => {
    expect(amountDue({ mode: "none", depositKind: "percent", depositValue: 30 }, 5000)).toBeNull();
  });

  it("acompte en pourcentage, arrondi au centime", () => {
    expect(amountDue({ mode: "deposit", depositKind: "percent", depositValue: 30 }, 4550)).toEqual({ kind: "deposit", amountCents: 1365, remainingCents: 3185 });
  });

  it("acompte fixe plafonné au prix : devient un paiement intégral", () => {
    expect(amountDue({ mode: "deposit", depositKind: "fixed", depositValue: 3000 }, 2500)).toEqual({ kind: "full", amountCents: 2500, remainingCents: 0 });
  });

  it("paiement intégral", () => {
    expect(amountDue({ mode: "full", depositKind: "percent", depositValue: 30 }, 6000)).toEqual({ kind: "full", amountCents: 6000, remainingCents: 0 });
  });

  it("prestation gratuite ou montant sous 1 € : pas de paiement", () => {
    expect(amountDue({ mode: "full", depositKind: "percent", depositValue: 30 }, 0)).toBeNull();
    expect(amountDue({ mode: "deposit", depositKind: "percent", depositValue: 10 }, 900)).toBeNull();
  });

  it("valide les saisies de l'espace pro", () => {
    expect(validatePaymentRule({ mode: "deposit", depositKind: "percent", depositValue: 0 })).toMatch(/entre 1 et 100/);
    expect(validatePaymentRule({ mode: "deposit", depositKind: "percent", depositValue: 101 })).toMatch(/entre 1 et 100/);
    expect(validatePaymentRule({ mode: "deposit", depositKind: "fixed", depositValue: 50 })).toMatch(/entre 1 €/);
    expect(validatePaymentRule({ mode: "deposit", depositKind: "fixed", depositValue: 2000 })).toBeNull();
    expect(validatePaymentRule({ mode: "none", depositKind: "fixed", depositValue: 0 })).toBeNull();
  });

  it("libellés de la règle", () => {
    expect(describePaymentRule({ mode: "deposit", depositKind: "percent", depositValue: 30 }, euros)).toBe("Acompte de 30 % à la réservation");
    expect(describePaymentRule({ mode: "deposit", depositKind: "fixed", depositValue: 2000 }, euros)).toBe("Acompte de 20 € à la réservation");
    expect(describePaymentRule({ mode: "full", depositKind: "percent", depositValue: 30 }, euros)).toBe("Paiement intégral à la réservation");
  });

  it("statuts Mollie ramenés aux états suivis", () => {
    expect(normalizePaymentStatus("paid")).toBe("paid");
    expect(normalizePaymentStatus("authorized")).toBe("open");
    expect(normalizePaymentStatus("pending")).toBe("open");
    expect(normalizePaymentStatus("expired")).toBe("expired");
  });
});

describe("chiffrement des jetons Mollie", () => {
  const env = { MOLLIE_TOKEN_ENCRYPTION_KEY: "k".repeat(48) };

  it("chiffre puis déchiffre, avec un résultat différent à chaque fois", () => {
    const a = seal("access_abc", env);
    const b = seal("access_abc", env);
    expect(a).not.toBe(b);
    expect(a).not.toContain("access_abc");
    expect(open(a, env)).toBe("access_abc");
  });

  it("refuse un jeton modifié ou une autre clé", () => {
    const sealed = seal("refresh_xyz", env);
    const parts = sealed.split(".");
    parts[3] = Buffer.from("autre chose").toString("base64url");
    expect(() => open(parts.join("."), env)).toThrow();
    expect(() => open(sealed, { MOLLIE_TOKEN_ENCRYPTION_KEY: "z".repeat(48) })).toThrow();
  });

  it("exige une clé d'au moins 32 caractères", () => {
    expect(() => seal("x", { MOLLIE_TOKEN_ENCRYPTION_KEY: "court" })).toThrow(/32 caractères/);
  });
});
