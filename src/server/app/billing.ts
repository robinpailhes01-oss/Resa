import "server-only";
import { offer } from "@/config/offer";
import { GRACE_DAYS, RENEWAL_NOTICE_DAYS, addOneMonth, formatEuros, nextPeriod, paymentReference, subscriptionAmounts } from "@/lib/billing";
import { getEmailSender } from "@/server/email";
import { getSql } from "@/server/db";
import * as mollie from "@/server/mollie";
import { createHostedCheckout, getCheckout, isSumUpConfigured } from "@/server/sumup";
import { notifyTelegram, telegramEvents } from "@/server/telegram";
import type { Establishment } from "@/server/auth/guards";
import { pastDueEmail, receiptEmail, renewalEmail } from "@/server/billing/emails";
import { invoiceFilename, invoiceNumber, renderInvoicePdf, type InvoiceData } from "@/lib/invoice";

export type BillingProvider = "mollie" | "sumup";

export interface Payment {
  id: string;
  provider: BillingProvider;
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
  invoiceNumber: string | null;
}

type Row = {
  id: string;
  establishment_id: string;
  provider: BillingProvider;
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
  invoice_number: string | null;
  invoice_issued_at: Date | null;
  payment_method: string | null;
};
const map = (r: Row): Payment => ({
  id: r.id,
  provider: r.provider,
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
  invoiceNumber: r.invoice_number ?? null,
});

const METHOD_LABELS: Record<string, string> = { creditcard: "carte bancaire", directdebit: "prélèvement SEPA", bancontact: "Bancontact", applepay: "Apple Pay", paypal: "PayPal", card: "carte bancaire" };

type InvoiceRow = Row & { e_name: string; e_address_line: string | null; e_postal_code: string | null; e_city: string | null; owner_email: string };

function invoiceData(row: InvoiceRow): InvoiceData {
  const vatRate = row.amount_cents - row.vat_cents > 0 ? Math.round((row.vat_cents / (row.amount_cents - row.vat_cents)) * 1000) / 10 : 0;
  return {
    number: row.invoice_number ?? "",
    issuedAt: row.invoice_issued_at ? new Date(row.invoice_issued_at) : new Date(row.paid_at ?? row.created_at),
    seller: { name: offer.legalEntity?.split(",")[0]?.trim() ?? offer.brandName, address: offer.legalEntity?.split(",").slice(1).join(",").trim() || "", siren: offer.legalId, vatNumber: offer.vatNumber, email: offer.supportEmail, brand: offer.brandName },
    buyer: { name: row.e_name, address: [row.e_address_line, [row.e_postal_code, row.e_city].filter(Boolean).join(" ")].filter(Boolean).join(", ") || null, email: row.owner_email },
    description: `Abonnement ${offer.brandName} · ${row.e_name}`,
    periodStart: new Date(row.period_start),
    periodEnd: new Date(row.period_end),
    exVatCents: row.amount_cents - row.vat_cents,
    vatCents: row.vat_cents,
    vatRate,
    totalCents: row.amount_cents,
    paidAt: new Date(row.paid_at ?? row.created_at),
    paymentMethod: row.payment_method ? (METHOD_LABELS[row.payment_method] ?? row.payment_method) : null,
    reference: row.checkout_reference,
  };
}

async function loadInvoiceRow(paymentId: string, establishmentId?: string): Promise<InvoiceRow | null> {
  const rows = await getSql()<InvoiceRow[]>`
    select p.*, e.name as e_name, e.address_line as e_address_line, e.postal_code as e_postal_code, e.city as e_city, u.email as owner_email
    from payments p join establishments e on e.id = p.establishment_id join users u on u.id = e.owner_user_id
    where p.id = ${paymentId} ${establishmentId ? getSql()`and p.establishment_id = ${establishmentId}` : getSql()``} limit 1`;
  return rows[0] ?? null;
}

