import { describe, expect, it } from "vitest";
import { prospectionCategories, prospectionCities, prospectionSettings } from "@/config/prospection";
import { detectBookingProvider, extractEmails, findContactLinks, formatProspectionReport, isBookingPlatformUrl, isBusinessDayParis, looksLikeDecline, pickBestEmail, planQueries, shortEstablishmentName } from "@/lib/prospection";
import { prospectionContent } from "@/content/fr/prospection";
import { createHmac } from "node:crypto";
import { bareAddress, readableText, verifyResendSignature } from "@/server/resend-inbound";

describe("prospection : rotation des recherches", () => {
  it("avance chaque jour et couvre toutes les combinaisons avant de recommencer", () => {
    const cats = prospectionCategories.slice(0, 2);
    const cities = ["Marseille", "Aix-en-Provence", "Toulon"];
    const day1 = planQueries(new Date("2026-09-24T06:00:00Z"), cats, cities, 4);
    const day2 = planQueries(new Date("2026-09-25T06:00:00Z"), cats, cities, 4);
    expect(day1).toHaveLength(4);
    expect(day1.map((q) => q.text)).not.toEqual(day2.map((q) => q.text));
    const seen = new Set<string>();
    for (let d = 0; d < 3; d += 1) for (const q of planQueries(new Date(Date.UTC(2026, 8, 24 + d)), cats, cities, 2)) seen.add(q.text);
    expect(seen.size).toBe(6);
    expect(day1[0]!.text).toMatch(/^(salon de coiffure|barbier) (Marseille|Aix-en-Provence|Toulon)$/);
  });

  it("réglages par défaut et plafonds", () => {
    expect(prospectionSettings({})).toEqual({ searchesPerDay: 3, dailyEmailLimit: 20, followUpAfterDays: 5, enrichPerRun: 60, providers: ["planity"] });
    expect(prospectionSettings({ PROSPECTION_PROVIDERS: "all" }).providers).toBe("all");
    expect(prospectionSettings({ PROSPECTION_PROVIDERS: "planity, treatwell" }).providers).toEqual(["planity", "treatwell"]);
    expect(prospectionSettings({ PROSPECTION_DAILY_LIMIT: "500", PROSPECTION_SEARCHES_PER_DAY: "abc" })).toMatchObject({ dailyEmailLimit: 80, searchesPerDay: 3 });
    expect(prospectionCities.length).toBeGreaterThan(10);
  });
});

describe("prospection : détection de l'outil de réservation", () => {
  it("reconnaît Planity dans une URL de fiche ou un widget", () => {
    expect(detectBookingProvider("https://www.planity.com/salon-x-13001-marseille")).toBe("planity");
    expect(detectBookingProvider("https://mon-salon.fr", '<a href="https://www.planity.com/mon-salon">Réserver</a>')).toBe("planity");
    expect(detectBookingProvider("https://mon-salon.fr", '<script src="https://widget.treatwell.fr/x.js">')).toBe("treatwell");
    expect(detectBookingProvider("https://mon-salon.fr", "<p>Appelez-nous</p>")).toBeNull();
    expect(isBookingPlatformUrl("https://www.planity.com/salon-x")).toBe(true);
    expect(isBookingPlatformUrl("https://mon-salon.fr/planity")).toBe(false);
  });
});

describe("prospection : extraction d'emails", () => {
  it("trouve les adresses utiles et ignore les faux positifs", () => {
    const html = `
      <a href="mailto:Contact@Mon-Salon.fr">écrire</a>
      <img src="logo@2x.png"> <span>hello[at]studio-coiffure.fr</span>
      <a href="mailto:noreply@wixpress.com">x</a> <p>rgpd@mon-salon.fr</p> user@example.com
      <script>window.__sentry = "abc@sentry.io"</script>`;
    expect(extractEmails(html).sort()).toEqual(["contact@mon-salon.fr", "hello@studio-coiffure.fr"]);
    expect(pickBestEmail(["hello@studio-coiffure.fr", "contact@mon-salon.fr"], "https://www.mon-salon.fr")).toBe("contact@mon-salon.fr");
    expect(pickBestEmail(["perso.dupont@gmail.com", "contact@autre.fr"], null)).toBe("contact@autre.fr");
    // Adresse d'une agence web (autre domaine, pas une messagerie grand public) : ignorée ; la messagerie du salon est gardée.
    expect(pickBestEmail(["contact@agence-web.com"], "https://www.mon-salon.fr")).toBeNull();
    expect(pickBestEmail(["contact@agence-web.com", "monsalon@orange.fr"], "https://www.mon-salon.fr")).toBe("monsalon@orange.fr");
    expect(pickBestEmail(["hello@mon-salon.fr"], "https://reservation.mon-salon.fr/")).toBe("hello@mon-salon.fr");
    expect(pickBestEmail([], "https://x.fr")).toBeNull();
  });

  it("repère les pages de contact du même site", () => {
    const html = '<a href="/contact">Contact</a> <a href="https://instagram.com/x">insta</a> <a href="https://mon-salon.fr/infos-pratiques/">infos</a> <a href="/tarifs">tarifs</a>';
    expect(findContactLinks(html, "https://mon-salon.fr/")).toEqual(["https://mon-salon.fr/contact", "https://mon-salon.fr/infos-pratiques/"]);
  });
});

