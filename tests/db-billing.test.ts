/**
 * Cycle d'abonnement Mollie contre le PostgreSQL de test : premier paiement,
 * activation, création de l'abonnement, prélèvement automatique suivant,
 * résiliation. L'API Mollie est simulée. Ignoré sans TEST_DATABASE_URL.
 */
import postgres from "postgres";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

const url = process.env.TEST_DATABASE_URL;
if (url) {
  process.env.DATABASE_URL = url;
  process.env.MOLLIE_API_KEY = "test_abcdefghijklmnopqrstuvwxyz";
  process.env.EMAIL_PROVIDER = "console";
}

const mollieState = { payments: new Map<string, Record<string, unknown>>(), subscriptions: [] as Array<Record<string, unknown>>, cancelled: [] as string[], mandateValid: true };

vi.mock("@/server/mollie", () => ({
  isMollieConfigured: () => true,
  isMollieTestMode: () => true,
  createCustomer: vi.fn(async () => "cst_test"),
  createFirstPayment: vi.fn(async (input: { metadata: Record<string, string>; amountCents: number }) => {
    const id = `tr_first_${mollieState.payments.size + 1}`;
    mollieState.payments.set(id, { id, status: "open", amountCents: input.amountCents, metadata: input.metadata, mandateId: null, subscriptionId: null, customerId: "cst_test" });
    return { id, status: "open", amountCents: input.amountCents, checkoutUrl: `https://www.mollie.com/checkout/${id}`, mandateId: null, subscriptionId: null, customerId: "cst_test", sequenceType: "first", method: null, metadata: input.metadata, paidAt: null };
  }),
  getPayment: vi.fn(async (id: string) => {
    const p = mollieState.payments.get(id);
    if (!p) throw new Error(`paiement inconnu ${id}`);
    return { checkoutUrl: null, sequenceType: "first", method: "creditcard", paidAt: null, ...p };
  }),
  hasValidMandate: vi.fn(async () => mollieState.mandateValid),
  createSubscription: vi.fn(async (input: Record<string, unknown>) => {
    const sub = { id: `sub_${mollieState.subscriptions.length + 1}`, status: "active", nextPaymentDate: input.startDate, ...input };
    mollieState.subscriptions.push(sub);
    return { id: sub.id, status: "active", nextPaymentDate: input.startDate as string };
  }),
  getSubscription: vi.fn(async (_c: string, id: string) => (mollieState.cancelled.includes(id) ? null : { id, status: "active", nextPaymentDate: null })),
  cancelSubscription: vi.fn(async (_c: string, id: string) => {
    mollieState.cancelled.push(id);
  }),
  MollieError: class extends Error {},
}));

