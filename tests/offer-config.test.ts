import { describe, expect, it } from "vitest";
import { __internal } from "@/config/offer";

const { buildConfig } = __internal;

describe("configuration commerciale", () => {
  it("démarre en pré-lancement par défaut avec 39 € et 3 praticiens (F01, F02)", () => {
    const config = buildConfig({});
    expect(config.launchMode).toBe("prelaunch");
    expect(config.monthlyPriceExVat).toBe(39);
    expect(config.practitionerLimit).toBe(3);
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
    expect(() => buildConfig({ RESO_MONTHLY_PRICE_EX_VAT: "gratuit" })).toThrow(/invalide/);
  });
});
