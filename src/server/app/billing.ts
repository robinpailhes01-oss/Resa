import "server-only";
import { offer } from "@/config/offer";
import { GRACE_DAYS, RENEWAL_NOTICE_DAYS, formatEuros, nextPeriod, paymentReference, subscriptionAmounts } from "@/lib/billing";
import { getEmailSender } from "@/server/email";
import { getSql } from "@/server/db";
import { createHostedCheckout, getCheckout, isSumUpConfigured } from "@/server/sumup";
import { notifyTelegram, telegramEvents } from "@/server/telegram";
import type { Establishment } from "@/server/auth/guards";
import { pastDueEmail, receiptEmail, renewalEmail } from "@/server/billing/emails";

export interface Payment {
  id: string;
  checkoutId: string | null;
  reference: string;
  amountCents: number;
  vatCents: number;
  status: "pending" | "paid" | "failed" | "expired";
  periodStart: Date;
  periodEnd: Date;
  hostedUrl: string | null;
  createdAt: Date;
  paidAt: Date | null;
}

type Row = {
  id: string;
  establishment_id: string;
  checkout_id: string | null;
  checkout_reference: string;
  amount_cents: number;
  vat_cents: number;
  status: Payment["status"];
  period_start: Date;
  period_end: Date;
  hosted_url: string | null;
  created_at: Date;
  paid_at: Date | null;
};
const map = (r: Row): Payment => ({
  id: r.id,
  checkoutId: r.checkout_id,
  reference: r.checkout_reference,
  amountCents: r.amount_cents,
  vatCents: r.vat_cents,
  status: r.status,
  periodStart: new Date(r.period_start),
  periodEnd: new Date(r.period_end),
  hostedUrl: r.hosted_url,
  createdAt: new Date(r.created_at),
  paidAt: r.paid_at ? new Date(r.paid_at) : null,
});

const siteUrl = () => offer.siteUrl.replace(/\/$/, "");
const PENDING_TTL_MS = 20 * 60 * 60 * 1000; // un lien de paiement est réutilisé 20 h, puis recréé

export function amounts() {
  return subscriptionAmounts(offer.monthlyPriceExVat, offer.vatRate);
}

export async function listPayments(establishmentId: string): Promise<Payment[]> {
  const rows = await getSql()<Row[]>`select * from payments where establishment_id = ${establishmentId} order by created_at desc limit 24`;
  return rows.map(map);
}

/**
 * Prépare le paiement du mois suivant : réutilise un lien encore frais pour
 * la même période, sinon crée un paiement hébergé SumUp.
 */
export async function preparePayment(establishment: Pick<Establishment, "id" | "name" | "paidUntil">, now = new Date()): Promise<Payment> {
  if (!isSumUpConfigured()) throw new Error("Le paiement en ligne n’est pas encore activé.");
  const sql = getSql();
  const period = nextPeriod(establishment.paidUntil, now);
  const [existing] = await sql<Row[]>`
    select * from payments where establishment_id = ${establishment.id} and status = 'pending' and hosted_url is not null
      and period_start >= ${new Date(period.start.getTime() - 60_000)} and created_at > ${new Date(now.getTime() - PENDING_TTL_MS)}
    order by created_at desc limit 1`;
  if (existing) return map(existing);
  const a = amounts();
  const reference = paymentReference(establishment.id, period.start);
  const [row] = await sql<Row[]>`
    insert into payments (establishment_id, checkout_reference, amount_cents, vat_cents, period_start, period_end)
    values (${establishment.id}, ${reference}, ${a.totalCents}, ${a.vatCents}, ${period.start}, ${period.end}) returning *`;
  try {
    const checkout = await createHostedCheckout({
      reference,
      amountCents: a.totalCents,
      description: `${offer.brandName} · abonnement ${establishment.name}`,
      redirectUrl: `${siteUrl()}/app/abonnement?checkout=${encodeURIComponent(reference)}`,
      returnUrl: `${siteUrl()}/api/webhooks/sumup`,
    });
    const [updated] = await sql<Row[]>`update payments set checkout_id = ${checkout.id}, hosted_url = ${checkout.hostedUrl} where id = ${row.id} returning *`;
    return map(updated);
  } catch (error) {
    await sql`update payments set status = 'failed' where id = ${row.id}`;
    throw error;
  }
}

