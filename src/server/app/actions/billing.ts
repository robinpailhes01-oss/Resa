"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { FormState } from "@/components/app/ActionForm";
import { requireEstablishment } from "@/server/auth/guards";
import { preparePayment, setCancelAtPeriodEnd } from "../billing";

/** Bouton « Payer » : crée (ou réutilise) le paiement SumUp et redirige vers la page de paiement. */
export async function startPaymentAction(_prev: FormState, _fd: FormData): Promise<FormState> {
  const { establishment } = await requireEstablishment();
  let url: string | null = null;
  try {
    const payment = await preparePayment(establishment);
    url = payment.hostedUrl;
  } catch (error) {
    console.error("[billing] démarrage paiement", error instanceof Error ? error.message : error);
    return { error: "Le paiement n’a pas pu être préparé. Réessayez dans quelques instants ou écrivez-nous." };
  }
  if (!url) return { error: "Le paiement n’a pas pu être préparé." };
  redirect(url);
}

export async function cancelSubscriptionAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const { establishment } = await requireEstablishment();
  const resume = fd.get("resume") === "1";
  try {
    await setCancelAtPeriodEnd(establishment.id, !resume);
  } catch (error) {
    console.error("[billing] résiliation", error instanceof Error ? error.message : error);
    return { error: "Impossible d’enregistrer votre demande pour le moment." };
  }
  revalidatePath("/app/abonnement");
  return { success: resume ? "Votre abonnement continuera après la période en cours." : "Résiliation enregistrée : votre abonnement s’arrêtera à la fin de la période payée." };
}
