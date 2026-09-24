import { NextResponse } from "next/server";
import { isAuthorizedInternal } from "@/server/http";
import { isTelegramConfigured, notifyTelegram } from "@/server/telegram";

export const runtime = "nodejs";

/** Envoie un message de test sur Telegram pour vérifier TELEGRAM_BOT_TOKEN et TELEGRAM_CHAT_ID. */
export async function GET(request: Request) {
  if (!isAuthorizedInternal(request)) return NextResponse.json({ status: "forbidden" }, { status: 403 });
  if (!isTelegramConfigured()) return NextResponse.json({ status: "non configuré" });
  const sent = await notifyTelegram("✅ <b>Reso</b> : les notifications Telegram fonctionnent.");
  return NextResponse.json({ status: sent ? "envoyé" : "échec" });
}
