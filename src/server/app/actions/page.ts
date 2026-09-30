"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { FormState } from "@/components/app/ActionForm";
import { pageEditor } from "@/content/fr/app";
import { detectImageType } from "@/lib/image-type";
import { requireEstablishment } from "@/server/auth/guards";
import { getSql } from "@/server/db";
import { MAX_PHOTO_BYTES, PhotoLimitError, addUploadedPhoto, deletePhoto, movePhotoFirst } from "../photos";
import { ReviewsUnavailableError, setReviewHidden, syncGoogleReviews } from "../reviews";
import { GENERIC_ERROR, fieldErrors, str } from "./shared";

const t = pageEditor;

function refresh(slug: string) {
  revalidatePath("/app/ma-page");
  revalidatePath("/app");
  revalidatePath(`/r/${slug}`);
}

/** Envoi d'une photo (une par appel, déjà redimensionnée par le navigateur). */
export async function uploadPhotoAction(fd: FormData): Promise<{ ok: true } | { error: string }> {
  const { establishment } = await requireEstablishment();
  const file = fd.get("photo");
  if (!(file instanceof File) || file.size === 0) return { error: t.photos.errors.missing };
  if (file.size > MAX_PHOTO_BYTES) return { error: t.photos.errors.tooBig };
  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = detectImageType(bytes);
  if (!type) return { error: t.photos.errors.format };
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

const descriptionSchema = z.object({ description: z.string().trim().max(600, t.about.tooLong).transform((v) => v || null) });

export async function updateDescriptionAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const { establishment } = await requireEstablishment();
  const parsed = descriptionSchema.safeParse({ description: str(fd, "description") });
  if (!parsed.success) return fieldErrors(parsed.error);
  try {
    await getSql()`update establishments set description = ${parsed.data.description} where id = ${establishment.id}`;
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
