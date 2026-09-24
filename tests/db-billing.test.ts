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
  listSubscriptions: vi.fn(async () => mollieState.subscriptions.filter((s) => !mollieState.cancelled.includes(s.id as string)).map((s) => ({ id: s.id as string, status: "active", nextPaymentDate: null, description: (s.description as string) ?? null }))),
  cancelSubscription: vi.fn(async (_c: string, id: string) => {
    mollieState.cancelled.push(id);
  }),
  MollieError: class extends Error {
    constructor(
      message: string,
      public readonly status?: number,
    ) {
      super(message);
    }
  },
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

    // Nouveau clic 10 minutes plus tard : le lien encore ouvert est réutilisé, pas de doublon.
    const later = new Date(now.getTime() + 10 * 60_000);
    const again = await billing.preparePayment({ id: establishmentId, name: "Institut Mollie", paidUntil: null }, later);
    expect(again.id).toBe(payment.id);
    // Lien expiré chez Mollie : un nouveau lien est créé, l'ancien sort de l'historique.
    mollieState.payments.get(payment.checkoutId as string)!.status = "expired";
    const replaced = await billing.preparePayment({ id: establishmentId, name: "Institut Mollie", paidUntil: null }, later);
    expect(replaced.id).not.toBe(payment.id);
    expect((await billing.listPayments(establishmentId)).map((p) => p.status).sort()).toEqual(["expired", "pending"]);
    // Le premier lien redevient ouvert puis est payé : le lien de remplacement est retiré.
    mollieState.payments.get(payment.checkoutId as string)!.status = "open";

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
    expect((await billing.listPayments(establishmentId)).map((p) => p.status).sort()).toEqual(["expired", "paid"]);
    // Reconfirmer ne crée pas de doublon.
    await billing.confirmPayment({ reference: payment.reference }, now);
    expect(mollieState.subscriptions).toHaveLength(1);
  });

  it("abonnement créé en parallèle par la notification Mollie → récupéré plutôt que dupliqué", async () => {
    const billing = await import("@/server/app/billing");
    const mollie = await import("@/server/mollie");
    await sql`update establishments set mollie_subscription_id = null where id = ${establishmentId}`;
    // Le webhook a déjà créé l'abonnement : Mollie refuse le doublon (422).
    const create = vi.mocked(mollie.createSubscription);
    create.mockImplementationOnce(async () => {
      throw new mollie.MollieError("A subscription with the same description already exists", 422);
    });
    mollieState.subscriptions.length = 0;
    const [paid] = await sql`select checkout_reference from payments where establishment_id = ${establishmentId} and status = 'paid' limit 1`;
    await sql`update payments set status = 'pending' where checkout_reference = ${paid.checkout_reference}`;
    const listed = vi.mocked(mollie.listSubscriptions);
    listed.mockResolvedValueOnce([]).mockResolvedValueOnce([{ id: "sub_webhook", status: "active", nextPaymentDate: null, description: "Reso · abonnement Institut Mollie" }]);
    await billing.confirmPayment({ reference: paid.checkout_reference }, now);
    const [est] = await sql`select mollie_subscription_id from establishments where id = ${establishmentId}`;
    expect(est.mollie_subscription_id).toBe("sub_webhook");
    // Remise en état pour les tests suivants (abonnement « sub_1 » créé au premier paiement).
    await sql`update establishments set mollie_subscription_id = 'sub_1' where id = ${establishmentId}`;
    mollieState.subscriptions.push({ id: "sub_1", status: "active", description: "Reso · abonnement Institut Mollie" });
  });

  it("paiement encaissé sans numéro de facture → numéroté au cycle quotidien", async () => {
    const billing = await import("@/server/app/billing");
    const [row] = await sql`insert into payments (establishment_id, provider, checkout_reference, amount_cents, vat_cents, period_start, period_end, status, paid_at)
      values (${establishmentId}, 'sumup', ${`reso-ancien-${Date.now()}`}, 4680, 780, '2026-08-01', '2026-09-01', 'paid', '2026-08-01T09:00:00Z') returning id`;
    const summary = await billing.runBillingCycle(now);
    expect(summary.invoices).toBe(1);
    const [issued] = await sql`select invoice_number, invoice_issued_at from payments where id = ${row.id}`;
    expect(issued.invoice_number).toMatch(/^RESO-\d{4}-\d{6}$/);
    expect(new Date(issued.invoice_issued_at).toISOString()).toBe("2026-08-01T09:00:00.000Z");
    expect((await billing.runBillingCycle(now)).invoices).toBe(0);
    await sql`delete from payments where id = ${row.id}`;
  });

  it("prélèvement automatique reçu par webhook → période prolongée d'un mois", async () => {
    const billing = await import("@/server/app/billing");
    mollieState.payments.set("tr_rec_1", { id: "tr_rec_1", status: "paid", amountCents: 4680, metadata: { establishmentId }, mandateId: "mdt_1", subscriptionId: "sub_1", customerId: "cst_test" });
    const later = new Date("2026-11-01T06:00:00Z");
    expect(await billing.handleMolliePayment("tr_rec_1", later)).toBe("paid");
    const [est] = await sql`select paid_until from establishments where id = ${establishmentId}`;
    expect(new Date(est.paid_until).toISOString()).toBe("2026-12-01T10:00:00.000Z");
    const rows = await sql`select status, period_start, period_end from payments where establishment_id = ${establishmentId} and status <> 'expired' order by created_at`;
    expect(rows).toHaveLength(2);
    expect(rows.every((r) => r.status === "paid")).toBe(true);
    const invoices = await sql`select invoice_number, payment_method from payments where establishment_id = ${establishmentId} and status = 'paid' order by created_at`;
    expect(invoices.map((i) => i.invoice_number)).toEqual(expect.arrayContaining([expect.stringMatching(/^RESO-\d{4}-\d{6}$/)]));
    expect(new Set(invoices.map((i) => i.invoice_number)).size).toBe(2);
    expect(invoices[0].payment_method).toBe("creditcard");
    const pdf = await billing.invoicePdf(establishmentId, (await sql`select id from payments where establishment_id = ${establishmentId} order by created_at limit 1`)[0].id);
    expect(pdf?.filename).toMatch(/^facture-reso-/);
    expect(Buffer.from(pdf!.content).toString("latin1").startsWith("%PDF")).toBe(true);
    // Rejouer le même webhook n'ajoute rien.
    await billing.handleMolliePayment("tr_rec_1", later);
    expect(await sql`select count(*)::int as n from payments where establishment_id = ${establishmentId} and status = 'paid'`).toMatchObject([{ n: 2 }]);
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
