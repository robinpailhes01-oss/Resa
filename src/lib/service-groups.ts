/**
 * Regroupe les prestations sous les rubriques de l'établissement, dans l'ordre
 * choisi. Une rubrique sans prestation reste affichée si elle porte un texte
 * (bloc d'information) ; les prestations sans rubrique viennent à la fin.
 */
export interface CategoryLike {
  id: string;
  title: string;
  description: string | null;
  sortOrder: number;
}

export interface ServiceLike {
  categoryId: string | null;
  sortOrder: number;
}

export interface ServiceGroup<C extends CategoryLike, S extends ServiceLike> {
  /** null = prestations sans rubrique. */
  category: C | null;
  services: S[];
}

export function groupServices<C extends CategoryLike, S extends ServiceLike>(categories: C[], services: S[]): Array<ServiceGroup<C, S>> {
  const ordered = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
  const known = new Set(ordered.map((c) => c.id));
  const groups: Array<ServiceGroup<C, S>> = ordered.map((category) => ({ category, services: services.filter((s) => s.categoryId === category.id) }));
  const loose = services.filter((s) => s.categoryId === null || !known.has(s.categoryId));
  const kept = groups.filter((g) => g.services.length > 0 || (g.category?.description ?? "").trim() !== "");
  if (loose.length > 0) kept.push({ category: null, services: loose });
  return kept;
}

/** Nouvel ordre après échange avec la voisine ; null si rien ne bouge. */
export function swapNeighbour(ids: string[], id: string, direction: "up" | "down"): string[] | null {
  const index = ids.indexOf(id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= ids.length) return null;
  const next = [...ids];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
