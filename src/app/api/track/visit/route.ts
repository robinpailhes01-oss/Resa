import { NextResponse } from "next/server";
import { countVisit } from "@/server/acquisition";
import { isSameOrigin, readLimitedBody } from "@/server/http";

export const runtime = "nodejs";

const clean = (v: unknown) => (typeof v === "string" ? v.replace(/[^\p{L}\p{N}_.\-+ ]/gu, "").slice(0, 80) : "");

/** Compte une visite du site (une par session, envoyée par le navigateur), agrégée par jour et par origine. */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ status: "forbidden" }, { status: 403 });
  try {
    const body = JSON.parse(await readLimitedBody(request)) as Record<string, unknown>;
    const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris" }).format(new Date());
    await countVisit(day, { utm_source: clean(body.utm_source), utm_campaign: clean(body.utm_campaign), utm_content: clean(body.utm_content) });
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ status: "ignored" }, { status: 202 });
  }
}