/** Facture PDF d'un paiement encaissé de l'établissement (téléchargement depuis l'espace pro). */
export async function invoicePdf(establishmentId: string, paymentId: string): Promise<{ filename: string; content: Uint8Array } | null> {
  const row = await loadInvoiceRow(paymentId, establishmentId);
  if (!row || row.status !== "paid" || !row.invoice_number) return null;
  return { filename: invoiceFilename(row.invoice_number), content: renderInvoicePdf(invoiceData(row)) };
}

const siteUrl = () => offer.siteUrl.replace(/\/$/, "");
const PENDING_TTL_MS = 20 * 60 * 60 * 1000; // un lien de paiement est réutilisé 20 h, puis recréé
const dateKey = (d: Date) => d.toISOString().slice(0, 10);

/** Prestataire actif : Mollie (prélèvement automatique) dès qu'il est configuré, sinon SumUp (paiement mensuel manuel). */
export function billingProvider(): BillingProvider | null {
  if (mollie.isMollieConfigured()) return "mollie";
  if (isSumUpConfigured()) return "sumup";
  return null;
}

export function amounts() {
  return subscriptionAmounts(offer.monthlyPriceExVat, offer.vatRate);
}

export async function listPayments(establishmentId: string): Promise<Payment[]> {
  const rows = await getSql()<Row[]>`select * from payments where establishment_id = ${establishmentId} order by created_at desc limit 24`;
  return rows.map(map);
}

type EstablishmentBilling = {
  id: string;
  name: string;
  paid_until: Date | null;
  subscription_status: string;
  cancel_at_period_end: boolean;
  mollie_customer_id: string | null;
  mollie_mandate_id: string | null;
  mollie_subscription_id: string | null;
  owner_email: string;
  owner_name: string;
};

async function loadEstablishment(id: string): Promise<EstablishmentBilling | null> {
  const [row] = await getSql()<EstablishmentBilling[]>`
    select e.id, e.name, e.paid_until, e.subscription_status, e.cancel_at_period_end, e.mollie_customer_id, e.mollie_mandate_id, e.mollie_subscription_id,
      u.email as owner_email, u.full_name as owner_name
    from establishments e join users u on u.id = e.owner_user_id where e.id = ${id}`;
  return row ?? null;
}

/**
 * Prépare le paiement du mois suivant : réutilise un lien encore frais pour
 * la même période, sinon crée un paiement chez le prestataire.
 * Mollie : premier paiement « first » qui enregistre le moyen de paiement
 * pour les prélèvements automatiques suivants.
 */
