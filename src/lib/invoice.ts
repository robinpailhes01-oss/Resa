import { buildPdf, type PdfLine, type PdfText } from "./pdf";
import { formatEuros } from "./billing";

export interface InvoiceData {
  number: string;
  issuedAt: Date;
  seller: { name: string; address: string; siren: string | null; vatNumber: string | null; email: string | null; brand: string };
  buyer: { name: string; address: string | null; email: string };
  description: string;
  periodStart: Date;
  periodEnd: Date;
  exVatCents: number;
  vatCents: number;
  vatRate: number;
  totalCents: number;
  paidAt: Date;
  paymentMethod: string | null;
  reference: string;
}

/** Numéro de facture : préfixe, année d'émission, compteur continu sur 6 chiffres. */
export function invoiceNumber(seq: number, issuedAt: Date): string {
  return `RESO-${issuedAt.getUTCFullYear()}-${String(seq).padStart(6, "0")}`;
}

const dateFr = (d: Date) => new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Paris" }).format(d);

export function invoiceFilename(number: string): string {
  return `facture-${number.toLowerCase()}.pdf`;
}

/** Facture d'abonnement : une page A4, mentions obligatoires françaises. */
export function renderInvoicePdf(inv: InvoiceData): Uint8Array {
  const L = 56;
  const R = 539;
  const texts: PdfText[] = [];
  const lines: PdfLine[] = [];
  const ink: [number, number, number] = [0.07, 0.07, 0.09];
  const muted: [number, number, number] = [0.44, 0.44, 0.49];
  const brand: [number, number, number] = [0.42, 0.31, 0.97];

  texts.push({ text: inv.seller.brand.toLowerCase(), x: L, y: 785, size: 26, bold: true, color: brand });
  texts.push({ text: "FACTURE", x: R, y: 790, size: 20, bold: true, right: true });
  texts.push({ text: `N° ${inv.number}`, x: R, y: 772, size: 11, right: true });
  texts.push({ text: `Émise le ${dateFr(inv.issuedAt)}`, x: R, y: 758, size: 10, right: true, color: muted });

  let y = 720;
  texts.push({ text: "Émetteur", x: L, y, size: 9, bold: true, color: muted });
  texts.push({ text: "Client", x: 320, y, size: 9, bold: true, color: muted });
  y -= 15;
  const sellerLines = [inv.seller.name, ...inv.seller.address.split(/,\s*/), inv.seller.siren ? `SIREN ${inv.seller.siren}` : null, inv.seller.vatNumber ? `TVA intracommunautaire ${inv.seller.vatNumber}` : null, inv.seller.email].filter((v): v is string => Boolean(v));
  const buyerLines = [inv.buyer.name, ...(inv.buyer.address ? inv.buyer.address.split(/,\s*/) : []), inv.buyer.email];
  const rows = Math.max(sellerLines.length, buyerLines.length);
  for (let i = 0; i < rows; i += 1) {
    if (sellerLines[i]) texts.push({ text: sellerLines[i], x: L, y: y - i * 13, size: i === 0 ? 10.5 : 9.5, bold: i === 0 });
    if (buyerLines[i]) texts.push({ text: buyerLines[i], x: 320, y: y - i * 13, size: i === 0 ? 10.5 : 9.5, bold: i === 0 });
  }
  y -= rows * 13 + 24;

  lines.push({ x1: L, y1: y + 4, x2: R, y2: y + 4, color: [0.07, 0.07, 0.09], width: 0.9 });
  y -= 12;
  texts.push({ text: "Désignation", x: L, y, size: 9, bold: true, color: muted });
  texts.push({ text: "Période", x: 300, y, size: 9, bold: true, color: muted });
  texts.push({ text: "Montant HT", x: R, y, size: 9, bold: true, right: true, color: muted });
  y -= 8;
  lines.push({ x1: L, y1: y, x2: R, y2: y });
  y -= 18;
  texts.push({ text: inv.description, x: L, y, size: 10.5 });
  texts.push({ text: `du ${dateFr(inv.periodStart)} au ${dateFr(inv.periodEnd)}`, x: 300, y, size: 10 });
  texts.push({ text: formatEuros(inv.exVatCents), x: R, y, size: 10.5, right: true });
  y -= 14;
  lines.push({ x1: L, y1: y, x2: R, y2: y });

  y -= 26;
  const totalsX = 380;
  texts.push({ text: "Total HT", x: totalsX, y, size: 10, color: muted });
  texts.push({ text: formatEuros(inv.exVatCents), x: R, y, size: 10, right: true });
  y -= 15;
  if (inv.vatRate > 0) {
    texts.push({ text: `TVA ${inv.vatRate.toLocaleString("fr-FR")} %`, x: totalsX, y, size: 10, color: muted });
    texts.push({ text: formatEuros(inv.vatCents), x: R, y, size: 10, right: true });
  } else {
    texts.push({ text: "TVA non applicable, art. 293 B du CGI", x: totalsX, y, size: 9, color: muted });
  }
  y -= 8;
  lines.push({ x1: totalsX, y1: y, x2: R, y2: y, color: [0.07, 0.07, 0.09] });
  y -= 16;
  texts.push({ text: "Total TTC", x: totalsX, y, size: 12, bold: true });
  texts.push({ text: formatEuros(inv.totalCents), x: R, y, size: 12, bold: true, right: true });

  y -= 40;
  texts.push({ text: `Réglée le ${dateFr(inv.paidAt)}${inv.paymentMethod ? ` par ${inv.paymentMethod}` : ""} · référence ${inv.reference}`, x: L, y, size: 9.5 });
  y -= 14;
  texts.push({ text: "Facture acquittée. Abonnement mensuel sans engagement, payable d’avance.", x: L, y, size: 9.5, color: muted });
  y -= 14;
  texts.push({ text: "Pas d’escompte pour paiement anticipé. Pénalités de retard : trois fois le taux d’intérêt légal ; indemnité forfaitaire de recouvrement : 40 €.", x: L, y, size: 8.5, color: muted });

  texts.push({ text: `${inv.seller.name} · ${inv.seller.address}${inv.seller.siren ? ` · SIREN ${inv.seller.siren}` : ""}`, x: 297.6 - 0, y: 40, size: 8, color: muted, right: false });
  return buildPdf({ texts, lines, title: `Facture ${inv.number}` });
}
