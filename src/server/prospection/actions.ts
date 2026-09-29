"use server";

import { redirect } from "next/navigation";
import { allowPendingFollowUps, setProspectOutcome, unsubscribeProspect } from "@/server/prospection";
import { requireAdmin } from "@/server/prospection/admin";

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

/** Actions de la page de suivi (/admin/prospection) : marquer une réponse, un refus, annuler, autoriser les relances. */
export async function prospectionAdminAction(formData: FormData): Promise<void> {
  await requireAdmin("/admin/prospection");
  const op = String(formData.get("op") ?? "");
  const id = String(formData.get("id") ?? "");
  let done = "";
  try {
    if (op === "replied" || op === "declined" || op === "undo") {
      if (await setProspectOutcome(id, op)) done = op;
    } else if (op === "allow") {
      await allowPendingFollowUps();
      done = "allow";
    }
  } catch (error) {
    console.error("[prospection] action de suivi échouée", error instanceof Error ? error.message : error);
  }
  redirect(`/admin/prospection${done ? `?ok=${done}` : ""}${id ? `#p-${id}` : ""}`);
}
