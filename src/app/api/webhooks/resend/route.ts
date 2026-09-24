import { NextResponse } from "next/server";
import { fetchReceivedEmail, verifyResendSignature } from "@/server/resend-inbound";
import { recordProspectReply } from "@/server/prospection";

export const runtime = "nodejs";

/**
 * Webhook Resend : un email reçu sur l'adresse de réponse de la prospection
 * (événement `email.received`) est transmis sur Telegram et à l'adresse de
 * contact, et le prospect passe en « a répondu ». Les autres événements sont ignorés.
 */
export async function POST(request: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET?.trim();
  if (!secret) return NextResponse.json({ status: "not-configured" }, { status: 503 });
  const rawBody = await request.text();
  const ok = verifyResendSignature(rawBody, {
    id: request.headers.get("svix-id"),
    timestamp: request.headers.get("svix-timestamp"),
    signature: request.headers.get("svix-signature"),
  }, secret);
  if (!ok) return NextResponse.json({ status: "invalid-signature" }, { status: 401 });

  let event: { type?: string; data?: { email_id?: string; id?: string } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ status: "bad-json" }, { status: 400 });
  }
  if (event.type !== "email.received") return NextResponse.json({ status: "ignored", type: event.type ?? null });
  const emailId = event.data?.email_id ?? event.data?.id;
  if (!emailId) return NextResponse.json({ status: "ignored", reason: "sans identifiant" });
  try {
    const email = await fetchReceivedEmail(emailId);
    if (!email) return NextResponse.json({ status: "unavailable" }, { status: 502 });
    const result = await recordProspectReply(email);
    return NextResponse.json({ status: "ok", ...result });
  } catch (error) {
    console.error("[resend] réponse non traitée", error instanceof Error ? error.message : error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
