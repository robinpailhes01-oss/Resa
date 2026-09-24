import "server-only";
import { MAX_PHOTOS, type GooglePlaceCandidate } from "@/lib/google-places";
import { getSql } from "@/server/db";
import { resolvePhotoUrls } from "@/server/google/places";
import { replaceOpeningHours } from "./hours";
import { addPhotos, listPhotos } from "./photos";

export interface GoogleSyncOptions {
  photos: boolean;
  description: boolean;
  hours: boolean;
}

/**
 * Relie une fiche Google à un établissement existant : identifiant, note et
 * nombre d'avis toujours mis à jour ; photos, présentation et horaires selon
 * les options cochées par le pro.
 */
export async function applyGooglePlace(establishmentId: string, place: GooglePlaceCandidate, options: GoogleSyncOptions): Promise<{ photosAdded: number }> {
  const sql = getSql();
  await sql`
    update establishments set
      google_place_id = ${place.placeId},
      google_rating = ${place.rating},
      google_rating_count = ${place.ratingCount},
      google_maps_url = ${place.mapsUrl},
      google_synced_at = now(),
      description = case when ${options.description && Boolean(place.description)} then ${place.description} else description end
    where id = ${establishmentId}`;
  if (options.hours && place.hours) await replaceOpeningHours(establishmentId, null, { days: place.hours });
  let photosAdded = 0;
  if (options.photos && place.photoNames.length > 0) {
    const existing = await listPhotos(establishmentId);
    const room = Math.max(0, MAX_PHOTOS - existing.length);
    if (room > 0) {
      const urls = (await resolvePhotoUrls(place.photoNames.slice(0, room))).filter((url) => !existing.some((p) => p.url === url));
      await addPhotos(establishmentId, urls, "google");
      photosAdded = urls.length;
    }
  }
  return { photosAdded };
}
