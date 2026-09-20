import { offer } from "@/config/offer";
import type { EmailMessage } from "@/server/email/types";

function esc(v: string): string {
  return v.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function shell(title: string, bodyHtml: string): string {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:#faf7f2;font-family:Manrope,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:#27242a;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf7f2;"><tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;">
<tr><td style="padding:28px 28px 8px 28px;font-size:22px;font-weight:700;color:#493344;">${esc(offer.brandName.toLowerCase())}</td></tr>
${bodyHtml}
</table></td></tr></table></body></html>`;
}

const p = (text: string) => `<tr><td style="padding:10px 28px 0 28px;font-size:16px;line-height:25px;">${text}</td></tr>`;
const button = (href: string, label: string) =>
  `<tr><td style="padding:22px 28px;"><a href="${esc(href)}" style="display:inline-block;background:#493344;color:#ffffff;text-decoration:none;font-weight:600;font-size:16px;line-height:24px;padding:12px 24px;border-radius:12px;">${esc(label)}</a></td></tr>`;
const small = (text: string) => `<tr><td style="padding:0 28px 28px 28px;font-size:13px;line-height:20px;color:#655b66;">${text}</td></tr>`;

export function passwordResetEmail(to: string, url: string): EmailMessage {
  const subject = `Réinitialisez votre mot de passe ${offer.brandName}`;
  return {
    to,
    subject,
    text: `Bonjour,\n\nVous avez demandé à réinitialiser votre mot de passe ${offer.brandName}.\n\nChoisir un nouveau mot de passe : ${url}\n\nCe lien est valable 1 heure. Si vous n’êtes pas à l’origine de cette demande, ignorez cet email.\n\nL’équipe ${offer.brandName}`,
    html: shell(subject, [
      p("Bonjour,"),
      p(`Vous avez demandé à réinitialiser votre mot de passe ${esc(offer.brandName)}.`),
      button(url, "Choisir un nouveau mot de passe"),
      small(`Ce lien est valable 1 heure. Si vous n’êtes pas à l’origine de cette demande, ignorez cet email.`),
    ].join("")),
    replyTo: offer.supportEmail ?? undefined,
  };
}

export function verifyEmailEmail(to: string, url: string): EmailMessage {
  const subject = `Confirmez votre adresse email ${offer.brandName}`;
  return {
    to,
    subject,
    text: `Bonjour,\n\nBienvenue sur ${offer.brandName}. Confirmez votre adresse email : ${url}\n\nCe lien est valable 48 heures.\n\nL’équipe ${offer.brandName}`,
    html: shell(subject, [
      p("Bonjour,"),
      p(`Bienvenue sur ${esc(offer.brandName)}. Confirmez votre adresse email pour sécuriser votre compte.`),
      button(url, "Confirmer mon adresse"),
      small("Ce lien est valable 48 heures."),
    ].join("")),
    replyTo: offer.supportEmail ?? undefined,
  };
}
