import { NextResponse } from "next/server";
import { isAuthorizedInternal } from "@/server/http";
import { recentPayments, runBillingCycle } from "@/server/app/billing";

export const runtime = "nodejs";

/** Cycle de facturation quotidien (cron Vercel) : relances, suspensions, résiliations, vérification des paiements. */
export async function GET(request: Request) {
  if (!isAuthorizedInternal(request)) return NextResponse.json({ status: "forbidden" }, { status: 403 });
  try {
    const summary = await runBillingCycle();
    const payments = await recentPayments(10);
    return NextResponse.json({ status: "ok", ...summary, payments });
  } catch (error) {
    console.error("[billing] cycle", error instanceof Error ? error.message : error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}
