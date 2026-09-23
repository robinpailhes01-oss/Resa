"use server";

import { after } from "next/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { FormState } from "@/components/app/ActionForm";
import { getRateLimiters } from "@/server/rate-limit";
import { isValidEmail, normalizeEmail } from "@/server/waitlist/email-normalize";
import { isDateKey } from "@/lib/time";
import { canAcceptOnlineBookings, resolveAccess } from "@/lib/trial";
import { SlotUnavailableError, availableSlots, cancelBookingByClient, createBooking, getBookingByManageToken } from "../bookings";
import { getEstablishmentById, getEstablishmentBySlug } from "../establishments";
import { processEmailJobs } from "../notifications";
import { getPractitioner } from "../practitioners";
import { getService } from "../services";
import { GENERIC_ERROR, fieldErrors, str } from "./shared";

const schema = z.object({
  slug: z.string().min(3).max(60),
  serviceId: z.string().uuid(),
  practitionerId: z.string().uuid(),
  date: z.string().refine(isDateKey, "Date invalide."),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Créneau invalide."),
  firstName: z.string().trim().min(1, "Indiquez votre prénom.").max(60),
  lastName: z.string().trim().min(1, "Indiquez votre nom.").max(60),
  email: z.string().trim().max(254).transform(normalizeEmail).refine(isValidEmail, "Saisissez une adresse email valide."),
  phone: z.string().trim().min(6, "Indiquez un numéro de téléphone.").max(30),
  clientNotes: z.string().trim().max(400).transform((v) => v || null),
  website: z.string().max(0).optional(),
});

/** Réservation en ligne par un client, depuis la page publique de l'établissement. */
export async function publicBookAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!getRateLimiters().booking.hit(`book:${ip}`)) return { error: "Trop de tentatives. Réessayez un peu plus tard." };

  const parsed = schema.safeParse({
    slug: fd.get("slug"),
    serviceId: fd.get("serviceId"),
    practitionerId: fd.get("practitionerId"),
    date: fd.get("date"),
    time: fd.get("time"),
    firstName: fd.get("firstName"),
    lastName: fd.get("lastName"),
    email: fd.get("email"),
    phone: fd.get("phone"),
    clientNotes: fd.get("clientNotes") ?? "",
    website: fd.get("website") ?? "",
  });
  if (!parsed.success) {
    if (parsed.error.issues.some((i) => i.path[0] === "website")) return { success: "Merci." };
    return fieldErrors(parsed.error);
  }
  const d = parsed.data;
  const establishment = await getEstablishmentBySlug(d.slug);
  if (!establishment || !establishment.bookingEnabled || !canAcceptOnlineBookings(resolveAccess(establishment))) {
    return { error: "La réservation en ligne n’est pas disponible pour cet établissement." };
  }
  const [service, practitioner] = await Promise.all([getService(establishment.id, d.serviceId), getPractitioner(establishment.id, d.practitionerId)]);
  if (!service || !service.active || !practitioner || !practitioner.active) return { error: "Cette prestation n’est plus proposée." };
  if (service.practitionerIds.length > 0 && !service.practitionerIds.includes(practitioner.id)) return { error: "Ce praticien ne réalise pas cette prestation." };

  const slots = await availableSlots({
    establishmentId: establishment.id,
    practitionerId: practitioner.id,
    dateKey: d.date,
    timeZone: establishment.timezone,
    durationMin: service.durationMin,
    bufferMin: service.bufferMin,
    stepMin: establishment.slotStepMin,
    minLeadMin: establishment.minLeadMin,
  });
  const slot = slots.find((s) => s.label === d.time);
  if (!slot) return { error: "Ce créneau n’est plus disponible. Choisissez-en un autre." };

  let token: string;
  try {
    const result = await createBooking({
      establishmentId: establishment.id,
      practitionerId: practitioner.id,
      serviceId: service.id,
      serviceName: service.name,
      durationMin: service.durationMin,
      bufferMin: service.bufferMin,
      priceCents: service.priceCents,
      startsAt: slot.start,
      source: "online",
      clientNotes: d.clientNotes,
      client: { firstName: d.firstName, lastName: d.lastName, email: d.email, phone: d.phone },
    });
    token = result.manageToken;
  } catch (error) {
    if (error instanceof SlotUnavailableError) return { error: "Ce créneau vient d’être réservé. Choisissez-en un autre." };
    console.error("[réservation] création", error instanceof Error ? error.message : error);
    return { error: GENERIC_ERROR };
  }
  after(async () => {
    try {
      await processEmailJobs();
    } catch (error) {
      console.error("[emails] traitement", error instanceof Error ? error.message : error);
    }
  });
  redirect(`/rdv/${token}?nouveau=1`);
}

export async function cancelByClientAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const token = str(fd, "token");
  const booking = await getBookingByManageToken(token);
  if (!booking) return { error: "Ce lien n’est pas valide." };
  const establishment = await getEstablishmentById(booking.establishmentId);
  const outcome = await cancelBookingByClient(token, establishment?.cancellationHours ?? 24);
  if (outcome === "too_late") {
    return { error: `Ce rendez-vous ne peut plus être annulé en ligne (moins de ${establishment?.cancellationHours ?? 24} h avant). Contactez directement l’établissement.` };
  }
  if (outcome === "invalid") return { error: "Ce lien n’est pas valide." };
  if (outcome === "cancelled") {
    after(async () => {
      try {
        await processEmailJobs();
      } catch (error) {
        console.error("[emails] traitement", error instanceof Error ? error.message : error);
      }
    });
  }
  redirect(`/rdv/${token}?annule=1`);
}
