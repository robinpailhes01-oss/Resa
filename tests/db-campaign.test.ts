/**
 * Campagne Hérault (salons hors Planity, shooting offert) contre la base de test :
 * recherche, analyse des sites, liste en simulation, envoi du texte validé,
 * exclusions (Planity, autre département, agences, désinscrits), total respecté.
 * Google, les sites et l'envoi sont simulés. Ignoré sans TEST_DATABASE_URL.
 */
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import postgres from "postgres";
import { ConsoleEmailSender } from "@/server/email/console-sender";
import { setEmailSenderForTests } from "@/server/email";

const url = process.env.TEST_DATABASE_URL;
process.env.DATABASE_URL = url ?? "";
process.env.PROSPECTION_ENABLED = "1";

const stamp = Date.now();
const place = (n: number, name: string, postalCode: string, website: string | null) => ({
  placeId: `camp-${stamp}-${n}`, name, formattedAddress: `${n} rue Test, ${postalCode}`, addressLine: null, postalCode, city: postalCode.startsWith("34") ? "Montpellier" : "Marseille",
  phone: null, website, businessType: "coiffure_barbier", hours: null, description: null, photoNames: [], rating: 4.7, ratingCount: 40, mapsUrl: null,
});
const places = [
  place(1, "Salon Écusson", "34000", "https://salon-ecusson.example/"),
  place(2, "Barber Planity Montpellier", "34000", "https://barber-planity.example/"),
  place(3, "Institut Marseille", "13001", "https://institut-marseille.example/"),
  place(4, "Ongles Agence A", "34070", "https://agence-a.example/"),
  place(5, "Ongles Agence B", "34080", "https://agence-b.example/"),
  place(6, "Coiffure Désinscrite", "34090", "https://desinscrite.example/"),
  place(7, "Beauté Lattes", "34970", "https://beaute-lattes.example/"),
];

vi.mock("@/server/google/places", () => ({
  isGoogleImportEnabled: () => true,
  searchPlaces: vi.fn(async () => places),
}));
vi.mock("@/server/telegram", () => ({ notifyTelegram: vi.fn(async () => true), isTelegramConfigured: () => false, escapeHtml: (v: string) => v, telegramEvents: {} }));

const pages: Record<string, string> = {
  "https://salon-ecusson.example/": `<html>Écrivez-nous : bonjour@salon-ecusson.example</html>`,
  "https://barber-planity.example/": `<html><a href="https://www.planity.com/barber">Réserver</a> contact@barber-planity.example</html>`,
  "https://institut-marseille.example/": `<html>hello@institut-marseille.example</html>`,
  "https://agence-a.example/": `<html>studio-${stamp}@gmail.com</html>`,
  "https://agence-b.example/": `<html>studio-${stamp}@gmail.com</html>`,
  "https://desinscrite.example/": `<html>non-${stamp}@desinscrite.example</html>`,
  "https://beaute-lattes.example/": `<html>rdv@beaute-lattes.example</html>`,
};
const fakeFetch = (async (input: RequestInfo | URL) => {
  const body = pages[new URL(String(input)).toString()];
  return body === undefined ? new Response("not found", { status: 404 }) : new Response(body, { status: 200, headers: { "content-type": "text/html" } });
}) as typeof fetch;

describe.skipIf(!url)("campagne Hérault hors Planity", () => {
  const sql = postgres(url ?? "postgres://invalid", { max: 1, prepare: false, onnotice: () => {} });
  const sender = new ConsoleEmailSender();
  const thursday = new Date("2026-10-01T09:00:00Z");

  beforeAll(async () => {
    setEmailSenderForTests(sender);
    await sql`insert into prospect_optouts (email) values (${`non-${stamp}@desinscrite.example`}) on conflict do nothing`;
    await sql`delete from prospection_campaign_queries where campaign = 'herault-shooting'`;
  });

  afterAll(async () => {
    setEmailSenderForTests(null);
    await sql`delete from prospects where google_place_id like ${`camp-${stamp}-%`}`;
    await sql`delete from prospect_optouts where email like ${`%${stamp}%`}`;
    await sql`delete from prospection_campaign_queries where campaign = 'herault-shooting'`;
    await sql.end();
  });

  it("simulation : liste les salons de l'Hérault hors Planity, sans rien envoyer", async () => {
    const { runCampaign } = await import("@/server/prospection/campaign");
    const result = await runCampaign("herault", { dryRun: true, now: thursday, fetchImpl: fakeFetch, budgetMs: 5_000 });
    const names = result.ready.map((r) => r.name);
    expect(names).toEqual(expect.arrayContaining(["Salon Écusson", "Beauté Lattes"]));
    expect(names).not.toContain("Barber Planity Montpellier");
    expect(names).not.toContain("Institut Marseille");
    expect(names.some((n) => n.startsWith("Ongles Agence"))).toBe(false);
    expect(names).not.toContain("Coiffure Désinscrite");
    expect(sender.sent).toHaveLength(0);
    expect(result.searches.length).toBeGreaterThan(0);
  });

  it("envoi : texte de la campagne, salons marqués, jamais deux fois", async () => {
    const { runCampaign } = await import("@/server/prospection/campaign");
    // Toutes les recherches marquées faites : l'envoi part avec les salons prêts.
    const { prospectionCampaigns, prospectionCategories } = await import("@/config/prospection");
    for (const city of prospectionCampaigns.herault.cities) {
      for (const c of prospectionCategories) await sql`insert into prospection_campaign_queries (campaign, query) values ('herault-shooting', ${`${c.query} ${city}`}) on conflict do nothing`;
    }
    const result = await runCampaign("herault", { dryRun: false, now: thursday, fetchImpl: fakeFetch, budgetMs: 5_000 });
    expect(result.sent.length).toBeGreaterThanOrEqual(2);
    const ecusson = sender.sent.find((m) => m.to === "bonjour@salon-ecusson.example")!;
    expect(ecusson.subject).toBe("Un shooting photo offert pour Salon Écusson 📸");
    expect(ecusson.text).toContain("C’est Ludivine et Robin 👋");
    expect(ecusson.text).toContain("on offre un shooting photo de votre salon pour toute inscription");
    expect(ecusson.fromName).toBe("Ludivine & Robin · Reso");
    expect(sender.sent.map((m) => m.to)).not.toContain("contact@barber-planity.example");
    const [row] = await sql`select status, campaign, follow_up_allowed from prospects where google_place_id = ${`camp-${stamp}-1`}`;
    expect(row).toMatchObject({ status: "contacte", campaign: "herault-shooting", follow_up_allowed: false });

    const before = sender.sent.length;
    const again = await runCampaign("herault", { dryRun: false, now: thursday, fetchImpl: fakeFetch, budgetMs: 2_000 });
    expect(again.sent.filter((s) => s.includes("Salon Écusson"))).toHaveLength(0);
    expect(sender.sent.filter((m) => m.to === "bonjour@salon-ecusson.example")).toHaveLength(1);
    expect(sender.sent.length).toBeGreaterThanOrEqual(before);
  });
});
