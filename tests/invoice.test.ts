import { describe, expect, it } from "vitest";
import { encodePdfText } from "@/lib/pdf";
import { invoiceFilename, invoiceNumber, renderInvoicePdf } from "@/lib/invoice";

describe("factures", () => {
  it("numérote de façon continue et lisible", () => {
    expect(invoiceNumber(1, new Date("2026-10-01T00:00:00Z"))).toBe("RESO-2026-000001");
    expect(invoiceNumber(1234, new Date("2027-01-15T00:00:00Z"))).toBe("RESO-2027-001234");
    expect(invoiceFilename("RESO-2026-000001")).toBe("facture-reso-2026-000001.pdf");
  });
  it("encode les accents et le symbole euro pour le PDF", () => {
    expect(encodePdfText("é€(a)")).toBe("\\351\\200\\(a\\)");
  });
  it("produit un PDF valide avec les mentions essentielles", () => {
    const pdf = renderInvoicePdf({
      number: "RESO-2026-000007",
      issuedAt: new Date("2026-10-01T10:00:00Z"),
      seller: { name: "SAS Harmonie Group", address: "61 rue du Rouet, 13008 Marseille, France", siren: "991 738 733", vatNumber: "FR07991738733", email: "contact@reso-app.fr", brand: "Reso" },
      buyer: { name: "Institut Lumière", address: "8 cours de l’Intendance, 33000 Bordeaux", email: "camille@example.com" },
      description: "Abonnement Reso · Institut Lumière",
      periodStart: new Date("2026-10-01T10:00:00Z"),
      periodEnd: new Date("2026-11-01T10:00:00Z"),
      exVatCents: 3900,
      vatCents: 780,
      vatRate: 20,
      totalCents: 4680,
      paidAt: new Date("2026-10-01T10:05:00Z"),
      paymentMethod: "carte bancaire",
      reference: "reso-abc",
    });
    const text = Buffer.from(pdf).toString("latin1");
    expect(text.startsWith("%PDF-1.4")).toBe(true);
    expect(text).toContain("RESO-2026-000007");
    expect(text).toContain("SIREN 991 738 733");
    expect(text).toContain("%%EOF");
    expect(text.match(/\d{10} 00000 n/g)?.length).toBe(7);
  });
});