/** Vérifie auprès de SumUp l'état d'un paiement (par référence ou identifiant) et applique le résultat. */
export async function confirmPayment(lookup: { reference?: string; checkoutId?: string }, now = new Date()): Promise<Payment | null> {
  const sql = getSql();
  const [row] = lookup.reference
    ? await sql<Row[]>`select * from payments where checkout_reference = ${lookup.reference} limit 1`
    : lookup.checkoutId
      ? await sql<Row[]>`select * from payments where checkout_id = ${lookup.checkoutId} limit 1`
      : [];
  if (!row) return null;
  if (row.status === "paid") return map(row);
  if (!row.checkout_id) return map(row);
  const state = await getCheckout(row.checkout_id);
  await sql`update payments set last_checked_at = ${now} where id = ${row.id}`;
  if (state.status === "PAID") {
    const [paid] = await sql<Row[]>`update payments set status = 'paid', paid_at = ${now} where id = ${row.id} and status <> 'paid' returning *`;
    if (!paid) return map(row);
    const [est] = await sql<Array<{ name: string; owner_email: string; paid_until: Date | null }>>`
      update establishments e set subscription_status = 'active', paid_until = greatest(coalesce(e.paid_until, ${paid.period_start}), ${paid.period_end})
      from users u where e.id = ${row.establishment_id} and u.id = e.owner_user_id
      returning e.name, u.email as owner_email, e.paid_until`;
    const a = amounts();
    if (est) {
      await getEmailSender()
        .send(receiptEmail(est.owner_email, { establishment: est.name, amounts: a, periodStart: new Date(paid.period_start), periodEnd: new Date(paid.period_end), reference: paid.checkout_reference, transactionCode: state.transactionCode }))
        .catch((error) => console.error("[billing] reçu non envoyé", error instanceof Error ? error.message : error));
      void notifyTelegram(telegramEvents.payment({ establishment: est.name, amountLabel: formatEuros(a.totalCents) }));
    }
    return map(paid);
  }
  if (state.status === "FAILED" || state.status === "EXPIRED") {
    const [failed] = await sql<Row[]>`update payments set status = ${state.status === "FAILED" ? "failed" : "expired"} where id = ${row.id} returning *`;
    return map(failed);
  }
  return map(row);
}

/**
 * Tâche quotidienne : relances avant échéance, suspension après le délai de
 * tolérance, résiliations en fin de période, vérification des paiements en attente.
 */
export async function runBillingCycle(now = new Date()): Promise<{ reminders: number; pastDue: number; cancelled: number; confirmed: number }> {
  const sql = getSql();
  const summary = { reminders: 0, pastDue: 0, cancelled: 0, confirmed: 0 };

  // 1. Paiements en attente : SumUp a-t-il encaissé sans que le client revienne sur le site ?
  const pending = await sql<Array<{ checkout_reference: string }>>`select checkout_reference from payments where status = 'pending' and checkout_id is not null and created_at > ${new Date(now.getTime() - 3 * 24 * 3600_000)}`;
  for (const p of pending) {
    const result = await confirmPayment({ reference: p.checkout_reference }, now).catch(() => null);
    if (result?.status === "paid") summary.confirmed += 1;
  }

  // 2. Résiliations effectives en fin de période.
  const cancelled = await sql`update establishments set subscription_status = 'cancelled' where subscription_status in ('active','past_due') and cancel_at_period_end and paid_until is not null and paid_until <= ${now} returning id`;
  summary.cancelled = cancelled.length;

  if (!isSumUpConfigured()) return summary;

  // 3. Relance avant échéance (une fois par période : pas de paiement en attente pour la période suivante).
  const due = await sql<Array<{ id: string; name: string; paid_until: Date; owner_email: string }>>`
    select e.id, e.name, e.paid_until, u.email as owner_email from establishments e join users u on u.id = e.owner_user_id
    where e.subscription_status = 'active' and not e.cancel_at_period_end and e.paid_until is not null
      and e.paid_until <= ${new Date(now.getTime() + RENEWAL_NOTICE_DAYS * 24 * 3600_000)}
      and not exists (select 1 from payments p where p.establishment_id = e.id and p.status in ('pending','paid') and p.period_start >= e.paid_until - interval '1 minute')`;
  for (const e of due) {
    try {
      const payment = await preparePayment({ id: e.id, name: e.name, paidUntil: new Date(e.paid_until) }, now);
      if (payment.hostedUrl) {
        await getEmailSender().send(renewalEmail(e.owner_email, { establishment: e.name, amounts: amounts(), periodStart: payment.periodStart, periodEnd: payment.periodEnd, payUrl: payment.hostedUrl }));
        summary.reminders += 1;
      }
    } catch (error) {
      console.error("[billing] relance", e.id, error instanceof Error ? error.message : error);
    }
  }

  // 4. Suspension après le délai de tolérance.
  const late = await sql<Array<{ id: string; name: string; owner_email: string }>>`
    update establishments e set subscription_status = 'past_due' from users u
    where u.id = e.owner_user_id and e.subscription_status = 'active' and e.paid_until is not null and e.paid_until <= ${new Date(now.getTime() - GRACE_DAYS * 24 * 3600_000)}
    returning e.id, e.name, u.email as owner_email`;
  for (const e of late) {
    summary.pastDue += 1;
    await getEmailSender()
      .send(pastDueEmail(e.owner_email, { establishment: e.name, payUrl: `${siteUrl()}/app/abonnement` }))
      .catch((error) => console.error("[billing] email suspension", error instanceof Error ? error.message : error));
  }
  return summary;
}

export async function setCancelAtPeriodEnd(establishmentId: string, value: boolean): Promise<void> {
  await getSql()`update establishments set cancel_at_period_end = ${value} where id = ${establishmentId}`;
}
