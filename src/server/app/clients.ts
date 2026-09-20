import "server-only";
import { getSql, type Db } from "@/server/db";

export interface Client {
  id: string;
  establishmentId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  createdAt: Date;
}

type Row = { id: string; establishment_id: string; first_name: string; last_name: string; email: string | null; phone: string | null; notes: string | null; created_at: Date };

const map = (r: Row): Client => ({
  id: r.id,
  establishmentId: r.establishment_id,
  firstName: r.first_name,
  lastName: r.last_name,
  email: r.email,
  phone: r.phone,
  notes: r.notes,
  createdAt: r.created_at,
});

export function clientFullName(c: { firstName: string; lastName: string }): string {
  return `${c.firstName} ${c.lastName}`.trim();
}

export async function listClients(establishmentId: string, search = ""): Promise<Array<Client & { bookingCount: number; lastBookingAt: Date | null }>> {
  const sql = getSql();
  const like = `%${search.trim()}%`;
  const rows = await sql<Array<Row & { booking_count: string; last_booking_at: Date | null }>>`
    select c.*, count(b.id)::text as booking_count, max(b.starts_at) as last_booking_at
    from clients c left join bookings b on b.client_id = c.id and b.status <> 'cancelled'
    where c.establishment_id = ${establishmentId}
      ${search.trim() ? sql`and (c.first_name ilike ${like} or c.last_name ilike ${like} or c.email ilike ${like} or c.phone ilike ${like})` : sql``}
    group by c.id
    order by c.last_name, c.first_name
    limit 300`;
  return rows.map((r) => ({ ...map(r), bookingCount: Number(r.booking_count), lastBookingAt: r.last_booking_at }));
}

export async function getClient(establishmentId: string, id: string): Promise<Client | null> {
  const rows = await getSql()<Row[]>`select * from clients where establishment_id = ${establishmentId} and id = ${id}`;
  return rows[0] ? map(rows[0]) : null;
}

export interface ClientInput {
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  notes?: string | null;
}

/** Retrouve un client par email (si fourni), sinon le crée. Met à jour le téléphone s'il manquait. */
export async function upsertClient(establishmentId: string, input: ClientInput, tx: Db = getSql()): Promise<Client> {
  if (input.email) {
    const existing = await tx<Row[]>`select * from clients where establishment_id = ${establishmentId} and email = ${input.email}`;
    if (existing[0]) {
      const c = existing[0];
      const [updated] = await tx<Row[]>`
        update clients set phone = coalesce(${input.phone}, phone),
          first_name = case when first_name = '' then ${input.firstName} else first_name end
        where id = ${c.id} returning *`;
      return map(updated);
    }
  }
  const [row] = await tx<Row[]>`
    insert into clients (establishment_id, first_name, last_name, email, phone, notes)
    values (${establishmentId}, ${input.firstName}, ${input.lastName}, ${input.email}, ${input.phone}, ${input.notes ?? null})
    returning *`;
  return map(row);
}

export async function updateClient(establishmentId: string, id: string, input: ClientInput): Promise<void> {
  await getSql()`
    update clients set first_name = ${input.firstName}, last_name = ${input.lastName}, email = ${input.email}, phone = ${input.phone}, notes = ${input.notes ?? null}
    where establishment_id = ${establishmentId} and id = ${id}`;
}
