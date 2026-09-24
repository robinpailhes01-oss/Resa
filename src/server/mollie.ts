import "server-only";

/**
 * Client Mollie (API v2) : clients, paiements, mandats, abonnements.
 * Configuration : MOLLIE_API_KEY (clé test_… ou live_…). Aucune donnée de
 * carte ne transite par Reso : le payeur saisit sa carte ou son IBAN chez Mollie.
 */
const API = "https://api.mollie.com/v2";

export class MollieError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
  }
}

export function isMollieConfigured(): boolean {
  return /^(test|live)_[A-Za-z0-9]{10,}$/.test(process.env.MOLLIE_API_KEY?.trim() ?? "");
}

export function isMollieTestMode(): boolean {
  return (process.env.MOLLIE_API_KEY?.trim() ?? "").startsWith("test_");
}

function key(): string {
  const value = process.env.MOLLIE_API_KEY?.trim();
  if (!value) throw new MollieError("MOLLIE_API_KEY manquante.");
  return value;
}

async function call<T>(path: string, init: RequestInit = {}, fetchImpl: typeof fetch = fetch): Promise<T> {
  const response = await fetchImpl(`${API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${key()}`, "Content-Type": "application/json", Accept: "application/json", ...(init.headers ?? {}) },
    signal: AbortSignal.timeout(15000),
  });
  const text = await response.text();
  if (!response.ok) throw new MollieError(`Mollie a répondu ${response.status} : ${text.replace(/\s+/g, " ").slice(0, 300)}`, response.status);
  return (text ? JSON.parse(text) : {}) as T;
}

/** Moyens de paiement activés sur le profil Mollie pour un premier paiement récurrent (diagnostic après passage en live). */
export async function listRecurringMethods(fetchImpl?: typeof fetch): Promise<Array<{ id: string; description: string }>> {
  const data = await call<{ _embedded?: { methods?: Array<{ id: string; description: string; status?: string }> } }>("/methods?sequenceType=first&amount[value]=46.80&amount[currency]=EUR", {}, fetchImpl);
  return (data._embedded?.methods ?? []).map((m) => ({ id: m.id, description: m.description }));
}

export const euros = (cents: number) => ({ currency: "EUR", value: (cents / 100).toFixed(2) });

export interface MolliePayment {
  id: string;
  status: "open" | "pending" | "authorized" | "paid" | "failed" | "canceled" | "expired" | string;
  amountCents: number;
  checkoutUrl: string | null;
  mandateId: string | null;
  subscriptionId: string | null;
  customerId: string | null;
  sequenceType: string | null;
  method: string | null;
  metadata: Record<string, string> | null;
  paidAt: Date | null;
}

type RawPayment = {
  id: string;
  status: string;
  amount: { value: string; currency: string };
  mandateId?: string;
  subscriptionId?: string;
  customerId?: string;
  sequenceType?: string;
  method?: string | null;
  metadata?: Record<string, string> | null;
  paidAt?: string;
  _links?: { checkout?: { href: string } };
};

const mapPayment = (p: RawPayment): MolliePayment => ({
  id: p.id,
  status: p.status,
  amountCents: Math.round(Number(p.amount.value) * 100),
  checkoutUrl: p._links?.checkout?.href ?? null,
  mandateId: p.mandateId ?? null,
  subscriptionId: p.subscriptionId ?? null,
  customerId: p.customerId ?? null,
  sequenceType: p.sequenceType ?? null,
  method: p.method ?? null,
  metadata: p.metadata ?? null,
  paidAt: p.paidAt ? new Date(p.paidAt) : null,
});

export async function createCustomer(input: { name: string; email: string; metadata?: Record<string, string> }, fetchImpl?: typeof fetch): Promise<string> {
  const data = await call<{ id: string }>("/customers", { method: "POST", body: JSON.stringify(input) }, fetchImpl);
  return data.id;
}

/**
 * Premier paiement d'un abonnement : encaisse le mois et enregistre le
 * moyen de paiement (mandat) pour les prélèvements suivants.
 */
