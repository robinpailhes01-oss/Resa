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

/**
 * Mollie Connect : l'adresse de retour déclarée chez Mollie (MOLLIE_REDIRECT_URI)
 * peut avoir un autre chemin que /api/mollie/callback ; elle est alors
 * redirigée en interne vers la route de retour, sans rien changer chez Mollie.
 */
function mollieRedirectPath(): string | null {
  try {
    const raw = process.env.MOLLIE_REDIRECT_URI?.trim();
    if (!raw) return null;
    const path = new URL(raw).pathname.replace(/\/+$/, "");
    return path && path !== "/api/mollie/callback" && path.startsWith("/") ? path : null;
  } catch {
    return null;
  }
}
const mollieCallbackAlias = mollieRedirectPath();

const nextConfig: NextConfig = {
  // La configuration commerciale (src/config/offer.ts) est lue dans process.env
  // côté serveur et côté client : ces clés sont figées au build pour que les
  // deux rendus soient identiques (sinon erreur d'hydratation en mode live).
  env: {
    RESO_LAUNCH_MODE: process.env.RESO_LAUNCH_MODE ?? "",
    RESO_MONTHLY_PRICE_TTC: process.env.RESO_MONTHLY_PRICE_TTC ?? "",
    RESO_PRACTITIONER_LIMIT: process.env.RESO_PRACTITIONER_LIMIT ?? "",
    RESO_TRIAL_DAYS: process.env.RESO_TRIAL_DAYS ?? "",
    RESO_SIGNUP_URL: process.env.RESO_SIGNUP_URL ?? "",
    RESO_LOGIN_URL: process.env.RESO_LOGIN_URL ?? "",
    RESO_SUPPORT_EMAIL: process.env.RESO_SUPPORT_EMAIL ?? "",
    RESO_LEGAL_ENTITY: process.env.RESO_LEGAL_ENTITY ?? "",
    RESO_PRIVACY_VERSION: process.env.RESO_PRIVACY_VERSION ?? "",
    RESO_SITE_URL: process.env.RESO_SITE_URL ?? "",
    MOLLIE_PLATFORM_FEE_PERCENT: process.env.MOLLIE_PLATFORM_FEE_PERCENT ?? "",
    RESO_DEMO_WHATSAPP: process.env.RESO_DEMO_WHATSAPP ?? "",
    RESO_INSTAGRAM_URL: process.env.RESO_INSTAGRAM_URL ?? "",
    RESO_TIKTOK_URL: process.env.RESO_TIKTOK_URL ?? "",
    RESO_FACEBOOK_URL: process.env.RESO_FACEBOOK_URL ?? "",
    RESO_LINKEDIN_URL: process.env.RESO_LINKEDIN_URL ?? "",
  },
  poweredByHeader: false,
  async rewrites() {
    return mollieCallbackAlias ? [{ source: mollieCallbackAlias, destination: "/api/mollie/callback" }] : [];
  },
  reactStrictMode: true,
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      // Pages contenant un jeton : jamais de referrer sortant, jamais en cache.
      {
        source: "/(confirmer-inscription|desinscription|ne-plus-me-contacter)",
        headers: [
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
      // Page de suivi protégée par un secret dans l'URL : jamais de referrer, jamais en cache.
      {
        source: "/admin/:path*",
        headers: [
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
};

export default nextConfig;
