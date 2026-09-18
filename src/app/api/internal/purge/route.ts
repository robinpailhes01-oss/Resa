import { NextResponse } from "next/server";
import { isAuthorizedInternal } from "@/server/http";
import { purgeWaitlist } from "@/server/waitlist/service";

export const runtime = "nodejs";

/** Purge planifiée : demandes non confirmées (7 j) et liste confirmée (12 mois) — durées à valider (§15). */
export async function POST(request: Request) {
  if (!isAuthorizedInternal(request)) return NextResponse.json({ status: "forbidden" }, { status: 403 });
  try {
    const removed = await purgeWaitlist();
    return NextResponse.json({ status: "ok", removed });
  } catch (error) {
    console.error("[purge] échec", error instanceof Error ? error.message : "erreur inconnue");
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
