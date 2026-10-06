import { NextResponse } from "next/server";
import { CLIENT_STEPS, type JourneyStep } from "@/lib/journey";
import { recordJourney } from "@/server/acquisition/journey";
import { getCurrentUser } from "@/server/auth/session";
import { isSameOrigin, readLimitedBody } from "@/server/http";

export const runtime = "nodejs";

/** Étape du parcours signalée par le navigateur d'un pro connecté (lien copié, erreur affichée). */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ status: "forbidden" }, { status: 403 });
  const user = await getCurrentUser();
  if (!user) return new NextResponse(null, { status: 204 });
  try {
    const body = JSON.parse(await readLimitedBody(request)) as { name?: unknown; detail?: unknown };
    const name = typeof body.name === "string" ? (body.name as JourneyStep) : null;
    if (!name || !CLIENT_STEPS.has(name)) return NextResponse.json({ status: "ignored" }, { status: 202 });
    const detail = typeof body.detail === "string" ? body.detail.slice(0, 160) : null;
    await recordJourney(user.id, name, detail);
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ status: "ignored" }, { status: 202 });
  }
}
