import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import postgres from "postgres";
import { ConsoleEmailSender } from "@/server/email/console-sender";
import { setEmailSenderForTests } from "@/server/email";

const url = process.env.TEST_DATABASE_URL;
process.env.DATABASE_URL = url ?? "";
process.env.PROSPECTION_ENABLED = "1";
process.env.PROSPECTION_SEARCHES_PER_DAY = "1";
process.env.PROSPECTION_DAILY_LIMIT = "5";
process.env.PROSPECTION_FOLLOW_UP_DAYS = "5";
process.env.PROSPECTION_PROVIDERS = "all";

const stamp = Date.now();
const places = {
  planitySite: { placeId: `p-${stamp}-1`, name: "Barber Test Planity", formattedAddress: "1 rue Test, 13001 Marseille", addressLine: "1 rue Test", postalCode: "13001", city: "Marseille", phone: "04 91 00 00 01", website: "https://barber-test-planity.example", businessType: "coiffure_barbier", hours: null, description: null, photoNames: [], rating: 4.8, ratingCount: 120, mapsUrl: "https://maps.google.com/?cid=1" },
  planityOnly: { placeId: `p-${stamp}-2`, name: "Salon Sans Site", formattedAddress: "2 rue Test, 13002 Marseille", addressLine: null, postalCode: "13002", city: "Marseille", phone: "04 91 00 00 02", website: "https://www.planity.com/salon-sans-site-13002-marseille", businessType: "coiffure_barbier", hours: null, description: null, photoNames: [], rating: 4.5, ratingCount: 30, mapsUrl: null },
  noWebsite: { placeId: `p-${stamp}-3`, name: "Coiffure Sans Web", formattedAddress: "3 rue Test, 13003 Marseille", addressLine: null, postalCode: "13003", city: "Marseille", phone: "04 91 00 00 03", website: null, businessType: "coiffure_barbier", hours: null, description: null, photoNames: [], rating: null, ratingCount: null, mapsUrl: null },
  contactPage: { placeId: `p-${stamp}-4`, name: "Institut Page Contact", formattedAddress: "4 rue Test, 13004 Marseille", addressLine: null, postalCode: "13004", city: "Marseille", phone: null, website: "https://institut-contact.example/", businessType: "institut", hours: null, description: null, photoNames: [], rating: 4.9, ratingCount: 12, mapsUrl: null },
  alreadyUser: { placeId: `p-${stamp}-5`, name: "Déjà Client", formattedAddress: "5 rue Test, 13005 Marseille", addressLine: null, postalCode: "13005", city: "Marseille", phone: null, website: "https://deja-client.example/", businessType: "institut", hours: null, description: null, photoNames: [], rating: null, ratingCount: null, mapsUrl: null },
};

vi.mock("@/server/google/places", () => ({
  isGoogleImportEnabled: () => true,
  searchPlaces: vi.fn(async () => Object.values(places)),
}));
vi.mock("@/server/telegram", () => ({ notifyTelegram: vi.fn(async () => true), isTelegramConfigured: () => false, escapeHtml: (v: string) => v, telegramEvents: {} }));

const pages: Record<string, string> = {
  "https://barber-test-planity.example/": '<html><a href="https://www.planity.com/barber-test">Réserver</a> <a href="mailto:contact@barber-test-planity.example">Nous écrire</a></html>',
  "https://institut-contact.example/": '<html><a href="/contact">Contact</a><p>Bienvenue</p></html>',
  "https://institut-contact.example/contact": "<html><p>Écrivez-nous : bonjour@institut-contact.example</p></html>",
  "https://deja-client.example/": `<html>contact : client-${stamp}@deja-client.example</html>`,
};
const fakeFetch = (async (input: RequestInfo | URL) => {
  const key = new URL(String(input)).toString();
  const body = pages[key];
  if (body === undefined) return new Response("not found", { status: 404 });
  return new Response(body, { status: 200, headers: { "content-type": "text/html; charset=utf-8" } });
}) as typeof fetch;

