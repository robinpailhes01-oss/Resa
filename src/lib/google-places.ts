/**
 * Import d'une fiche Google (Places API « New ») : fonctions pures, sans
 * réseau, testables. Le serveur n'appelle Google qu'avec une clé configurée.
 */

export interface GooglePlaceCandidate {
  placeId: string;
  name: string;
  formattedAddress: string;
  addressLine: string | null;
  postalCode: string | null;
  city: string | null;
  phone: string | null;
  website: string | null;
  /** Type Reso deviné à partir du type principal Google. */
  businessType: "institut" | "onglerie" | "regard_cils" | "coiffure_barbier" | "spa_soins" | "autre";
  /** Horaires par jour (0 = dimanche … 6 = samedi), plages [début, fin] en minutes. */
  hours: Record<number, Array<[number, number]>> | null;
  /** Texte de présentation Google (résumé éditorial), s'il existe. */
  description: string | null;
  /** Noms de ressources des photos (places/…/photos/…), résolus côté serveur. */
  photoNames: string[];
  /** Note Google moyenne (0 à 5) et nombre d'avis, tels que publiés par Google. */
  rating: number | null;
  ratingCount: number | null;
  /** Lien vers la fiche Google Maps. */
  mapsUrl: string | null;
}

/** Champs demandés à Google (SKU « Text Search Pro »). */
export const PLACES_FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.addressComponents",
  "places.nationalPhoneNumber",
  "places.websiteUri",
  "places.primaryType",
  "places.regularOpeningHours",
  "places.editorialSummary",
  "places.photos",
  "places.rating",
  "places.userRatingCount",
  "places.googleMapsUri",
].join(",");

/** Lien Google pour laisser un avis sur la fiche. */
export function googleWriteReviewUrl(placeId: string): string {
  return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`;
}

/** Lien Google vers les avis de la fiche. */
export function googleReviewsUrl(placeId: string): string {
  return `https://search.google.com/local/reviews?placeid=${encodeURIComponent(placeId)}`;
}

/** Métadonnées Google transmises par le formulaire (champ caché), validées. */
export function parseGoogleMeta(raw: string | null | undefined): { rating: number | null; ratingCount: number | null; mapsUrl: string | null } {
  const empty = { rating: null, ratingCount: null, mapsUrl: null };
  if (!raw) return empty;
  try {
    const data = JSON.parse(raw) as Record<string, unknown>;
    const rating = typeof data.rating === "number" && data.rating >= 0 && data.rating <= 5 ? Math.round(data.rating * 10) / 10 : null;
    const ratingCount = Number.isInteger(data.ratingCount) && (data.ratingCount as number) >= 0 ? (data.ratingCount as number) : null;
    const mapsUrl = typeof data.mapsUrl === "string" && /^https:\/\/(maps\.google\.com|www\.google\.com\/maps|maps\.app\.goo\.gl)/.test(data.mapsUrl) ? data.mapsUrl.slice(0, 500) : null;
    return { rating, ratingCount, mapsUrl };
  } catch {
    return empty;
  }
}

export const MAX_PHOTOS = 6;
// Les noms de photos Google sont longs (jusqu'à ~1 000 caractères) : lettres, chiffres, « _ », « - », « . », « ~ », « % ».
const PHOTO_NAME = /^places\/[A-Za-z0-9_.~%-]+\/photos\/[A-Za-z0-9_.~%-]+$/;

export function isPhotoName(value: unknown): value is string {
  return typeof value === "string" && value.length <= 2000 && PHOTO_NAME.test(value);
}

/** Liste de noms de photos transmise par le formulaire (champ caché), validée. */
export function parsePhotoNames(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data.filter(isPhotoName).slice(0, MAX_PHOTOS) : [];
  } catch {
    return [];
  }
}

export function buildTextSearchBody(query: string, maxResultCount = 5): Record<string, unknown> {
  return { textQuery: query, languageCode: "fr", regionCode: "FR", maxResultCount: Math.min(Math.max(maxResultCount, 1), 20) };
}

type Component = { longText?: string; shortText?: string; types?: string[] };
type Period = { open?: { day: number; hour: number; minute: number }; close?: { day: number; hour: number; minute: number } };
export type GooglePlaceRaw = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  addressComponents?: Component[];
  nationalPhoneNumber?: string;
  websiteUri?: string;
  primaryType?: string;
  regularOpeningHours?: { periods?: Period[] };
  editorialSummary?: { text?: string };
  photos?: Array<{ name?: string }>;
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
};

const TYPE_MAP: Record<string, GooglePlaceCandidate["businessType"]> = {
  hair_salon: "coiffure_barbier",
  hair_care: "coiffure_barbier",
  barber_shop: "coiffure_barbier",
  nail_salon: "onglerie",
  spa: "spa_soins",
  massage: "spa_soins",
  wellness_center: "spa_soins",
  sauna: "spa_soins",
  beauty_salon: "institut",
  beautician: "institut",
  skin_care_clinic: "institut",
  makeup_artist: "institut",
  tanning_studio: "institut",
};

export function guessBusinessType(primaryType: string | undefined): GooglePlaceCandidate["businessType"] {
  if (!primaryType) return "institut";
  return TYPE_MAP[primaryType] ?? "autre";
}

function component(components: Component[] | undefined, type: string): string | null {
  const found = components?.find((c) => c.types?.includes(type));
  return found?.longText?.trim() || null;
}

