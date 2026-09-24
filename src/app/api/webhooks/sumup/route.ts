import { NextResponse } from "next/server";
import { confirmPayment } from "@/server/app/billing";

export const runtime = "nodejs";

/**
 * Notification SumUp (return_url) : le corps n'est pas considéré comme fiable ;
 * on relit l'état du paiement auprès de l'API SumUp avant toute mise à jour.
 */
export async function POST(request: Request) {
  let body: { id?: string; checkout_reference?: string } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    /* corps vide ou non JSON : rien à traiter */
  }
  const id = typeof body.id === "string" ? body.id : undefined;
  const reference = typeof body.checkout_reference === "string" ? body.checkout_reference : undefined;
  if (!id && !reference) return NextResponse.json({ status: "ignored" });
  try {
    const payment = await confirmPayment(id ? { checkoutId: id } : { reference });
    return NextResponse.json({ status: payment ? payment.status : "unknown" });
  } catch (error) {
    console.error("[sumup-webhook]", error instanceof Error ? error.message : error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
