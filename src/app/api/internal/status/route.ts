import { NextResponse } from "next/server";
import { offer } from "@/config/offer";
import { isAuthorizedInternal } from "@/server/http";
import { getEmailSender } from "@/server/email";
import { isGoogleImportEnabled } from "@/server/google/places";
import { isSumUpConfigured } from "@/server/sumup";
import { isMollieConfigured, isMollieTestMode } from "@/server/mollie";
import { isTelegramConfigured } from "@/server/telegram";

export const runtime = "nodejs";

/** État des intégrations (sans secrets) : pour vérifier une configuration après déploiement. */
export async function GET(request: Request) {
  if (!isAuthorizedInternal(request)) return NextResponse.json({ status: "forbidden" }, { status: 403 });
  let email: string;
  try {
    email = getEmailSender().name;
  } catch (error) {
    email = `invalide : ${error instanceof Error ? error.message : String(error)}`;
  }
  return NextResponse.json({
    status: "ok",
    launchMode: offer.launchMode,
    siteUrl: offer.siteUrl,
    email,
    sumup: isSumUpConfigured() ? "configuré" : "absent (SUMUP_API_KEY et SUMUP_MERCHANT_CODE)",
    mollie: isMollieConfigured() ? (isMollieTestMode() ? "configuré (mode test)" : "configuré (live)") : "absent (MOLLIE_API_KEY)",
    billing: isMollieConfigured() ? "mollie (prélèvement automatique)" : isSumUpConfigured() ? "sumup (paiement mensuel manuel)" : "désactivé",
    googlePlaces: isGoogleImportEnabled() ? "configuré" : "absent (GOOGLE_PLACES_API_KEY)",
    telegram: isTelegramConfigured() ? "configuré" : "absent (TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID)",
    cronSecret: process.env.CRON_SECRET?.trim() ? "présent" : "absent",
    legal: { entity: offer.legalEntity, siren: offer.legalId ?? "absent (RESO_LEGAL_ID)", vatRate: offer.vatRate, vatNumber: offer.vatNumber ?? "absent" },
  });
}
