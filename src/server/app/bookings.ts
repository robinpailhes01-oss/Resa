import "server-only";
import { getSql, type Db } from "@/server/db";
import { generateToken, hashToken, looksLikeToken } from "@/server/waitlist/tokens";
import { zonedToUtc } from "@/lib/time";
import { computeSlots, type BusyInterval, type Slot } from "./availability";
import { upsertClient, type ClientInput } from "./clients";
import { effectiveRanges } from "./hours";
import { onBookingCancelled, scheduleBookingEmails } from "./notifications";
import { weekdayOfDateKey } from "@/lib/time";

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled" | "no_show";

export interface Booking {
  id: string;
  establishmentId: string;
  practitionerId: string;
  serviceId: string | null;
  clientId: string | null;
  serviceName: string;
  durationMin: number;
  bufferMin: number;
  priceCents: number;
  startsAt: Date;
  endsAt: Date;
  status: BookingStatus;
  source: "online" | "manual";
  notes: string | null;
  clientNotes: string | null;
  createdAt: Date;
  cancelledAt: Date | null;
  cancelledBy: "client" | "pro" | null;
  client: { id: string; firstName: string; lastName: string; email: string | null; phone: string | null } | null;
  practitionerName: string;
}

type Row = {
  id: string;
  establishment_id: string;
  practitioner_id: string;
  service_id: string | null;
  client_id: string | null;
  service_name: string;
  duration_min: number;
  buffer_min: number;
  price_cents: number;
  starts_at: Date;
  ends_at: Date;
  status: BookingStatus;
  source: "online" | "manual";
  notes: string | null;
  client_notes: string | null;
  created_at: Date;
  cancelled_at: Date | null;
  cancelled_by: "client" | "pro" | null;
  c_id: string | null;
  c_first_name: string | null;
  c_last_name: string | null;
  c_email: string | null;
  c_phone: string | null;
  p_name: string;
};

const map = (r: Row): Booking => ({
  id: r.id,
  establishmentId: r.establishment_id,
  practitionerId: r.practitioner_id,
  serviceId: r.service_id,
  clientId: r.client_id,
  serviceName: r.service_name,
  durationMin: r.duration_min,
  bufferMin: r.buffer_min,
  priceCents: r.price_cents,
  startsAt: r.starts_at,
  endsAt: r.ends_at,
  status: r.status,
  source: r.source,
  notes: r.notes,
  clientNotes: r.client_notes,
  createdAt: r.created_at,
  cancelledAt: r.cancelled_at,
  cancelledBy: r.cancelled_by,
  client: r.c_id ? { id: r.c_id, firstName: r.c_first_name ?? "", lastName: r.c_last_name ?? "", email: r.c_email, phone: r.c_phone } : null,
  practitionerName: r.p_name,
});

const SELECT = (sql: Db) => sql`
  select b.*, c.id as c_id, c.first_name as c_first_name, c.last_name as c_last_name, c.email as c_email, c.phone as c_phone, p.name as p_name
  from bookings b
  left join clients c on c.id = b.client_id
  join practitioners p on p.id = b.practitioner_id`;

/** Rendez-vous d'une journée locale (bornes calculées dans le fuseau de l'établissement). */
export async function listBookingsForDay(establishmentId: string, dateKey: string, timeZone: string): Promise<Booking[]> {
  const sql = getSql();
  const start = zonedToUtc(dateKey, 0, timeZone);
  const end = zonedToUtc(dateKey, 24 * 60, timeZone);
  const rows = await sql<Row[]>`${SELECT(sql)}
    where b.establishment_id = ${establishmentId} and b.starts_at >= ${start} and b.starts_at < ${end}
    order by b.starts_at`;
  return rows.map(map);
}

export async function listUpcomingBookings(establishmentId: string, limit = 50): Promise<Booking[]> {
  const sql = getSql();
  const rows = await sql<Row[]>`${SELECT(sql)}
    where b.establishment_id = ${establishmentId} and b.starts_at >= now() and b.status in ('pending','confirmed')
    order by b.starts_at limit ${limit}`;
  return rows.map(map);
}