describe.skipIf(!url)("abonnement Mollie", () => {
  const sql = postgres(url ?? "postgres://invalid", { max: 1, prepare: false, onnotice: () => {} });
  let userId = "";
  let establishmentId = "";
  const now = new Date("2026-10-01T10:00:00Z");

  beforeAll(async () => {
    const [u] = await sql`insert into users (email, password_hash, full_name) values (${`billing+${Date.now()}@example.com`}, 'x', 'Camille Test') returning id`;
    userId = u.id;
    const [e] = await sql`insert into establishments (owner_user_id, name, slug, subscription_status, trial_ends_at) values (${userId}, 'Institut Mollie', ${`mollie-${Date.now()}`}, 'trial', ${new Date("2026-09-30T00:00:00Z")}) returning id`;
    establishmentId = e.id;
  });

  afterAll(async () => {
    if (establishmentId) await sql`delete from establishments where id = ${establishmentId}`;
    if (userId) await sql`delete from users where id = ${userId}`;
    await sql.end();
  });

  it("premier paiement → actif un mois, abonnement créé à la fin de la période", async () => {
    const billing = await import("@/server/app/billing");
    const payment = await billing.preparePayment({ id: establishmentId, name: "Institut Mollie", paidUntil: null }, now);
    expect(payment.provider).toBe("mollie");
    expect(payment.hostedUrl).toContain("mollie.com/checkout");
    const [est0] = await sql`select mollie_customer_id from establishments where id = ${establishmentId}`;
    expect(est0.mollie_customer_id).toBe("cst_test");

    // Retour sans paiement : toujours en attente.
    expect((await billing.confirmPayment({ reference: payment.reference }, now))?.status).toBe("pending");

    // Mollie confirme le paiement et le mandat.
    const raw = mollieState.payments.get(payment.checkoutId as string)!;
    raw.status = "paid";
    raw.mandateId = "mdt_1";
    const confirmed = await billing.confirmPayment({ reference: payment.reference }, now);
    expect(confirmed?.status).toBe("paid");
    const [est] = await sql`select subscription_status, paid_until, mollie_mandate_id, mollie_subscription_id from establishments where id = ${establishmentId}`;
    expect(est.subscription_status).toBe("active");
    expect(new Date(est.paid_until).toISOString()).toBe("2026-11-01T10:00:00.000Z");
    expect(est.mollie_mandate_id).toBe("mdt_1");
    expect(est.mollie_subscription_id).toBe("sub_1");
    expect(mollieState.subscriptions[0]).toMatchObject({ startDate: "2026-11-01", customerId: "cst_test" });
    // Reconfirmer ne crée pas de doublon.
    await billing.confirmPayment({ reference: payment.reference }, now);
    expect(mollieState.subscriptions).toHaveLength(1);
  });

  it("prélèvement automatique reçu par webhook → période prolongée d'un mois", async () => {
    const billing = await import("@/server/app/billing");
    mollieState.payments.set("tr_rec_1", { id: "tr_rec_1", status: "paid", amountCents: 4680, metadata: { establishmentId }, mandateId: "mdt_1", subscriptionId: "sub_1", customerId: "cst_test" });
    const later = new Date("2026-11-01T06:00:00Z");
    expect(await billing.handleMolliePayment("tr_rec_1", later)).toBe("paid");
    const [est] = await sql`select paid_until from establishments where id = ${establishmentId}`;
    expect(new Date(est.paid_until).toISOString()).toBe("2026-12-01T10:00:00.000Z");
    const rows = await sql`select status, period_start, period_end from payments where establishment_id = ${establishmentId} order by created_at`;
    expect(rows).toHaveLength(2);
    expect(rows.every((r) => r.status === "paid")).toBe(true);
    const invoices = await sql`select invoice_number, payment_method from payments where establishment_id = ${establishmentId} order by created_at`;
    expect(invoices.map((i) => i.invoice_number)).toEqual(expect.arrayContaining([expect.stringMatching(/^RESO-\d{4}-\d{6}$/)]));
    expect(new Set(invoices.map((i) => i.invoice_number)).size).toBe(2);
    expect(invoices[0].payment_method).toBe("creditcard");
    const pdf = await billing.invoicePdf(establishmentId, (await sql`select id from payments where establishment_id = ${establishmentId} order by created_at limit 1`)[0].id);
    expect(pdf?.filename).toMatch(/^facture-reso-/);
    expect(Buffer.from(pdf!.content).toString("latin1").startsWith("%PDF")).toBe(true);
    // Rejouer le même webhook n'ajoute rien.
    await billing.handleMolliePayment("tr_rec_1", later);
    expect(await sql`select count(*)::int as n from payments where establishment_id = ${establishmentId}`).toMatchObject([{ n: 2 }]);
  });

  it("prélèvement échoué → paiement en échec, période inchangée ; résiliation arrête l'abonnement Mollie", async () => {
    const billing = await import("@/server/app/billing");
    mollieState.payments.set("tr_rec_2", { id: "tr_rec_2", status: "failed", amountCents: 4680, metadata: {}, mandateId: "mdt_1", subscriptionId: "sub_1", customerId: "cst_test" });
    expect(await billing.handleMolliePayment("tr_rec_2", new Date("2026-12-01T06:00:00Z"))).toBe("failed");
    const [est] = await sql`select paid_until from establishments where id = ${establishmentId}`;
    expect(new Date(est.paid_until).toISOString()).toBe("2026-12-01T10:00:00.000Z");
    await billing.setCancelAtPeriodEnd(establishmentId, true);
    expect(mollieState.cancelled).toContain("sub_1");
    const [after] = await sql`select cancel_at_period_end, mollie_subscription_id from establishments where id = ${establishmentId}`;
    expect(after.cancel_at_period_end).toBe(true);
    expect(after.mollie_subscription_id).toBeNull();
    // Reprise : nouvel abonnement à partir de la période payée.
    await billing.setCancelAtPeriodEnd(establishmentId, false);
    expect(mollieState.subscriptions).toHaveLength(2);
    expect(mollieState.subscriptions[1]).toMatchObject({ startDate: "2026-12-01" });
  });
});
