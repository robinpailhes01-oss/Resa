import "server-only";
import { offer } from "@/config/offer";
import { prospectionSettings } from "@/config/prospection";
import { prospectionContent, type ProspectionEmailInput } from "@/content/fr/prospection";
import { providerLabels, shortEstablishmentName, type BookingProvider } from "@/lib/prospection";
import { formatEuros } from "@/lib/billing";
import type { EmailMessage } from "@/server/email/types";

const esc = (v: string) => v.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] ?? c);
const linkify = (text: string) => esc(text).replace(/https?:\/\/[^\s)]+/g, (url) => `<a href="${url}" style="color:#6c4ff8">${url}</a>`);

export interface ProspectForEmail {
  name: string;
  email: string;
  categoryPlural: string;
  categoryKey: string;
  bookingProvider: BookingProvider | null;
  unsubscribeToken: string;
}

export function prospectionEmailInput(p: ProspectForEmail): ProspectionEmailInput {
  return {
    establishmentName: shortEstablishmentName(p.name),
    categoryPlural: p.categoryPlural,
    providerLabel: p.bookingProvider ? providerLabels[p.bookingProvider] : null,
    // Lien nu, lisible : le nom de domaine seul.
    trialUrl: offer.siteUrl,
    unsubscribeUrl: `${offer.siteUrl}/ne-plus-me-contacter?token=${encodeURIComponent(p.unsubscribeToken)}`,
    priceLabel: Number.isInteger(offer.monthlyPriceExVat) ? `${offer.monthlyPriceExVat} € HT` : `${formatEuros(Math.round(offer.monthlyPriceExVat * 100))} HT`,
    trialDays: offer.trialDays,
    senderName: prospectionContent.senderName,
    brandName: offer.brandName,
    legalEntity: offer.legalEntity ?? offer.brandName,
  };
}

function build(to: string, subject: string, paragraphs: string[], input: ProspectionEmailInput, replyTo: string | undefined): EmailMessage {
  const footer = prospectionContent.footer(input);
  const text = [...paragraphs, ...(footer ? ["", footer] : [])].join("\n\n").replace(/\n\n\n/g, "\n\n");
  // Style volontairement sobre (email écrit à la main) : pas de bandeau, pas de bouton, pas d'image.
  const html = `<!doctype html><html lang="fr"><body style="margin:0;padding:24px 16px;background:#ffffff;font-family:Inter,Arial,sans-serif;color:#111116;font-size:15px;line-height:24px"><div style="max-width:560px;margin:0 auto">${paragraphs
    .map((p) => `<p style="margin:0 0 16px">${linkify(p).replace(/\n/g, "<br>")}</p>`)
    .join("")}${footer ? `<p style="margin:28px 0 0;font-size:12px;line-height:18px;color:#6f707c">${linkify(footer)}</p>` : ""}</div></body></html>`;
  return { to, subject, text, html, fromName: prospectionContent.fromName, replyTo };
}

export function prospectionFirstEmail(p: ProspectForEmail, replyTo: string | undefined = offer.supportEmail ?? undefined): EmailMessage {
  if (prospectionSettings().providers !== "all" && (!p.bookingProvider || p.bookingProvider === "autre")) {
    throw new Error(`Email générique refusé pour ${p.name} : le ciblage n'autorise que ${prospectionSettings().providers}.`);
  }
  const input = prospectionEmailInput(p);
  const subject = input.providerLabel && p.bookingProvider !== "autre" ? prospectionContent.subjects.withProvider(input.establishmentName, input.providerLabel) : prospectionContent.subjects.generic(input.establishmentName);
  return build(p.email, subject, prospectionContent.first(input), input, replyTo);
}

export function prospectionFollowUpEmail(p: ProspectForEmail, replyTo: string | undefined = offer.supportEmail ?? undefined): EmailMessage {
  const input = prospectionEmailInput(p);
  return build(p.email, prospectionContent.subjects.followUp(input.establishmentName, p.bookingProvider && p.bookingProvider !== "autre" ? input.providerLabel : null), prospectionContent.followUp(input), input, replyTo);
}
