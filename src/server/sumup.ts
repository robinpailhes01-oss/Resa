import "server-only";

/**
 * SumUp Checkouts API (paiement hébergé) : création d'un paiement et lecture
 * de son état. Configuration : SUMUP_API_KEY (clé secrète) et
 * SUMUP_MERCHANT_CODE. Aucune donnée de carte ne transite par Reso.
 */
const API = "https://api.sumup.com/v0.1";

export class SumUpError extends Error {}

export function isSumUpConfigured(): boolean {
  return Boolean(process.env.SUMUP_API_KEY?.trim() && process.env.SUMUP_MERCHANT_CODE?.trim());
}

function credentials(): { key: string; merchant: string } {
  const key = process.env.SUMUP_API_KEY?.trim();
  const merchant = process.env.SUMUP_MERCHANT_CODE?.trim();
  if (!key || !merchant) throw new SumUpError("SumUp non configuré (SUMUP_API_KEY, SUMUP_MERCHANT_CODE).");
  return { key, merchant };
}

export interface HostedCheckout {
  id: string;
  hostedUrl: string;
  status: string;
}

export interface CheckoutState {
  id: string;
  status: "PENDING" | "PAID" | "FAILED" | "EXPIRED" | string;
  amount: number;
  currency: string;
  reference: string | null;
  transactionCode: string | null;
}

async function call<T>(path: string, init: RequestInit, fetchImpl: typeof fetch): Promise<T> {
  const { key } = credentials();
  const response = await fetchImpl(`${API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", Accept: "application/json", ...(init.headers ?? {}) },
    signal: AbortSignal.timeout(15000),
  });
  const text = await response.text();
  if (!response.ok) throw new SumUpError(`SumUp a répondu ${response.status} : ${text.replace(/\s+/g, " ").slice(0, 300)}`);
  return (text ? JSON.parse(text) : {}) as T;
}

/** Crée un paiement hébergé : le client paie sur une page SumUp, puis revient sur redirectUrl. */
export async function createHostedCheckout(
  input: { reference: string; amountCents: number; description: string; redirectUrl: string; returnUrl: string },
  fetchImpl: typeof fetch = fetch,
): Promise<HostedCheckout> {
  const { merchant } = credentials();
  const body = {
    checkout_reference: input.reference,
    amount: Number((input.amountCents / 100).toFixed(2)),
    currency: "EUR",
    merchant_code: merchant,
    description: input.description,
    redirect_url: input.redirectUrl,
    return_url: input.returnUrl,
    hosted_checkout: { enabled: true },
  };
  const data = await call<{ id?: string; hosted_checkout_url?: string; status?: string }>("/checkouts", { method: "POST", body: JSON.stringify(body) }, fetchImpl);
  if (!data.id || !data.hosted_checkout_url) throw new SumUpError("Réponse SumUp incomplète (pas d'URL de paiement).");
  return { id: data.id, hostedUrl: data.hosted_checkout_url, status: data.status ?? "PENDING" };
}

export async function getCheckout(id: string, fetchImpl: typeof fetch = fetch): Promise<CheckoutState> {
  const data = await call<{ id: string; status: string; amount: number; currency: string; checkout_reference?: string; transaction_code?: string; transactions?: Array<{ transaction_code?: string; status?: string }> }>(
    `/checkouts/${encodeURIComponent(id)}`,
    { method: "GET" },
    fetchImpl,
  );
  const successful = data.transactions?.find((t) => t.status === "SUCCESSFUL");
  return {
    id: data.id,
    status: data.status,
    amount: data.amount,
    currency: data.currency,
    reference: data.checkout_reference ?? null,
    transactionCode: data.transaction_code ?? successful?.transaction_code ?? null,
  };
}