export async function listBookingsForClient(establishmentId: string, clientId: string): Promise<Booking[]> {
  const sql = getSql();
  const rows = await sql<Row[]>`${SELECT(sql)}
    where b.establishment_id = ${establishmentId} and b.client_id = ${clientId}
    order by b.starts_at desc limit 100`;
  return rows.map(map);
}

export async function getBooking(establishmentId: string, id: string): Promise<Booking | null> {
  const sql = getSql();
  const rows = await sql<Row[]>`${SELECT(sql)} where b.establishment_id = ${establishmentId} and b.id = ${id}`;
  return rows[0] ? map(rows[0]) : null;
}

export async function getBookingByManageToken(raw: string): Promise<Booking | null> {
  if (!looksLikeToken(raw)) return null;
  const sql = getSql();
  const rows = await sql<Row[]>`${SELECT(sql)} where b.manage_token_hash = ${hashToken(raw)}`;
  return rows[0] ? map(rows[0]) : null;
}

/** Remplace le jeton de gestion et renvoie le nouveau jeton brut (à mettre dans l'email). */
export async function rotateManageToken(bookingId: string, tx: Db = getSql()): Promise<string | null> {
  const raw = generateToken();
  const rows = await tx`update bookings set manage_token_hash = ${hashToken(raw)} where id = ${bookingId} returning id`;
  return rows.length ? raw : null;
}

/** Créneaux disponibles d'un praticien pour une prestation, un jour donné. */
export async function availableSlots(params: {
  establishmentId: string;
  practitionerId: string;
  dateKey: string;
  timeZone: string;
  durationMin: number;
  bufferMin: number;
  stepMin: number;
  minLeadMin: number;
  now?: Date;
}): Promise<Slot[]> {
  const sql = getSql();
  const weekday = weekdayOfDateKey(params.dateKey);
  const ranges = (await effectiveRanges(params.establishmentId, params.practitionerId)).filter((r) => r.weekday === weekday);
  if (ranges.length === 0) return [];
  const dayStart = zonedToUtc(params.dateKey, 0, params.timeZone);
  const dayEnd = zonedToUtc(params.dateKey, 24 * 60, params.timeZone);
  const busyRows = await sql<Array<{ starts_at: Date; blocks_until: Date }>>`
    select starts_at, blocks_until from bookings
    where practitioner_id = ${params.practitionerId} and status in ('pending','confirmed')
      and blocks_until > ${dayStart} and starts_at < ${dayEnd}`;
  const offRows = await sql<Array<{ starts_at: Date; ends_at: Date }>>`
    select starts_at, ends_at from time_off
    where establishment_id = ${params.establishmentId} and (practitioner_id is null or practitioner_id = ${params.practitionerId})
      and ends_at > ${dayStart} and starts_at < ${dayEnd}`;
  const busy: BusyInterval[] = [
    ...busyRows.map((b) => ({ start: b.starts_at, end: b.blocks_until })),
    ...offRows.map((o) => ({ start: o.starts_at, end: o.ends_at })),
  ];
  return computeSlots({
    dateKey: params.dateKey,
    timeZone: params.timeZone,
    ranges,
    busy,
    durationMin: params.durationMin,
    bufferMin: params.bufferMin,
    stepMin: params.stepMin,
    now: params.now ?? new Date(),
    minLeadMin: params.minLeadMin,
  });
}

export class SlotUnavailableError extends Error {
  constructor() {
    super("Ce créneau n’est plus disponible.");
    this.name = "SlotUnavailableError";
  }
}

export interface CreateBookingInput {
  establishmentId: string;
  practitionerId: string;
  serviceId: string | null;
  serviceName: string;
  durationMin: number;
  bufferMin: number;
  priceCents: number;
  startsAt: Date;
  source: "online" | "manual";
  status?: BookingStatus;
  notes?: string | null;
  clientNotes?: string | null;
  client: ClientInput | null;
}

/**
 * Crée le rendez-vous, le client si besoin, le jeton de gestion et les emails
 * planifiés, dans une seule transaction. La contrainte d'exclusion de la base
 * garantit l'absence de chevauchement même en cas de demandes simultanées.
 */
