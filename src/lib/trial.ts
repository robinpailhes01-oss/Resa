/**
 * Règles d'accès liées à l'essai gratuit et à l'abonnement (fonctions pures,
 * testables sans base).
 */

export type SubscriptionStatus = "trial" | "active" | "cancelled";

export interface AccessInput {
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt: Date | null;
}

export type AccessState =
  /** Essai en cours : accès complet. */
  | { state: "trial"; daysLeft: number; endsAt: Date }
  /** Abonnement actif : accès complet. */
  | { state: "active" }
  /** Essai terminé sans abonnement : réservation en ligne suspendue. */
  | { state: "expired"; endsAt: Date | null }
  /** Abonnement arrêté : réservation en ligne suspendue. */
  | { state: "cancelled" };

const DAY_MS = 24 * 60 * 60 * 1000;

/** Nombre de jours restants, arrondi vers le haut (0 le dernier jour écoulé). */
export function daysLeft(endsAt: Date, now: Date): number {
  return Math.max(0, Math.ceil((endsAt.getTime() - now.getTime()) / DAY_MS));
}

export function resolveAccess(input: AccessInput, now: Date = new Date()): AccessState {
  if (input.subscriptionStatus === "active") return { state: "active" };
  if (input.subscriptionStatus === "cancelled") return { state: "cancelled" };
  if (input.trialEndsAt && input.trialEndsAt.getTime() > now.getTime()) {
    return { state: "trial", daysLeft: daysLeft(input.trialEndsAt, now), endsAt: input.trialEndsAt };
  }
  return { state: "expired", endsAt: input.trialEndsAt };
}

/** La réservation en ligne est-elle ouverte au public ? */
export function canAcceptOnlineBookings(access: AccessState): boolean {
  return access.state === "trial" || access.state === "active";
}

/** Date de fin d'essai pour un établissement créé maintenant. */
export function trialEndDate(trialDays: number, now: Date = new Date()): Date {
  return new Date(now.getTime() + trialDays * DAY_MS);
}
