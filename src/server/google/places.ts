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
  const payload = (await response.json()) as { places?: Array<Record<string, unknown>> };
  // Journal opérationnel (sans données personnelles) : champs réellement renvoyés par Google.
  const first = payload.places?.[0];
  console.log(
    "[google] recherche",
    `résultats=${payload.places?.length ?? 0}`,
    first ? `champs=${Object.keys(first).join(",")}` : "",
    first ? `photos=${Array.isArray(first.photos) ? first.photos.length : 0}` : "",
  );
  return parsePlaceCandidates(payload as Parameters<typeof parsePlaceCandidates>[0]);
}

/**
 * Résout l'URL d'affichage d'une photo (hébergée par Google, stable dans le
 * temps). Un appel par photo, SKU « Place Photo ». Les échecs sont ignorés :
 * une photo manquante ne doit pas bloquer la création de l'établissement.
 */
export async function resolvePhotoUrls(photoNames: string[], fetchImpl: typeof fetch = fetch): Promise<string[]> {
  const key = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!key || photoNames.length === 0) return [];
  const urls = await Promise.all(
    photoNames.map(async (name) => {
      try {
        const response = await fetchImpl(`https://places.googleapis.com/v1/${name}/media?maxWidthPx=1200&skipHttpRedirect=true&key=${encodeURIComponent(key)}`, {
          signal: AbortSignal.timeout(8000),
        });
        if (!response.ok) return null;
        const data = (await response.json()) as { photoUri?: string };
        return data.photoUri && data.photoUri.startsWith("https://") ? data.photoUri : null;
      } catch (error) {
        console.error("[google] photo non résolue", error instanceof Error ? error.message : error);
        return null;
      }
    }),
  );
  return urls.filter((url): url is string => Boolean(url));
}
