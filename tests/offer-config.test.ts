import { describe, expect, it } from "vitest";
import { __internal } from "@/config/offer";

const { buildConfig } = __internal;

describe("configuration commerciale", () => {
  it("démarre en pré-lancement par défaut avec 29 € TTC et 3 praticiens (F01, F02)", () => {
    const config = buildConfig({});
    expect(config.platformFeePercent).toBe(2);
    expect(config.social).toEqual({ instagram: null, tiktok: null, facebook: null, linkedin: null });
    expect(buildConfig({ RESO_INSTAGRAM_URL: "instagram.com/reso.app" }).social.instagram).toBe("https://instagram.com/reso.app");
    expect(() => buildConfig({ RESO_TIKTOK_URL: "http://tiktok.com/@reso" })).toThrow(/https/);
    expect(buildConfig({ MOLLIE_PLATFORM_FEE_PERCENT: "1,5" }).platformFeePercent).toBe(1.5);
    expect(() => buildConfig({ MOLLIE_PLATFORM_FEE_PERCENT: "25" })).toThrow(/entre 0 et 10/);
    expect(config.launchMode).toBe("prelaunch");
    expect(config.monthlyPriceInclVat).toBe(29);
    expect(config.practitionerLimit).toBeNull();
    expect(buildConfig({ RESO_PRACTITIONER_LIMIT: "3" }).practitionerLimit).toBe(3);
    expect(buildConfig({ RESO_PRACTITIONER_LIMIT: "illimité" }).practitionerLimit).toBeNull();
    expect(config.signupUrl).toBeNull();
    expect(config.loginUrl).toBeNull();
    expect(config.trialDays).toBe(7);
  });

  it("en mode live, pointe par défaut sur les pages intégrées d'inscription et de connexion", () => {
    const config = buildConfig({ RESO_LAUNCH_MODE: "live" });
    expect(config.launchMode).toBe("live");
    expect(config.signupUrl).toBe("/inscription");
    expect(config.loginUrl).toBe("/connexion");
  });

  it("accepte le mode live avec une URL HTTPS validée (F15)", () => {
    const config = buildConfig({ RESO_LAUNCH_MODE: "live", RESO_SIGNUP_URL: "https://app.example.com/inscription" });
    expect(config.launchMode).toBe("live");
    expect(config.signupUrl).toBe("https://app.example.com/inscription");
  });

  it("refuse une URL non HTTPS ou invalide", () => {
    expect(() => buildConfig({ RESO_SIGNUP_URL: "http://app.example.com" })).toThrow(/HTTPS/);
    expect(() => buildConfig({ RESO_SIGNUP_URL: "pas-une-url" })).toThrow(/URL absolue/);
    expect(() => buildConfig({ RESO_SIGNUP_URL: "//evil.example" })).toThrow(/URL absolue/);
  });

  it("accepte les chemins internes de l'application", () => {
    const config = buildConfig({ RESO_LAUNCH_MODE: "live", RESO_SIGNUP_URL: "/inscription", RESO_LOGIN_URL: "/connexion" });
    expect(config.signupUrl).toBe("/inscription");
    expect(config.loginUrl).toBe("/connexion");
  });

  it("refuse un mode inconnu et un prix invalide", () => {
    expect(() => buildConfig({ RESO_LAUNCH_MODE: "beta" })).toThrow(/inconnu/);
    expect(() => buildConfig({ RESO_MONTHLY_PRICE_TTC: "gratuit" })).toThrow(/invalide/);
    // L'ancienne variable HT ne peut plus écraser le tarif TTC.
    expect(buildConfig({ RESO_MONTHLY_PRICE_EX_VAT: "39" }).monthlyPriceInclVat).toBe(29);
  });

  it("refuse une adresse de contact masquée ou invalide, accepte une adresse en clair", () => {
    expect(() => buildConfig({ RESO_SUPPORT_EMAIL: "•••••••••••" })).toThrow(/RESO_SUPPORT_EMAIL invalide/);
    expect(() => buildConfig({ RESO_SUPPORT_EMAIL: "contact" })).toThrow(/RESO_SUPPORT_EMAIL invalide/);
    expect(buildConfig({ RESO_SUPPORT_EMAIL: " Contact@Reso-App.fr " }).supportEmail).toBe("contact@reso-app.fr");
  });
});
