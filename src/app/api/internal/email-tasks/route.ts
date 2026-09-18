import { NextResponse } from "next/server";
import { isAuthorizedInternal } from "@/server/http";
import { processEmailTasks } from "@/server/waitlist/service";

export const runtime = "nodejs";

/**
 * Rejoue les tâches d'envoi en attente (réessais avec backoff).
 * À appeler par une tâche planifiée (cron) avec `Authorization: Bearer INTERNAL_TASKS_SECRET`.
 */
export async function POST(request: Request) {
  if (!isAuthorizedInternal(request)) return NextResponse.json({ status: "forbidden" }, { status: 403 });
  try {
    const summary = await processEmailTasks(50);
    return NextResponse.json({ status: "ok", ...summary });
  } catch (error) {
    console.error("[tasks] traitement échoué", error instanceof Error ? error.message : "erreur inconnue");
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
