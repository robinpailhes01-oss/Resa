"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { offer } from "@/config/offer";
import { notifyTelegram, telegramEvents } from "@/server/telegram";
import { businessTypeLabel } from "../establishments";
import { z } from "zod";
import type { FormState } from "@/components/app/ActionForm";
import { requireEstablishment, requireUser, getUserEstablishment } from "@/server/auth/guards";
import { isValidEmail } from "@/server/waitlist/email-normalize";
import { BUSINESS_TYPES, createEstablishment, updateEstablishment } from "../establishments";
import { replaceOpeningHours, type WeekInput } from "../hours";
import { getNotificationSettings, updateNotificationSettings } from "../notifications";
import { hhmmToMinutes } from "@/lib/time";
import { parseGoogleMeta, parseHoursJson, parsePhotoNames } from "@/lib/google-places";
import { getSql } from "@/server/db";
import { resolvePhotoUrls } from "@/server/google/places";
import { addPhotos, deletePhoto } from "../photos";
import { GENERIC_ERROR, bool, fieldErrors, int, optStr, str } from "./shared";

const typeValues = BUSINESS_TYPES.map((t) => t.value) as [string, ...string[]];
const emailOrNull = z
  .string()
  .trim()
  .max(254)
  .transform((v) => v || null)
  .refine((v) => v === null || isValidEmail(v), "Adresse email invalide.");

const establishmentSchema = z.object({
  name: z.string().trim().min(2, "Indiquez le nom de votre établissement.").max(80),
  businessType: z.enum(typeValues),
  city: z.string().trim().max(80).transform((v) => v || null),
  postalCode: z.string().trim().max(12).transform((v) => v || null),
  addressLine: z.string().trim().max(160).transform((v) => v || null),
  phone: z.string().trim().max(30).transform((v) => v || null),
  publicEmail: emailOrNull,
});

export async function createEstablishmentAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  if (await getUserEstablishment(user.id)) redirect("/app/agenda");
  const parsed = establishmentSchema.safeParse({
    name: fd.get("name"),
    businessType: fd.get("businessType"),
    city: fd.get("city") ?? "",
    postalCode: fd.get("postalCode") ?? "",
    addressLine: fd.get("addressLine") ?? "",
    phone: fd.get("phone") ?? "",
    publicEmail: fd.get("publicEmail") ?? "",
  });
  if (!parsed.success) return fieldErrors(parsed.error);
  // Fiche Google importée : horaires et identifiant transmis par le formulaire (validés ici).
  const googleHours = parseHoursJson(optStr(fd, "googleHours"));
  const googlePlaceId = optStr(fd, "googlePlaceId")?.slice(0, 200) ?? null;
  const googleDescription = optStr(fd, "googleDescription")?.slice(0, 600) ?? null;
  const googlePhotos = parsePhotoNames(optStr(fd, "googlePhotos"));
  const googleMeta = parseGoogleMeta(optStr(fd, "googleMeta"));
  try {
    const establishment = await createEstablishment(user.id, { ...parsed.data, businessType: parsed.data.businessType as (typeof BUSINESS_TYPES)[number]["value"], ownerName: user.fullName });
    if (googleHours) await replaceOpeningHours(establishment.id, null, { days: googleHours });
    if (googlePlaceId || googleDescription) {
      await getSql()`update establishments set google_place_id = coalesce(${googlePlaceId}, google_place_id), description = coalesce(${googleDescription}, description),
        google_rating = ${googleMeta.rating}, google_rating_count = ${googleMeta.ratingCount}, google_maps_url = ${googleMeta.mapsUrl}, google_synced_at = case when ${Boolean(googlePlaceId)} then now() else google_synced_at end
        where id = ${establishment.id}`;
    }
    if (googlePhotos.length > 0) await addPhotos(establishment.id, await resolvePhotoUrls(googlePhotos), "google");
    after(() =>
      notifyTelegram(
        telegramEvents.establishment({ name: establishment.name, businessType: businessTypeLabel(establishment.businessType), city: establishment.city, slug: establishment.slug }, offer.siteUrl.replace(/\/$/, "")),
      ),
    );
  } catch (error) {
    console.error("[app] création établissement", error instanceof Error ? error.message : error);
    return { error: GENERIC_ERROR };
  }
  redirect("/app/prestations?bienvenue=1");
}

const settingsSchema = establishmentSchema.extend({
  description: z.string().trim().max(600).transform((v) => v || null),
  bookingTerms: z.string().trim().max(1500, "1 500 caractères maximum.").transform((v) => v || null),
  bookingEnabled: z.boolean(),
  slotStepMin: z.number().int().refine((v) => [5, 10, 15, 20, 30, 60].includes(v), "Pas de créneau invalide."),
  minLeadMin: z.number().int().min(0).max(7 * 24 * 60),
  maxHorizonDays: z.number().int().min(1).max(365),
  cancellationHours: z.number().int().min(0).max(720),
});

