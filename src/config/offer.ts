/**
 * Source unique de configuration commerciale (cahier des charges §2).
 *
 * Tous les montants, mentions et métadonnées affichés sur le site doivent
 * dériver de cet objet. Modifier une valeur ici met à jour l'ensemble du site.
 *
 * Les valeurs sensibles au déploiement (mode, URLs applicatives) sont lues
 * dans l'environnement au moment du build ; les valeurs manquantes gardent
 * un défaut sûr (mode pré-lancement).
 */

export type LaunchMode = "prelaunch" | "live";

export interface OfferConfig {
  brandName: string;
  launchMode: LaunchMode;
  monthlyPriceExVat: number;
  currency: "EUR";
  practitionerLimit: number;
  /** Durée de l'essai gratuit en jours (7 par défaut ; RESO_TRIAL_DAYS=0 la désactive). */
  trialDays: number | null;
  /** URL réelle de création de compte. `null` tant qu'elle n'est pas validée. */
  signupUrl: string | null;
  /** URL réelle de connexion. `null` tant qu'elle n'est pas validée. */
  loginUrl: string | null;
  /** Adresse de contact surveillée. `null` tant qu'elle n'est pas fournie. */
  supportEmail: string | null;
  /** Identité légale de l'éditeur (raison sociale et adresse). */
  legalEntity: string | null;
  /** Numéro SIREN ou SIRET de l'éditeur. */
  legalId: string | null;
  /** Numéro de TVA intracommunautaire, ou null en franchise de TVA. */
  vatNumber: string | null;
  /** Taux de TVA appliqué à l'abonnement (20 par défaut ; 0 en franchise). */
  vatRate: number;
  /** Directeur ou directrice de la publication. */
  publicationDirector: string | null;
  /** Hébergeur du site. */
  hostingProvider: string;
  /** Version de la politique de confidentialité acceptée par le formulaire. */
  privacyVersion: string;
  /** Origine publique du site (canonical, liens absolus des emails). */
  siteUrl: string;
}

function readOptional(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function readEmail(value: string | undefined, name: string): string | null {
  const raw = readOptional(value);
  if (!raw) return null;
  // Une valeur recopiée depuis un champ masqué (« •••• ») n'est pas une adresse : on le dit au build.
  if (!/^[^\s@<>•*]+@[^\s@<>•*]+\.[^\s@<>•*]+$/.test(raw)) {
    throw new Error(`${name} invalide : attendu une adresse email en clair, par exemple contact@reso-app.fr (reçu : "${raw}").`);
  }
  return raw.toLowerCase();
}

function readHttpsUrl(value: string | undefined, name: string): string | null {
  const raw = readOptional(value);
  if (!raw) return null;
  // Chemin interne de l'application (ex. « /inscription ») : accepté tel quel.
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw;
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error(`${name} doit être une URL absolue valide ou un chemin interne commençant par « / » (reçu : "${raw}").`);
  }
  if (parsed.protocol !== "https:" && parsed.hostname !== "localhost") {
    throw new Error(`${name} doit utiliser HTTPS (reçu : "${raw}").`);
  }
  return parsed.toString();
}

function readLaunchMode(value: string | undefined): LaunchMode {
  const mode = (value ?? "prelaunch").trim().toLowerCase();
  if (mode === "live") return "live";
  if (mode === "prelaunch" || mode === "") return "prelaunch";
  throw new Error(`RESO_LAUNCH_MODE inconnu : "${value}". Valeurs admises : prelaunch, live.`);
}

function readPrice(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number(value.replace(",", "."));
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`RESO_MONTHLY_PRICE_EX_VAT invalide : "${value}".`);
  }
  return parsed;
}

function readVatRate(value: string | undefined): number {
  if (!value || !value.trim()) return 20;
  const parsed = Number(value.replace(",", "."));
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 30) throw new Error(`RESO_VAT_RATE invalide : "${value}".`);
  return parsed;
}

function readInt(value: string | undefined, fallback: number | null, { allowZero = false } = {}): number | null {
  if (!value || !value.trim()) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 0 || (parsed === 0 && !allowZero)) {
    throw new Error(`Valeur entière invalide : "${value}".`);
  }
  return parsed === 0 ? null : parsed;
}

type Env = Record<string, string | undefined>;

