import "server-only";
import { getSql } from "@/server/db";

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

export async function deletePhoto(establishmentId: string, photoId: string): Promise<void> {
  await getSql()`delete from establishment_photos where id = ${photoId} and establishment_id = ${establishmentId}`;
}
