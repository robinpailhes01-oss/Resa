"use server";

import type { GooglePlaceCandidate } from "@/lib/google-places";
import { requireUser } from "@/server/auth/guards";
import { GooglePlacesError, isGoogleImportEnabled, searchPlaces } from "@/server/google/places";
import { SlidingWindowRateLimiter } from "@/server/rate-limit";

export type GoogleSearchResult = { results: GooglePlaceCandidate[]; error?: undefined } | { results?: undefined; error: string };

// 20 recherches par utilisateur et par quart d'heure : protège le quota Google.
const limiter = new SlidingWindowRateLimiter(20, 15 * 60_000);

export async function searchGooglePlacesAction(rawQuery: string): Promise<GoogleSearchResult> {
  const user = await requireUser();
  if (!isGoogleImportEnabled()) return { error: "L’import Google n’est pas activé." };
  const query = String(rawQuery ?? "").trim().slice(0, 120);
  if (query.length < 3) return { error: "Indiquez au moins le nom de votre établissement et sa ville." };
  if (!limiter.hit(`places:${user.id}`)) return { error: "Trop de recherches. Réessayez dans quelques minutes." };
  try {
    return { results: await searchPlaces(query) };
  } catch (error) {
    console.error("[google] recherche de fiche", error instanceof GooglePlacesError ? error.message : error);
    return { error: "La recherche Google n’a pas abouti. Vous pouvez remplir le formulaire à la main." };
  }
}
