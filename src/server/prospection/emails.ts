import "server-only";
import { offer } from "@/config/offer";
import { prospectionContent, type ProspectionEmailInput } from "@/content/fr/prospection";
import { providerLabels, type BookingProvider } from "@/lib/prospection";
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
  const campaign = `${p.categoryKey}${p.bookingProvider ? `-${p.bookingProvider}` : ""}`;
  return {
    establishmentName: p.name,
    categoryPlural: p.categoryPlural,
    providerLabel: p.bookingProvider ? providerLabels[p.bookingProvider] : null,
    trialUrl: `${offer.siteUrl}/?utm_source=prospection&utm_medium=email&utm_campaign=${encodeURIComponent(campaign)}`,
    unsubscribeUrl: `${offer.siteUrl}/ne-plus-me-contacter?token=${encodeURIComponent(p.unsubscribeToken)}`,
    priceLabel: `${formatEuros(Math.round(offer.monthlyPriceExVat * 100))} HT`,
    trialDays: offer.trialDays,
    senderName: prospectionContent.senderName,
    brandName: offer.brandName,
    legalEntity: offer.legalEntity ?? offer.brandName,
  };
}

function build(to: string, subject: string, paragraphs: string[], input: ProspectionEmailInput): EmailMessage {
  const footer = prospectionContent.footer(input);
  const text = [...paragraphs, "", "—", footer].join("\n\n").replace(/\n\n\n/g, "\n\n");
  // Style volontairement sobre (email écrit à la main) : pas de bandeau, pas de bouton, pas d'image.
  const html = `<!doctype html><html lang="fr"><body style="margin:0;padding:24px 16px;background:#ffffff;font-family:Inter,Arial,sans-serif;color:#111116;font-size:15px;line-height:24px"><div style="max-width:560px;margin:0 auto">${paragraphs
    .map((p) => `<p style="margin:0 0 16px">${linkify(p).replace(/\n/g, "<br>")}</p>`)
    .join("")}<p style="margin:28px 0 0;font-size:12px;line-height:18px;color:#6f707c">${linkify(footer)}</p></div></body></html>`;
  return { to, subject, text, html, fromName: prospectionContent.fromName, replyTo: offer.supportEmail ?? undefined };
}

export function prospectionFirstEmail(p: ProspectForEmail): EmailMessage {
  const input = prospectionEmailInput(p);
  const subject = input.providerLabel && p.bookingProvider !== "autre" ? prospectionContent.subjects.withProvider(p.name, input.providerLabel) : prospectionContent.subjects.generic(p.name);
  return build(p.email, subject, prospectionContent.first(input), input);
}

export function prospectionFollowUpEmail(p: ProspectForEmail): EmailMessage {
  const input = prospectionEmailInput(p);
  return build(p.email, prospectionContent.subjects.followUp(p.name), prospectionContent.followUp(input), input);
}
