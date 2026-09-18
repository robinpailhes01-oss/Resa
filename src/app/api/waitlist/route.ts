import { after, NextResponse } from "next/server";
import { offer } from "@/config/offer";
import { getRateLimiters } from "@/server/rate-limit";
import { BodyTooLargeError, clientIp, isFormEncoded, isSameOrigin, readLimitedBody } from "@/server/http";
import { waitlistRequestSchema } from "@/server/waitlist/schema";
import { processEmailTasks, requestWaitlistSignup } from "@/server/waitlist/service";
import { StoreUnavailableError } from "@/server/waitlist/types";

export const runtime = "nodejs";

type Outcome = "accepted" | "invalid" | "rate_limited" | "unavailable" | "forbidden";

function jsonFor(outcome: Outcome, details?: Record<string, string>) {
  switch (outcome) {
    case "accepted":
      return NextResponse.json({ status: "accepted" }, { status: 202 });
    case "invalid":
      return NextResponse.json({ status: "invalid", errors: details ?? {} }, { status: 422 });
    case "rate_limited":
      return NextResponse.json({ status: "rate_limited" }, { status: 429, headers: { "Retry-After": "900" } });
    case "forbidden":
      return NextResponse.json({ status: "forbidden" }, { status: 403 });
    default:
      return NextResponse.json({ status: "unavailable" }, { status: 503, headers: { "Retry-After": "60" } });
  }
}

/** Repli sans JavaScript : redirection vers la section avec un état lisible (§16). */
function redirectFor(request: Request, outcome: Outcome) {
  const state = outcome === "accepted" ? "ok" : outcome === "invalid" ? "email" : outcome === "rate_limited" ? "limite" : "erreur";
  const url = new URL(`/?inscription=${state}#inscription`, request.url);
  return NextResponse.redirect(url, 303);
}

function formToObject(form: URLSearchParams): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of ["email", "businessType", "teamSize", "privacyVersion", "website", "idempotencyKey"]) {
    const value = form.get(key);
    if (value !== null) out[key] = value;
  }
  return out;
}

export async function POST(request: Request) {
  const asForm = isFormEncoded(request);
  const respond = (outcome: Outcome, details?: Record<string, string>) =>
    asForm ? redirectFor(request, outcome) : jsonFor(outcome, details);

  if (offer.launchMode !== "prelaunch") return respond("forbidden");
  if (!isSameOrigin(request)) return respond("forbidden");

  if (!getRateLimiters().ip.hit(clientIp(request))) return respond("rate_limited");

  let payload: unknown;
  try {
    const body = await readLimitedBody(request);
    payload = asForm ? formToObject(new URLSearchParams(body)) : JSON.parse(body);
  } catch (error) {
    if (error instanceof BodyTooLargeError) return respond("invalid", { body: "too_large" });
    return respond("invalid", { body: "malformed" });
  }

  const parsed = waitlistRequestSchema.safeParse(payload);
  if (!parsed.success) {
    // Champ piège rempli : réponse « acceptée » silencieuse, rien n'est stocké.
    const honeypot = parsed.error.issues.some((issue) => issue.path[0] === "website");
    if (honeypot) return respond("accepted");
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "body");
      if (!errors[key]) errors[key] = issue.message;
    }
    return respond("invalid", errors);
  }

  try {
    const outcome = await requestWaitlistSignup(parsed.data);
    if (outcome.taskCreated) {
      after(async () => {
        try {
          await processEmailTasks();
        } catch (error) {
          console.error("[waitlist] traitement des tâches email échoué", error instanceof Error ? error.message : error);
        }
      });
    }
    return respond("accepted");
  } catch (error) {
    if (!(error instanceof StoreUnavailableError)) {
      console.error("[waitlist] enregistrement échoué", error instanceof Error ? error.message : "erreur inconnue");
    }
    return respond("unavailable");
  }
}