describe.skipIf(!url)("prospection en base", () => {
  const sql = postgres(url ?? "postgres://invalid", { max: 1, prepare: false, onnotice: () => {} });
  const sender = new ConsoleEmailSender();
  let userId = "";
  const monday = new Date("2026-09-28T06:00:00Z");

  beforeAll(async () => {
    setEmailSenderForTests(sender);
    const [u] = await sql`insert into users (email, password_hash, full_name) values (${`client-${stamp}@deja-client.example`}, 'x', 'Client Existant') returning id`;
    userId = u.id;
  });

  afterAll(async () => {
    setEmailSenderForTests(null);
    await sql`delete from prospects where google_place_id like ${`p-${stamp}-%`}`;
    await sql`delete from prospect_optouts where email like ${`%${stamp}%`} or email in ('contact@barber-test-planity.example','bonjour@institut-contact.example')`;
    await sql`delete from prospection_runs where ran_at >= ${new Date(monday.getTime() - 1000)} and ran_at <= ${new Date(monday.getTime() + 30 * 86_400_000)}`;
    if (userId) await sql`delete from users where id = ${userId}`;
    await sql.end();
  });

  it("découvre, analyse, envoie (Planity d'abord), relance, respecte inscrits et désinscrits", async () => {
    const prospection = await import("@/server/prospection");

    // Simulation d'abord : rien n'est envoyé, mais tout est analysé.
    const dry = await prospection.runProspection({ now: monday, dryRun: true, fetchImpl: fakeFetch });
    expect(dry.found).toBe(5);
    expect(dry.created).toBe(5);
    expect(dry.enriched).toBe(5);
    expect(dry.emailsFound).toBe(3);
    expect(dry.sent).toBe(2); // le compte existant n'est pas contacté
    expect(sender.sent).toHaveLength(0);
    const rows = await sql<Array<{ name: string; status: string; booking_provider: string | null; email: string | null }>>`select name, status, booking_provider, email from prospects where google_place_id like ${`p-${stamp}-%`} order by name`;
    expect(rows.find((r) => r.name === "Barber Test Planity")).toMatchObject({ status: "a_contacter", booking_provider: "planity", email: "contact@barber-test-planity.example" });
    expect(rows.find((r) => r.name === "Salon Sans Site")).toMatchObject({ status: "sans_email", booking_provider: "planity", email: null });
    expect(rows.find((r) => r.name === "Coiffure Sans Web")).toMatchObject({ status: "sans_email", booking_provider: null });
    expect(rows.find((r) => r.name === "Institut Page Contact")).toMatchObject({ status: "a_contacter", email: "bonjour@institut-contact.example" });
    expect(rows.find((r) => r.name === "Déjà Client")).toMatchObject({ status: "inscrit" });

    // Envoi réel (lundi) : Planity en premier, email signé, désinscription et identité présentes.
    const real = await prospection.runProspection({ now: monday, fetchImpl: fakeFetch });
    expect(real.created).toBe(0);
    expect(real.sent).toBe(2);
    expect(sender.sent).toHaveLength(2);
    expect(sender.sent[0]!.to).toBe("contact@barber-test-planity.example");
    expect(sender.sent[0]!.subject).toBe("Une alternative à Planity pour Barber Test Planity ?");
    expect(sender.sent[0]!.text).toContain("Ne plus recevoir d’emails : ");
    expect(sender.sent[0]!.fromName).toBe("Robin de Reso");
    expect(sender.sent[1]!.subject).toBe("Réservation en ligne pour Institut Page Contact, sans commission");

    // Rejouer le même jour n'envoie rien de plus, même si de nouveaux prospects à contacter apparaissent.
    process.env.PROSPECTION_DAILY_LIMIT = "2";
    await sql`update prospects set status = 'a_contacter' where google_place_id = ${places.alreadyUser.placeId}`;
    const replay = await prospection.runProspection({ now: new Date(monday.getTime() + 3 * 3600_000), fetchImpl: fakeFetch });
    expect(replay.sent).toBe(0);
    expect(replay.skipped).toContain("limite quotidienne");
    await sql`update prospects set status = 'inscrit' where google_place_id = ${places.alreadyUser.placeId}`;
    process.env.PROSPECTION_DAILY_LIMIT = "5";

    // Le samedi : pas d'envoi.
    const saturday = new Date("2026-10-03T06:00:00Z");
    expect((await prospection.runProspection({ now: saturday, fetchImpl: fakeFetch })).skipped).toContain("week-end");

    // Désinscription en un clic de l'institut, puis relance 5 jours plus tard : seul le barbier est relancé.
    const [institut] = await sql<Array<{ unsubscribe_token: string }>>`select unsubscribe_token from prospects where google_place_id = ${places.contactPage.placeId}`;
    expect(await prospection.peekProspectToken(institut.unsubscribe_token)).toBe(true);
    expect(await prospection.unsubscribeProspect(institut.unsubscribe_token)).toBe(true);
    expect(await prospection.unsubscribeProspect("0000")).toBe(false);
    const later = new Date("2026-10-05T06:00:00Z"); // lundi suivant, 7 jours après
    const follow = await prospection.runProspection({ now: later, fetchImpl: fakeFetch });
    expect(follow.followUps).toBe(1);
    expect(sender.sent).toHaveLength(3);
    expect(sender.sent[2]!.subject).toBe("Re : Une alternative à Planity pour Barber Test Planity ?");
    const [barber] = await sql<Array<{ status: string }>>`select status from prospects where google_place_id = ${places.planitySite.placeId}`;
    expect(barber.status).toBe("relance");
    const [optout] = await sql`select 1 as ok from prospect_optouts where email = 'bonjour@institut-contact.example'`;
    expect(optout).toBeTruthy();

    // Ciblage Planity seul : un prospect sans outil détecté n'est jamais contacté, même à contacter.
    process.env.PROSPECTION_PROVIDERS = "planity";
    await sql`update prospects set status = 'a_contacter', first_email_at = null where google_place_id = ${places.alreadyUser.placeId}`;
    const targeted = await prospection.runProspection({ now: new Date("2026-10-06T06:00:00Z"), fetchImpl: fakeFetch });
    expect(targeted.sent).toBe(0);
    process.env.PROSPECTION_PROVIDERS = "all";
    await sql`update prospects set status = 'inscrit' where google_place_id = ${places.alreadyUser.placeId}`;

    // Export CSV lisible dans un tableur.
    const csv = await prospection.prospectsCsv();
    expect(csv.startsWith("﻿\"Nom\";")).toBe(true);
    expect(csv).toContain('"Barber Test Planity";"barbier";"Marseille"');

    // Réponse du barbier reçue via Resend : statut « a répondu », transfert à l'adresse de contact.
    const reply = await prospection.recordProspectReply({ id: "em_1", from: "Barber <contact@barber-test-planity.example>", fromAddress: "contact@barber-test-planity.example", to: ["robin@reply.example"], subject: "Re : Une alternative", text: "Oui, intéressé, rappelez-moi." }, later);
    expect(reply.prospect).toBe("Barber Test Planity");
    const [replied] = await sql<Array<{ status: string; last_reply: string }>>`select status, last_reply from prospects where google_place_id = ${places.planitySite.placeId}`;
    expect(replied).toMatchObject({ status: "repondu", last_reply: "Oui, intéressé, rappelez-moi." });
    const forwarded = sender.sent.find((m) => m.subject === "[Prospection] Re : Une alternative");
    expect(forwarded?.replyTo).toBe("contact@barber-test-planity.example");
    // Inscription d'un prospect : marqué inscrit, nom renvoyé pour la notification.
    expect(await prospection.matchProspectSignup("contact@barber-test-planity.example")).toBe("Barber Test Planity (Marseille)");
    expect(await prospection.matchProspectSignup("inconnu@nulle-part.example")).toBeNull();

    // Récap hebdo : 2 emails, 1 relance sur la période.
    const stats = await prospection.prospectionWeeklyStats(new Date("2026-09-27T00:00:00Z"));
    expect(stats).toMatchObject({ contacted: 2, followedUp: 1 });
  });
});
