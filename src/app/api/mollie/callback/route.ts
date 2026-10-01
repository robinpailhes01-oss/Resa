import { NextResponse } from "next/server";
import { offer } from "@/config/offer";
import { getCurrentUser } from "@/server/auth/session";
import { ConnectError, completeConnection } from "@/server/app/booking-payments";
import { isMollieConnectConfigured } from "@/server/mollie-connect";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const back = (outcome: string) => NextResponse.redirect(new URL(`/app/paiements?connexion=${outcome}`, offer.siteUrl), 303);

/**
 * Retour de Mollie après l'autorisation (Mollie Connect) : adresse à
 * déclarer comme « Redirect URL » de l'application Mollie.
 */
export async function GET(request: Request) {
  if (!isMollieConnectConfigured()) return back("indisponible");
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  if (error) return back(error === "access_denied" ? "refusee" : "erreur");
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) return back("erreur");
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/connexion?next=/app/paiements", offer.siteUrl), 303);
  try {
    await completeConnection({ state, code, userId: user.id });
    return back("ok");
  } catch (e) {
    console.error("[mollie-connect] retour", e instanceof Error ? e.message : e);
    return back(e instanceof ConnectError ? "expiree" : "erreur");
  }
}
