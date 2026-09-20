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
  /** Durée d'essai en jours. `null` tant qu'elle n'est pas approuvée. */
  trialDays: number | null;
  /** URL réelle de création de compte. `null` tant qu'elle n'est pas validée. */
  signupUrl: string | null;
  /** URL réelle de connexion. `null` tant qu'elle n'est pas validée. */
  loginUrl: string | null;
  /** Adresse de contact surveillée. `null` tant qu'elle n'est pas fournie. */
  supportEmail: string | null;
  /** Identité légale de l'éditeur. `null` tant qu'elle n'est pas fournie. */
  legalEntity: string | null;
  /** Version de la politique de confidentialité acceptée par le formulaire. */
  privacyVersion: string;
  /** Origine publique du site (canonical, liens absolus des emails). */
  siteUrl: string;
}

function readOptional(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
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

function readInt(value: string | undefined, fallback: number | null): number | null {
  if (!value || !value.trim()) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Valeur entière invalide : "${value}".`);
  }
  return parsed;
}

type Env = Record<string, string | undefined>;

function buildConfig(env: Env): OfferConfig {
  const config: OfferConfig = {
    brandName: "Reso",
    launchMode: readLaunchMode(env.RESO_LAUNCH_MODE),
    monthlyPriceExVat: readPrice(env.RESO_MONTHLY_PRICE_EX_VAT, 39),
    currency: "EUR",
    practitionerLimit: readInt(env.RESO_PRACTITIONER_LIMIT, 3) ?? 3,
    trialDays: readInt(env.RESO_TRIAL_DAYS, null),
    signupUrl: readHttpsUrl(env.RESO_SIGNUP_URL, "RESO_SIGNUP_URL"),
    loginUrl: readHttpsUrl(env.RESO_LOGIN_URL, "RESO_LOGIN_URL"),
    supportEmail: readOptional(env.RESO_SUPPORT_EMAIL),
    legalEntity: readOptional(env.RESO_LEGAL_ENTITY),
    privacyVersion: readOptional(env.RESO_PRIVACY_VERSION) ?? "2026-09-18",
    siteUrl: readOptional(env.RESO_SITE_URL) ?? "http://localhost:3000",
  };

  assertLaunchRules(config);
  return config;
}

/**
 * Règle de mise en production (§2) : un mode live ne peut pas être activé
 * sans URL de création de compte validée. Le build échoue explicitement
 * plutôt que d'afficher un bouton inactif ou un lien « # ».
 */
export function assertLaunchRules(config: OfferConfig): void {
  if (config.launchMode === "live" && !config.signupUrl) {
    throw new Error(
      "RESO_LAUNCH_MODE=live exige RESO_SIGNUP_URL. Repassez en prelaunch ou fournissez l'URL validée.",
    );
  }
}

export const offer: OfferConfig = buildConfig(process.env);

export const isPrelaunch = offer.launchMode === "prelaunch";
export const isLive = offer.launchMode === "live";

/** Exposé pour les tests : reconstruit une configuration à partir d'un environnement. */
export const __internal = { buildConfig };
