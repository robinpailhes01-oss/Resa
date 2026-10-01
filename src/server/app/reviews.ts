import "server-only";
import type { GoogleReview } from "@/lib/google-places";
import { getSql } from "@/server/db";
import { getPlaceReviews, isGoogleImportEnabled } from "@/server/google/places";

/**
 * Avis affichés sur la page de réservation : avis Google importés tels que
 * publiés (auteur, note, texte, date), que l'établissement peut masquer.
 * Aucun avis n'est saisi à la main (avis authentiques uniquement).
 */
export interface Review {
  id: string;
  authorName: string;
  authorUrl: string | null;
  authorPhotoUrl: string | null;
  rating: number;
  text: string;
  relativeTime: string | null;
  publishedAt: Date | null;
  hidden: boolean;
}

type Row = {
  id: string;
  author_name: string;
  author_url: string | null;
  author_photo_url: string | null;
  rating: number;
  text: string;
  relative_time: string | null;
  published_at: Date | null;
  hidden: boolean;
};

const map = (r: Row): Review => ({
  id: r.id,
  authorName: r.author_name,
  authorUrl: r.author_url,
  authorPhotoUrl: r.author_photo_url,
  rating: r.rating,
  text: r.text,
  relativeTime: r.relative_time,
  publishedAt: r.published_at,
  hidden: r.hidden,
});

/** Avis de l'établissement ; `visibleOnly` pour la page publique (avis avec texte, non masqués). */
export async function listReviews(establishmentId: string, { visibleOnly = false } = {}): Promise<Review[]> {
  const sql = getSql();
  const rows = visibleOnly
    ? await sql<Row[]>`select * from establishment_reviews where establishment_id = ${establishmentId} and not hidden and text <> ''
        order by rating desc, published_at desc nulls last limit 6`
    : await sql<Row[]>`select * from establishment_reviews where establishment_id = ${establishmentId} order by published_at desc nulls last`;
  return rows.map(map);
}

export async function saveGoogleReviews(establishmentId: string, reviews: GoogleReview[]): Promise<number> {
  const sql = getSql();
  for (const r of reviews) {
    // Le choix « masqué » de l'établissement est conservé à chaque actualisation.
    await sql`
      insert into establishment_reviews (establishment_id, external_id, author_name, author_url, author_photo_url, rating, text, relative_time, published_at)
      values (${establishmentId}, ${r.externalId}, ${r.authorName}, ${r.authorUrl}, ${r.authorPhotoUrl}, ${r.rating}, ${r.text}, ${r.relativeTime}, ${r.publishedAt})
      on conflict (establishment_id, external_id) do update set
        author_name = excluded.author_name, author_url = excluded.author_url, author_photo_url = excluded.author_photo_url,
        rating = excluded.rating, text = excluded.text, relative_time = excluded.relative_time, published_at = excluded.published_at,
        imported_at = now()`;
  }
  return reviews.length;
}

export class ReviewsUnavailableError extends Error {}

/** Récupère les avis de la fiche Google reliée, ainsi que la note et le nombre d'avis à jour. */
export async function syncGoogleReviews(establishmentId: string, placeId: string | null): Promise<number> {
  if (!placeId) throw new ReviewsUnavailableError("Aucune fiche Google reliée.");
  if (!isGoogleImportEnabled()) throw new ReviewsUnavailableError("Import Google non activé.");
  const data = await getPlaceReviews(placeId);
  if (!data) throw new ReviewsUnavailableError("Fiche Google introuvable.");
  const count = await saveGoogleReviews(establishmentId, data.reviews);
  await getSql()`update establishments set google_rating = coalesce(${data.rating}, google_rating), google_rating_count = coalesce(${data.ratingCount}, google_rating_count),
      google_maps_url = coalesce(${data.mapsUrl}, google_maps_url), google_synced_at = now()
    where id = ${establishmentId}`;
  return count;
}

export async function setReviewHidden(establishmentId: string, reviewId: string, hidden: boolean): Promise<void> {
  await getSql()`update establishment_reviews set hidden = ${hidden} where id = ${reviewId} and establishment_id = ${establishmentId}`;
}
