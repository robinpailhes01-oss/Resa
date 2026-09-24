import { NextResponse } from "next/server";
import { isAuthorizedInternal } from "@/server/http";
import { collectWeeklyStats } from "@/server/app/weekly-report";
import { formatWeeklyReport } from "@/lib/weekly-report";
import { isTelegramConfigured, notifyTelegram } from "@/server/telegram";

export const runtime = "nodejs";

/** Récap hebdomadaire envoyé sur Telegram (cron Vercel le lundi matin, ou appel manuel). */
export async function GET(request: Request) {
  if (!isAuthorizedInternal(request)) return NextResponse.json({ status: "forbidden" }, { status: 403 });
  try {
    const stats = await collectWeeklyStats();
    const text = formatWeeklyReport(stats);
    const sent = await notifyTelegram(text);
    return NextResponse.json({ status: "ok", telegram: isTelegramConfigured() ? (sent ? "envoyé" : "échec") : "non configuré", stats });
  } catch (error) {
    console.error("[weekly-report]", error instanceof Error ? error.message : error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}
