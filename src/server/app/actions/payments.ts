"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { FormState } from "@/components/app/ActionForm";
import { paymentsPage } from "@/content/fr/app";
import { validatePaymentRule, type DepositKind, type PaymentMode, type PaymentRule } from "@/lib/booking-payment";
import { requireEstablishment } from "@/server/auth/guards";
import { authorizeUrl, isMollieConnectConfigured } from "@/server/mollie-connect";
import { createConnectState, disconnectMollie, getMollieConnection, refreshMollieConnection, updatePaymentRule } from "../booking-payments";
import { GENERIC_ERROR, int, priceToCents, str } from "./shared";

/** Seul le propriétaire du compte relie ou délie le compte Mollie qui reçoit l'argent. */
async function requireOwner() {
  const ctx = await requireEstablishment();
  if (ctx.establishment.ownerUserId !== ctx.user.id) redirect("/app/paiements?connexion=proprietaire");
  return ctx;
}

export async function startMollieConnectAction(): Promise<void> {
  const { user, establishment } = await requireOwner();
  if (!isMollieConnectConfigured()) redirect("/app/paiements?connexion=indisponible");
  const state = await createConnectState(establishment.id, user.id);
  redirect(authorizeUrl(state));
}

export async function refreshMollieAction(): Promise<void> {
  const { establishment } = await requireEstablishment();
  let outcome = "actualise";
  try {
    await refreshMollieConnection(establishment.id);
  } catch (error) {
    console.error("[mollie-connect] actualisation", error instanceof Error ? error.message : error);
    outcome = "erreur";
  }
  revalidatePath("/app/paiements");
  redirect(`/app/paiements?connexion=${outcome}`);
}

export async function disconnectMollieAction(): Promise<void> {
  const { establishment } = await requireOwner();
  await disconnectMollie(establishment.id);
  revalidatePath("/app/paiements");
  redirect("/app/paiements?connexion=deconnecte");
}

const modes: PaymentMode[] = ["none", "deposit", "full"];
const kinds: DepositKind[] = ["percent", "fixed"];

export async function updatePaymentRuleAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const { establishment } = await requireEstablishment();
  const mode = str(fd, "mode") as PaymentMode;
  const depositKind = str(fd, "depositKind") as DepositKind;
  if (!modes.includes(mode) || !kinds.includes(depositKind)) return { error: GENERIC_ERROR };
  const rule: PaymentRule = {
    mode,
    depositKind,
    depositValue: depositKind === "percent" ? int(fd, "depositPercent", 30) : priceToCents(str(fd, "depositAmount")),
  };
  if (mode !== "none") {
    const connection = await getMollieConnection(establishment.id);
    if (!connection) return { error: paymentsPage.rule.needsConnection };
  }
  const invalid = validatePaymentRule(rule);
  if (invalid) return { fieldErrors: { [depositKind === "percent" ? "depositPercent" : "depositAmount"]: invalid } };
  // Règle désactivée : on garde la dernière valeur d'acompte pour la retrouver plus tard.
  const stored = mode === "deposit" ? rule : { ...rule, depositKind: establishment.depositKind, depositValue: establishment.depositValue };
  try {
    await updatePaymentRule(establishment.id, stored);
  } catch {
    return { error: GENERIC_ERROR };
  }
  revalidatePath("/app/paiements");
  return { success: paymentsPage.rule.saved };
}
