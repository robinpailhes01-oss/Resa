import "server-only";
import { getSql } from "@/server/db";

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
});

const SELECT = (sql: ReturnType<typeof getSql>) => sql`
  select s.*, (select array_agg(sp.practitioner_id) from service_practitioners sp where sp.service_id = s.id) as practitioner_ids
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
}

export async function createService(establishmentId: string, input: ServiceInput): Promise<Service> {
  const sql = getSql();
  return sql.begin(async (tx) => {
    const [max] = await tx<Array<{ max: number | null }>>`select max(sort_order) as max from services where establishment_id = ${establishmentId}`;
    const [row] = await tx<Row[]>`
      insert into services (establishment_id, name, description, duration_min, buffer_min, price_cents, active, sort_order)
      values (${establishmentId}, ${input.name}, ${input.description}, ${input.durationMin}, ${input.bufferMin}, ${input.priceCents}, ${input.active}, ${(max?.max ?? -1) + 1})
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
    const updated = await tx`
      update services set name = ${input.name}, description = ${input.description}, duration_min = ${input.durationMin},
        buffer_min = ${input.bufferMin}, price_cents = ${input.priceCents}, active = ${input.active}
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
