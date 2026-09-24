import { NextResponse } from "next/server";
import { isAuthorizedInternal } from "@/server/http";
import { processEmailJobs } from "@/server/app/notifications";
import { getSql } from "@/server/db";
import { getEmailSender } from "@/server/email";

export const runtime = "nodejs";

/**
 * Envoie les emails de rendez-vous dus (rappels, demandes d'avis, réessais).
 * À appeler toutes les 5 à 15 minutes par un cron avec `Authorization: Bearer INTERNAL_TASKS_SECRET`.
 */
export async function POST(request: Request) {
  if (!isAuthorizedInternal(request)) return NextResponse.json({ status: "forbidden" }, { status: 403 });
  try {
    const sql = getSql();
    // ?retry=1 : remet immédiatement en file les emails en attente de réessai ou abandonnés (après correction de la configuration).
    if (new URL(request.url).searchParams.get("retry") === "1") {
      await sql`update email_jobs set status = 'pending', scheduled_at = now(), attempts = 0 where status in ('pending','failed') and last_error is not null`;
    }
    const summary = await processEmailJobs(50);
    // Diagnostic : fournisseur configuré, file d'attente et dernières erreurs distinctes (sans données personnelles).
    let provider: string;
    try {
      provider = getEmailSender().name;
    } catch (error) {
      provider = `invalide : ${error instanceof Error ? error.message : String(error)}`;
    }
    const [queue] = await sql<Array<{ pending: number; failed: number; next_at: Date | null }>>`
      select count(*) filter (where status = 'pending')::int as pending, count(*) filter (where status = 'failed')::int as failed,
        min(scheduled_at) filter (where status = 'pending') as next_at from email_jobs`;
    const errors = await sql<Array<{ last_error: string }>>`
      select distinct last_error from email_jobs where last_error is not null and status in ('pending','failed') order by last_error limit 3`;
    return NextResponse.json({ status: "ok", ...summary, provider, queue, lastErrors: errors.map((row) => row.last_error) });
  } catch (error) {
    console.error("[email-jobs] traitement échoué", error instanceof Error ? error.message : "erreur inconnue");
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return POST(request);
}
