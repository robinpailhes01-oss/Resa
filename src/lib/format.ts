/** Espace insécable fine et espace insécable classique. */
export const NNBSP = " ";
export const NBSP = " ";

/**
 * Formate un montant en euros à la française : « 39 € » avec espace
 * insécable, sans décimales inutiles (« 39,50 € » si nécessaire).
 */
export function formatPrice(amount: number, currency: "EUR" = "EUR"): string {
  const hasCents = !Number.isInteger(amount);
  const formatted = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount);
  // Intl utilise déjà une espace insécable (U+00A0 ou U+202F) avant le symbole.
  return formatted.replace(/\s/g, NBSP);
}

/** « 39 € HT / mois » avec espaces insécables. */
export function formatMonthlyPriceExVat(amount: number, currency: "EUR" = "EUR"): string {
  return `${formatPrice(amount, currency)}${NBSP}HT${NBSP}/${NBSP}mois`;
}

/** « 39 € HT/mois » : version compacte pour les métadonnées. */
export function formatMonthlyPriceExVatCompact(amount: number, currency: "EUR" = "EUR"): string {
  return `${formatPrice(amount, currency)}${NBSP}HT/mois`;
}

/** Formate le nombre de praticiens : « jusqu'à 3 praticiens ». */
export function formatPractitioners(limit: number): string {
  return `jusqu’à ${limit}${NBSP}praticien${limit > 1 ? "s" : ""}`;
}
