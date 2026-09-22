import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ...(process.env.NODE_ENV === "production"
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]
    : []),
];

const nextConfig: NextConfig = {
  // La configuration commerciale (src/config/offer.ts) est lue dans process.env
  // côté serveur et côté client : ces clés sont figées au build pour que les
  // deux rendus soient identiques (sinon erreur d'hydratation en mode live).
  env: {
    RESO_LAUNCH_MODE: process.env.RESO_LAUNCH_MODE ?? "",
    RESO_MONTHLY_PRICE_EX_VAT: process.env.RESO_MONTHLY_PRICE_EX_VAT ?? "",
    RESO_PRACTITIONER_LIMIT: process.env.RESO_PRACTITIONER_LIMIT ?? "",
    RESO_TRIAL_DAYS: process.env.RESO_TRIAL_DAYS ?? "",
    RESO_SIGNUP_URL: process.env.RESO_SIGNUP_URL ?? "",
    RESO_LOGIN_URL: process.env.RESO_LOGIN_URL ?? "",
    RESO_SUPPORT_EMAIL: process.env.RESO_SUPPORT_EMAIL ?? "",
    RESO_LEGAL_ENTITY: process.env.RESO_LEGAL_ENTITY ?? "",
    RESO_PRIVACY_VERSION: process.env.RESO_PRIVACY_VERSION ?? "",
    RESO_SITE_URL: process.env.RESO_SITE_URL ?? "",
  },
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      // Pages contenant un jeton : jamais de referrer sortant, jamais en cache.
      {
        source: "/(confirmer-inscription|desinscription)",
        headers: [
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
};

export default nextConfig;
