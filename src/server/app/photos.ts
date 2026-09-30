import "server-only";
import { randomUUID } from "node:crypto";
import { getSql } from "@/server/db";
import type { ImageType } from "@/lib/image-type";

/** Nombre maximum de photos sur une page de réservation. */
export const MAX_PHOTOS = 12;
/** Taille maximum d'une photo envoyée (déjà compressée par le navigateur). */
export const MAX_PHOTO_BYTES = 1_500_000;

export class PhotoLimitError extends Error {}

export interface EstablishmentPhoto {
  id: string;
  url: string;
  source: "google" | "manual";
  sortOrder: number;
}

type Row = { id: string; url: string; source: EstablishmentPhoto["source"]; sort_order: number };
const map = (r: Row): EstablishmentPhoto => ({ id: r.id, url: r.url, source: r.source, sortOrder: r.sort_order });

export async function listPhotos(establishmentId: string): Promise<EstablishmentPhoto[]> {
  const rows = await getSql()<Row[]>`select id, url, source, sort_order from establishment_photos where establishment_id = ${establishmentId} order by sort_order, created_at`;
  return rows.map(map);
}

export async function addPhotos(establishmentId: string, urls: string[], source: EstablishmentPhoto["source"] = "google"): Promise<void> {
  if (urls.length === 0) return;
  const sql = getSql();
  const [max] = await sql<Array<{ max: number | null }>>`select max(sort_order) as max from establishment_photos where establishment_id = ${establishmentId}`;
  let order = (max?.max ?? -1) + 1;
  for (const url of urls) {
    await sql`insert into establishment_photos (establishment_id, url, source, sort_order) values (${establishmentId}, ${url}, ${source}, ${order})`;
    order += 1;
  }
}

/** Photo envoyée depuis l'appareil du professionnel, stockée en base et servie par /photos/<id>. */
export async function addUploadedPhoto(establishmentId: string, bytes: Uint8Array, contentType: ImageType): Promise<string> {
  const sql = getSql();
  return sql.begin(async (tx) => {
    const [count] = await tx<Array<{ n: number }>>`select count(*)::int as n from establishment_photos where establishment_id = ${establishmentId}`;
    if (count.n >= MAX_PHOTOS) throw new PhotoLimitError(`${MAX_PHOTOS} photos maximum.`);
    const [max] = await tx<Array<{ max: number | null }>>`select max(sort_order) as max from establishment_photos where establishment_id = ${establishmentId}`;
    const id = randomUUID();
    await tx`insert into establishment_photos (id, establishment_id, url, source, sort_order, image, content_type)
      values (${id}, ${establishmentId}, ${`/photos/${id}`}, 'manual', ${(max?.max ?? -1) + 1}, ${Buffer.from(bytes)}, ${contentType})`;
    return id;
  });
}

/** Image d'une photo envoyée (route publique /photos/<id>). */
export async function getPhotoImage(id: string): Promise<{ bytes: Buffer; contentType: string } | null> {
  const rows = await getSql()<Array<{ image: Buffer | null; content_type: string | null }>>`select image, content_type from establishment_photos where id = ${id}`;
  const row = rows[0];
  return row?.image && row.content_type ? { bytes: row.image, contentType: row.content_type } : null;
}

/** Place une photo en premier (photo de couverture de la page). */
export async function movePhotoFirst(establishmentId: string, photoId: string): Promise<void> {
  const sql = getSql();
  await sql.begin(async (tx) => {
    const [min] = await tx<Array<{ min: number | null }>>`select min(sort_order) as min from establishment_photos where establishment_id = ${establishmentId}`;
    await tx`update establishment_photos set sort_order = ${(min?.min ?? 0) - 1} where id = ${photoId} and establishment_id = ${establishmentId}`;
  });
}

export async function deletePhoto(establishmentId: string, photoId: string): Promise<void> {
  await getSql()`delete from establishment_photos where id = ${photoId} and establishment_id = ${establishmentId}`;
}
