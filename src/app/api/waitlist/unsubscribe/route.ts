import { NextResponse } from "next/server";
import { getRateLimiters } from "@/server/rate-limit";
import { clientIp, isSameOrigin, readLimitedBody } from "@/server/http";
import { unsubscribeFromWaitlist } from "@/server/waitlist/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const redirect = (state: string) => NextResponse.redirect(new URL(`/desinscription?etat=${state}`, request.url), 303);
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
    const outcome = await unsubscribeFromWaitlist(token);
    return redirect(outcome === "unsubscribed" ? "retire" : "invalide");
  } catch (error) {
    console.error("[waitlist] désinscription échouée", error instanceof Error ? error.message : "erreur inconnue");
    return redirect("erreur");
  }
}
