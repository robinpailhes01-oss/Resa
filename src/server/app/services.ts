import "server-only";
import { swapNeighbour } from "@/lib/service-groups";
import { getSql, type Db } from "@/server/db";

export interface Service {
  id: string;
  establishmentId: string;
  name: string;
  description: string | null;
  durationMin: number;
  bufferMin: number;
  priceCents: number;
  active: boolean;
  sortOrder: number;
  /** Identifiants des praticiens habilités ; vide = tous. */
  practitionerIds: string[];
  /** Photo de la prestation (facultative). */
  photoUrl: string | null;
  /** Rubrique de la page de réservation ; null = sans rubrique. */
  categoryId: string | null;
}

type Row = {
  id: string;
  establishment_id: string;
  name: string;
  description: string | null;
  duration_min: number;
  buffer_min: number;
  price_cents: number;
  active: boolean;
  sort_order: number;
  practitioner_ids: string[] | null;
  photo_url: string | null;
  category_id: string | null;
};

const map = (r: Row): Service => ({
  id: r.id,
  establishmentId: r.establishment_id,
  name: r.name,
  description: r.description,
  durationMin: r.duration_min,
  bufferMin: r.buffer_min,
  priceCents: r.price_cents,
  active: r.active,
  sortOrder: r.sort_order,
  practitionerIds: r.practitioner_ids ?? [],
  photoUrl: r.photo_url ?? null,
  categoryId: r.category_id ?? null,
});

const SELECT = (sql: ReturnType<typeof getSql>) => sql`
  select s.*, (select array_agg(sp.practitioner_id) from service_practitioners sp where sp.service_id = s.id) as practitioner_ids,
    (select ph.url from establishment_photos ph where ph.service_id = s.id limit 1) as photo_url
  from services s`;

export async function listServices(establishmentId: string, includeInactive = false): Promise<Service[]> {
  const sql = getSql();
  const rows = await sql<Row[]>`
    ${SELECT(sql)}
    where s.establishment_id = ${establishmentId} ${includeInactive ? sql`` : sql`and s.active = true`}
    order by s.sort_order, s.created_at`;
  return rows.map(map);
}

export async function getService(establishmentId: string, id: string): Promise<Service | null> {
  const sql = getSql();
  const rows = await sql<Row[]>`${SELECT(sql)} where s.establishment_id = ${establishmentId} and s.id = ${id}`;
  return rows[0] ? map(rows[0]) : null;
}

export interface ServiceInput {
  name: string;
  description: string | null;
  durationMin: number;
  bufferMin: number;
  priceCents: number;
  active: boolean;
  practitionerIds: string[];
  /** Absent = rubrique inchangée (création : sans rubrique). */
  categoryId?: string | null;
}

/** Rubrique acceptée seulement si elle appartient à l'établissement. */
async function ownCategory(tx: Db, establishmentId: string, categoryId: string | null | undefined): Promise<string | null> {
  if (!categoryId) return null;
  const rows = await tx`select id from service_categories where establishment_id = ${establishmentId} and id = ${categoryId}`;
  return rows.length > 0 ? categoryId : null;
}

export async function createService(establishmentId: string, input: ServiceInput): Promise<Service> {
  const sql = getSql();
  return sql.begin(async (tx) => {
    const [max] = await tx<Array<{ max: number | null }>>`select max(sort_order) as max from services where establishment_id = ${establishmentId}`;
    const categoryId = await ownCategory(tx, establishmentId, input.categoryId);
    const [row] = await tx<Row[]>`
      insert into services (establishment_id, name, description, duration_min, buffer_min, price_cents, active, sort_order, category_id)
      values (${establishmentId}, ${input.name}, ${input.description}, ${input.durationMin}, ${input.bufferMin}, ${input.priceCents}, ${input.active}, ${(max?.max ?? -1) + 1}, ${categoryId})
      returning *, null::uuid[] as practitioner_ids`;
    for (const pid of input.practitionerIds) {
      await tx`insert into service_practitioners (service_id, practitioner_id) values (${row.id}, ${pid}) on conflict do nothing`;
    }
    return { ...map(row), practitionerIds: input.practitionerIds };
  });
}

export async function updateService(establishmentId: string, id: string, input: ServiceInput): Promise<void> {
  const sql = getSql();
  await sql.begin(async (tx) => {
    const category =
      input.categoryId === undefined ? tx`` : tx`, category_id = ${await ownCategory(tx, establishmentId, input.categoryId)}`;
    const updated = await tx`
      update services set name = ${input.name}, description = ${input.description}, duration_min = ${input.durationMin},
        buffer_min = ${input.bufferMin}, price_cents = ${input.priceCents}, active = ${input.active} ${category}
      where establishment_id = ${establishmentId} and id = ${id} returning id`;
    if (updated.length === 0) return;
    await tx`delete from service_practitioners where service_id = ${id}`;
    for (const pid of input.practitionerIds) {
      await tx`insert into service_practitioners (service_id, practitioner_id) values (${id}, ${pid}) on conflict do nothing`;
    }
  });
}

export async function deleteService(establishmentId: string, id: string): Promise<"deleted" | "deactivated"> {
  const sql = getSql();
  const [used] = await sql<Array<{ count: string }>>`select count(*)::text as count from bookings where service_id = ${id}`;
  if (Number(used.count) > 0) {
    await sql`update services set active = false where establishment_id = ${establishmentId} and id = ${id}`;
    return "deactivated";
  }
  await sql`delete from services where establishment_id = ${establishmentId} and id = ${id}`;
  return "deleted";
}

/** Monte ou descend la prestation parmi celles de la même rubrique. */
export async function moveService(establishmentId: string, id: string, direction: "up" | "down"): Promise<void> {
  const sql = getSql();
  await sql.begin(async (tx) => {
    const rows = await tx<Array<{ id: string; category_id: string | null }>>`
      select id, category_id from services where establishment_id = ${establishmentId} order by sort_order, created_at for update`;
    const current = rows.find((r) => r.id === id);
    if (!current) return;
    const sameGroup = rows.filter((r) => r.category_id === current.category_id).map((r) => r.id);
    const reordered = swapNeighbour(sameGroup, id, direction);
    if (!reordered) return;
    // Les places du groupe dans l'ordre général sont conservées ; seules les prestations du groupe s'échangent.
    let k = 0;
    const all = rows.map((r) => (r.category_id === current.category_id ? reordered[k++] : r.id));
    for (const [index, rowId] of all.entries()) await tx`update services set sort_order = ${index} where id = ${rowId}`;
  });
}

/** Range une prestation dans une rubrique (ou aucune). */
export async function setServiceCategory(establishmentId: string, id: string, categoryId: string | null): Promise<void> {
  const sql = getSql();
  const category = await ownCategory(sql, establishmentId, categoryId);
  await sql`update services set category_id = ${category} where establishment_id = ${establishmentId} and id = ${id}`;
}
