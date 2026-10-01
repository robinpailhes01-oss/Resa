/**
 * Acompte à la réservation (Mollie Connect) contre le PostgreSQL de test :
 * connexion OAuth, rendez-vous retenu, paiement, confirmation et emails,
 * échec, expiration, paiement tardif, remboursement. L'API Mollie est simulée.
 * Ignoré sans TEST_DATABASE_URL.
 */
import postgres from "postgres";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

const url = process.env.TEST_DATABASE_URL;
if (url) {
  process.env.DATABASE_URL = url;
  process.env.EMAIL_PROVIDER = "console";
  process.env.MOLLIE_TOKEN_ENCRYPTION_KEY = "cle-de-test-".repeat(4);
}

const mollie = {
  payments: new Map<string, { status: string; amountCents: number }>(),
  refunds: [] as string[],
  created: [] as Array<Record<string, unknown>>,
};

vi.mock("@/server/mollie-connect", () => ({
  isMollieConnectConfigured: () => true,
  isConnectTestMode: () => true,
  exchangeCode: vi.fn(async () => ({ accessToken: "access_1", refreshToken: "refresh_1", expiresAt: new Date(Date.now() + 3_600_000), scope: "payments.write" })),
  refreshTokens: vi.fn(async () => ({ accessToken: "access_2", refreshToken: null, expiresAt: new Date(Date.now() + 3_600_000), scope: "" })),
  revokeRefreshToken: vi.fn(async () => {}),
  merchantStatus: vi.fn(async () => ({
    organizationId: "org_1",
    organizationName: "Institut Acompte SAS",
    onboardingStatus: "completed",
    canReceivePayments: true,
    dashboardUrl: "https://my.mollie.com/dashboard",
    profiles: [{ id: "pfl_1", name: "Institut Acompte", status: "verified" }],
  })),
  createConnectPayment: vi.fn(async (_token: string, input: { amountCents: number; profileId: string }) => {
    const id = `tr_connect${mollie.payments.size + 1}`;
    mollie.payments.set(id, { status: "open", amountCents: input.amountCents });
    mollie.created.push({ id, ...input });
    return { id, status: "open", amountCents: input.amountCents, checkoutUrl: `https://www.mollie.com/checkout/${id}`, paidAt: null, refundedCents: 0 };
  }),
  getConnectPayment: vi.fn(async (_token: string, id: string) => {
    const p = mollie.payments.get(id)!;
    return { id, status: p.status, amountCents: p.amountCents, checkoutUrl: null, paidAt: p.status === "paid" ? new Date() : null, refundedCents: 0 };
  }),
  refundConnectPayment: vi.fn(async (_token: string, input: { paymentId: string }) => {
    mollie.refunds.push(input.paymentId);
    return `re_${mollie.refunds.length}`;
  }),
}));

