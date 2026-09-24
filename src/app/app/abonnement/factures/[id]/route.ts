import { requireEstablishment } from "@/server/auth/guards";
import { invoicePdf } from "@/server/app/billing";

export const runtime = "nodejs";

/** Téléchargement de la facture PDF d'un paiement de l'établissement connecté. */
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { establishment } = await requireEstablishment();
  const { id } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response("Introuvable", { status: 404 });
  const invoice = await invoicePdf(establishment.id, id);
  if (!invoice) return new Response("Introuvable", { status: 404 });
  return new Response(Buffer.from(invoice.content), {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="${invoice.filename}"`, "Cache-Control": "private, no-store" },
  });
}