export async function updateEstablishmentAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const { establishment } = await requireEstablishment();
  const parsed = settingsSchema.safeParse({
    name: fd.get("name"),
    businessType: fd.get("businessType"),
    city: fd.get("city") ?? "",
    postalCode: fd.get("postalCode") ?? "",
    addressLine: fd.get("addressLine") ?? "",
    phone: fd.get("phone") ?? "",
    publicEmail: fd.get("publicEmail") ?? "",
    description: fd.get("description") ?? "",
    bookingTerms: fd.get("bookingTerms") ?? "",
    bookingEnabled: bool(fd, "bookingEnabled"),
    slotStepMin: int(fd, "slotStepMin", 15),
    minLeadMin: int(fd, "minLeadHours", 1) * 60,
    maxHorizonDays: int(fd, "maxHorizonDays", 60),
    cancellationHours: int(fd, "cancellationHours", 24),
  });
  if (!parsed.success) return fieldErrors(parsed.error);
  try {
    await updateEstablishment(establishment.id, { ...parsed.data, businessType: parsed.data.businessType as (typeof BUSINESS_TYPES)[number]["value"] });
  } catch (error) {
    console.error("[app] mise à jour établissement", error instanceof Error ? error.message : error);
    return { error: GENERIC_ERROR };
  }
  revalidatePath("/app", "layout");
  return { success: "Paramètres enregistrés." };
}

/**
 * Horaires hebdomadaires : champs `open-<jour>`, `start-<jour>-<n>`, `end-<jour>-<n>` (n = 0 ou 1).
 * `practitionerId` vide = horaires de l'établissement.
 */
export async function saveOpeningHoursAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const { establishment } = await requireEstablishment();
  const practitionerId = optStr(fd, "practitionerId");
  const days: WeekInput["days"] = {};
  const errors: Record<string, string> = {};
  for (let weekday = 0; weekday < 7; weekday += 1) {
    if (!bool(fd, `open-${weekday}`)) continue;
    const ranges: Array<[number, number]> = [];
    for (let n = 0; n < 2; n += 1) {
      const startRaw = str(fd, `start-${weekday}-${n}`);
      const endRaw = str(fd, `end-${weekday}-${n}`);
      if (!startRaw && !endRaw) continue;
      const start = hhmmToMinutes(startRaw);
      const end = hhmmToMinutes(endRaw);
      if (start === null || end === null || end <= start) {
        errors[`day-${weekday}`] = "Vérifiez les horaires saisis (l’heure de fin doit suivre l’heure de début).";
        continue;
      }
      ranges.push([start, end]);
    }
    if (ranges.length > 0) days[weekday] = ranges;
  }
  if (Object.keys(errors).length) return { fieldErrors: errors };
  try {
    await replaceOpeningHours(establishment.id, practitionerId, { days });
  } catch (error) {
    console.error("[app] horaires", error instanceof Error ? error.message : error);
    return { error: GENERIC_ERROR };
  }
  revalidatePath("/app", "layout");
  return { success: "Horaires enregistrés." };
}

const notificationSchema = z.object({
  confirmationEnabled: z.boolean(),
  reminderEnabled: z.boolean(),
  reminderHours: z.number().int().min(1).max(168),
  reviewEnabled: z.boolean(),
  reviewDelayHours: z.number().int().min(1).max(168),
  reviewSubject: z.string().trim().min(3).max(120),
  reviewUrl: z
    .string()
    .trim()
    .max(500)
    .transform((v) => v || null)
    .refine((v) => v === null || /^https?:\/\/\S+$/.test(v), "Le lien doit commencer par https://"),
  notifyProOnBooking: z.boolean(),
});

export async function updateNotificationSettingsAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const { establishment } = await requireEstablishment();
  const current = await getNotificationSettings(establishment.id);
  const parsed = notificationSchema.safeParse({
    confirmationEnabled: bool(fd, "confirmationEnabled"),
    reminderEnabled: bool(fd, "reminderEnabled"),
    reminderHours: int(fd, "reminderHours", current.reminderHours),
    reviewEnabled: bool(fd, "reviewEnabled"),
    reviewDelayHours: int(fd, "reviewDelayHours", current.reviewDelayHours),
    reviewSubject: str(fd, "reviewSubject") || current.reviewSubject,
    reviewUrl: fd.get("reviewUrl") ?? "",
    notifyProOnBooking: bool(fd, "notifyProOnBooking"),
  });
  if (!parsed.success) return fieldErrors(parsed.error);
  try {
    await updateNotificationSettings(establishment.id, parsed.data);
  } catch (error) {
    console.error("[app] réglages emails", error instanceof Error ? error.message : error);
    return { error: GENERIC_ERROR };
  }
  revalidatePath("/app/emails");
  return { success: "Réglages enregistrés." };
}

export async function deletePhotoAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const { establishment } = await requireEstablishment();
  const id = str(fd, "photoId");
  if (!id) return { error: GENERIC_ERROR };
  try {
    await deletePhoto(establishment.id, id);
  } catch (error) {
    console.error("[app] suppression photo", error instanceof Error ? error.message : error);
    return { error: GENERIC_ERROR };
  }
  revalidatePath("/app/parametres");
  revalidatePath(`/r/${establishment.slug}`);
  return { success: "Photo retirée." };
}
