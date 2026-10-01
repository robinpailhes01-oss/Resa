import { describe, expect, it } from "vitest";
import { groupServices, swapNeighbour } from "@/lib/service-groups";

const cat = (id: string, sortOrder: number, description: string | null = null) => ({ id, title: id, description, sortOrder });
const svc = (name: string, categoryId: string | null, sortOrder = 0) => ({ name, categoryId, sortOrder });

describe("rubriques de la page de réservation", () => {
  it("range les prestations sous leurs rubriques, dans l'ordre choisi, et met les autres à la fin", () => {
    const groups = groupServices([cat("ongles", 2), cat("visage", 1)], [svc("Pose", "ongles"), svc("Soin", "visage"), svc("Libre", null), svc("Orpheline", "supprimée")]);
    expect(groups.map((g) => g.category?.id ?? null)).toEqual(["visage", "ongles", null]);
    expect(groups[2].services.map((s) => s.name)).toEqual(["Libre", "Orpheline"]);
  });

  it("garde une rubrique vide seulement si elle porte un message", () => {
    const groups = groupServices([cat("info", 0, "Merci de lire avant de réserver"), cat("vide", 1), cat("visage", 2)], [svc("Soin", "visage")]);
    expect(groups.map((g) => g.category?.id)).toEqual(["info", "visage"]);
  });

  it("sans rubrique : une seule liste", () => {
    const groups = groupServices([], [svc("A", null), svc("B", null)]);
    expect(groups).toHaveLength(1);
    expect(groups[0].category).toBeNull();
  });

  it("échange avec la voisine, sans sortir de la liste", () => {
    expect(swapNeighbour(["a", "b", "c"], "b", "up")).toEqual(["b", "a", "c"]);
    expect(swapNeighbour(["a", "b", "c"], "b", "down")).toEqual(["a", "c", "b"]);
    expect(swapNeighbour(["a", "b"], "a", "up")).toBeNull();
    expect(swapNeighbour(["a", "b"], "b", "down")).toBeNull();
    expect(swapNeighbour(["a"], "z", "up")).toBeNull();
  });
});
