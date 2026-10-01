import { NextResponse } from "next/server";
import { isAuthorizedInternal } from "@/server/http";
import { ProspectionDisabledError, allowPendingFollowUps, markProspectReplied, optOutProspectByEmail, runProspection } from "@/server/prospection";
import { runCampaign } from "@/server/prospection/campaign";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Cycle de prospection (découverte Google, analyse des sites, emails). `?dry=1` : tout sauf les envois. */
export async function GET(request: Request) {
  if (!isAuthorizedInternal(request)) return NextResponse.json({ status: "forbidden" }, { status: 403 });
  const url = new URL(request.url);
  // Refus reçu dans la boîte de contact : `?optout=adresse` retire le prospect sans lancer le cycle.
  const optout = url.searchParams.get("optout");
  if (optout) return NextResponse.json({ status: "ok", ...(await optOutProspectByEmail(optout)) });
  // Réponse reçue dans la boîte de contact : `?replied=adresse` (plus de relance pour ce prospect).
  const replied = url.searchParams.get("replied");
  if (replied) return NextResponse.json({ status: "ok", ...(await markProspectReplied(replied)) });
  // Une fois les réponses marquées : `?allow_follow_ups=1` autorise la relance des autres prospects contactés.
  if (url.searchParams.get("allow_follow_ups") === "1") return NextResponse.json({ status: "ok", ...(await allowPendingFollowUps()) });
  const dryRun = url.searchParams.get("dry") === "1";
  // Campagne ponctuelle : `?campaign=herault&dry=1` (liste, aucun email) puis `&run=1` (envoi).
  const campaign = url.searchParams.get("campaign");
  if (campaign) {
    if (!dryRun && url.searchParams.get("run") !== "1") return NextResponse.json({ status: "noop", usage: "?campaign=herault&dry=1 · ?campaign=herault&run=1" });
    try {
      return NextResponse.json({ status: "ok", ...(await runCampaign(campaign, { dryRun })) });
    } catch (error) {
      if (error instanceof ProspectionDisabledError) return NextResponse.json({ status: "disabled", reason: error.message });
      console.error("[campagne]", error instanceof Error ? error.message : error);
      return NextResponse.json({ status: "error", reason: error instanceof Error ? error.message : "erreur" }, { status: 500 });
    }
  }
  // Garde-fou : le cycle (recherches, emails, relances) ne part que sur demande explicite.
  // Le cron quotidien passe par /api/internal/daily. Un appel sans `run=1` ni `dry=1` ne fait rien.
  if (!dryRun && url.searchParams.get("run") !== "1") {
    return NextResponse.json({
      status: "noop",
      usage: "?dry=1 (simulation, aucun email) · ?run=1 (cycle réel) · ?replied=adresse · ?optout=adresse · ?allow_follow_ups=1 · ?campaign=herault&dry=1",
    });
  }
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
