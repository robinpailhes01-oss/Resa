import "server-only";
import { swapNeighbour } from "@/lib/service-groups";
import { getSql } from "@/server/db";

/** Rubrique de la page de réservation (titre libre, texte d'information, ordre). */
export interface ServiceCategory {
  id: string;
  title: string;
  description: string | null;
  sortOrder: number;
}

type Row = { id: string; title: string; description: string | null; sort_order: number };
const map = (r: Row): ServiceCategory => ({ id: r.id, title: r.title, description: r.description, sortOrder: r.sort_order });

export interface CategoryInput {
  title: string;
  description: string | null;
}

export async function listCategories(establishmentId: string): Promise<ServiceCategory[]> {
  const sql = getSql();
  const rows = await sql<Row[]>`select id, title, description, sort_order from service_categories where establishment_id = ${establishmentId} order by sort_order, created_at`;
  return rows.map(map);
}

export async function createCategory(establishmentId: string, input: CategoryInput): Promise<ServiceCategory> {
  const sql = getSql();
  const [row] = await sql<Row[]>`
    insert into service_categories (establishment_id, title, description, sort_order)
    values (${establishmentId}, ${input.title}, ${input.description},
      (select coalesce(max(sort_order), -1) + 1 from service_categories where establishment_id = ${establishmentId}))
    returning id, title, description, sort_order`;
  return map(row);
}

export async function updateCategory(establishmentId: string, id: string, input: CategoryInput): Promise<boolean> {
  const sql = getSql();
  const rows = await sql`update service_categories set title = ${input.title}, description = ${input.description} where establishment_id = ${establishmentId} and id = ${id} returning id`;
  return rows.length > 0;
}

/** Supprime la rubrique ; ses prestations restent, sans rubrique. */
export async function deleteCategory(establishmentId: string, id: string): Promise<void> {
  const sql = getSql();
  await sql`delete from service_categories where establishment_id = ${establishmentId} and id = ${id}`;
}

/** Échange la rubrique avec sa voisine (au-dessus ou en dessous). */
export async function moveCategory(establishmentId: string, id: string, direction: "up" | "down"): Promise<void> {
  const sql = getSql();
  await sql.begin(async (tx) => {
    const rows = await tx<Array<{ id: string }>>`select id from service_categories where establishment_id = ${establishmentId} order by sort_order, created_at for update`;
    const ids = swapNeighbour(rows.map((r) => r.id), id, direction);
    if (!ids) return;
    for (const [index, rowId] of ids.entries()) await tx`update service_categories set sort_order = ${index} where id = ${rowId}`;
  });
}
