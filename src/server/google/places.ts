import "server-only";
import { PLACES_FIELD_MASK, buildTextSearchBody, parsePlaceCandidates, type GooglePlaceCandidate } from "@/lib/google-places";

/** L'import Google n'est proposé que si une clé est configurée. */
export function isGoogleImportEnabled(): boolean {
  return Boolean(process.env.GOOGLE_PLACES_API_KEY?.trim());
}

export class GooglePlacesError extends Error {}

/** Recherche textuelle (Places API New). Une requête = un appel facturé au SKU « Text Search Pro ». */
export async function searchPlaces(query: string, fetchImpl: typeof fetch = fetch): Promise<GooglePlaceCandidate[]> {
  const key = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!key) throw new GooglePlacesError("GOOGLE_PLACES_API_KEY manquante.");
  const response = await fetchImpl("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Goog-Api-Key": key, "X-Goog-FieldMask": PLACES_FIELD_MASK },
    body: JSON.stringify(buildTextSearchBody(query)),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new GooglePlacesError(`Google Places a répondu ${response.status} ${detail.slice(0, 200)}`);
  }
  return parsePlaceCandidates(await response.json());
}
