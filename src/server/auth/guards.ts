import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getSql } from "@/server/db";
import { getCurrentUser, type SessionUser } from "./session";
import type { SubscriptionStatus } from "@/lib/trial";

export interface Establishment {
  id: string;
  ownerUserId: string;
  name: string;
  slug: string;
  businessType: string;
  addressLine: string | null;
  postalCode: string | null;
  city: string | null;
  phone: string | null;
  publicEmail: string | null;
  description: string | null;
  /** Conditions affichées à la cliente avant confirmation et dans l'email. */
  bookingTerms: string | null;
  timezone: string;
  bookingEnabled: boolean;
  slotStepMin: number;
  minLeadMin: number;
  maxHorizonDays: number;
  cancellationHours: number;
  /** Statut d'abonnement (essai, actif, arrêté). */
  subscriptionStatus: SubscriptionStatus;
  /** Fin de l'essai gratuit. */
  trialEndsAt: Date | null;
}

export type EstablishmentRow = {
  id: string;
  owner_user_id: string;
  name: string;
  slug: string;
  business_type: string;
  address_line: string | null;
  postal_code: string | null;
  city: string | null;
  phone: string | null;
  public_email: string | null;
  description: string | null;
  booking_terms: string | null;
  timezone: string;
  booking_enabled: boolean;
  slot_step_min: number;
  min_lead_min: number;
  max_horizon_days: number;
  cancellation_hours: number;
  subscription_status: SubscriptionStatus;
  trial_ends_at: Date | string | null;
};

export function mapEstablishment(r: EstablishmentRow): Establishment {
  return {
    id: r.id,
    ownerUserId: r.owner_user_id,
    name: r.name,
    slug: r.slug,
    businessType: r.business_type,
    addressLine: r.address_line,
    postalCode: r.postal_code,
    city: r.city,
    phone: r.phone,
    publicEmail: r.public_email,
    description: r.description,
    bookingTerms: r.booking_terms,
    timezone: r.timezone,
    bookingEnabled: r.booking_enabled,
    slotStepMin: r.slot_step_min,
    minLeadMin: r.min_lead_min,
    maxHorizonDays: r.max_horizon_days,
    cancellationHours: r.cancellation_hours,
    subscriptionStatus: r.subscription_status,
    trialEndsAt: r.trial_ends_at ? new Date(r.trial_ends_at) : null,
  };
}

/** Redirige vers la connexion si aucun utilisateur n'est connecté. */
export async function requireUser(next?: string): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect(next ? `/connexion?next=${encodeURIComponent(next)}` : "/connexion");
  return user;
}

/** Établissement de l'utilisateur (le premier, un seul par compte dans cette version). */
export const getUserEstablishment = cache(async (userId: string): Promise<Establishment | null> => {
  const rows = await getSql()<EstablishmentRow[]>`
    select e.* from establishments e
    join memberships m on m.establishment_id = e.id
    where m.user_id = ${userId}
    order by e.created_at
    limit 1`;
  return rows[0] ? mapEstablishment(rows[0]) : null;
});

/** Utilisateur connecté avec son établissement ; sinon redirection vers l'onboarding. */
export async function requireEstablishment(): Promise<{ user: SessionUser; establishment: Establishment }> {
  const user = await requireUser();
  const establishment = await getUserEstablishment(user.id);
  if (!establishment) redirect("/app/bienvenue");
  return { user, establishment };
}
