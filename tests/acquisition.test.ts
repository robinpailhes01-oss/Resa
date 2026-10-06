/**
 * Mesure de l'acquisition : origine des visites, consentement, envoi à Meta.
 */
import { describe, expect, it, vi } from "vitest";
import { attributionFromUrl, decodeAttribution, encodeAttribution, fbcFrom, isTrackedPath, withoutAdIds } from "@/lib/attribution";
import { hasAdsConsent, parseConsent, readCookie } from "@/lib/consent";

vi.mock("server-only", () => ({}));

const now = new Date("2026-10-06T10:00:00Z");

describe("origine de la visite", () => {
  it("lit les UTM et le clic Meta", () => {
    const a = attributionFromUrl(new URL("https://www.reso-app.fr/?utm_source=meta&utm_medium=paid&utm_campaign=t001&utm_content=site_pub01&fbclid=IwAR0abcdefghijk"), "https://l.instagram.com/", now);
    expect(a).toMatchObject({ utm_source: "meta", utm_campaign: "t001", utm_content: "site_pub01", landingPath: "/", referrerHost: "l.instagram.com" });
    expect(fbcFrom(a!)).toBe(`fb.1.${now.getTime()}.IwAR0abcdefghijk`);
  });

  it("ignore une visite sans paramètre de campagne", () => {
    expect(attributionFromUrl(new URL("https://www.reso-app.fr/tarifs"), null, now)).toBeNull();
  });

  it("attribue à Meta un clic sans UTM", () => {
    expect(attributionFromUrl(new URL("https://www.reso-app.fr/?fbclid=IwAR0abcdefghijk"), null, now)?.utm_source).toBe("meta");
  });

  it("nettoie les valeurs et survit à l'aller-retour du cookie", () => {
    const a = attributionFromUrl(new URL("https://www.reso-app.fr/?utm_campaign=%3Cscript%3Et001"), null, now)!;
    expect(a.utm_campaign).toBe("scriptt001");
    expect(decodeAttribution(encodeAttribution(a))).toEqual(a);
    expect(decodeAttribution("%7Bpas-du-json")).toBeNull();
  });

  it("retire les identifiants publicitaires sans consentement", () => {
    const a = attributionFromUrl(new URL("https://www.reso-app.fr/?utm_source=meta&fbclid=IwAR0abcdefghijk"), null, now)!;
    const b = withoutAdIds(a);
    expect(b.fbclid).toBeUndefined();
    expect(fbcFrom(b)).toBeUndefined();
    expect(b.utm_source).toBe("meta");
  });

  it("ne mesure ni l'espace pro, ni l'admin, ni les pages des salons", () => {
    expect(isTrackedPath("/")).toBe(true);
    expect(isTrackedPath("/inscription")).toBe(true);
    for (const p of ["/app", "/app/agenda", "/admin/acquisition", "/r/maison-alba", "/rdv/abc", "/api/track/visit"]) expect(isTrackedPath(p)).toBe(false);
  });
});

describe("consentement", () => {
  it("reconnaît les deux choix", () => {
    expect(parseConsent("ads")).toBe("ads");
    expect(parseConsent("none")).toBe("none");
    expect(parseConsent("oui")).toBeNull();
    expect(hasAdsConsent("ads")).toBe(true);
    expect(hasAdsConsent(undefined)).toBe(false);
    expect(readCookie("a=1; reso_consent=ads; b=2", "reso_consent")).toBe("ads");
  });
});

describe("API Conversions Meta", () => {
  it("hache les données personnelles et porte la valeur de l'abonnement", async () => {
    const { buildMetaPayload, sha256 } = await import("@/server/acquisition/meta");
    const body = buildMetaPayload(
      { name: "Subscribe", eventId: "subscribe-1", eventTime: now, sourceUrl: "https://www.reso-app.fr/app/abonnement", email: " Pro@Example.com ", externalId: "user-1", fbc: "fb.1.1.abc", valueCents: 2900 },
      "TEST123",
    );
    const event = body.data[0] as Record<string, unknown> & { user_data: Record<string, unknown> };
    expect(event.event_name).toBe("Subscribe");
    expect(event.event_time).toBe(Math.floor(now.getTime() / 1000));
    expect(event.user_data.em).toEqual([sha256("pro@example.com")]);
    expect(JSON.stringify(body)).not.toContain("example.com");
    expect(event.custom_data).toEqual({ value: 29, currency: "EUR" });
    expect(body.test_event_code).toBe("TEST123");
  });

  it("n'envoie rien sans configuration", async () => {
    const { sendMetaEvent } = await import("@/server/acquisition/meta");
    const fetchImpl = vi.fn();
    const result = await sendMetaEvent({ name: "StartTrial", eventId: "x", eventTime: now, sourceUrl: "https://x", email: null, externalId: "u" }, fetchImpl as unknown as typeof fetch);
    expect(result.status).toBe("skipped");
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});

describe("rapport Telegram quotidien", () => {
  it("résume le tunnel, les pubs et l'envoi à Meta", async () => {
    vi.doMock("@/server/telegram", () => ({ escapeHtml: (v: string) => v.replace(/</g, "&lt;") }));
    const { formatAcquisitionReport } = await import("@/server/acquisition/daily-report");
    const row = { source: "meta", campaign: "t001", content: "site_pub01", visits: 40, signups: 3, onboarded: 2, published: 1, activated: 1, paid: 0 };
    const report = {
      rows: [row],
      total: row,
      meta: { pixel: true, capi: true, testMode: false, sent: 4, skipped: 1, errors: 0, lastError: null },
      salonPayments: { count: 0, amountCents: 0, feeCents: 0 },
      latest: [],
    };
    const text = formatAcquisitionReport(report, report);
    expect(text).toContain("Inscriptions 3");
    expect(text).toContain("Abonnés payants 0");
    expect(text).toContain("meta · t001 · site_pub01 : 40 visites, 3 inscr.");
    expect(text).toContain("4 envoyés · 1 sans accord cookies · 0 erreurs");
  });
});
