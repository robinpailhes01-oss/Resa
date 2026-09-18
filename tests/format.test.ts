import { describe, expect, it } from "vitest";
import { formatMonthlyPriceExVat, formatMonthlyPriceExVatCompact, formatPractitioners, formatPrice, NBSP } from "@/lib/format";

describe("formatPrice", () => {
  it("formate 39 € avec espace insécable et sans décimales", () => {
    expect(formatPrice(39)).toBe(`39${NBSP}€`);
  });
  it("garde les centimes quand nécessaire", () => {
    expect(formatPrice(39.5)).toBe(`39,50${NBSP}€`);
  });
  it("compose les mentions HT / mois", () => {
    expect(formatMonthlyPriceExVat(39)).toBe(`39${NBSP}€${NBSP}HT${NBSP}/${NBSP}mois`);
    expect(formatMonthlyPriceExVatCompact(39)).toBe(`39${NBSP}€${NBSP}HT/mois`);
  });
  it("accorde le nombre de praticiens", () => {
    expect(formatPractitioners(3)).toBe(`jusqu’à 3${NBSP}praticiens`);
    expect(formatPractitioners(1)).toBe(`jusqu’à 1${NBSP}praticien`);
  });
});
