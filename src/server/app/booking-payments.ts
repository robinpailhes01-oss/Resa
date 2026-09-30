import "server-only";
import { amountDue, describePaymentRule, normalizePaymentStatus, type AmountDue, type PaymentRule } from "@/lib/booking-payment";
import { bookingPaymentRules } from "@/config/offer";
import { formatDateTimeFr } from "@/lib/time";
import { alertOps } from "@/server/alerts";
import type { Establishment } from "@/server/auth/guards";
import { getSql, type Db } from "@/server/db";
import { absoluteUrl } from "@/server/email";
import * as connect from "@/server/mollie-connect";
import { open, seal } from "@/server/secret-box";
import { generateToken, hashToken } from "@/server/waitlist/tokens";
import { scheduleBookingEmails } from "./notifications";

/**
 * Encaissement à la réservation via Mollie Connect : connexion du compte
 * Mollie de l'établissement, règle d'acompte, paiement des clients,
 * confirmation au paiement, libération du créneau et remboursements.
 */

// ------------------------------------------------------------------ connexion

export interface MollieConnection {
  organizationName: string | null;
  profileId: string | null;
  profileName: string | null;
  onboardingStatus: string | null;
  canReceivePayments: boolean;
  dashboardUrl: string | null;
  testmode: boolean;
  connectedAt: Date;
  checkedAt: Date | null;
}

type ConnectionRow = {
  establishment_id: string;
  organization_id: string | null;
  organization_name: string | null;
  profile_id: string | null;
  profile_name: string | null;
  access_token_enc: string;
  access_expires_at: Date;
  refresh_token_enc: string;
  onboarding_status: string | null;
  can_receive_payments: boolean;
  dashboard_url: string | null;
  testmode: boolean;
  connected_at: Date;
  checked_at: Date | null;
};

const mapConnection = (r: ConnectionRow): MollieConnection => ({
  organizationName: r.organization_name,
  profileId: r.profile_id,
  profileName: r.profile_name,
  onboardingStatus: r.onboarding_status,
  canReceivePayments: r.can_receive_payments,
  dashboardUrl: r.dashboard_url,
  testmode: r.testmode,
  connectedAt: r.connected_at,
  checkedAt: r.checked_at,
});

export async function getMollieConnection(establishmentId: string): Promise<MollieConnection | null> {
  const rows = await getSql()<ConnectionRow[]>`select * from mollie_connections where establishment_id = ${establishmentId}`;
  return rows[0] ? mapConnection(rows[0]) : null;
}

/** Jeton anti-CSRF du parcours d'autorisation : lié à l'utilisateur et à l'établissement, 15 minutes. */
export async function createConnectState(establishmentId: string, userId: string): Promise<string> {
  const raw = generateToken();
  const sql = getSql();
  await sql`delete from mollie_oauth_states where expires_at < now()`;
  await sql`insert into mollie_oauth_states (state_hash, establishment_id, user_id, expires_at)
    values (${hashToken(raw)}, ${establishmentId}, ${userId}, now() + interval '15 minutes')`;
  return raw;
}

export class ConnectError extends Error {}

