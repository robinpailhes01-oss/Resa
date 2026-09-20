import "server-only";
import { getSql } from "@/server/db";

export interface Practitioner {
  id: string;
  establishmentId: string;
  name: string;
  roleTitle: string | null;
  color: "soft" | "accent" | "success";
  active: boolean;
  sortOrder: number;
}

type Row = { id: string; establishment_id: string; name: string; role_title: string | null; color: Practitioner["color"]; active: boolean; sort_order: number };

const map = (r: Row): Practitioner => ({
  id: r.id,
  establishmentId: r.establishment_id,
  name: r.name,
  roleTitle: r.role_title,
  color: r.color,
  active: r.active,
  sortOrder: r.sort_order,
});

export const PRACTITIONER_LIMIT = 3;

export async function listPractitioners(establishmentId: string, includeInactive = false): Promise<Practitioner[]> {
  const rows = await getSql()<Row[]>`
    select * from practitioners
    where establishment_id = ${establishmentId} ${includeInactive ? getSql()`` : getSql()`and active = true`}
    order by sort_order, created_at`;
  return rows.map(map);
}

export async function getPractitioner(establishmentId: string, id: string): Promise<Practitioner | null> {
  const rows = await getSql()<Row[]>`select * from practitioners where establishment_id = ${establishmentId} and id = ${id}`;
  return rows[0] ? map(rows[0]) : null;
}

export async function countActivePractitioners(establishmentId: string): Promise<number> {
  const [row] = await getSql()<Array<{ count: string }>>`select count(*)::text as count from practitioners where establishment_id = ${establishmentId} and active = true`;
  return Number(row?.count ?? 0);
}

export async function createPractitioner(establishmentId: string, input: { name: string; roleTitle: string | null; color: Practitioner["color"] }): Promise<Practitioner> {
  const sql = getSql();
  const [max] = await sql<Array<{ max: number | null }>>`select max(sort_order) as max from practitioners where establishment_id = ${establishmentId}`;
  const [row] = await sql<Row[]>`
    insert into practitioners (establishment_id, name, role_title, color, sort_order)
    values (${establishmentId}, ${input.name}, ${input.roleTitle}, ${input.color}, ${(max?.max ?? -1) + 1})
    returning *`;
  return map(row);
}

export async function updatePractitioner(establishmentId: string, id: string, input: { name: string; roleTitle: string | null; color: Practitioner["color"]; active: boolean }): Promise<void> {
  await getSql()`
    update practitioners set name = ${input.name}, role_title = ${input.roleTitle}, color = ${input.color}, active = ${input.active}
    where establishment_id = ${establishmentId} and id = ${id}`;
}

export async function deletePractitioner(establishmentId: string, id: string): Promise<"deleted" | "deactivated"> {
  const sql = getSql();
  const [used] = await sql<Array<{ count: string }>>`select count(*)::text as count from bookings where practitioner_id = ${id}`;
  if (Number(used.count) > 0) {
    await sql`update practitioners set active = false where establishment_id = ${establishmentId} and id = ${id}`;
    return "deactivated";
  }
  await sql`delete from practitioners where establishment_id = ${establishmentId} and id = ${id}`;
  return "deleted";
}
