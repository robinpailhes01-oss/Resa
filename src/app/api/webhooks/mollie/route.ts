import { NextResponse } from "next/server";
import { handleMolliePayment } from "@/server/app/billing";

export const runtime = "nodejs";

/**
 * Webhook Mollie : le corps ne contient qu'un identifiant de paiement ; l'état
 * est toujours relu auprès de l'API Mollie avant toute mise à jour.
 */
export async function POST(request: Request) {
  let id: string | null = null;
  try {
    const form = await request.formData();
    const value = form.get("id");
    id = typeof value === "string" ? value : null;
  } catch {
    /* corps vide ou non formulaire */
  }
  if (!id || !/^(tr|sub)_[A-Za-z0-9]+$/.test(id)) return NextResponse.json({ status: "ignored" });
  try {
    const status = id.startsWith("tr_") ? await handleMolliePayment(id) : "ignored";
    return NextResponse.json({ status });
  } catch (error) {
    console.error("[mollie-webhook]", error instanceof Error ? error.message : error);
    // 200 volontaire : Mollie réessaie sinon ; la tâche quotidienne rattrape les paiements en attente.
    return NextResponse.json({ status: "error" });
  }
}