/** Retour de Mollie : vérifie le jeton, échange le code, enregistre les jetons chiffrés. */
export async function completeConnection(params: { state: string; code: string; userId: string }): Promise<string> {
  const sql = getSql();
  const rows = await sql<Array<{ establishment_id: string; user_id: string }>>`
    delete from mollie_oauth_states where state_hash = ${hashToken(params.state)} and expires_at > now()
    returning establishment_id, user_id`;
  const state = rows[0];
  if (!state || state.user_id !== params.userId) throw new ConnectError("Lien de connexion expiré. Recommencez depuis votre espace.");
  const tokens = await connect.exchangeCode(params.code);
  if (!tokens.refreshToken) throw new ConnectError("Mollie n’a pas renvoyé de jeton de rafraîchissement.");
  const status = await connect.merchantStatus(tokens.accessToken);
  const profile = pickProfile(status.profiles);
  await sql`
    insert into mollie_connections (establishment_id, organization_id, organization_name, profile_id, profile_name, access_token_enc, access_expires_at,
      refresh_token_enc, scope, onboarding_status, can_receive_payments, dashboard_url, testmode, connected_by, connected_at, checked_at)
    values (${state.establishment_id}, ${status.organizationId}, ${status.organizationName}, ${profile?.id ?? null}, ${profile?.name ?? null},
      ${seal(tokens.accessToken)}, ${tokens.expiresAt}, ${seal(tokens.refreshToken)}, ${tokens.scope}, ${status.onboardingStatus},
      ${status.canReceivePayments}, ${status.dashboardUrl}, ${connect.isConnectTestMode()}, ${params.userId}, now(), now())
    on conflict (establishment_id) do update set
      organization_id = excluded.organization_id, organization_name = excluded.organization_name, profile_id = excluded.profile_id,
      profile_name = excluded.profile_name, access_token_enc = excluded.access_token_enc, access_expires_at = excluded.access_expires_at,
      refresh_token_enc = excluded.refresh_token_enc, scope = excluded.scope, onboarding_status = excluded.onboarding_status,
      can_receive_payments = excluded.can_receive_payments, dashboard_url = excluded.dashboard_url, testmode = excluded.testmode,
      connected_by = excluded.connected_by, connected_at = now(), checked_at = now(), updated_at = now()`;
  return state.establishment_id;
}

/** Profil de paiement retenu : le premier actif (ou vérifié), sinon le premier. */
function pickProfile(profiles: Array<{ id: string; name: string; status: string }>) {
  return profiles.find((p) => p.status === "verified") ?? profiles.find((p) => p.status !== "blocked") ?? profiles[0] ?? null;
}

/** Jeton d'accès valide pour l'établissement (renouvelé s'il expire dans moins de 2 minutes). */
async function accessToken(establishmentId: string): Promise<{ token: string; row: ConnectionRow }> {
  const sql = getSql();
  return sql.begin(async (tx) => {
    const rows = await tx<ConnectionRow[]>`select * from mollie_connections where establishment_id = ${establishmentId} for update`;
    const row = rows[0];
    if (!row) throw new ConnectError("Compte Mollie non relié.");
    if (row.access_expires_at.getTime() > Date.now() + 120_000) return { token: open(row.access_token_enc), row };
    const tokens = await connect.refreshTokens(open(row.refresh_token_enc));
    await tx`update mollie_connections set access_token_enc = ${seal(tokens.accessToken)}, access_expires_at = ${tokens.expiresAt},
      refresh_token_enc = ${tokens.refreshToken ? seal(tokens.refreshToken) : row.refresh_token_enc}, updated_at = now()
      where establishment_id = ${establishmentId}`;
    return { token: tokens.accessToken, row };
  });
}

/** Relit l'état d'activation du compte Mollie (bouton « Actualiser », retour de Mollie). */
export async function refreshMollieConnection(establishmentId: string): Promise<MollieConnection | null> {
  const { token, row } = await accessToken(establishmentId);
  const status = await connect.merchantStatus(token);
  const current = status.profiles.find((p) => p.id === row.profile_id) ?? pickProfile(status.profiles);
  const [updated] = await getSql()<ConnectionRow[]>`
    update mollie_connections set organization_name = coalesce(${status.organizationName}, organization_name),
      profile_id = ${current?.id ?? null}, profile_name = ${current?.name ?? null}, onboarding_status = ${status.onboardingStatus},
      can_receive_payments = ${status.canReceivePayments}, dashboard_url = ${status.dashboardUrl}, checked_at = now(), updated_at = now()
    where establishment_id = ${establishmentId} returning *`;
  return updated ? mapConnection(updated) : null;
}

/** Déconnexion : révoque l'accès chez Mollie, supprime les jetons et coupe l'encaissement. */
export async function disconnectMollie(establishmentId: string): Promise<void> {
  const sql = getSql();
  const rows = await sql<Array<{ refresh_token_enc: string }>>`delete from mollie_connections where establishment_id = ${establishmentId} returning refresh_token_enc`;
  await sql`update establishments set payment_mode = 'none' where id = ${establishmentId}`;
  if (rows[0]) {
    try {
      await connect.revokeRefreshToken(open(rows[0].refresh_token_enc));
    } catch {
      /* jeton illisible (clé changée) : la suppression locale suffit */
    }
  }
}

