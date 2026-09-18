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
    expect(config.trialDays).toBeNull();
  });

  it("refuse le mode live sans URL d'inscription (règle de mise en production)", () => {
    expect(() => buildConfig({ RESO_LAUNCH_MODE: "live" })).toThrow(/RESO_SIGNUP_URL/);
  });

  it("accepte le mode live avec une URL HTTPS validée (F15)", () => {
    const config = buildConfig({ RESO_LAUNCH_MODE: "live", RESO_SIGNUP_URL: "https://app.example.com/inscription" });
    expect(config.launchMode).toBe("live");
    expect(config.signupUrl).toBe("https://app.example.com/inscription");
  });

  it("refuse une URL non HTTPS ou invalide", () => {
    expect(() => buildConfig({ RESO_SIGNUP_URL: "http://app.example.com" })).toThrow(/HTTPS/);
    expect(() => buildConfig({ RESO_SIGNUP_URL: "pas-une-url" })).toThrow(/URL absolue/);
  });

  it("refuse un mode inconnu et un prix invalide", () => {
    expect(() => buildConfig({ RESO_LAUNCH_MODE: "beta" })).toThrow(/inconnu/);
    expect(() => buildConfig({ RESO_MONTHLY_PRICE_EX_VAT: "gratuit" })).toThrow(/invalide/);
  });
});
