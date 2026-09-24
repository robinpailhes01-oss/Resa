/**
 * Ciblage de la prospection sortante (config commerciale, jamais de valeur en dur ailleurs).
 * Chaque jour, quelques recherches Google Places sont lancées en tournant sur
 * les couples catégorie × ville ci-dessous, puis les établissements avec un
 * email public sont contactés (limite quotidienne, jours ouvrés).
 */

export interface ProspectionCategory {
  /** Clé stockée en base et utilisée dans les emails. */
  key: "coiffeur" | "barbier" | "institut" | "onglerie";
  /** Texte de la recherche Google. */
  query: string;
  /** Libellé au pluriel pour les emails (« pensé pour les … indépendants »). */
  pluralLabel: string;
}

export const prospectionCategories: ProspectionCategory[] = [
  { key: "coiffeur", query: "salon de coiffure", pluralLabel: "salons de coiffure" },
  { key: "barbier", query: "barbier", pluralLabel: "barbiers" },
  { key: "institut", query: "institut de beauté", pluralLabel: "instituts de beauté" },
  { key: "onglerie", query: "onglerie", pluralLabel: "ongleries" },
];

/** Villes prospectées, du plus proche au plus lointain de Marseille (rotation quotidienne). */
export const prospectionCities: string[] = [
  "Marseille",
  "Aix-en-Provence",
  "Aubagne",
  "La Ciotat",
  "Martigues",
  "Salon-de-Provence",
  "Toulon",
  "Hyères",
  "Avignon",
  "Nîmes",
  "Montpellier",
  "Nice",
  "Cannes",
  "Antibes",
  "Lyon",
  "Grenoble",
  "Toulouse",
  "Bordeaux",
  "Nantes",
  "Rennes",
  "Lille",
  "Strasbourg",
  "Paris",
];

export interface ProspectionSettings {
  /** Recherches Google par jour (chaque recherche renvoie jusqu'à 20 établissements). */
  searchesPerDay: number;
  /** Emails de premier contact envoyés par jour ouvré. */
  dailyEmailLimit: number;
  /** Relance unique, ce nombre de jours après le premier email sans inscription ni désinscription. */
  followUpAfterDays: number;
  /** Sites analysés par exécution (page d'accueil + page contact). */
  enrichPerRun: number;
}

function readInt(value: string | undefined, fallback: number, max: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isInteger(parsed) || parsed < 0) return fallback;
  return Math.min(parsed, max);
}

/** Réglages lus à l'exécution (variables serveur, modifiables sans rebuild). */
export function prospectionSettings(env: Record<string, string | undefined> = process.env): ProspectionSettings {
  return {
    searchesPerDay: readInt(env.PROSPECTION_SEARCHES_PER_DAY, 3, 12),
    dailyEmailLimit: readInt(env.PROSPECTION_DAILY_LIMIT, 20, 80),
    followUpAfterDays: readInt(env.PROSPECTION_FOLLOW_UP_DAYS, 5, 30),
    enrichPerRun: readInt(env.PROSPECTION_ENRICH_PER_RUN, 60, 120),
  };
}

/** La prospection est active seulement si PROSPECTION_ENABLED=1 (et une clé Google Places présente). */
export function isProspectionEnabled(env: Record<string, string | undefined> = process.env): boolean {
  return (env.PROSPECTION_ENABLED ?? "").trim() === "1";
}