// ------------------------------------------------------------------ règle d'encaissement

export function paymentRuleOf(e: Pick<Establishment, "paymentMode" | "depositKind" | "depositValue">): PaymentRule {
  return { mode: e.paymentMode, depositKind: e.depositKind, depositValue: e.depositValue };
}

export async function updatePaymentRule(establishmentId: string, rule: PaymentRule): Promise<void> {
  await getSql()`update establishments set payment_mode = ${rule.mode}, deposit_kind = ${rule.depositKind}, deposit_value = ${rule.depositValue}
    where id = ${establishmentId}`;
}

/**
 * Paiement exigé pour réserver cette prestation en ligne, ou null : règle
 * désactivée, compte non relié ou pas encore activé chez Mollie, montant trop faible.
 */
export async function onlinePaymentFor(e: Establishment, priceCents: number): Promise<AmountDue | null> {
  const due = amountDue(paymentRuleOf(e), priceCents);
  if (!due || !connect.isMollieConnectConfigured()) return null;
  const connection = await getMollieConnection(e.id);
  if (!connection?.canReceivePayments || !connection.profileId) return null;
  return due;
}

/** Libellé de la règle pour la page publique, ou null si rien n'est demandé en ligne. */
export async function publicPaymentLabel(e: Establishment, formatCents: (cents: number) => string): Promise<string | null> {
  if (e.paymentMode === "none" || !connect.isMollieConnectConfigured()) return null;
  const connection = await getMollieConnection(e.id);
  if (!connection?.canReceivePayments || !connection.profileId) return null;
  return describePaymentRule(paymentRuleOf(e), formatCents);
}

// ------------------------------------------------------------------ paiements des clients

export interface BookingPayment {
  id: string;
  bookingId: string;
  molliePaymentId: string | null;
  kind: "deposit" | "full";
  amountCents: number;
  status: "open" | "paid" | "failed" | "canceled" | "expired" | "refunded" | "refund_failed";
  checkoutUrl: string | null;
  testmode: boolean;
  paidAt: Date | null;
  refundedAt: Date | null;
  createdAt: Date;
}

type PaymentRow = {
  id: string;
  booking_id: string;
  establishment_id: string;
  mollie_payment_id: string | null;
  kind: "deposit" | "full";
  amount_cents: number;
  status: BookingPayment["status"];
  checkout_url: string | null;
  manage_token: string | null;
  testmode: boolean;
  paid_at: Date | null;
  refunded_at: Date | null;
  created_at: Date;
};

const mapPayment = (r: PaymentRow): BookingPayment => ({
  id: r.id,
  bookingId: r.booking_id,
  molliePaymentId: r.mollie_payment_id,
  kind: r.kind,
  amountCents: r.amount_cents,
  status: r.status,
  checkoutUrl: r.checkout_url,
  testmode: r.testmode,
  paidAt: r.paid_at,
  refundedAt: r.refunded_at,
  createdAt: r.created_at,
});

/** Dernier paiement en ligne d'un rendez-vous. */
export async function getBookingPayment(bookingId: string): Promise<BookingPayment | null> {
  const rows = await getSql()<PaymentRow[]>`select * from booking_payments where booking_id = ${bookingId} order by created_at desc limit 1`;
  return rows[0] ? mapPayment(rows[0]) : null;
}

/** Heure limite de paiement d'un rendez-vous réservé en ligne. */
export const holdUntil = (now = new Date()) => new Date(now.getTime() + bookingPaymentRules.holdMinutes * 60_000);

/**
 * Crée le paiement Mollie du client sur le compte de l'établissement et
 * renvoie l'adresse de paiement. En cas d'échec, le rendez-vous est libéré.
 */
