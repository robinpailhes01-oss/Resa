/**
 * Test d'intégration contre un PostgreSQL de test (migrations appliquées).
 * Ignoré si TEST_DATABASE_URL est absent.
 */
import postgres from "postgres";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const url = process.env.TEST_DATABASE_URL;

describe.skipIf(!url)("contrainte d'exclusion des rendez-vous", () => {
  const sql = postgres(url ?? "postgres://invalid", { max: 1, prepare: false, onnotice: () => {} });
  let userId = "";
  let establishmentId = "";
  let practitionerId = "";

  beforeAll(async () => {
    const [u] = await sql`insert into users (email, password_hash, full_name) values (${`test+${Date.now()}@example.com`}, 'x', 'Test') returning id`;
    userId = u.id;
    const [e] = await sql`insert into establishments (owner_user_id, name, slug) values (${userId}, 'Test', ${`test-${Date.now()}`}) returning id`;
    establishmentId = e.id;
    const [p] = await sql`insert into practitioners (establishment_id, name) values (${establishmentId}, 'Praticienne') returning id`;
    practitionerId = p.id;
  });

  afterAll(async () => {
    if (establishmentId) await sql`delete from establishments where id = ${establishmentId}`;
    if (userId) await sql`delete from users where id = ${userId}`;
    await sql.end();
  });

  const insert = (startsAt: string, endsAt: string, bufferMin = 0, status = "confirmed") =>
    sql`insert into bookings (establishment_id, practitioner_id, service_name, duration_min, buffer_min, price_cents, starts_at, ends_at, status, source)
      values (${establishmentId}, ${practitionerId}, 'Soin', 60, ${bufferMin}, 0, ${startsAt}, ${endsAt}, ${status}, 'manual') returning id, blocks_until`;

  it("refuse deux rendez-vous qui se chevauchent pour le même praticien", async () => {
    const [first] = await insert("2030-03-01T09:00:00Z", "2030-03-01T10:00:00Z", 15);
    expect(new Date(first.blocks_until).toISOString()).toBe("2030-03-01T10:15:00.000Z");
    await expect(insert("2030-03-01T10:00:00Z", "2030-03-01T11:00:00Z")).rejects.toMatchObject({ code: "23P01" });
    // Après le tampon : accepté.
    await expect(insert("2030-03-01T10:15:00Z", "2030-03-01T11:15:00Z")).resolves.toHaveLength(1);
  });

  it("ignore les rendez-vous annulés", async () => {
    await insert("2030-03-02T09:00:00Z", "2030-03-02T10:00:00Z", 0, "cancelled");
    await expect(insert("2030-03-02T09:00:00Z", "2030-03-02T10:00:00Z")).resolves.toHaveLength(1);
  });
});
