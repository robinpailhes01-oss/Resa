/**
 * Règle d'encaissement à la réservation en ligne (fonctions pures, testables
 * sans base) : aucun paiement, acompte (pourcentage ou montant fixe) ou
 * totalité de la prestation.
 */
import { bookingPaymentRules } from "@/config/offer";

export type PaymentMode = "none" | "deposit" | "full";
export type DepositKind = "percent" | "fixed";

export interface PaymentRule {
  mode: PaymentMode;
  depositKind: DepositKind;
  /** Pourcentage (1 à 100) ou montant en centimes selon `depositKind`. */
  depositValue: number;
}

export interface AmountDue {
  kind: "deposit" | "full";
  amountCents: number;
  /** Reste à régler sur place. */
  remainingCents: number;
}

/**
 * Montant à payer en ligne pour une prestation, ou null si rien n'est dû
 * (règle désactivée, prestation gratuite, montant sous le minimum Mollie).
 */
export function amountDue(rule: PaymentRule, priceCents: number): AmountDue | null {
  if (rule.mode === "none" || priceCents <= 0) return null;
  let amount = priceCents;
  if (rule.mode === "deposit") {
    amount = rule.depositKind === "percent" ? Math.round((priceCents * clamp(rule.depositValue, 0, 100)) / 100) : Math.max(0, rule.depositValue);
    amount = Math.min(amount, priceCents);
  }
  if (amount < bookingPaymentRules.minOnlineCents) return null;
  return { kind: amount >= priceCents ? "full" : "deposit", amountCents: amount, remainingCents: priceCents - amount };
}

/**
 * Commission Reso sur un paiement en ligne, en centimes : pourcentage arrondi,
 * au moins 1 centime, plafonnée par Mollie (montant − 0,35 € − 6 %). 0 si rien.
 */
export function applicationFeeCents(amountCents: number, percent: number): number {
  if (percent <= 0 || amountCents <= 0) return 0;
  const fee = Math.max(1, Math.round((amountCents * percent) / 100));
  const cap = Math.floor(amountCents - 35 - amountCents * 0.06);
  return cap >= 1 ? Math.min(fee, cap) : 0;
}

/** Valide une règle saisie dans l'espace pro ; renvoie un message d'erreur ou null. */
export function validatePaymentRule(rule: PaymentRule): string | null {
  if (rule.mode !== "deposit") return null;
  if (rule.depositKind === "percent" && (rule.depositValue < 1 || rule.depositValue > 100)) return "Indiquez un pourcentage entre 1 et 100.";
  if (rule.depositKind === "fixed" && (rule.depositValue < bookingPaymentRules.minOnlineCents || rule.depositValue > bookingPaymentRules.maxFixedDepositCents)) {
    return `Indiquez un montant entre ${bookingPaymentRules.minOnlineCents / 100} € et ${bookingPaymentRules.maxFixedDepositCents / 100} €.`;
  }
  return null;
}

/** Libellé court de la règle (« Acompte de 30 % », « Paiement intégral »…). */
export function describePaymentRule(rule: PaymentRule, formatCents: (cents: number) => string): string {
  if (rule.mode === "none") return "Paiement sur place";
  if (rule.mode === "full") return "Paiement intégral à la réservation";
  return rule.depositKind === "percent" ? `Acompte de ${rule.depositValue} % à la réservation` : `Acompte de ${formatCents(rule.depositValue)} à la réservation`;
}

export type OnboardingStatus = "needs-data" | "in-review" | "completed";

/** Statut d'un paiement Mollie ramené aux états suivis côté Reso. */
export function normalizePaymentStatus(status: string): "open" | "paid" | "failed" | "canceled" | "expired" {
  if (status === "paid") return "paid";
  if (status === "failed") return "failed";
  if (status === "canceled") return "canceled";
  if (status === "expired") return "expired";
  return "open";
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