function buildConfig(env: Env): OfferConfig {
  const config: OfferConfig = {
    brandName: "Reso",
    launchMode: readLaunchMode(env.RESO_LAUNCH_MODE),
    monthlyPriceExVat: readPrice(env.RESO_MONTHLY_PRICE_EX_VAT, 39),
    currency: "EUR",
    practitionerLimit: readInt(env.RESO_PRACTITIONER_LIMIT, 3) ?? 3,
    trialDays: readInt(env.RESO_TRIAL_DAYS, 7, { allowZero: true }),
    signupUrl: readHttpsUrl(env.RESO_SIGNUP_URL, "RESO_SIGNUP_URL"),
    loginUrl: readHttpsUrl(env.RESO_LOGIN_URL, "RESO_LOGIN_URL"),
    supportEmail: readEmail(env.RESO_SUPPORT_EMAIL, "RESO_SUPPORT_EMAIL"),
    legalEntity: readOptional(env.RESO_LEGAL_ENTITY) ?? "SAS Harmonie Group, 61 rue du Rouet, 13008 Marseille, France",
    legalId: readOptional(env.RESO_LEGAL_ID),
    vatNumber: readOptional(env.RESO_VAT_NUMBER),
    vatRate: readVatRate(env.RESO_VAT_RATE),
    publicationDirector: readOptional(env.RESO_PUBLICATION_DIRECTOR) ?? "Robin Pailhes",
    hostingProvider: readOptional(env.RESO_HOSTING_PROVIDER) ?? "Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis",
    privacyVersion: readOptional(env.RESO_PRIVACY_VERSION) ?? "2026-09-18",
    siteUrl: readOptional(env.RESO_SITE_URL) ?? "http://localhost:3000",
  };

  // L'application est intégrée au site : en mode live, l'inscription et la
  // connexion pointent par défaut sur ses propres pages.
  if (config.launchMode === "live") {
    config.signupUrl ??= "/inscription";
    config.loginUrl ??= "/connexion";
  }

  assertLaunchRules(config);
  return config;
}

/**
 * Règle de mise en production (§2) : un mode live ne peut pas être activé
 * sans URL de création de compte. Le build échoue explicitement plutôt que
 * d'afficher un bouton inactif ou un lien « # » (les chemins internes de
 * l'application servent de défaut).
 */
export function assertLaunchRules(config: OfferConfig): void {
  if (config.launchMode === "live" && !config.signupUrl) {
    throw new Error(
      "RESO_LAUNCH_MODE=live exige RESO_SIGNUP_URL. Repassez en prelaunch ou fournissez l'URL validée.",
    );
  }
}

/**
 * Accès littéraux à process.env : Next.js les fige au build (clé `env` de
 * next.config.ts) dans le bundle serveur comme dans le bundle client, ce qui
 * garantit un rendu identique des deux côtés.
 */
const runtimeEnv: Env = {
  RESO_LAUNCH_MODE: process.env.RESO_LAUNCH_MODE,
  RESO_MONTHLY_PRICE_EX_VAT: process.env.RESO_MONTHLY_PRICE_EX_VAT,
  RESO_PRACTITIONER_LIMIT: process.env.RESO_PRACTITIONER_LIMIT,
  RESO_TRIAL_DAYS: process.env.RESO_TRIAL_DAYS,
  RESO_SIGNUP_URL: process.env.RESO_SIGNUP_URL,
  RESO_LOGIN_URL: process.env.RESO_LOGIN_URL,
  RESO_SUPPORT_EMAIL: process.env.RESO_SUPPORT_EMAIL,
  RESO_LEGAL_ENTITY: process.env.RESO_LEGAL_ENTITY,
  RESO_LEGAL_ID: process.env.RESO_LEGAL_ID,
  RESO_VAT_NUMBER: process.env.RESO_VAT_NUMBER,
  RESO_VAT_RATE: process.env.RESO_VAT_RATE,
  RESO_PUBLICATION_DIRECTOR: process.env.RESO_PUBLICATION_DIRECTOR,
  RESO_HOSTING_PROVIDER: process.env.RESO_HOSTING_PROVIDER,
  RESO_PRIVACY_VERSION: process.env.RESO_PRIVACY_VERSION,
  RESO_SITE_URL: process.env.RESO_SITE_URL,
};

export const offer: OfferConfig = buildConfig(runtimeEnv);

export const isPrelaunch = offer.launchMode === "prelaunch";
export const isLive = offer.launchMode === "live";

/** Exposé pour les tests : reconstruit une configuration à partir d'un environnement. */
export const __internal = { buildConfig };
