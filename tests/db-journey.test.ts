/**
 * Parcours d'un pro (micro-étapes, étape où il s'arrête) et rapport Telegram,
 * sur une vraie base. Ignoré sans TEST_DATABASE_URL.
 */
import postgres from "postgres";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const url = process.env.TEST_DATABASE_URL;
if (url) process.env.DATABASE_URL = url;

describe.skipIf(!url)("parcours des inscrits", () => {
  const sql = postgres(url ?? "postgres://invalid", { max: 1, prepare: false, onnotice: () => {} });
  const stamp = Date.now();
  let userId = "";
  let establishmentId = "";

  beforeAll(async () => {
    const [u] = await sql`insert into users (email, password_hash, full_name) values (${`parcours+${stamp}@example.com`}, 'x', 'Léa Martin') returning id`;
    userId = u.id;
    await sql`insert into acquisition_attributions (user_id, utm_source, utm_campaign, utm_content) values (${userId}, 'meta', 't001', 'site_pub01')`;
    const [e] = await sql`insert into establishments (owner_user_id, name, slug, business_type, city) values (${userId}, 'Léa Nails', ${`parcours-${stamp}`}, 'onglerie', 'Montpellier') returning id`;
    establishmentId = e.id;
  });

  afterAll(async () => {
    if (establishmentId) await sql`delete from establishments where id = ${establishmentId}`;
    if (userId) await sql`delete from users where id = ${userId}`;
    await sql.end();
  });

  it("enregistre chaque micro-étape une seule fois, et les erreurs à chaque fois", async () => {
    const { recordJourney, recordJourneyForEstablishment } = await import("@/server/acquisition/journey");
    await recordJourney(userId, "google_import", "fiche importée (4 photos)");
    await recordJourney(userId, "first_service", "3 modèle(s)");
    await recordJourney(userId, "first_service", "ajoutée à la main");
    await recordJourney(userId, "error", "enregistrement des horaires");
    await recordJourney(userId, "error", "enregistrement des horaires");
    // La pro qui visite sa propre page ne compte pas comme un partage.
    await recordJourneyForEstablishment(establishmentId, "page_visited", null, userId);
    const rows = await sql`select name, count(*)::int as n from journey_events where user_id = ${userId} group by name order by name`;
    expect(rows).toEqual([
      { name: "error", n: 2 },
      { name: "first_service", n: 1 },
      { name: "google_import", n: 1 },
    ]);
  });

  it("montre où la pro s'est arrêtée, dans le rapport", async () => {
    const { loadJourneys } = await import("@/server/acquisition/journey");
    const { formatJourneys } = await import("@/server/acquisition/daily-report");
    const journeys = (await loadJourneys(1)).filter((j) => j.name === "Léa M.");
    expect(journeys).toHaveLength(1);
    const j = journeys[0];
    expect(j.source).toBe("meta · t001 · site_pub01");
    expect(j.googleImport).toBe("fiche importée (4 photos)");
    expect(j.firstServiceAt).not.toBeNull();
    expect(j.hoursAt).toBeNull();
    expect(j.errors).toBe(2);
    const text = formatJourneys(journeys, journeys, new Date()).join("\n");
    expect(text).toContain("Léa M. · Onglerie · Montpellier · 0 praticien · fiche Google : non · meta · t001 · site_pub01 · arrêté à : renseigner ses horaires");
    expect(text).toContain("Qui s'inscrit (7 j)</b> : Onglerie 1");
    expect(text).toContain("✓ prestations");
    expect(text).toContain("✗ horaires");
    expect(text).toContain("2 erreur(s) : enregistrement des horaires");
    expect(text).not.toContain("example.com");
  });
});

describe.skipIf(!url)("rapport Telegram complet", () => {
  it("se construit sur la vraie base", async () => {
    const { buildAcquisitionReport } = await import("@/server/acquisition/daily-report");
    const text = await buildAcquisitionReport();
    expect(text).toContain("📊 <b>Acquisition RESO</b>");
    expect(text).toContain("Envoi à Meta (7 j)");
  });
});