export async function preparePayment(establishment: Pick<Establishment, "id" | "name" | "paidUntil">, now = new Date()): Promise<Payment> {
  const provider = billingProvider();
  if (!provider) throw new Error("Le paiement en ligne n’est pas encore activé.");
  const sql = getSql();
  const period = nextPeriod(establishment.paidUntil, now);
  const [existing] = await sql<Row[]>`
    select * from payments where establishment_id = ${establishment.id} and status = 'pending' and hosted_url is not null and provider = ${provider}
      and period_start >= ${new Date(period.start.getTime() - 60_000)} and created_at > ${new Date(now.getTime() - PENDING_TTL_MS)}
    order by created_at desc limit 1`;
  if (existing) return map(existing);
  const a = amounts();
  const reference = paymentReference(establishment.id, period.start);
  const [row] = await sql<Row[]>`
    insert into payments (establishment_id, provider, checkout_reference, amount_cents, vat_cents, period_start, period_end)
    values (${establishment.id}, ${provider}, ${reference}, ${a.totalCents}, ${a.vatCents}, ${period.start}, ${period.end}) returning *`;
  const description = `${offer.brandName} · abonnement ${establishment.name}`;
  try {
    if (provider === "mollie") {
      const est = await loadEstablishment(establishment.id);
      if (!est) throw new Error("Établissement introuvable.");
      let customerId = est.mollie_customer_id;
      if (!customerId) {
        customerId = await mollie.createCustomer({ name: est.owner_name, email: est.owner_email, metadata: { establishmentId: est.id } });
        await sql`update establishments set mollie_customer_id = ${customerId} where id = ${est.id}`;
      }
      const payment = await mollie.createFirstPayment({
        customerId,
        amountCents: a.totalCents,
        description,
        redirectUrl: `${siteUrl()}/app/abonnement?checkout=${encodeURIComponent(reference)}`,
        webhookUrl: `${siteUrl()}/api/webhooks/mollie`,
        metadata: { paymentId: row.id, establishmentId: est.id, reference },
      });
      const [updated] = await sql<Row[]>`update payments set checkout_id = ${payment.id}, hosted_url = ${payment.checkoutUrl} where id = ${row.id} returning *`;
      return map(updated);
    }
    const checkout = await createHostedCheckout({
      reference,
      amountCents: a.totalCents,
      description,
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

/** Applique un paiement encaissé : période payée, statut actif, reçu, notification. */
async function applyPaid(row: Row, now: Date, extra: { transactionCode: string | null; mandateId?: string | null; method?: string | null }): Promise<Row> {
  const sql = getSql();
  // Numéro de facture continu, attribué à l'encaissement.
  const [paid] = await sql<Row[]>`
    update payments set status = 'paid', paid_at = ${now}, payment_method = coalesce(${extra.method ?? null}, payment_method),
      invoice_issued_at = ${now}, invoice_number = coalesce(invoice_number, ${invoiceNumber(0, now).replace(/\d{6}$/, "")} || lpad(nextval('invoice_number_seq')::text, 6, '0'))
    where id = ${row.id} and status <> 'paid' returning *`;
  if (!paid) return row;
  const [est] = await sql<Array<{ name: string; owner_email: string; paid_until: Date | null }>>`
    update establishments e set subscription_status = 'active',
      paid_until = greatest(coalesce(e.paid_until, ${paid.period_start}), ${paid.period_end}),
      mollie_mandate_id = coalesce(${extra.mandateId ?? null}, e.mollie_mandate_id)
    from users u where e.id = ${row.establishment_id} and u.id = e.owner_user_id
    returning e.name, u.email as owner_email, e.paid_until`;
  const a = amounts();
  if (est) {
    const invoiceRow = await loadInvoiceRow(paid.id);
    const attachment = invoiceRow && paid.invoice_number ? { filename: invoiceFilename(paid.invoice_number), content: renderInvoicePdf(invoiceData(invoiceRow)) } : undefined;
    await getEmailSender()
      .send(receiptEmail(est.owner_email, { establishment: est.name, amounts: a, periodStart: new Date(paid.period_start), periodEnd: new Date(paid.period_end), reference: paid.checkout_reference, transactionCode: extra.transactionCode, invoiceNumber: paid.invoice_number, attachment }))
      .catch((error) => console.error("[billing] facture non envoyée", error instanceof Error ? error.message : error));
    // Attendu explicitement : en serverless, un envoi non attendu est interrompu à la fin de la requête.
    await notifyTelegram(telegramEvents.payment({ establishment: est.name, amountLabel: formatEuros(a.totalCents) }));
  }
  return paid;
}

/** Après un premier paiement Mollie : crée l'abonnement qui prélèvera automatiquement à partir de la fin de la période payée. */
async function ensureMollieSubscription(establishmentId: string): Promise<void> {
  const est = await loadEstablishment(establishmentId);
  if (!est || !est.mollie_customer_id || est.cancel_at_period_end || !est.paid_until) return;
  if (est.mollie_subscription_id) {
    const current = await mollie.getSubscription(est.mollie_customer_id, est.mollie_subscription_id).catch(() => null);
    if (current && (current.status === "active" || current.status === "pending")) return;
  }
  if (!(await mollie.hasValidMandate(est.mollie_customer_id, est.mollie_mandate_id))) {
    console.error("[billing] aucun mandat valide, abonnement Mollie non créé", establishmentId);
    return;
  }
  const sub = await mollie.createSubscription({
    customerId: est.mollie_customer_id,
    amountCents: amounts().totalCents,
    description: `${offer.brandName} · abonnement ${est.name}`,
    startDate: dateKey(new Date(est.paid_until)),
    webhookUrl: `${siteUrl()}/api/webhooks/mollie`,
    metadata: { establishmentId: est.id },
  });
  await getSql()`update establishments set mollie_subscription_id = ${sub.id} where id = ${est.id}`;
}

/** Vérifie auprès du prestataire l'état d'un paiement (par référence ou identifiant) et applique le résultat. */
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
  await sql`update payments set last_checked_at = ${now} where id = ${row.id}`;

  if (row.provider === "mollie") {
    const payment = await mollie.getPayment(row.checkout_id);
    if (payment.status === "paid") {
      const paid = await applyPaid(row, now, { transactionCode: payment.id, mandateId: payment.mandateId, method: payment.method });
      await ensureMollieSubscription(row.establishment_id).catch((error) => console.error("[billing] abonnement Mollie", error instanceof Error ? error.message : error));
      return map(paid);
    }
    if (payment.status === "failed" || payment.status === "canceled" || payment.status === "expired") {
      const [failed] = await sql<Row[]>`update payments set status = ${payment.status === "expired" ? "expired" : "failed"} where id = ${row.id} returning *`;
      return map(failed);
    }
    return map(row);
  }

  const state = await getCheckout(row.checkout_id);
  if (state.status === "PAID") return map(await applyPaid(row, now, { transactionCode: state.transactionCode, method: "card" }));
  if (state.status === "FAILED" || state.status === "EXPIRED") {
    const [failed] = await sql<Row[]>`update payments set status = ${state.status === "FAILED" ? "failed" : "expired"} where id = ${row.id} returning *`;
    return map(failed);
  }
  return map(row);
}

/**
 * Notification Mollie : paiement connu (premier paiement) ou prélèvement
 * automatique d'un abonnement (nouvelle ligne de paiement).
 */
export async function handleMolliePayment(paymentId: string, now = new Date()): Promise<string> {
  const sql = getSql();
  const [known] = await sql<Row[]>`select * from payments where checkout_id = ${paymentId} limit 1`;
  if (known) return (await confirmPayment({ checkoutId: paymentId }, now))?.status ?? "unknown";
  const payment = await mollie.getPayment(paymentId);
  const establishmentId = payment.metadata?.establishmentId ?? null;
  const [est] = payment.subscriptionId
    ? await sql<EstablishmentBilling[]>`select e.*, u.email as owner_email, u.full_name as owner_name from establishments e join users u on u.id = e.owner_user_id where e.mollie_subscription_id = ${payment.subscriptionId} limit 1`
    : establishmentId
      ? await sql<EstablishmentBilling[]>`select e.*, u.email as owner_email, u.full_name as owner_name from establishments e join users u on u.id = e.owner_user_id where e.id = ${establishmentId} limit 1`
      : [];
  if (!est) return "ignored";
  const period = nextPeriod(est.paid_until ? new Date(est.paid_until) : null, now);
  const a = amounts();
  const [row] = await sql<Row[]>`
    insert into payments (establishment_id, provider, checkout_id, checkout_reference, amount_cents, vat_cents, period_start, period_end, status)
    values (${est.id}, 'mollie', ${payment.id}, ${paymentReference(est.id, period.start)}, ${payment.amountCents || a.totalCents}, ${a.vatCents}, ${period.start}, ${period.end}, 'pending')
    on conflict (checkout_id) do update set last_checked_at = ${now} returning *`;
  if (payment.status === "paid") {
    await applyPaid(row, now, { transactionCode: payment.id, mandateId: payment.mandateId, method: payment.method });
    return "paid";
  }
  if (payment.status === "failed" || payment.status === "canceled" || payment.status === "expired") {
    await sql`update payments set status = ${payment.status === "expired" ? "expired" : "failed"} where id = ${row.id}`;
    return payment.status;
  }
  return payment.status;
}

/**
 * Tâche quotidienne : vérification des paiements en attente, résiliations en
 * fin de période, relances (SumUp) et suspension après le délai de tolérance.
 */
export async function runBillingCycle(now = new Date()): Promise<{ reminders: number; pastDue: number; cancelled: number; confirmed: number }> {
  const sql = getSql();
  const summary = { reminders: 0, pastDue: 0, cancelled: 0, confirmed: 0 };
  const provider = billingProvider();

  const pending = await sql<Array<{ checkout_reference: string }>>`select checkout_reference from payments where status = 'pending' and checkout_id is not null and created_at > ${new Date(now.getTime() - 3 * 24 * 3600_000)}`;
  for (const p of pending) {
    const result = await confirmPayment({ reference: p.checkout_reference }, now).catch(() => null);
    if (result?.status === "paid") summary.confirmed += 1;
  }

  const cancelled = await sql`update establishments set subscription_status = 'cancelled' where subscription_status in ('active','past_due') and cancel_at_period_end and paid_until is not null and paid_until <= ${now} returning id`;
  summary.cancelled = cancelled.length;

  if (!provider) return summary;

  if (provider === "sumup") {
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
  }

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

/** Résiliation en fin de période : arrête le prélèvement automatique Mollie ; reprise : le recrée si le mandat est valide. */
export async function setCancelAtPeriodEnd(establishmentId: string, value: boolean): Promise<void> {
  const sql = getSql();
  await sql`update establishments set cancel_at_period_end = ${value} where id = ${establishmentId}`;
  const est = await loadEstablishment(establishmentId);
  if (!est?.mollie_customer_id) return;
  if (value && est.mollie_subscription_id) {
    await mollie.cancelSubscription(est.mollie_customer_id, est.mollie_subscription_id);
    await sql`update establishments set mollie_subscription_id = null where id = ${establishmentId}`;
  } else if (!value) {
    await ensureMollieSubscription(establishmentId);
  }
}

/** Le prochain prélèvement automatique est-il programmé (abonnement Mollie actif) ? */
export async function hasAutomaticRenewal(establishmentId: string): Promise<boolean> {
  const est = await loadEstablishment(establishmentId);
  return Boolean(est?.mollie_subscription_id && !est.cancel_at_period_end);
}

/** Diagnostic : derniers paiements (sans données personnelles). */
export async function recentPayments(limit = 10): Promise<Array<{ establishment: string; provider: string; status: string; amountCents: number; createdAt: Date; paidAt: Date | null; reference: string; subscriptionStatus: string; paidUntil: Date | null; automatic: boolean }>> {
  const rows = await getSql()<Array<{ establishment: string; provider: string; status: string; amount_cents: number; created_at: Date; paid_at: Date | null; checkout_reference: string; subscription_status: string; paid_until: Date | null; mollie_subscription_id: string | null }>>`
    select e.name as establishment, p.provider, p.status, p.amount_cents, p.created_at, p.paid_at, p.checkout_reference, e.subscription_status, e.paid_until, e.mollie_subscription_id
    from payments p join establishments e on e.id = p.establishment_id order by p.created_at desc limit ${limit}`;
  return rows.map((r) => ({ establishment: r.establishment, provider: r.provider, status: r.status, amountCents: r.amount_cents, createdAt: r.created_at, paidAt: r.paid_at, reference: r.checkout_reference, subscriptionStatus: r.subscription_status, paidUntil: r.paid_until, automatic: Boolean(r.mollie_subscription_id) }));
}

export { addOneMonth };