export async function createBooking(input: CreateBookingInput): Promise<{ booking: Booking; manageToken: string }> {
  const sql = getSql();
  const endsAt = new Date(input.startsAt.getTime() + input.durationMin * 60_000);
  const raw = generateToken();
  return sql.begin(async (tx) => {
    const client = input.client ? await upsertClient(input.establishmentId, input.client, tx) : null;
    let rows: Array<{ id: string }>;
    try {
      rows = await tx<Array<{ id: string }>>`
        insert into bookings (establishment_id, practitioner_id, service_id, client_id, service_name, duration_min, buffer_min, price_cents,
          starts_at, ends_at, status, source, notes, client_notes, manage_token_hash)
        values (${input.establishmentId}, ${input.practitionerId}, ${input.serviceId}, ${client?.id ?? null}, ${input.serviceName}, ${input.durationMin},
          ${input.bufferMin}, ${input.priceCents}, ${input.startsAt}, ${endsAt}, ${input.status ?? "confirmed"}, ${input.source},
          ${input.notes ?? null}, ${input.clientNotes ?? null}, ${hashToken(raw)})
        returning id`;
    } catch (error) {
      if ((error as { code?: string }).code === "23P01") throw new SlotUnavailableError();
      throw error;
    }
    const id = rows[0].id;
    await scheduleBookingEmails(tx, {
      establishmentId: input.establishmentId,
      bookingId: id,
      startsAt: input.startsAt,
      endsAt,
      source: input.source,
      hasClientEmail: Boolean(client?.email),
      manageToken: raw,
    });
    const [row] = await tx<Row[]>`${SELECT(tx)} where b.id = ${id}`;
    return { booking: map(row), manageToken: raw };
  });
}

export async function updateBookingStatus(establishmentId: string, id: string, status: BookingStatus): Promise<void> {
  const sql = getSql();
  await sql.begin(async (tx) => {
    const rows = await tx<Array<{ client_email: string | null }>>`
      update bookings b set status = ${status},
        cancelled_at = case when ${status} = 'cancelled' then now() else null end,
        cancelled_by = case when ${status} = 'cancelled' then 'pro' else null end
      from (select b2.id, c.email as client_email from bookings b2 left join clients c on c.id = b2.client_id where b2.id = ${id} and b2.establishment_id = ${establishmentId}) src
      where b.id = src.id
      returning src.client_email`;
    if (rows.length === 0) return;
    if (status === "cancelled") {
      await onBookingCancelled(tx, { establishmentId, bookingId: id, hasClientEmail: Boolean(rows[0].client_email), cancelledBy: "pro" });
    }
  });
}

export async function updateBookingNotes(establishmentId: string, id: string, notes: string | null): Promise<void> {
  await getSql()`update bookings set notes = ${notes} where establishment_id = ${establishmentId} and id = ${id}`;
}

/** Annulation par le client depuis son lien, si le délai le permet. */
/** Un client peut annuler tant que le délai de prévenance est respecté. */
export function isCancellableByClient(booking: Pick<Booking, "status" | "startsAt">, cancellationHours: number, now = new Date()): boolean {
  if (booking.status !== "confirmed" && booking.status !== "pending") return false;
  return booking.startsAt.getTime() - now.getTime() >= cancellationHours * 3600_000;
}

export async function cancelBookingByClient(raw: string, cancellationHours: number, now = new Date()): Promise<"cancelled" | "too_late" | "invalid" | "already"> {
  const booking = await getBookingByManageToken(raw);
  if (!booking) return "invalid";
  if (booking.status === "cancelled") return "already";
  if (booking.startsAt.getTime() - now.getTime() < cancellationHours * 3600_000) return "too_late";
  const sql = getSql();
  await sql.begin(async (tx) => {
    await tx`update bookings set status = 'cancelled', cancelled_at = now(), cancelled_by = 'client' where id = ${booking.id}`;
    await onBookingCancelled(tx, { establishmentId: booking.establishmentId, bookingId: booking.id, hasClientEmail: Boolean(booking.client?.email), cancelledBy: "client" });
  });
  return "cancelled";
}
