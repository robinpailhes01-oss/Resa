import { offer } from "@/config/offer";
import type { EmailMessage } from "@/server/email/types";
import { formatEuros, type SubscriptionAmounts } from "@/lib/billing";

const esc = (v: string) => v.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] ?? c);
const shell = (title: string, body: string) =>
  `<!doctype html><html lang="fr"><body style="margin:0;background:#fafafc;font-family:Inter,Arial,sans-serif;color:#111116"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px"><table role="presentation" width="100%" style="max-width:560px;background:#fff;border-radius:16px;border:1px solid #e8e8ee"><tr><td style="padding:28px 28px 0;font-size:22px;font-weight:700;color:#6c4ff8">${esc(offer.brandName)}</td></tr><tr><td style="padding:8px 28px 0;font-size:18px;font-weight:600">${esc(title)}</td></tr>${body}<tr><td style="padding:24px 28px 28px;font-size:12px;color:#6f707c">${esc(offer.legalEntity ?? offer.brandName)}${offer.supportEmail ? ` · ${esc(offer.supportEmail)}` : ""}</td></tr></table></td></tr></table></body></html>`;
const p = (t: string) => `<tr><td style="padding:12px 28px 0;font-size:15px;line-height:24px">${t}</td></tr>`;
const button = (href: string, label: string) =>
  `<tr><td style="padding:20px 28px 0"><a href="${esc(href)}" style="display:inline-block;background:#111116;color:#fff;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:12px">${esc(label)}</a></td></tr>`;

const dateFr = (d: Date) => new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris" }).format(d);

export function receiptEmail(to: string, input: { establishment: string; amounts: SubscriptionAmounts; periodStart: Date; periodEnd: Date; reference: string; transactionCode: string | null; invoiceNumber?: string | null; attachment?: { filename: string; content: Uint8Array } }): EmailMessage {
  const subject = input.invoiceNumber ? `Facture ${input.invoiceNumber} · ${offer.brandName} · ${formatEuros(input.amounts.totalCents)}` : `Reçu ${offer.brandName} · ${formatEuros(input.amounts.totalCents)} · ${input.establishment}`;
  const lines = [
    `Abonnement ${offer.brandName} pour ${input.establishment}`,
    `Période : du ${dateFr(input.periodStart)} au ${dateFr(input.periodEnd)}`,
    `Montant HT : ${formatEuros(input.amounts.exVatCents)}`,
    input.amounts.vatRate > 0 ? `TVA ${input.amounts.vatRate} % : ${formatEuros(input.amounts.vatCents)}` : "TVA non applicable, art. 293 B du CGI",
    `Total réglé : ${formatEuros(input.amounts.totalCents)}`,
    `Référence : ${input.reference}${input.transactionCode ? ` · transaction SumUp ${input.transactionCode}` : ""}`,
    `Émetteur : ${offer.legalEntity ?? offer.brandName}${offer.legalId ? ` · SIREN ${offer.legalId}` : ""}${offer.vatNumber ? ` · TVA ${offer.vatNumber}` : ""}`,
  ];
  if (input.invoiceNumber) lines.unshift(`Facture n° ${input.invoiceNumber} (en pièce jointe, aussi disponible dans votre espace, rubrique Abonnement)`);
  return {
    to,
    subject,
    text: `Merci pour votre paiement.\n\n${lines.join("\n")}\n\nL’équipe ${offer.brandName}`,
    html: shell("Merci pour votre paiement", [p("Votre abonnement est à jour. Votre facture est en pièce jointe :"), ...lines.map((l) => p(esc(l)))].join("")),
    replyTo: offer.supportEmail ?? undefined,
    attachments: input.attachment ? [{ filename: input.attachment.filename, content: input.attachment.content, contentType: "application/pdf" }] : undefined,
  };
}

export function renewalEmail(to: string, input: { establishment: string; amounts: SubscriptionAmounts; periodStart: Date; periodEnd: Date; payUrl: string }): EmailMessage {
  const subject = `Votre abonnement ${offer.brandName} se renouvelle le ${dateFr(input.periodStart)}`;
  const text = `Bonjour,\n\nVotre abonnement ${offer.brandName} pour ${input.establishment} arrive à échéance le ${dateFr(input.periodStart)}. Pour garder votre page de réservation ouverte, réglez le mois suivant (${formatEuros(input.amounts.totalCents)}, période du ${dateFr(input.periodStart)} au ${dateFr(input.periodEnd)}) :\n${input.payUrl}\n\nSans règlement 3 jours après l’échéance, la réservation en ligne est suspendue ; votre agenda reste accessible.\n\nL’équipe ${offer.brandName}`;
  return {
    to,
    subject,
    text,
    html: shell(subject, [p(`Bonjour, votre abonnement pour <b>${esc(input.establishment)}</b> arrive à échéance le ${esc(dateFr(input.periodStart))}.`), p(`Réglez le mois suivant (${esc(formatEuros(input.amounts.totalCents))}, du ${esc(dateFr(input.periodStart))} au ${esc(dateFr(input.periodEnd))}) pour garder votre page de réservation ouverte.`), button(input.payUrl, "Payer mon abonnement"), p(`Sans règlement 3 jours après l’échéance, la réservation en ligne est suspendue ; votre agenda reste accessible.`)].join("")),
    replyTo: offer.supportEmail ?? undefined,
  };
}

export function pastDueEmail(to: string, input: { establishment: string; payUrl: string }): EmailMessage {
  const subject = `Réservation en ligne suspendue · ${input.establishment}`;
  const text = `Bonjour,\n\nLe paiement de votre abonnement ${offer.brandName} n’a pas été reçu. La page de réservation de ${input.establishment} est suspendue ; votre agenda et vos données restent accessibles. Réglez le mois en cours pour la rouvrir immédiatement :\n${input.payUrl}\n\nL’équipe ${offer.brandName}`;
  return {
    to,
    subject,
    text,
    html: shell(subject, [p(`Le paiement de votre abonnement n’a pas été reçu. La page de réservation de <b>${esc(input.establishment)}</b> est suspendue ; votre agenda et vos données restent accessibles.`), button(input.payUrl, "Régler et rouvrir ma page")].join("")),
    replyTo: offer.supportEmail ?? undefined,
  };
}
