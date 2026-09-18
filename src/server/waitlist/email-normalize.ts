/**
 * Normalisation documentée des adresses email (§10) :
 * - suppression des espaces périphériques ;
 * - passage en minuscules de l'adresse complète (le domaine est insensible
 *   à la casse ; en pratique tous les fournisseurs traitent aussi la partie
 *   locale ainsi) ;
 * - AUCUNE suppression des points ni des suffixes « + » : deux adresses
 *   différentes restent deux prospects différents.
 */
export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

/**
 * Validation pragmatique : une partie locale, un « @ », un domaine avec au
 * moins un point, pas d'espaces, 254 caractères maximum.
 */
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@.]+(?:\.[^\s@.]+)+$/;

export function isValidEmail(value: string): boolean {
  if (value.length === 0 || value.length > 254) return false;
  return EMAIL_RE.test(value);
}