export async function startBookingPayment(params: {
  establishment: Establishment;
  bookingId: string;
  serviceName: string;
  startsAt: Date;
  manageToken: string;
  due: AmountDue;
}): Promise<string> {
  const sql = getSql();
  const { establishment: e, due } = params;
  const [row] = await sql<PaymentRow[]>`
    insert into booking_payments (booking_id, establishment_id, kind, amount_cents, manage_token, testmode)
    values (${params.bookingId}, ${e.id}, ${due.kind}, ${due.amountCents}, ${params.manageToken}, ${connect.isConnectTestMode()})
    returning *`;
  try {
    const { token, row: connection } = await accessToken(e.id);
    if (!connection.profile_id) throw new ConnectError("Aucun profil de paiement Mollie.");
    const label = due.kind === "full" ? "Paiement" : "Acompte";
    const payment = await connect.createConnectPayment(token, {
      profileId: connection.profile_id,
      testmode: row.testmode,
      amountCents: due.amountCents,
      description: `${label} ${params.serviceName} – ${e.name} – ${formatDateTimeFr(params.startsAt, e.timezone)}`.slice(0, 250),
      redirectUrl: absoluteUrl(`/rdv/${params.manageToken}?paiement=retour`),
      webhookUrl: absoluteUrl("/api/webhooks/mollie-connect"),
      metadata: { bookingPaymentId: row.id, bookingId: params.bookingId },
    });
    if (!payment.checkoutUrl) throw new ConnectError("Mollie n’a pas renvoyé de page de paiement.");
    await sql`update booking_payments set mollie_payment_id = ${payment.id}, checkout_url = ${payment.checkoutUrl}, updated_at = now() where id = ${row.id}`;
    return payment.checkoutUrl;
  } catch (error) {
    await sql.begin(async (tx) => {
      await tx`update booking_payments set status = 'failed', manage_token = null, updated_at = now() where id = ${row.id}`;
      await releaseBooking(tx, params.bookingId);
    });
    throw error;
  }
}

/** Libère le créneau d'un rendez-vous resté impayé. */
async function releaseBooking(tx: Db, bookingId: string): Promise<void> {
  // payment_hold_until est conservé : il distingue un créneau libéré faute de paiement d'une vraie annulation.
  await tx`update bookings set status = 'cancelled', cancelled_at = now(), cancelled_by = 'client',
      notes = coalesce(notes, 'Paiement en ligne non finalisé : créneau libéré automatiquement.')
    where id = ${bookingId} and status = 'pending' and payment_hold_until is not null`;
}

/** Créneaux retenus dont le délai de paiement est dépassé : libérés. */
export async function releaseExpiredHolds(now = new Date()): Promise<number> {
  const sql = getSql();
  const rows = await sql<Array<{ id: string }>>`
    update bookings set status = 'cancelled', cancelled_at = now(), cancelled_by = 'client',
      notes = coalesce(notes, 'Paiement en ligne non finalisé : créneau libéré automatiquement.')
    where status = 'pending' and payment_hold_until is not null and payment_hold_until < ${now}
    returning id`;
  return rows.length;
}

export type PaymentOutcome = "paid" | "released" | "open" | "unknown" | "late_refunded";

/**
 * Relit le paiement chez Mollie (webhook ou retour du client) et applique son
 * état : payé → rendez-vous confirmé et emails ; échec, abandon, expiration →
 * créneau libéré. Idempotent.
 */
