import { offer } from "@/config/offer";
import type { EmailMessage } from "./types";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/**
 * Email de confirmation exact (§10). HTML responsive + version texte,
 * liens absolus HTTPS, aucun pixel de suivi.
 */
export function confirmationEmail(to: string, confirmUrl: string): EmailMessage {
  const brand = offer.brandName;
  const subject = `Confirmez votre inscription au lancement de ${brand}`;
  const safeUrl = escapeHtml(confirmUrl);

  const text = [
    "Bonjour,",
    "",
    `Vous avez demandé à être informé de l’ouverture de ${brand}. Confirmez votre adresse email pour recevoir cette notification.`,
    "",
    `Confirmer mon inscription : ${confirmUrl}`,
    "",
    "Ce lien est valable pendant 48 heures. Si vous n’êtes pas à l’origine de cette demande, vous pouvez ignorer cet email.",
    "",
    "À bientôt,",
    `L’équipe ${brand}`,
  ].join("\n");

  const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#faf7f2;font-family:Manrope,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:#27242a;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf7f2;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;">
<tr><td style="padding:32px 28px 8px 28px;font-size:24px;font-weight:700;color:#493344;">${escapeHtml(brand.toLowerCase())}</td></tr>
<tr><td style="padding:8px 28px 0 28px;font-size:16px;line-height:25px;">Bonjour,</td></tr>
<tr><td style="padding:16px 28px 0 28px;font-size:16px;line-height:25px;">Vous avez demandé à être informé de l’ouverture de ${escapeHtml(brand)}. Confirmez votre adresse email pour recevoir cette notification.</td></tr>
<tr><td style="padding:24px 28px;">
<a href="${safeUrl}" style="display:inline-block;background:#493344;color:#ffffff;text-decoration:none;font-weight:600;font-size:16px;line-height:24px;padding:12px 24px;border-radius:10px;">Confirmer mon inscription</a>
</td></tr>
<tr><td style="padding:0 28px 0 28px;font-size:14px;line-height:21px;color:#655b66;">Ce lien est valable pendant 48 heures. Si vous n’êtes pas à l’origine de cette demande, vous pouvez ignorer cet email.</td></tr>
<tr><td style="padding:24px 28px 32px 28px;font-size:16px;line-height:25px;">À bientôt,<br>L’équipe ${escapeHtml(brand)}</td></tr>
</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
<tr><td style="padding:16px 8px;font-size:12px;line-height:18px;color:#655b66;">Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br><a href="${safeUrl}" style="color:#493344;word-break:break-all;">${safeUrl}</a></td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

  return { to, subject, html, text, replyTo: offer.supportEmail ?? undefined };
}