/** Convertit les périodes Google en plages par jour ; nuit à cheval sur deux jours = fin à minuit. */
export function mapGoogleOpeningHours(periods: Period[] | undefined): Record<number, Array<[number, number]>> | null {
  if (!periods || periods.length === 0) return null;
  const days: Record<number, Array<[number, number]>> = {};
  for (const period of periods) {
    if (!period.open) continue;
    const start = period.open.hour * 60 + period.open.minute;
    if (!period.close) {
      // Ouvert 24 h/24 : Google renvoie une seule période sans fermeture.
      for (let d = 0; d < 7; d += 1) days[d] = [[0, 24 * 60]];
      return days;
    }
    const sameDay = period.close.day === period.open.day;
    const end = sameDay ? period.close.hour * 60 + period.close.minute : 24 * 60;
    if (end <= start) continue;
    (days[period.open.day] ??= []).push([start, end]);
  }
  for (const key of Object.keys(days)) days[Number(key)].sort((a, b) => a[0] - b[0]);
  return Object.keys(days).length > 0 ? days : null;
}

export function parsePlaceCandidates(payload: { places?: GooglePlaceRaw[] } | null | undefined): GooglePlaceCandidate[] {
  return (payload?.places ?? [])
    .filter((place) => place.id && place.displayName?.text)
    .map((place) => {
      const number = component(place.addressComponents, "street_number");
      const route = component(place.addressComponents, "route");
      const addressLine = [number, route].filter(Boolean).join(" ") || null;
      return {
        placeId: place.id as string,
        name: (place.displayName?.text as string).trim(),
        formattedAddress: place.formattedAddress?.trim() ?? "",
        addressLine,
        postalCode: component(place.addressComponents, "postal_code"),
        city: component(place.addressComponents, "locality") ?? component(place.addressComponents, "postal_town"),
        phone: place.nationalPhoneNumber?.trim() || null,
        website: place.websiteUri?.trim() || null,
        businessType: guessBusinessType(place.primaryType),
        hours: mapGoogleOpeningHours(place.regularOpeningHours?.periods),
        description: place.editorialSummary?.text?.trim().slice(0, 600) || null,
        photoNames: (place.photos ?? []).map((photo) => photo.name).filter(isPhotoName).slice(0, MAX_PHOTOS),
        rating: typeof place.rating === "number" ? Math.round(place.rating * 10) / 10 : null,
        ratingCount: typeof place.userRatingCount === "number" ? place.userRatingCount : null,
        mapsUrl: place.googleMapsUri?.startsWith("https://") ? place.googleMapsUri : null,
      };
    });
}

/** Validation des horaires renvoyés par le navigateur (champ caché du formulaire). */
export function parseHoursJson(raw: string | null | undefined): Record<number, Array<[number, number]>> | null {
  if (!raw) return null;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!data || typeof data !== "object") return null;
  const days: Record<number, Array<[number, number]>> = {};
  for (const [key, ranges] of Object.entries(data as Record<string, unknown>)) {
    const day = Number(key);
    if (!Number.isInteger(day) || day < 0 || day > 6 || !Array.isArray(ranges)) return null;
    const clean: Array<[number, number]> = [];
    for (const range of ranges) {
      if (!Array.isArray(range) || range.length !== 2) return null;
      const [s, e] = range;
      if (!Number.isInteger(s) || !Number.isInteger(e) || s < 0 || e > 24 * 60 || e <= s) return null;
      clean.push([s, e]);
    }
    if (clean.length > 0) days[day] = clean;
  }
  return Object.keys(days).length > 0 ? days : null;
}

/** La saisie ressemble-t-elle à un lien (fiche partagée depuis Google Maps) ? */
export function looksLikeUrl(value: string): boolean {
  return /^(https?:\/\/|share\.google\/|maps\.app\.goo\.gl\/|g\.page\/|goo\.gl\/|www\.google\.[a-z.]+\/maps)/i.test(value.trim());
}

export interface ParsedMapsUrl {
  placeId: string | null;
  name: string | null;
  lat: number | null;
  lng: number | null;
}

/**
 * Extrait ce qui est exploitable d'une URL Google Maps déjà résolue :
 * identifiant de lieu (query_place_id, place_id:), nom lisible (/maps/place/<nom>/)
 * et coordonnées (@lat,lng) pour cibler la recherche.
 */
export function parseGoogleMapsUrl(raw: string): ParsedMapsUrl {
  const out: ParsedMapsUrl = { placeId: null, name: null, lat: null, lng: null };
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return out;
  }
  const pid = url.searchParams.get("query_place_id") ?? url.searchParams.get("place_id") ?? url.searchParams.get("q")?.match(/^place_id:([A-Za-z0-9_-]+)$/)?.[1] ?? null;
  if (pid && /^[A-Za-z0-9_-]{10,}$/.test(pid)) out.placeId = pid;
  const place = url.pathname.match(/\/maps\/place\/([^/]+)/);
  if (place) {
    const name = decodeURIComponent(place[1].replace(/\+/g, " ")).trim();
    if (name && !/^-?\d/.test(name)) out.name = name.slice(0, 120);
  }
  const query = url.searchParams.get("q") ?? url.searchParams.get("query");
  if (!out.name && query && !/^place_id:/.test(query) && !/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(query)) out.name = query.trim().slice(0, 120);
  const at = raw.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  const coords = at ?? query?.match(/^(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)$/) ?? null;
  if (coords) {
    const lat = Number(coords[1]);
    const lng = Number(coords[2]);
    if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
      out.lat = lat;
      out.lng = lng;
    }
  }
  return out;
}
