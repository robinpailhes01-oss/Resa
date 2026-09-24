import { describe, expect, it } from "vitest";
import { addOneMonth, formatEuros, nextPeriod, subscriptionAmounts } from "@/lib/billing";

describe("facturation", () => {
  it("calcule HT, TVA et TTC", () => {
    expect(subscriptionAmounts(39, 20)).toEqual({ exVatCents: 3900, vatCents: 780, totalCents: 4680, vatRate: 20 });
    expect(subscriptionAmounts(39, 0).totalCents).toBe(3900);
    expect(formatEuros(4680).replace(/ | /g, " ")).toBe("46,80 €");
  });
  it("ajoute un mois calendaire et enchaîne les périodes", () => {
    expect(addOneMonth(new Date("2026-01-31T10:00:00Z")).toISOString()).toBe("2026-02-28T10:00:00.000Z");
    const now = new Date("2026-09-24T10:00:00Z");
    expect(nextPeriod(null, now).start).toBe(now);
    const paid = new Date("2026-10-01T10:00:00Z");
    const p = nextPeriod(paid, now);
    expect(p.start).toBe(paid);
    expect(p.end.toISOString()).toBe("2026-11-01T10:00:00.000Z");
    expect(nextPeriod(new Date("2026-09-01T00:00:00Z"), now).start).toBe(now);
  });
});
