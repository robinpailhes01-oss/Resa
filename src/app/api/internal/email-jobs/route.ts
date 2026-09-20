import { NextResponse } from "next/server";
import { isAuthorizedInternal } from "@/server/http";
import { processEmailJobs } from "@/server/app/notifications";

export const runtime = "nodejs";

/**
 * Envoie les emails de rendez-vous dus (rappels, demandes d'avis, réessais).
 * À appeler toutes les 5 à 15 minutes par un cron avec `Authorization: Bearer INTERNAL_TASKS_SECRET`.
 */
export async function POST(request: Request) {
  if (!isAuthorizedInternal(request)) return NextResponse.json({ status: "forbidden" }, { status: 403 });
  try {
    const summary = await processEmailJobs(50);
    return NextResponse.json({ status: "ok", ...summary });
  } catch (error) {
    console.error("[email-jobs] traitement échoué", error instanceof Error ? error.message : "erreur inconnue");
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return POST(request);
}