export async function syncBookingPayment(molliePaymentId: string): Promise<PaymentOutcome> {
  const sql = getSql();
  const rows = await sql<PaymentRow[]>`select * from booking_payments where mollie_payment_id = ${molliePaymentId}`;
  const record = rows[0];
  if (!record) return "unknown";
  const { token } = await accessToken(record.establishment_id);
  const payment = await connect.getConnectPayment(token, molliePaymentId, record.testmode);
  const status = normalizePaymentStatus(payment.status);
  if (status === "open") return "open";
  if (status !== "paid") {
    await sql.begin(async (tx) => {
      await tx`update booking_payments set status = ${status}, manage_token = null, updated_at = now() where id = ${record.id} and status = 'open'`;
      await releaseBooking(tx, record.booking_id);
    });
    return "released";
  }
  const outcome = await sql.begin(async (tx) => {
    const claimed = await tx<Array<{ manage_token: string | null }>>`
      update booking_payments p set status = 'paid', paid_at = ${payment.paidAt ?? new Date()}, manage_token = null, updated_at = now()
      from (select id, manage_token from booking_payments where id = ${record.id} for update) old
      where p.id = old.id and p.status in ('open','failed','canceled','expired')
      returning old.manage_token`;
    if (claimed.length === 0) return "paid" as const;
    const [b] = await tx<Array<{ status: string; starts_at: Date; ends_at: Date; source: "online" | "manual"; client_email: string | null; payment_hold_until: Date | null }>>`
      select b.status, b.starts_at, b.ends_at, b.source, c.email as client_email, b.payment_hold_until
      from bookings b left join clients c on c.id = b.client_id where b.id = ${record.booking_id}`;
    if (!b) return "paid" as const;
    let confirmed = b.status === "pending" || b.status === "confirmed";
    if (b.status === "pending") {
      await tx`update bookings set status = 'confirmed', payment_hold_until = null where id = ${record.booking_id}`;
    } else if (b.status === "cancelled" && b.payment_hold_until) {
      // Paiement arrivé après la libération du créneau (pas après une annulation) : repris s'il est encore libre.
      confirmed = await tx
        .savepoint(async (sp) => {
          const rows = await sp`update bookings set status = 'confirmed', cancelled_at = null, cancelled_by = null, payment_hold_until = null, notes = null
            where id = ${record.booking_id} and status = 'cancelled' and payment_hold_until is not null returning id`;
          return rows.length > 0;
        })
        .catch((error: { code?: string }) => {
          if (error.code === "23P01") return false;
          throw error;
        });
    }
    if (!confirmed) return "late" as const;
    await scheduleBookingEmails(tx, {
      establishmentId: record.establishment_id,
      bookingId: record.booking_id,
      startsAt: b.starts_at,
      endsAt: b.ends_at,
      source: b.source,
      hasClientEmail: Boolean(b.client_email),
      manageToken: claimed[0].manage_token,
    });
    return "confirmed" as const;
  });
  if (outcome === "late") {
    await refundBookingPayment(record.establishment_id, record.booking_id, "Créneau déjà repris : remboursement automatique");
    return "late_refunded";
  }
  return "paid";
}

/**
 * Rembourse le paiement d'un rendez-vous annulé (par le salon, ou par le
 * client dans les délais). En cas d'échec (solde Mollie insuffisant…), le
 * paiement est marqué « à rembourser » et l'équipe est alertée.
 */
export async function refundBookingPayment(establishmentId: string, bookingId: string, reason = "Rendez-vous annulé"): Promise<"refunded" | "failed" | "none"> {
  const sql = getSql();
  const rows = await sql<PaymentRow[]>`
    update booking_payments set status = 'refund_failed', updated_at = now()
    where id = (select id from booking_payments where booking_id = ${bookingId} and establishment_id = ${establishmentId} and status = 'paid'
      order by created_at desc limit 1)
    returning *`;
  const record = rows[0];
  if (!record?.mollie_payment_id) return "none";
  try {
    const { token } = await accessToken(record.establishment_id);
    const refundId = await connect.refundConnectPayment(token, {
      paymentId: record.mollie_payment_id,
      amountCents: record.amount_cents,
      description: reason.slice(0, 140),
      testmode: record.testmode,
    });
    await sql`update booking_payments set status = 'refunded', refunded_at = now(), mollie_refund_id = ${refundId}, updated_at = now() where id = ${record.id}`;
    return "refunded";
  } catch (error) {
    await alertOps("Remboursement Mollie Connect impossible", { bookingId, error: error instanceof Error ? error.message : String(error) });
    return "failed";
  }
}

export interface PaymentListItem extends BookingPayment {
  serviceName: string;
  startsAt: Date;
  clientName: string;
}

/** Derniers paiements en ligne de l'établissement (page Paiements). */
export async function listRecentBookingPayments(establishmentId: string, limit = 20): Promise<PaymentListItem[]> {
  const rows = await getSql()<Array<PaymentRow & { service_name: string; starts_at: Date; first_name: string | null; last_name: string | null }>>`
    select p.*, b.service_name, b.starts_at, c.first_name, c.last_name
    from booking_payments p join bookings b on b.id = p.booking_id left join clients c on c.id = b.client_id
    where p.establishment_id = ${establishmentId} and p.status <> 'open'
    order by p.created_at desc limit ${limit}`;
  return rows.map((r) => ({
    ...mapPayment(r),
    serviceName: r.service_name,
    startsAt: r.starts_at,
    clientName: [r.first_name, r.last_name].filter(Boolean).join(" "),
  }));
}
