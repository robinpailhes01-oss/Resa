import { NextResponse } from "next/server";
import { getRateLimiters } from "@/server/rate-limit";
import { clientIp, isSameOrigin, readLimitedBody } from "@/server/http";
import { confirmWaitlistSignup } from "@/server/waitlist/service";

export const runtime = "nodejs";

/** POST de confirmation : consomme le jeton puis redirige sans le jeton dans l'URL. */
export async function POST(request: Request) {
  const redirect = (state: string) => NextResponse.redirect(new URL(`/confirmer-inscription?etat=${state}`, request.url), 303);
  if (!isSameOrigin(request)) return redirect("invalide");
  if (!getRateLimiters().confirm.hit(clientIp(request))) return redirect("limite");

  let token = "";
  try {
    const body = await readLimitedBody(request);
    token = new URLSearchParams(body).get("token") ?? "";
  } catch {
    return redirect("invalide");
  }

  try {
    const outcome = await confirmWaitlistSignup(token);
    switch (outcome) {
      case "confirmed":
      case "already_confirmed":
        return redirect("confirme");
      case "expired":
        return redirect("expire");
      default:
        return redirect("invalide");
    }
  } catch (error) {
    console.error("[waitlist] confirmation échouée", error instanceof Error ? error.message : "erreur inconnue");
    return redirect("erreur");
  }
}
