/** Calculs de facturation de l'abonnement (purs, testables). */

export interface SubscriptionAmounts {
  exVatCents: number;
  vatCents: number;
  totalCents: number;
  vatRate: number;
}

/** Montants en centimes à partir du prix HT et du taux de TVA (arrondi au centime). */
export function subscriptionAmounts(priceExVat: number, vatRate: number): SubscriptionAmounts {
  const exVatCents = Math.round(priceExVat * 100);
  const vatCents = Math.round((exVatCents * vatRate) / 100);
  return { exVatCents, vatCents, totalCents: exVatCents + vatCents, vatRate };
}

export function formatEuros(cents: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);
}

/** Ajoute un mois calendaire (31 janvier → 28/29 février). */
export function addOneMonth(date: Date): Date {
  const d = new Date(date.getTime());
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + 1);
  const lastDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, lastDay));
  return d;
}

/** Période couverte par le prochain paiement : enchaîne sur la période payée si elle court encore. */
export function nextPeriod(paidUntil: Date | null, now: Date): { start: Date; end: Date } {
  const start = paidUntil && paidUntil.getTime() > now.getTime() ? paidUntil : now;
  return { start, end: addOneMonth(start) };
}

/** Référence de paiement lisible et unique par établissement et période. */
export function paymentReference(establishmentId: string, periodStart: Date): string {
  const ym = periodStart.toISOString().slice(0, 10).replace(/-/g, "");
  return `reso-${establishmentId.slice(0, 8)}-${ym}-${Math.random().toString(36).slice(2, 8)}`;
}

export const GRACE_DAYS = 3;
export const RENEWAL_NOTICE_DAYS = 5;
