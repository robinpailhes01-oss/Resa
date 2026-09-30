import { NextResponse } from "next/server";
import { after } from "next/server";
import { syncBookingPayment } from "@/server/app/booking-payments";
import { processEmailJobs } from "@/server/app/notifications";

export const runtime = "nodejs";

/**
 * Webhook des paiements clients encaissés sur le compte Mollie des
 * établissements (Mollie Connect). Le corps ne contient qu'un identifiant :
 * l'état est toujours relu chez Mollie avec le jeton de l'établissement.
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
  if (!id || !/^tr_[A-Za-z0-9]+$/.test(id)) return NextResponse.json({ status: "ignored" });
  try {
    const status = await syncBookingPayment(id);
    if (status === "paid") {
      after(async () => {
        try {
          await processEmailJobs();
        } catch (error) {
          console.error("[emails] traitement", error instanceof Error ? error.message : error);
        }
      });
    }
    return NextResponse.json({ status });
  } catch (error) {
    console.error("[mollie-connect-webhook]", error instanceof Error ? error.message : error);
    // Mollie réessaie en cas d'erreur HTTP : on laisse une chance de rattrapage.
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
