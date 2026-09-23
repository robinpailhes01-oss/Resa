import "server-only";
import { getSql } from "@/server/db";
import { mapEstablishment, type Establishment, type EstablishmentRow } from "@/server/auth/guards";
import { slugify } from "@/lib/slug";
import { trialEndDate } from "@/lib/trial";
import { offer } from "@/config/offer";

export const BUSINESS_TYPES = [
  { value: "institut", label: "Institut de beauté" },
  { value: "onglerie", label: "Onglerie" },
  { value: "regard_cils", label: "Regard et cils" },
  { value: "coiffure_barbier", label: "Coiffure et barbier" },
  { value: "spa_soins", label: "Spa et soins" },
  { value: "autre", label: "Autre" },
] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number]["value"];

export function businessTypeLabel(value: string): string {
  return BUSINESS_TYPES.find((t) => t.value === value)?.label ?? "Établissement";
}

export interface NewEstablishmentInput {
  name: string;
  businessType: BusinessType;
  city: string | null;
  postalCode: string | null;
  addressLine: string | null;
  phone: string | null;
  publicEmail: string | null;
  ownerName: string;
}

const DEFAULT_HOURS: Array<{ weekday: number; startMin: number; endMin: number }> = [1, 2, 3, 4, 5, 6].map((weekday) => ({
  weekday,
  startMin: 9 * 60,
  endMin: 19 * 60,
}));

/**
 * Crée l'établissement, l'adhésion du propriétaire, ses réglages d'emails,
 * des horaires par défaut (lundi–samedi 9h–19h) et un premier praticien.
 */
export async function createEstablishment(userId: string, input: NewEstablishmentInput): Promise<Establishment> {
  const sql = getSql();
  const base = slugify(input.name) || "mon-etablissement";
  return sql.begin(async (tx) => {
    let slug = base.length >= 3 ? base : `${base}-reso`;
    for (let i = 2; i < 50; i += 1) {
      const taken = await tx`select 1 from establishments where slug = ${slug}`;
      if (taken.length === 0) break;
      slug = `${base}-${i}`;
    }
    // Essai gratuit : fin calculée à la création ; sans essai configuré,
    // l'établissement est activé directement (paiement géré hors ligne).
    const trialEndsAt = offer.trialDays ? trialEndDate(offer.trialDays) : null;
    const status = offer.trialDays ? "trial" : "active";
    const [row] = await tx<EstablishmentRow[]>`
      insert into establishments (owner_user_id, name, slug, business_type, city, postal_code, address_line, phone, public_email, subscription_status, trial_ends_at)
      values (${userId}, ${input.name}, ${slug}, ${input.businessType}, ${input.city}, ${input.postalCode}, ${input.addressLine}, ${input.phone}, ${input.publicEmail}, ${status}, ${trialEndsAt})
      returning *`;
    await tx`insert into memberships (user_id, establishment_id, role) values (${userId}, ${row.id}, 'owner')`;
    await tx`insert into notification_settings (establishment_id) values (${row.id})`;
    for (const h of DEFAULT_HOURS) {
      await tx`insert into opening_hours (establishment_id, practitioner_id, weekday, start_min, end_min) values (${row.id}, null, ${h.weekday}, ${h.startMin}, ${h.endMin})`;
    }
    await tx`insert into practitioners (establishment_id, name, role_title, color, sort_order) values (${row.id}, ${input.ownerName}, null, 'soft', 0)`;
    return mapEstablishment(row);
  });
}

export interface UpdateEstablishmentInput {
  name: string;
  businessType: BusinessType;
  city: string | null;
  postalCode: string | null;
  addressLine: string | null;
  phone: string | null;
  publicEmail: string | null;
  description: string | null;
  bookingTerms: string | null;
  bookingEnabled: boolean;
  slotStepMin: number;
  minLeadMin: number;
  maxHorizonDays: number;
  cancellationHours: number;
}

export async function updateEstablishment(id: string, input: UpdateEstablishmentInput): Promise<void> {
  await getSql()`
    update establishments set
      name = ${input.name}, business_type = ${input.businessType}, city = ${input.city}, postal_code = ${input.postalCode},
      address_line = ${input.addressLine}, phone = ${input.phone}, public_email = ${input.publicEmail}, description = ${input.description},
      booking_terms = ${input.bookingTerms},
      booking_enabled = ${input.bookingEnabled}, slot_step_min = ${input.slotStepMin}, min_lead_min = ${input.minLeadMin},
      max_horizon_days = ${input.maxHorizonDays}, cancellation_hours = ${input.cancellationHours}
    where id = ${id}`;
}

export async function getEstablishmentBySlug(slug: string): Promise<Establishment | null> {
  const rows = await getSql()<EstablishmentRow[]>`select * from establishments where slug = ${slug} limit 1`;
  return rows[0] ? mapEstablishment(rows[0]) : null;
}

export async function getEstablishmentById(id: string): Promise<Establishment | null> {
  const rows = await getSql()<EstablishmentRow[]>`select * from establishments where id = ${id} limit 1`;
  return rows[0] ? mapEstablishment(rows[0]) : null;
}
