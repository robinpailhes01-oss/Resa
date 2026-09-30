import "server-only";
import { offer } from "@/config/offer";
import { hasEncryptionKey } from "./secret-box";
import { MollieError, euros } from "./mollie";

/**
 * Client Mollie Connect (OAuth) : un établissement relie son propre compte
 * Mollie ; Reso crée ensuite les paiements de ses clients avec le jeton
 * d'accès de l'établissement. L'argent arrive directement chez l'établissement.
 *
 * Configuration : MOLLIE_CLIENT_ID (app_…), MOLLIE_CLIENT_SECRET,
 * MOLLIE_TOKEN_ENCRYPTION_KEY ; facultatifs : MOLLIE_REDIRECT_URI (sinon
 * <site>/api/mollie/callback), MOLLIE_CONNECT_TESTMODE=1 (paiements de test).
 */
const API = "https://api.mollie.com";
const AUTHORIZE_URL = "https://my.mollie.com/oauth2/authorize";

export const CONNECT_SCOPES = [
  "payments.read",
  "payments.write",
  "refunds.read",
  "refunds.write",
  "organizations.read",
  "profiles.read",
  "onboarding.read",
] as const;

type Env = Record<string, string | undefined>;

export function isMollieConnectConfigured(env: Env = process.env): boolean {
  return /^app_[A-Za-z0-9]+$/.test(env.MOLLIE_CLIENT_ID?.trim() ?? "") && Boolean(env.MOLLIE_CLIENT_SECRET?.trim()) && hasEncryptionKey(env);
}

export function isConnectTestMode(env: Env = process.env): boolean {
  return ["1", "true", "oui"].includes(env.MOLLIE_CONNECT_TESTMODE?.trim().toLowerCase() ?? "");
}

export function connectRedirectUri(env: Env = process.env): string {
  return env.MOLLIE_REDIRECT_URI?.trim() || new URL("/api/mollie/callback", offer.siteUrl).toString();
}

export function authorizeUrl(state: string, env: Env = process.env): string {
  const url = new URL(AUTHORIZE_URL);
  url.searchParams.set("client_id", env.MOLLIE_CLIENT_ID?.trim() ?? "");
  url.searchParams.set("redirect_uri", connectRedirectUri(env));
  url.searchParams.set("state", state);
  url.searchParams.set("scope", CONNECT_SCOPES.join(" "));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("approval_prompt", "auto");
  url.searchParams.set("locale", "fr_FR");
  return url.toString();
}

export interface TokenSet {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date;
  scope: string;
}

