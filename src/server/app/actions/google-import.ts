"use server";

import { revalidatePath } from "next/cache";
import type { FormState } from "@/components/app/ActionForm";
import { parseGoogleMeta, parseHoursJson, parsePhotoNames, type GooglePlaceCandidate } from "@/lib/google-places";
import { requireEstablishment, requireUser } from "@/server/auth/guards";
import { applyGooglePlace } from "../google-sync";
import { GooglePlacesError, findPlaces, isGoogleImportEnabled } from "@/server/google/places";
import { SlidingWindowRateLimiter } from "@/server/rate-limit";

export type GoogleSearchResult = { results: GooglePlaceCandidate[]; error?: undefined } | { results?: undefined; error: string };

// 20 recherches par utilisateur et par quart d'heure : protège le quota Google.
const limiter = new SlidingWindowRateLimiter(20, 15 * 60_000);

export async function searchGooglePlacesAction(rawQuery: string): Promise<GoogleSearchResult> {
  const user = await requireUser();
  if (!isGoogleImportEnabled()) return { error: "L’import Google n’est pas activé." };
  const query = String(rawQuery ?? "").trim().slice(0, 600);
  if (query.length < 3) return { error: "Indiquez le nom de votre établissement et sa ville, ou collez le lien de votre fiche Google." };
  if (!limiter.hit(`places:${user.id}`)) return { error: "Trop de recherches. Réessayez dans quelques minutes." };
  try {
    return { results: await findPlaces(query) };
  } catch (error) {
    console.error("[google] recherche de fiche", error instanceof GooglePlacesError ? error.message : error);
    if (error instanceof GooglePlacesError && error.message.startsWith("Lien Google non reconnu")) {
      return { error: "Ce lien n’a pas pu être lu. Tapez plutôt le nom de votre établissement et sa ville." };
    }
    return { error: "La recherche Google n’a pas abouti. Vous pouvez remplir le formulaire à la main." };
  }
}

/** Relecture stricte de la fiche choisie, transmise par le formulaire des Paramètres. */
function readCandidate(raw: string): GooglePlaceCandidate | null {
  try {
    const data = JSON.parse(raw) as Record<string, unknown>;
    const placeId = typeof data.placeId === "string" && /^[A-Za-z0-9_-]{5,200}$/.test(data.placeId) ? data.placeId : null;
    const name = typeof data.name === "string" ? data.name.trim().slice(0, 120) : "";
    if (!placeId || !name) return null;
    const meta = parseGoogleMeta(JSON.stringify({ rating: data.rating, ratingCount: data.ratingCount, mapsUrl: data.mapsUrl }));
    const str = (v: unknown, max: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null);
    return {
      placeId,
      name,
      formattedAddress: str(data.formattedAddress, 200) ?? "",
      addressLine: str(data.addressLine, 160),
      postalCode: str(data.postalCode, 12),
      city: str(data.city, 80),
      phone: str(data.phone, 30),
      website: str(data.website, 300),
      businessType: "autre",
      hours: parseHoursJson(data.hours ? JSON.stringify(data.hours) : null),
      description: str(data.description, 600),
      photoNames: parsePhotoNames(Array.isArray(data.photoNames) ? JSON.stringify(data.photoNames) : null),
      ...meta,
    };
  } catch {
    return null;
  }
}

/** Depuis les Paramètres : relie la fiche Google et importe ce qui est coché. */
export async function importGooglePlaceAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const { establishment } = await requireEstablishment();
  const candidate = readCandidate(String(fd.get("candidate") ?? ""));
  if (!candidate) return { error: "Fiche Google illisible. Relancez la recherche." };
  try {
    const result = await applyGooglePlace(establishment.id, candidate, {
      photos: fd.get("withPhotos") === "on",
      description: fd.get("withDescription") === "on",
      hours: fd.get("withHours") === "on",
    });
    revalidatePath("/app/parametres");
    revalidatePath(`/r/${establishment.slug}`);
    const parts = ["Fiche Google reliée"];
    if (candidate.rating !== null) parts.push(`note ${candidate.rating.toLocaleString("fr-FR")} (${candidate.ratingCount ?? 0} avis)`);
    if (result.photosAdded > 0) parts.push(`${result.photosAdded} photo${result.photosAdded > 1 ? "s" : ""} ajoutée${result.photosAdded > 1 ? "s" : ""}`);
    return { success: `${parts.join(" · ")}.` };
  } catch (error) {
    console.error("[google] import paramètres", error instanceof Error ? error.message : error);
    return { error: "L’import n’a pas abouti. Réessayez dans quelques instants." };
  }
}
