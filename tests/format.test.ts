import { describe, expect, it } from "vitest";
import { formatMonthlyPrice, formatMonthlyPriceCompact, formatPractitioners, formatPrice, NBSP } from "@/lib/format";

describe("formatPrice", () => {
  it("formate 39 € avec espace insécable et sans décimales", () => {
    expect(formatPrice(39)).toBe(`39${NBSP}€`);
  });
  it("garde les centimes quand nécessaire", () => {
    expect(formatPrice(39.5)).toBe(`39,50${NBSP}€`);
  });
  it("compose les mentions HT / mois", () => {
    expect(formatMonthlyPrice(29)).toBe(`29${NBSP}€${NBSP}TTC${NBSP}/${NBSP}mois`);
    expect(formatMonthlyPriceCompact(29)).toBe(`29${NBSP}€${NBSP}TTC/mois`);
  });
  it("accorde le nombre de praticiens", () => {
    expect(formatPractitioners(3)).toBe(`jusqu’à 3${NBSP}praticiens`);
    expect(formatPractitioners(1)).toBe(`jusqu’à 1${NBSP}praticien`);
    expect(formatPractitioners(null)).toBe("agendas illimités");
  });
});
