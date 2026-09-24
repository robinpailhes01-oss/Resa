import { NextResponse } from "next/server";
import { isAuthorizedInternal } from "@/server/http";
import { ProspectionDisabledError, runProspection } from "@/server/prospection";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Cycle de prospection (découverte Google, analyse des sites, emails). `?dry=1` : tout sauf les envois. */
export async function GET(request: Request) {
  if (!isAuthorizedInternal(request)) return NextResponse.json({ status: "forbidden" }, { status: 403 });
  const dryRun = new URL(request.url).searchParams.get("dry") === "1";
  try {
    const summary = await runProspection({ dryRun });
    return NextResponse.json({ status: "ok", ...summary });
  } catch (error) {
    if (error instanceof ProspectionDisabledError) return NextResponse.json({ status: "disabled", reason: error.message });
    console.error("[prospection]", error instanceof Error ? error.message : error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}
