import { describe, expect, it } from "vitest";
import { serviceTemplates, templatesFor } from "@/content/fr/service-templates";

describe("prestations types", () => {
  it("chaque activité a des modèles cohérents et des clés uniques", () => {
    for (const [type, list] of Object.entries(serviceTemplates)) {
      expect(list.length, type).toBeGreaterThan(0);
      expect(new Set(list.map((t) => t.key)).size).toBe(list.length);
      for (const t of list) {
        expect(t.durationMin % 5).toBe(0);
        expect(t.durationMin).toBeGreaterThanOrEqual(5);
        expect(t.price).toBeGreaterThan(0);
      }
    }
    expect(templatesFor("inconnu")).toBe(serviceTemplates.autre);
    expect(templatesFor("onglerie")[0].name).toMatch(/gel/i);
  });
});
