import { NextResponse } from "next/server";
import { offer } from "@/config/offer";
import { isAuthorizedInternal } from "@/server/http";
import { getEmailSender } from "@/server/email";
import { isGoogleImportEnabled } from "@/server/google/places";
import { isSumUpConfigured } from "@/server/sumup";
import { isMollieConfigured, isMollieTestMode, listRecurringMethods } from "@/server/mollie";
import { isTelegramConfigured } from "@/server/telegram";
import { isProspectionEnabled, prospectionSettings } from "@/config/prospection";
import { isResendInboundConfigured } from "@/server/resend-inbound";

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
  // Moyens de paiement réellement activés côté Mollie (carte, SEPA…) : vide tant que le profil n'est pas validé.
  let mollieMethods: string | string[] = "non applicable";
  if (isMollieConfigured()) {
    mollieMethods = await listRecurringMethods()
      .then((methods) => (methods.length ? methods.map((m) => m.description) : ["aucun : activez la carte bancaire (et SEPA) dans Mollie → Paramètres → Moyens de paiement"]))
      .catch((error) => `erreur : ${error instanceof Error ? error.message : String(error)}`);
  }
  return NextResponse.json({
    status: "ok",
    launchMode: offer.launchMode,
    siteUrl: offer.siteUrl,
    email,
    sumup: isSumUpConfigured() ? "configuré" : "absent (SUMUP_API_KEY et SUMUP_MERCHANT_CODE)",
    mollie: isMollieConfigured() ? (isMollieTestMode() ? "configuré (mode test)" : "configuré (live)") : "absent (MOLLIE_API_KEY)",
    mollieMethods,
    billing: isMollieConfigured() ? "mollie (prélèvement automatique)" : isSumUpConfigured() ? "sumup (paiement mensuel manuel)" : "désactivé",
    googlePlaces: isGoogleImportEnabled() ? "configuré" : "absent (GOOGLE_PLACES_API_KEY)",
    telegram: isTelegramConfigured() ? "configuré" : "absent (TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID)",
    cronSecret: process.env.CRON_SECRET?.trim() ? "présent" : "absent",
    prospection: isProspectionEnabled()
      ? `active (${prospectionSettings().searchesPerDay} recherches/jour, ${prospectionSettings().dailyEmailLimit} emails/jour ouvré)`
      : "désactivée (PROSPECTION_ENABLED=1 pour envoyer ; simulation possible avec /api/internal/prospection?dry=1)",
    prospectionReplies: isResendInboundConfigured()
      ? `réponses reçues par Resend sur ${process.env.PROSPECTION_REPLY_TO?.trim() || "(PROSPECTION_REPLY_TO manquante)"}`
      : `réponses lues dans votre boîte ${offer.supportEmail ?? ""} (notification Telegram : PROSPECTION_REPLY_TO + RESEND_WEBHOOK_SECRET, voir docs partie 12)`,
    legal: { entity: offer.legalEntity, siren: offer.legalId ?? "absent (RESO_LEGAL_ID)", vatRate: offer.vatRate, vatNumber: offer.vatNumber ?? "absent" },
  });
}