describe("prospection : calendrier et récap", () => {
  it("n'envoie pas le week-end (heure de Paris)", () => {
    expect(isBusinessDayParis(new Date("2026-09-25T06:00:00Z"))).toBe(true); // vendredi
    expect(isBusinessDayParis(new Date("2026-09-26T06:00:00Z"))).toBe(false); // samedi
    expect(isBusinessDayParis(new Date("2026-09-27T21:59:00Z"))).toBe(false); // dimanche soir
  });

  it("met en forme le récap Telegram", () => {
    const text = formatProspectionReport({
      queries: ["barbier Marseille", "onglerie Aix-en-Provence"],
      found: 40,
      created: 31,
      enriched: 31,
      emailsFound: 9,
      sent: 9,
      followUps: 2,
      sentTo: ["Barber Club · Marseille"],
      followUpTo: ["Institut Lumière · Aix-en-Provence"],
      skipped: null,
      dryRun: false,
      totals: { prospects: 120, toContact: 4, contacted: 60, signedUp: 2, unsubscribed: 1 },
    });
    expect(text).toContain("barbier Marseille · onglerie Aix-en-Provence");
    expect(text).toContain("nouveaux : <b>31</b>");
    expect(text).toContain("Emails envoyés : <b>9</b> · relances : 2");
    expect(text).toContain("• Barber Club · Marseille");
    expect(text).toContain("↩ Institut Lumière · Aix-en-Provence");
    expect(text).toContain("inscrits : <b>2</b>");
  });

  it("les textes d'email sont courts, factuels, avec le lien de désinscription", () => {
    const input = {
      establishmentName: "Barber Club",
      categoryPlural: "barbiers",
      providerLabel: "Planity",
      trialUrl: "https://www.reso-app.fr/?utm_source=prospection",
      unsubscribeUrl: "https://www.reso-app.fr/ne-plus-me-contacter?token=abc",
      priceLabel: "39 € HT",
      trialDays: 7,
      senderName: "Robin Pailhes",
      brandName: "Reso",
      legalEntity: "SAS Harmonie Group, 61 rue du Rouet, 13008 Marseille, France",
    };
    const first = prospectionContent.first(input).join("\n");
    expect(first).toContain("Barber Club utilise Planity");
    expect(first).toContain("39 € HT par mois");
    expect(first).toContain("7 jours gratuits");
    expect(first.length).toBeLessThan(520);
    expect(first).not.toMatch(/SMS|Harmonie/i);
    expect(prospectionContent.footer(input)).toBe("Ne plus recevoir d’emails : https://www.reso-app.fr/ne-plus-me-contacter?token=abc");
    expect(prospectionContent.subjects.withProvider("Barber Club", "Planity")).toBe("Une alternative à Planity pour Barber Club ?");
    expect(prospectionContent.subjects.followUp("Barber Club", "Planity")).toBe("Re : Une alternative à Planity pour Barber Club ?");
  });
});

describe("réponses reçues via Resend", () => {
  it("vérifie la signature Svix et rejette les corps altérés ou anciens", () => {
    const secret = `whsec_${Buffer.from("secret-de-test-0123456789").toString("base64")}`;
    const body = JSON.stringify({ type: "email.received", data: { email_id: "abc" } });
    const now = 1_790_000_000_000;
    const timestamp = String(Math.floor(now / 1000));
    const sig = createHmac("sha256", Buffer.from("secret-de-test-0123456789")).update(`msg_1.${timestamp}.${body}`).digest("base64");
    const headers = { id: "msg_1", timestamp, signature: `v1,${sig}` };
    expect(verifyResendSignature(body, headers, secret, now)).toBe(true);
    expect(verifyResendSignature(body, { ...headers, signature: `v1,${sig} v1,autre` }, secret, now)).toBe(true);
    expect(verifyResendSignature(body + " ", headers, secret, now)).toBe(false);
    expect(verifyResendSignature(body, headers, secret, now + 10 * 60_000)).toBe(false);
    expect(verifyResendSignature(body, { ...headers, signature: null }, secret, now)).toBe(false);
  });

  it("extrait l'adresse et un texte lisible", () => {
    expect(bareAddress("Salon Test <Contact@Salon-Test.fr>")).toBe("contact@salon-test.fr");
    expect(bareAddress("contact@salon-test.fr")).toBe("contact@salon-test.fr");
    expect(readableText(null, "<p>Bonjour,</p><p>Oui &amp; merci</p><style>p{}</style>")).toBe("Bonjour,\n Oui & merci");
    expect(readableText("  Texte direct ", "<p>ignoré</p>")).toBe("Texte direct");
  });
});

describe("prospection : nom court et refus", () => {
  it("coupe les slogans des fiches Google", () => {
    expect(shortEstablishmentName("Parenthèse au Naturel - Institut de beauté Bio et experte en soin du visage, massage Kobido")).toBe("Parenthèse au Naturel");
    expect(shortEstablishmentName("Nailsica - Onglerie à Nice Côte d'Azur")).toBe("Nailsica");
    expect(shortEstablishmentName("SHE’S BEAUTY Institut de beauté privé à Toulouse Saint-Cyprien")).toBe("SHE’S BEAUTY Institut de beauté privé à");
    expect(shortEstablishmentName("Barber Club")).toBe("Barber Club");
    expect(shortEstablishmentName("L'Institut, Lyon 6")).toBe("L'Institut");
  });

  it("reconnaît un refus", () => {
    expect(looksLikeDecline("Non merci\n\nParenthèse au Naturel\nInstitut…")).toBe(true);
    expect(looksLikeDecline("Bonjour, pas intéressée pour le moment.")).toBe(true);
    expect(looksLikeDecline("Bonjour, ça m’intéresse, pouvez-vous m’appeler ?")).toBe(false);
  });
});
