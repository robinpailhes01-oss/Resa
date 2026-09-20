"use server";

import { after } from "next/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { FormState } from "@/components/app/ActionForm";
import { requireEstablishment } from "@/server/auth/guards";
import { isValidEmail, normalizeEmail } from "@/server/waitlist/email-normalize";
import { hhmmToMinutes, isDateKey, zonedToUtc } from "@/lib/time";
import { SlotUnavailableError, createBooking, updateBookingNotes, updateBookingStatus, type BookingStatus } from "../bookings";
import { updateClient } from "../clients";
import { processEmailJobs } from "../notifications";
import { getPractitioner } from "../practitioners";
import { getService } from "../services";
import { GENERIC_ERROR, fieldErrors, int, optStr, str } from "./shared";

function processEmailsSoon() {
  after(async () => {
    try {
      await processEmailJobs();
    } catch (error) {
      console.error("[emails] traitement", error instanceof Error ? error.message : error);
    }
  });
}

const manualBookingSchema = z.object({
  practitionerId: z.string().uuid("Choisissez un praticien."),
  serviceId: z.string().uuid().nullable(),
  serviceName: z.string().trim().min(2, "Indiquez la prestation.").max(80),
  durationMin: z.number().int().min(5).max(720),
  date: z.string().refine(isDateKey, "Date invalide."),
  time: z.string().refine((v) => hhmmToMinutes(v) !== null, "Heure invalide."),
  firstName: z.string().trim().min(1, "Indiquez le prénom du client.").max(60),
  lastName: z.string().trim().max(60),
  email: z.string().trim().max(254).transform((v) => (v ? normalizeEmail(v) : null)).refine((v) => v === null || isValidEmail(v), "Email invalide."),
  phone: z.string().trim().max(30).transform((v) => v || null),
  notes: z.string().trim().max(600).transform((v) => v || null),
});

/** Création d'un rendez-vous par le professionnel depuis l'agenda. */
export async function createManualBookingAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const { establishment } = await requireEstablishment();
  const serviceId = optStr(fd, "serviceId");
  const service = serviceId ? await getService(establishment.id, serviceId) : null;
  const parsed = manualBookingSchema.safeParse({
    practitionerId: fd.get("practitionerId"),
    serviceId: service?.id ?? null,
    serviceName: service?.name ?? str(fd, "serviceName"),
    durationMin: service ? service.durationMin : int(fd, "durationMin", 60),
    date: fd.get("date"),
    time: fd.get("time"),
    firstName: fd.get("firstName"),
    lastName: fd.get("lastName") ?? "",
    email: fd.get("email") ?? "",
    phone: fd.get("phone") ?? "",
    notes: fd.get("notes") ?? "",
  });
  if (!parsed.success) return fieldErrors(parsed.error);
  const d = parsed.data;
  const practitioner = await getPractitioner(establishment.id, d.practitionerId);
  if (!practitioner) return { error: "Praticien introuvable." };
  const startsAt = zonedToUtc(d.date, hhmmToMinutes(d.time)!, establishment.timezone);
  let bookingId: string;
  try {
    const { booking } = await createBooking({
      establishmentId: establishment.id,
      practitionerId: d.practitionerId,
      serviceId: service?.id ?? null,
      serviceName: d.serviceName,
      durationMin: d.durationMin,
      bufferMin: service?.bufferMin ?? 0,
      priceCents: service?.priceCents ?? 0,
      startsAt,
      source: "manual",
      notes: d.notes,
      client: { firstName: d.firstName, lastName: d.lastName, email: d.email, phone: d.phone },
    });
    bookingId = booking.id;
  } catch (error) {
    if (error instanceof SlotUnavailableError) {
      return { error: "Ce créneau chevauche un autre rendez-vous de ce praticien. Choisissez un autre horaire." };
    }
    console.error("[app] création rendez-vous", error instanceof Error ? error.message : error);
    return { error: GENERIC_ERROR };
  }
  processEmailsSoon();
  revalidatePath("/app/agenda");
  redirect(`/app/rendez-vous/${bookingId}?cree=1`);
}

const statuses: BookingStatus[] = ["pending", "confirmed", "completed", "cancelled", "no_show"];

export async function setBookingStatusAction(id: string, status: BookingStatus): Promise<void> {
  const { establishment } = await requireEstablishment();
  if (!statuses.includes(status)) return;
  await updateBookingStatus(establishment.id, id, status);
  if (status === "cancelled") processEmailsSoon();
  revalidatePath("/app/agenda");
  revalidatePath(`/app/rendez-vous/${id}`);
}

export async function updateBookingNotesAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const { establishment } = await requireEstablishment();
  const id = str(fd, "id");
  const notes = optStr(fd, "notes");
  try {
    await updateBookingNotes(establishment.id, id, notes);
  } catch {
    return { error: GENERIC_ERROR };
  }
  revalidatePath(`/app/rendez-vous/${id}`);
  return { success: "Note enregistrée." };
}

const clientSchema = z.object({
  firstName: z.string().trim().min(1, "Indiquez le prénom.").max(60),
  lastName: z.string().trim().max(60),
  email: z.string().trim().max(254).transform((v) => (v ? normalizeEmail(v) : null)).refine((v) => v === null || isValidEmail(v), "Email invalide."),
  phone: z.string().trim().max(30).transform((v) => v || null),
  notes: z.string().trim().max(1000).transform((v) => v || null),
});

export async function updateClientAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const { establishment } = await requireEstablishment();
  const id = str(fd, "id");
  const parsed = clientSchema.safeParse({
    firstName: fd.get("firstName"),
    lastName: fd.get("lastName") ?? "",
    email: fd.get("email") ?? "",
    phone: fd.get("phone") ?? "",
    notes: fd.get("notes") ?? "",
  });
  if (!parsed.success) return fieldErrors(parsed.error);
  try {
    await updateClient(establishment.id, id, parsed.data);
  } catch (error) {
    if ((error as { code?: string }).code === "23505") return { fieldErrors: { email: "Un autre client utilise déjà cet email." } };
    return { error: GENERIC_ERROR };
  }
  revalidatePath(`/app/clients/${id}`);
  return { success: "Fiche enregistrée." };
}