async function tokenRequest(body: Record<string, string>, fetchImpl: typeof fetch = fetch): Promise<TokenSet> {
  const basic = Buffer.from(`${process.env.MOLLIE_CLIENT_ID?.trim()}:${process.env.MOLLIE_CLIENT_SECRET?.trim()}`).toString("base64");
  const response = await fetchImpl(`${API}/oauth2/tokens`, {
    method: "POST",
    headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  const text = await response.text();
  if (!response.ok) throw new MollieError(`Mollie OAuth a répondu ${response.status} : ${text.replace(/\s+/g, " ").slice(0, 200)}`, response.status);
  const data = JSON.parse(text) as { access_token: string; refresh_token?: string; expires_in: number; scope?: string };
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? null,
    expiresAt: new Date(Date.now() + Math.max(60, data.expires_in - 60) * 1000),
    scope: data.scope ?? "",
  };
}

/** Échange le code d'autorisation (valable 30 secondes) contre les jetons. */
export function exchangeCode(code: string, fetchImpl?: typeof fetch): Promise<TokenSet> {
  return tokenRequest({ grant_type: "authorization_code", code, redirect_uri: connectRedirectUri() }, fetchImpl);
}

export function refreshTokens(refreshToken: string, fetchImpl?: typeof fetch): Promise<TokenSet> {
  return tokenRequest({ grant_type: "refresh_token", refresh_token: refreshToken }, fetchImpl);
}

/** Révoque le jeton de rafraîchissement (déconnexion) ; les erreurs sont ignorées. */
export async function revokeRefreshToken(refreshToken: string, fetchImpl: typeof fetch = fetch): Promise<void> {
  const basic = Buffer.from(`${process.env.MOLLIE_CLIENT_ID?.trim()}:${process.env.MOLLIE_CLIENT_SECRET?.trim()}`).toString("base64");
  await fetchImpl(`${API}/oauth2/tokens`, {
    method: "DELETE",
    headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/json" },
    body: JSON.stringify({ token_type_hint: "refresh_token", token: refreshToken }),
    signal: AbortSignal.timeout(10000),
  }).catch(() => undefined);
}

async function call<T>(accessToken: string, path: string, init: RequestInit = {}, fetchImpl: typeof fetch = fetch): Promise<T> {
  const response = await fetchImpl(`${API}/v2${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json", Accept: "application/json", ...(init.headers ?? {}) },
    signal: AbortSignal.timeout(15000),
  });
  const text = await response.text();
  if (!response.ok) throw new MollieError(`Mollie a répondu ${response.status} : ${text.replace(/\s+/g, " ").slice(0, 300)}`, response.status);
  return (text ? JSON.parse(text) : {}) as T;
}

export interface MerchantStatus {
  organizationId: string | null;
  organizationName: string | null;
  onboardingStatus: string | null;
  canReceivePayments: boolean;
  dashboardUrl: string | null;
  profiles: Array<{ id: string; name: string; status: string }>;
}

/** Organisation, état d'activation et profils de paiement du compte relié. */
export async function merchantStatus(accessToken: string, fetchImpl?: typeof fetch): Promise<MerchantStatus> {
  const [org, onboarding, profiles] = await Promise.all([
    call<{ id?: string; name?: string }>(accessToken, "/organizations/me", {}, fetchImpl).catch(() => ({}) as { id?: string; name?: string }),
    call<{ status?: string; canReceivePayments?: boolean; _links?: { dashboard?: { href?: string } } }>(accessToken, "/onboarding/me", {}, fetchImpl),
    call<{ _embedded?: { profiles?: Array<{ id: string; name: string; status: string }> } }>(accessToken, "/profiles?limit=50", {}, fetchImpl),
  ]);
  return {
    organizationId: org.id ?? null,
    organizationName: org.name ?? null,
    onboardingStatus: onboarding.status ?? null,
    canReceivePayments: Boolean(onboarding.canReceivePayments),
    dashboardUrl: onboarding._links?.dashboard?.href ?? null,
    profiles: (profiles._embedded?.profiles ?? []).map((p) => ({ id: p.id, name: p.name, status: p.status })),
  };
}

export interface ConnectPayment {
  id: string;
  status: string;
  amountCents: number;
  checkoutUrl: string | null;
  paidAt: Date | null;
  refundedCents: number;
}

type RawPayment = {
  id: string;
  status: string;
  amount: { value: string };
  amountRefunded?: { value: string };
  paidAt?: string;
  _links?: { checkout?: { href: string } };
};

const mapPayment = (p: RawPayment): ConnectPayment => ({
  id: p.id,
  status: p.status,
  amountCents: Math.round(Number(p.amount.value) * 100),
  checkoutUrl: p._links?.checkout?.href ?? null,
  paidAt: p.paidAt ? new Date(p.paidAt) : null,
  refundedCents: p.amountRefunded ? Math.round(Number(p.amountRefunded.value) * 100) : 0,
});

/** Paiement d'un client, créé sur le compte Mollie de l'établissement. */
export async function createConnectPayment(
  accessToken: string,
  input: { profileId: string; testmode: boolean; amountCents: number; description: string; redirectUrl: string; webhookUrl: string; metadata: Record<string, string> },
  fetchImpl?: typeof fetch,
): Promise<ConnectPayment> {
  const body = {
    amount: euros(input.amountCents),
    description: input.description,
    redirectUrl: input.redirectUrl,
    cancelUrl: input.redirectUrl,
    webhookUrl: input.webhookUrl,
    locale: "fr_FR",
    metadata: input.metadata,
    profileId: input.profileId,
    ...(input.testmode ? { testmode: true } : {}),
  };
  return mapPayment(await call<RawPayment>(accessToken, "/payments", { method: "POST", body: JSON.stringify(body) }, fetchImpl));
}

export async function getConnectPayment(accessToken: string, id: string, testmode: boolean, fetchImpl?: typeof fetch): Promise<ConnectPayment> {
  const query = testmode ? "?testmode=true" : "";
  return mapPayment(await call<RawPayment>(accessToken, `/payments/${encodeURIComponent(id)}${query}`, {}, fetchImpl));
}

export async function refundConnectPayment(
  accessToken: string,
  input: { paymentId: string; amountCents: number; description: string; testmode: boolean },
  fetchImpl?: typeof fetch,
): Promise<string> {
  const body = { amount: euros(input.amountCents), description: input.description, ...(input.testmode ? { testmode: true } : {}) };
  const data = await call<{ id: string }>(accessToken, `/payments/${encodeURIComponent(input.paymentId)}/refunds`, { method: "POST", body: JSON.stringify(body) }, fetchImpl);
  return data.id;
}
