import "server-only";
import { PLACES_FIELD_MASK, buildTextSearchBody, looksLikeUrl, parseGoogleMapsUrl, parsePlaceCandidates, type GooglePlaceCandidate } from "@/lib/google-places";

/** L'import Google n'est proposé que si une clé est configurée. */
export function isGoogleImportEnabled(): boolean {
  return Boolean(process.env.GOOGLE_PLACES_API_KEY?.trim());
}

export class GooglePlacesError extends Error {}

// Liste exacte : ni sous-domaines arbitraires, ni adresses IP, ni domaines ressemblants.
const GOOGLE_LINK_HOSTS = new Set([
  "share.google", "maps.app.goo.gl", "g.page", "goo.gl",
  "google.com", "www.google.com", "maps.google.com", "consent.google.com",
  "google.fr", "www.google.fr", "maps.google.fr", "consent.google.fr",
]);

function checkedGoogleUrl(raw: string, base?: URL): URL {
  let url: URL;
  try {
    url = new URL(raw, base);
  } catch {
    throw new GooglePlacesError("Lien Google non reconnu (URL invalide).");
  }
  if (url.protocol !== "https:" || url.port || url.username || url.password || !GOOGLE_LINK_HOSTS.has(url.hostname)) {
    throw new GooglePlacesError("Lien Google non reconnu (destination non autorisée).");
  }
  return url;
}

/** Suit les redirections d'un lien court Google (share.google, maps.app.goo.gl, g.page) jusqu'à l'URL Maps finale. */
export async function resolveGoogleLink(raw: string, fetchImpl: typeof fetch = fetch): Promise<string> {
  const input = raw.trim();
  let url = checkedGoogleUrl(/^https?:\/\//i.test(input) ? input : `https://${input}`);
  for (let hop = 0; hop < 6; hop += 1) {
    const response = await fetchImpl(url.toString(), { method: "GET", redirect: "manual", headers: { "User-Agent": "Mozilla/5.0 (compatible; Reso/1.0)" }, signal: AbortSignal.timeout(8000) });
    // Seuls les en-têtes sont utiles ; ne pas conserver le corps d'une page intermédiaire.
    await response.body?.cancel();
    const location = response.headers.get("location");
    if (response.status >= 300 && response.status < 400 && location) {
      url = checkedGoogleUrl(location, url);
      continue;
    }
    // Certaines pages intermédiaires (consentement) renvoient l'URL cible dans un paramètre « continue ».
    const cont = url.searchParams.get("continue");
    if (cont) return checkedGoogleUrl(cont, url).toString();
    return url.toString();
  }
  throw new GooglePlacesError("Lien Google non reconnu (trop de redirections).");
}

/** Détails d'un lieu par identifiant (Place Details New). */
export async function getPlaceById(placeId: string, fetchImpl: typeof fetch = fetch): Promise<GooglePlaceCandidate | null> {
  const key = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!key) throw new GooglePlacesError("GOOGLE_PLACES_API_KEY manquante.");
  const response = await fetchImpl(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=fr&regionCode=FR`, {
    headers: { "X-Goog-Api-Key": key, "X-Goog-FieldMask": PLACES_FIELD_MASK.replace(/places\./g, "") },
    signal: AbortSignal.timeout(8000),
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new GooglePlacesError(`Google Places a répondu ${response.status}`);
  const place = (await response.json()) as Parameters<typeof parsePlaceCandidates>[0] extends { places?: infer P } ? (P extends Array<infer R> ? R : never) : never;
  return parsePlaceCandidates({ places: [place] })[0] ?? null;
}

/**
 * Point d'entrée : un nom + ville, ou un lien Google Maps (partage depuis
 * l'application Google Maps). Le lien est résolu puis converti en identifiant
 * de lieu ou en recherche ciblée sur les coordonnées.
 */
export async function findPlaces(query: string, fetchImpl: typeof fetch = fetch): Promise<GooglePlaceCandidate[]> {
  if (!looksLikeUrl(query)) return searchPlaces(query, undefined, fetchImpl);
  const resolved = await resolveGoogleLink(query, fetchImpl);
  const parsed = parseGoogleMapsUrl(resolved);
  console.log("[google] lien résolu", `hôte=${(() => { try { return new URL(resolved).hostname; } catch { return "?"; } })()}`, `placeId=${parsed.placeId ? "oui" : "non"}`, `nom=${parsed.name ? "oui" : "non"}`, `coords=${parsed.lat !== null ? "oui" : "non"}`);
  if (parsed.placeId) {
    const place = await getPlaceById(parsed.placeId, fetchImpl);
    if (place) return [place];
  }
  if (parsed.name) return searchPlaces(parsed.name, parsed.lat !== null && parsed.lng !== null ? { lat: parsed.lat, lng: parsed.lng } : undefined, fetchImpl);
  throw new GooglePlacesError("Lien Google non reconnu (aucun nom ni identifiant de lieu dans l'URL résolue).");
}

/** Recherche textuelle (Places API New). Une requête = un appel facturé au SKU « Text Search Pro ». */
export async function searchPlaces(query: string, bias?: { lat: number; lng: number }, fetchImpl: typeof fetch = fetch, maxResults = 5): Promise<GooglePlaceCandidate[]> {
  const key = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!key) throw new GooglePlacesError("GOOGLE_PLACES_API_KEY manquante.");
  const body: Record<string, unknown> = buildTextSearchBody(query, maxResults);
  if (bias) body.locationBias = { circle: { center: { latitude: bias.lat, longitude: bias.lng }, radius: 500 } };
  const response = await fetchImpl("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Goog-Api-Key": key, "X-Goog-FieldMask": PLACES_FIELD_MASK },
    body: JSON.stringify(body),
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
  const candidates = parsePlaceCandidates(payload as Parameters<typeof parsePlaceCandidates>[0]);
  if (first && Array.isArray(first.photos) && first.photos.length > 0 && candidates[0]?.photoNames.length === 0) {
    const sample = (first.photos[0] as { name?: string }).name ?? "";
    console.warn("[google] photos ignorées : nom inattendu", `longueur=${sample.length}`, sample.slice(0, 40));
  }
  return candidates;
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