describe.skipIf(!url)("acompte à la réservation (Mollie Connect)", () => {
  const sql = postgres(url ?? "postgres://invalid", { max: 1, prepare: false, onnotice: () => {} });
  let userId = "";
  let otherUserId = "";
  let establishmentId = "";
  let practitionerId = "";
  const stamp = Date.now();

  beforeAll(async () => {
    const [u] = await sql`insert into users (email, password_hash, full_name) values (${`acompte+${stamp}@example.com`}, 'x', 'Camille') returning id`;
    userId = u.id;
    const [o] = await sql`insert into users (email, password_hash, full_name) values (${`autre+${stamp}@example.com`}, 'x', 'Autre') returning id`;
    otherUserId = o.id;
    const [e] = await sql`insert into establishments (owner_user_id, name, slug, subscription_status, payment_mode, deposit_kind, deposit_value)
      values (${userId}, 'Institut Acompte', ${`acompte-${stamp}`}, 'active', 'deposit', 'percent', 30) returning id`;
    establishmentId = e.id;
    await sql`insert into notification_settings (establishment_id) values (${establishmentId})`;
    const [p] = await sql`insert into practitioners (establishment_id, name) values (${establishmentId}, 'Léa') returning id`;
    practitionerId = p.id;
  });

  afterAll(async () => {
    if (establishmentId) await sql`delete from establishments where id = ${establishmentId}`;
    await sql`delete from users where id in (${userId}, ${otherUserId})`;
    await sql.end();
  });

  const book = async (startsAt: string, hold = true) => {
    const { createBooking } = await import("@/server/app/bookings");
    const { holdUntil } = await import("@/server/app/booking-payments");
    return createBooking({
      establishmentId,
      practitionerId,
      serviceId: null,
      serviceName: "Soin visage",
      durationMin: 60,
      bufferMin: 0,
      priceCents: 5000,
      startsAt: new Date(startsAt),
      source: "online",
      client: { firstName: "Inès", lastName: "Martin", email: `ines+${stamp}@example.com`, phone: "0600000000" },
      paymentHoldUntil: hold ? holdUntil() : null,
    });
  };

  const establishment = async () => (await import("@/server/app/establishments")).getEstablishmentById(establishmentId).then((e) => e!);

  it("relie le compte Mollie : jeton lié à l'utilisateur, jetons chiffrés en base", async () => {
    const payments = await import("@/server/app/booking-payments");
    const stolen = await payments.createConnectState(establishmentId, userId);
    await expect(payments.completeConnection({ state: stolen, code: "code_x", userId: otherUserId })).rejects.toThrow(/expiré/);

    const state = await payments.createConnectState(establishmentId, userId);
    await expect(payments.completeConnection({ state, code: "code_ok", userId })).resolves.toBe(establishmentId);
    // Jeton à usage unique.
    await expect(payments.completeConnection({ state, code: "code_ok", userId })).rejects.toThrow(/expiré/);

    const [row] = await sql`select * from mollie_connections where establishment_id = ${establishmentId}`;
    expect(row.profile_id).toBe("pfl_1");
    expect(row.can_receive_payments).toBe(true);
    expect(row.access_token_enc).not.toContain("access_1");
    expect(row.refresh_token_enc).not.toContain("refresh_1");
  });

  it("acompte de 30 % exigé ; rendez-vous retenu sans email avant paiement", async () => {
    const payments = await import("@/server/app/booking-payments");
    const e = await establishment();
    const due = await payments.onlinePaymentFor(e, 5000);
    expect(due).toEqual({ kind: "deposit", amountCents: 1500, remainingCents: 3500 });
    expect(await payments.publicPaymentLabel(e, (c) => `${c / 100} €`)).toBe("Acompte de 30 % à la réservation");

    const { booking, manageToken } = await book("2031-05-02T08:00:00Z");
    expect(booking.status).toBe("pending");
    const jobs = await sql`select kind from email_jobs where booking_id = ${booking.id}`;
    expect(jobs).toHaveLength(0);

    const checkout = await payments.startBookingPayment({ establishment: e, bookingId: booking.id, serviceName: "Soin visage", startsAt: booking.startsAt, manageToken, due: due! });
    expect(checkout).toContain("mollie.com/checkout");
    expect(mollie.created.at(-1)).toMatchObject({ profileId: "pfl_1", testmode: true, amountCents: 1500, applicationFeeCents: 30 });
    const [feeRow] = await sql`select application_fee_cents from booking_payments where booking_id = ${booking.id}`;
    expect(feeRow.application_fee_cents).toBe(30);

    // Paiement validé → rendez-vous confirmé, emails planifiés avec le lien de gestion.
    const [p] = await sql`select mollie_payment_id from booking_payments where booking_id = ${booking.id}`;
    mollie.payments.get(p.mollie_payment_id)!.status = "paid";
    expect(await payments.syncBookingPayment(p.mollie_payment_id)).toBe("paid");
    const [b] = await sql`select status, payment_hold_until from bookings where id = ${booking.id}`;
    expect(b.status).toBe("confirmed");
    expect(b.payment_hold_until).toBeNull();
    const confirmation = await sql`select manage_token from email_jobs where booking_id = ${booking.id} and kind = 'booking_confirmation'`;
    expect(confirmation).toHaveLength(1);
    expect(confirmation[0].manage_token).toBe(manageToken);
    const [stored] = await sql`select status, manage_token from booking_payments where booking_id = ${booking.id}`;
    expect(stored).toMatchObject({ status: "paid", manage_token: null });

    // Webhook rejoué : aucun doublon.
    expect(await payments.syncBookingPayment(p.mollie_payment_id)).toBe("paid");
    const again = await sql`select 1 from email_jobs where booking_id = ${booking.id} and kind = 'booking_confirmation'`;
    expect(again).toHaveLength(1);

    // Annulation : remboursement, limité à l'établissement concerné.
    expect(await payments.refundBookingPayment("00000000-0000-0000-0000-000000000000", booking.id)).toBe("none");
    expect(await payments.refundBookingPayment(establishmentId, booking.id)).toBe("refunded");
    expect(mollie.refunds).toContain(p.mollie_payment_id);
    const [refunded] = await sql`select status, mollie_refund_id from booking_payments where booking_id = ${booking.id}`;
    expect(refunded.status).toBe("refunded");
  });

  it("compte Mollie de Reso relié : Mollie refuse la commission, paiement créé sans", async () => {
    const payments = await import("@/server/app/booking-payments");
    const connectMock = await import("@/server/mollie-connect");
    const { MollieError } = await import("@/server/mollie");
    vi.mocked(connectMock.createConnectPayment).mockRejectedValueOnce(
      new MollieError('Mollie a répondu 422 : {"detail":"Application fees can not be created for your own account"}', 422),
    );
    const e = await establishment();
    const { booking, manageToken } = await book("2031-05-07T08:00:00Z");
    const url = await payments.startBookingPayment({ establishment: e, bookingId: booking.id, serviceName: "Soin", startsAt: booking.startsAt, manageToken, due: { kind: "deposit", amountCents: 700, remainingCents: 2800 } });
    expect(url).toContain("mollie.com/checkout");
    expect(mollie.created.at(-1)?.applicationFeeCents).toBeUndefined();
    const [row] = await sql`select application_fee_cents, status from booking_payments where booking_id = ${booking.id}`;
    expect(row).toMatchObject({ application_fee_cents: 0, status: "open" });
  });

  it("paiement abandonné : créneau libéré", async () => {
    const payments = await import("@/server/app/booking-payments");
    const e = await establishment();
    const { booking, manageToken } = await book("2031-05-03T08:00:00Z");
    await payments.startBookingPayment({ establishment: e, bookingId: booking.id, serviceName: "Soin", startsAt: booking.startsAt, manageToken, due: { kind: "deposit", amountCents: 1500, remainingCents: 3500 } });
    const [p] = await sql`select mollie_payment_id from booking_payments where booking_id = ${booking.id}`;
    mollie.payments.get(p.mollie_payment_id)!.status = "canceled";
    expect(await payments.syncBookingPayment(p.mollie_payment_id)).toBe("released");
    const [b] = await sql`select status from bookings where id = ${booking.id}`;
    expect(b.status).toBe("cancelled");
    // Le même créneau est de nouveau réservable.
    await expect(book("2031-05-03T08:00:00Z", false)).resolves.toBeTruthy();
  });

  it("délai dépassé puis paiement tardif : repris si libre, remboursé sinon", async () => {
    const payments = await import("@/server/app/booking-payments");
    const e = await establishment();
    const due = { kind: "deposit" as const, amountCents: 1500, remainingCents: 3500 };

    const first = await book("2031-05-04T08:00:00Z");
    await payments.startBookingPayment({ establishment: e, bookingId: first.booking.id, serviceName: "Soin", startsAt: first.booking.startsAt, manageToken: first.manageToken, due });
    const second = await book("2031-05-04T10:00:00Z");
    await payments.startBookingPayment({ establishment: e, bookingId: second.booking.id, serviceName: "Soin", startsAt: second.booking.startsAt, manageToken: second.manageToken, due });

    expect(await payments.releaseExpiredHolds(new Date(Date.now() + 2 * 3_600_000))).toBeGreaterThanOrEqual(2);

    // Créneau encore libre : le rendez-vous est repris.
    const [p1] = await sql`select mollie_payment_id from booking_payments where booking_id = ${first.booking.id}`;
    mollie.payments.get(p1.mollie_payment_id)!.status = "paid";
    expect(await payments.syncBookingPayment(p1.mollie_payment_id)).toBe("paid");
    const [b1] = await sql`select status from bookings where id = ${first.booking.id}`;
    expect(b1.status).toBe("confirmed");

    // Créneau repris par quelqu'un d'autre : remboursement automatique.
    await book("2031-05-04T10:00:00Z", false);
    const [p2] = await sql`select mollie_payment_id from booking_payments where booking_id = ${second.booking.id}`;
    mollie.payments.get(p2.mollie_payment_id)!.status = "paid";
    expect(await payments.syncBookingPayment(p2.mollie_payment_id)).toBe("late_refunded");
    const [b2] = await sql`select status from bookings where id = ${second.booking.id}`;
    expect(b2.status).toBe("cancelled");
    expect(mollie.refunds).toContain(p2.mollie_payment_id);
  });

  it("annulé par le client pendant le paiement : un paiement tardif est remboursé, pas repris", async () => {
    const payments = await import("@/server/app/booking-payments");
    const { cancelBookingByClient } = await import("@/server/app/bookings");
    const e = await establishment();
    const { booking, manageToken } = await book("2031-05-06T08:00:00Z");
    await payments.startBookingPayment({ establishment: e, bookingId: booking.id, serviceName: "Soin", startsAt: booking.startsAt, manageToken, due: { kind: "deposit", amountCents: 1500, remainingCents: 3500 } });
    expect(await cancelBookingByClient(manageToken, 24, new Date("2031-05-01T00:00:00Z"))).toBe("cancelled");
    const [p] = await sql`select mollie_payment_id from booking_payments where booking_id = ${booking.id}`;
    mollie.payments.get(p.mollie_payment_id)!.status = "paid";
    expect(await payments.syncBookingPayment(p.mollie_payment_id)).toBe("late_refunded");
    const [b] = await sql`select status from bookings where id = ${booking.id}`;
    expect(b.status).toBe("cancelled");
  });

  it("déconnexion : jetons supprimés et encaissement coupé", async () => {
    const payments = await import("@/server/app/booking-payments");
    await payments.disconnectMollie(establishmentId);
    expect(await payments.getMollieConnection(establishmentId)).toBeNull();
    const [e] = await sql`select payment_mode from establishments where id = ${establishmentId}`;
    expect(e.payment_mode).toBe("none");
  });
});
