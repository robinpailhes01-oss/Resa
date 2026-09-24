import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Réception d'emails via Resend (réponses des prospects) : vérification de la
 * signature des webhooks (format Svix) et lecture du contenu d'un email reçu.
 */

const TOLERANCE_S = 5 * 60;

export function isResendInboundConfigured(): boolean {
  return Boolean(process.env.RESEND_WEBHOOK_SECRET?.trim() && process.env.RESEND_API_KEY?.trim());
}

/** Vérifie `svix-id`, `svix-timestamp` et `svix-signature` (HMAC SHA-256 du corps brut, secret « whsec_… » en base64). */
export function verifyResendSignature(
  rawBody: string,
  headers: { id: string | null; timestamp: string | null; signature: string | null },
  secret: string,
  now = Date.now(),
): boolean {
  if (!headers.id || !headers.timestamp || !headers.signature) return false;
  const ts = Number(headers.timestamp);
  if (!Number.isFinite(ts) || Math.abs(now / 1000 - ts) > TOLERANCE_S) return false;
  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = createHmac("sha256", key).update(`${headers.id}.${headers.timestamp}.${rawBody}`).digest();
  return headers.signature.split(/\s+/).some((entry) => {
    const [version, sig] = entry.split(",");
    if (version !== "v1" || !sig) return false;
    const given = Buffer.from(sig, "base64");
    return given.length === expected.length && timingSafeEqual(given, expected);
  });
}

export interface ReceivedEmail {
  id: string;
  from: string;
  fromAddress: string;
  to: string[];
  subject: string;
  text: string;
}

/** Adresse nue d'un en-tête From (« Nom <a@b.fr> » → a@b.fr). */
export function bareAddress(value: string): string {
  const match = value.match(/<([^>]+)>/);
  return (match ? match[1] : value).trim().toLowerCase();
}

/** Texte lisible d'un email : version texte, sinon HTML dépouillé. */
export function readableText(text: string | null | undefined, html: string | null | undefined): string {
  const source = text?.trim() ? text : (html ?? "").replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/gi, " ").replace(/<br\s*\/?>|<\/p>|<\/div>/gi, "\n").replace(/<[^>]+>/g, " ");
  return source
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Lit le contenu complet d'un email reçu (l'événement webhook ne porte que les en-têtes). */
export async function fetchReceivedEmail(emailId: string, fetchImpl: typeof fetch = fetch): Promise<ReceivedEmail | null> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey || !/^[A-Za-z0-9_-]{6,}$/.test(emailId)) return null;
  const response = await fetchImpl(`https://api.resend.com/emails/receiving/${encodeURIComponent(emailId)}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) {
    console.error("[resend] lecture de l'email reçu impossible", response.status);
    return null;
  }
  const data = (await response.json()) as { id?: string; from?: string; to?: string[] | string; subject?: string; text?: string | null; html?: string | null };
  const from = data.from ?? "";
  return {
    id: data.id ?? emailId,
    from,
    fromAddress: bareAddress(from),
    to: Array.isArray(data.to) ? data.to : data.to ? [data.to] : [],
    subject: data.subject ?? "(sans objet)",
    text: readableText(data.text, data.html),
  };
}