export async function createFirstPayment(
  input: { customerId: string; amountCents: number; description: string; redirectUrl: string; webhookUrl: string; metadata: Record<string, string> },
  fetchImpl?: typeof fetch,
): Promise<MolliePayment> {
  const body = {
    amount: euros(input.amountCents),
    description: input.description,
    redirectUrl: input.redirectUrl,
    webhookUrl: input.webhookUrl,
    customerId: input.customerId,
    sequenceType: "first",
    locale: "fr_FR",
    metadata: input.metadata,
  };
  return mapPayment(await call<RawPayment>("/payments", { method: "POST", body: JSON.stringify(body) }, fetchImpl));
}

export async function getPayment(id: string, fetchImpl?: typeof fetch): Promise<MolliePayment> {
  return mapPayment(await call<RawPayment>(`/payments/${encodeURIComponent(id)}`, {}, fetchImpl));
}

export async function hasValidMandate(customerId: string, mandateId: string | null, fetchImpl?: typeof fetch): Promise<boolean> {
  const data = await call<{ _embedded?: { mandates?: Array<{ id: string; status: string }> } }>(`/customers/${encodeURIComponent(customerId)}/mandates`, {}, fetchImpl);
  const mandates = data._embedded?.mandates ?? [];
  return mandates.some((m) => m.status === "valid" && (!mandateId || m.id === mandateId));
}

export interface MollieSubscription {
  id: string;
  status: string;
  nextPaymentDate: string | null;
  description?: string | null;
}

/** Abonnement mensuel : Mollie prélève seul à chaque échéance et prévient le webhook. */
export async function createSubscription(
  input: { customerId: string; amountCents: number; description: string; startDate: string; webhookUrl: string; metadata: Record<string, string> },
  fetchImpl?: typeof fetch,
): Promise<MollieSubscription> {
  const body = {
    amount: euros(input.amountCents),
    interval: "1 month",
    startDate: input.startDate,
    description: input.description,
    webhookUrl: input.webhookUrl,
    metadata: input.metadata,
  };
  const data = await call<{ id: string; status: string; nextPaymentDate?: string }>(`/customers/${encodeURIComponent(input.customerId)}/subscriptions`, { method: "POST", body: JSON.stringify(body) }, fetchImpl);
  return { id: data.id, status: data.status, nextPaymentDate: data.nextPaymentDate ?? null };
}

export async function getSubscription(customerId: string, subscriptionId: string, fetchImpl?: typeof fetch): Promise<MollieSubscription | null> {
  try {
    const data = await call<{ id: string; status: string; nextPaymentDate?: string }>(`/customers/${encodeURIComponent(customerId)}/subscriptions/${encodeURIComponent(subscriptionId)}`, {}, fetchImpl);
    return { id: data.id, status: data.status, nextPaymentDate: data.nextPaymentDate ?? null };
  } catch (error) {
    if (error instanceof MollieError && error.status === 404) return null;
    throw error;
  }
}

/** Abonnements d'un client (pour retrouver un abonnement déjà créé, p. ex. après une notification simultanée). */
export async function listSubscriptions(customerId: string, fetchImpl?: typeof fetch): Promise<MollieSubscription[]> {
  const data = await call<{ _embedded?: { subscriptions?: Array<{ id: string; status: string; nextPaymentDate?: string; description?: string }> } }>(
    `/customers/${encodeURIComponent(customerId)}/subscriptions?limit=50`,
    {},
    fetchImpl,
  );
  return (data._embedded?.subscriptions ?? []).map((s) => ({ id: s.id, status: s.status, nextPaymentDate: s.nextPaymentDate ?? null, description: s.description ?? null }));
}

export async function cancelSubscription(customerId: string, subscriptionId: string, fetchImpl?: typeof fetch): Promise<void> {
  try {
    await call(`/customers/${encodeURIComponent(customerId)}/subscriptions/${encodeURIComponent(subscriptionId)}`, { method: "DELETE" }, fetchImpl);
  } catch (error) {
    if (error instanceof MollieError && (error.status === 404 || error.status === 410)) return;
    throw error;
  }
}
