"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { FormState } from "@/components/app/ActionForm";
import { pageEditor } from "@/content/fr/app";
import { detectImageType, type ImageType } from "@/lib/image-type";
import { requireEstablishment } from "@/server/auth/guards";
import { getSql } from "@/server/db";
import { MAX_PHOTO_BYTES, PhotoLimitError, addUploadedPhoto, deletePhoto, movePhotoFirst, removeServicePhoto, setServicePhoto } from "../photos";
import { ReviewsUnavailableError, setReviewHidden, syncGoogleReviews } from "../reviews";
import { GENERIC_ERROR, fieldErrors, str } from "./shared";

const t = pageEditor;

function refresh(slug: string) {
  revalidatePath("/app/ma-page");
  revalidatePath("/app");
  revalidatePath(`/r/${slug}`);
}

/** Photo reçue du navigateur : présente, pas trop lourde, et vraiment une image (JPEG, PNG, WebP). */
async function readPhoto(fd: FormData): Promise<{ error: string } | { bytes: Uint8Array; type: ImageType }> {
  const file = fd.get("photo");
  if (!(file instanceof File) || file.size === 0) return { error: t.photos.errors.missing };
  if (file.size > MAX_PHOTO_BYTES) return { error: t.photos.errors.tooBig };
  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = detectImageType(bytes);
  if (!type) return { error: t.photos.errors.format };
  return { bytes, type };
}

/** Envoi d'une photo (une par appel, déjà redimensionnée par le navigateur). */
export async function uploadPhotoAction(fd: FormData): Promise<{ ok: true } | { error: string }> {
  const { establishment } = await requireEstablishment();
  const photo = await readPhoto(fd);
  if ("error" in photo) return { error: photo.error };
  const { bytes, type } = photo;
  try {
    await addUploadedPhoto(establishment.id, bytes, type);
  } catch (error) {
    if (error instanceof PhotoLimitError) return { error: t.photos.errors.limit };
    console.error("[ma-page] envoi photo", error instanceof Error ? error.message : error);
    return { error: GENERIC_ERROR };
  }
  refresh(establishment.slug);
  return { ok: true };
}

/** Photo d'une prestation : remplace la précédente. */
export async function uploadServicePhotoAction(serviceId: string, fd: FormData): Promise<{ ok: true } | { error: string }> {
  const { establishment } = await requireEstablishment();
  const photo = await readPhoto(fd);
  if ("error" in photo) return { error: photo.error };
  try {
    if (!(await setServicePhoto(establishment.id, serviceId, photo.bytes, photo.type))) return { error: GENERIC_ERROR };
  } catch (error) {
    console.error("[prestation] envoi photo", error instanceof Error ? error.message : error);
    return { error: GENERIC_ERROR };
  }
  refresh(establishment.slug);
  revalidatePath(`/app/prestations/${serviceId}`);
  return { ok: true };
}

export async function removeServicePhotoAction(serviceId: string): Promise<void> {
  const { establishment } = await requireEstablishment();
  await removeServicePhoto(establishment.id, serviceId);
  refresh(establishment.slug);
  revalidatePath(`/app/prestations/${serviceId}`);
}

export async function deletePagePhotoAction(photoId: string): Promise<void> {
  const { establishment } = await requireEstablishment();
  await deletePhoto(establishment.id, photoId);
  refresh(establishment.slug);
}

export async function coverPhotoAction(photoId: string): Promise<void> {
  const { establishment } = await requireEstablishment();
  await movePhotoFirst(establishment.id, photoId);
  refresh(establishment.slug);
}

const descriptionSchema = z.object({
  bio: z
    .string()
    .transform((v) => v.replace(/\s+/g, " ").trim())
    .pipe(z.string().max(160, t.about.bioTooLong))
    .transform((v) => v || null),
  description: z.string().trim().max(600, t.about.tooLong).transform((v) => v || null),
});

export async function updateDescriptionAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const { establishment } = await requireEstablishment();
  const parsed = descriptionSchema.safeParse({ bio: str(fd, "bio"), description: str(fd, "description") });
  if (!parsed.success) return fieldErrors(parsed.error);
  try {
    await getSql()`update establishments set bio = ${parsed.data.bio}, description = ${parsed.data.description} where id = ${establishment.id}`;
  } catch {
    return { error: GENERIC_ERROR };
  }
  refresh(establishment.slug);
  return { success: t.about.saved };
}

export async function syncReviewsAction(): Promise<FormState> {
  const { establishment } = await requireEstablishment();
  try {
    const count = await syncGoogleReviews(establishment.id, establishment.googlePlaceId);
    refresh(establishment.slug);
    return { success: t.reviews.synced(count) };
  } catch (error) {
    if (error instanceof ReviewsUnavailableError) return { error: t.reviews.noListing };
    console.error("[ma-page] avis Google", error instanceof Error ? error.message : error);
    return { error: t.reviews.syncError };
  }
}

export async function setReviewHiddenAction(reviewId: string, hidden: boolean): Promise<void> {
  const { establishment } = await requireEstablishment();
  await setReviewHidden(establishment.id, reviewId, hidden);
  refresh(establishment.slug);
}
