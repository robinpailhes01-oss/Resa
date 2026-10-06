import "server-only";
import { createHash } from "node:crypto";

/**
 * API Conversions de Meta (envoi serveur des étapes du tunnel).
 * Configuration : NEXT_PUBLIC_META_PIXEL_ID (identifiant du jeu de données) et
 * META_CAPI_TOKEN (jeton d'accès, secret). META_TEST_EVENT_CODE (facultatif)
 * envoie en mode test (Gestionnaire d'événements → Tester les événements).
 */

export type MetaEventName = "CompleteRegistration" | "StartTrial" | "Activation" | "Subscribe";

export type MetaEventInput = {
  name: MetaEventName;
  eventId: string;
  eventTime: Date;
  sourceUrl: string;
  email: string | null;
  externalId: string;
  fbc?: string | null;
  fbp?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  valueCents?: number | null;
};

export function metaConfig(env: Record<string, string | undefined> = process.env) {
  const pixelId = env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || "";
  const token = env.META_CAPI_TOKEN?.trim() || "";
  return {
    pixelId,
    token,
    testCode: env.META_TEST_EVENT_CODE?.trim() || "",
    version: env.META_GRAPH_VERSION?.trim() || "v23.0",
    enabled: Boolean(/^\d{5,20}$/.test(pixelId) && token),
  };
}

export const sha256 = (value: string) => createHash("sha256").update(value.trim().toLowerCase()).digest("hex");

/** Corps de la requête Meta (données personnelles hachées, jamais en clair). */
export function buildMetaPayload(e: MetaEventInput, testCode = "") {
  const userData: Record<string, unknown> = { external_id: [sha256(e.externalId)] };
  if (e.email) userData.em = [sha256(e.email)];
  if (e.fbc) userData.fbc = e.fbc;
  if (e.fbp) userData.fbp = e.fbp;
  if (e.ip) userData.client_ip_address = e.ip;
  if (e.userAgent) userData.client_user_agent = e.userAgent;
  const event: Record<string, unknown> = {
    event_name: e.name,
    event_time: Math.floor(e.eventTime.getTime() / 1000),
    event_id: e.eventId,
    action_source: "website",
    event_source_url: e.sourceUrl,
    user_data: userData,
  };
  if (e.valueCents != null) event.custom_data = { value: Math.round(e.valueCents) / 100, currency: "EUR" };
  return { data: [event], ...(testCode ? { test_event_code: testCode } : {}) };
}

/** Envoie un événement. Ne lève jamais : renvoie le statut à enregistrer. */
export async function sendMetaEvent(e: MetaEventInput, fetchImpl: typeof fetch = fetch): Promise<{ status: "sent" | "error" | "skipped"; error?: string }> {
  const cfg = metaConfig();
  if (!cfg.enabled) return { status: "skipped" };
  try {
    const response = await fetchImpl(`https://graph.facebook.com/${cfg.version}/${cfg.pixelId}/events?access_token=${encodeURIComponent(cfg.token)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildMetaPayload(e, cfg.testCode)),
      signal: AbortSignal.timeout(6000),
    });
    if (!response.ok) {
      const text = (await response.text().catch(() => "")).slice(0, 300);
      return { status: "error", error: `${response.status} ${text}` };
    }
    return { status: "sent" };
  } catch (error) {
    return { status: "error", error: error instanceof Error ? error.message.slice(0, 300) : "erreur réseau" };
  }
}
