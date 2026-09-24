import { NextResponse } from "next/server";
import { isAuthorizedInternal } from "@/server/http";
import { recentPayments, runBillingCycle } from "@/server/app/billing";
import { collectWeeklyStats } from "@/server/app/weekly-report";
import { formatWeeklyReport } from "@/lib/weekly-report";
import { ProspectionDisabledError, runProspection } from "@/server/prospection";
import { notifyTelegram } from "@/server/telegram";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Tâche quotidienne unique (cron Vercel, un seul créneau en offre Hobby) :
 * facturation, prospection, et le lundi le récap hebdomadaire Telegram.
 * Chaque étape est isolée : une erreur n'empêche pas les suivantes.
 */
export async function GET(request: Request) {
  if (!isAuthorizedInternal(request)) return NextResponse.json({ status: "forbidden" }, { status: 403 });
  const now = new Date();
  const out: Record<string, unknown> = { status: "ok", ranAt: now.toISOString() };

  try {
    out.billing = await runBillingCycle(now);
    out.payments = (await recentPayments(5)).length;
  } catch (error) {
    console.error("[daily] facturation", error instanceof Error ? error.message : error);
    out.billing = "erreur";
  }

  const parisWeekday = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "Europe/Paris" }).format(now);
  if (parisWeekday === "Mon") {
    try {
      const sent = await notifyTelegram(formatWeeklyReport(await collectWeeklyStats(now)));
      out.weeklyReport = sent ? "envoyé" : "non envoyé";
    } catch (error) {
      console.error("[daily] récap hebdo", error instanceof Error ? error.message : error);
      out.weeklyReport = "erreur";
    }
  }

  try {
    const summary = await runProspection({ now });
    out.prospection = { queries: summary.queries, created: summary.created, emailsFound: summary.emailsFound, sent: summary.sent, followUps: summary.followUps, skipped: summary.skipped };
  } catch (error) {
    if (error instanceof ProspectionDisabledError) out.prospection = error.message;
    else {
      console.error("[daily] prospection", error instanceof Error ? error.message : error);
      out.prospection = "erreur";
    }
  }
  return NextResponse.json(out);
}

export async function POST(request: Request) {
  return GET(request);
}
