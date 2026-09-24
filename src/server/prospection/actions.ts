"use server";

import { redirect } from "next/navigation";
import { unsubscribeProspect } from "@/server/prospection";

/** Désinscription d'un prospect (formulaire de la page /ne-plus-me-contacter). */
export async function unsubscribeProspectAction(formData: FormData): Promise<void> {
  const token = String(formData.get("token") ?? "");
  let ok = false;
  try {
    ok = await unsubscribeProspect(token);
  } catch (error) {
    console.error("[prospection] désinscription échouée", error instanceof Error ? error.message : error);
    redirect("/ne-plus-me-contacter?etat=erreur");
  }
  redirect(ok ? "/ne-plus-me-contacter?etat=ok" : "/ne-plus-me-contacter?etat=invalide");
}
