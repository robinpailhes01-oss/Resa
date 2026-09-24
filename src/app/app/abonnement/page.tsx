import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CreditCard, ShieldCheck } from "lucide-react";
import { ActionForm } from "@/components/app/ActionForm";
import { Card, PageHeader } from "@/components/app/PageHeader";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { offer } from "@/config/offer";
import { formatEuros } from "@/lib/billing";
import { formatDateKeyLong, todayDateKey } from "@/lib/time";
import { resolveAccess } from "@/lib/trial";
import { requireEstablishment } from "@/server/auth/guards";
import { amounts, billingProvider, confirmPayment, hasAutomaticRenewal, listPayments } from "@/server/app/billing";
import { cancelSubscriptionAction, startPaymentAction } from "@/server/app/actions/billing";

export const metadata: Metadata = { title: "Abonnement" };

export default async function AbonnementPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { establishment: e } = await requireEstablishment();
  const params = await searchParams;
  const reference = typeof params.checkout === "string" ? params.checkout : null;
  if (reference) {
    // Retour de la page de paiement : on vérifie l'état auprès du prestataire (jamais depuis l'URL),
    // puis on recharge la page sans le paramètre pour afficher la situation à jour.
    const confirmed = await confirmPayment({ reference }).catch(() => null);
    redirect(`/app/abonnement?paiement=${encodeURIComponent(confirmed?.status ?? "inconnu")}`);
  }
  const outcome = typeof params.paiement === "string" ? params.paiement : null;
  const fresh = e;
  const access = resolveAccess(fresh);
  const a = amounts();
  const payments = (await listPayments(fresh.id)).filter((p) => p.status !== "expired");
  const fmt = (d: Date | null) => (d ? formatDateKeyLong(todayDateKey(fresh.timezone, d)) : null);
  const provider = billingProvider();
  const automatic = provider === "mollie" ? await hasAutomaticRenewal(fresh.id) : false;

  const statusLine =
    access.state === "trial"
      ? `Essai gratuit jusqu’au ${fmt(access.endsAt)}.`
      : access.state === "active"
        ? `Abonnement actif${access.paidUntil ? `, à jour jusqu’au ${fmt(access.paidUntil)}` : ""}.`
        : access.state === "past_due"
          ? `Paiement en attente${access.paidUntil ? ` depuis le ${fmt(access.paidUntil)}` : ""} : réservation en ligne suspendue.`
          : access.state === "expired"
            ? "Essai terminé : réservation en ligne suspendue."
            : "Abonnement arrêté.";

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Abonnement" intro={provider === "mollie" ? "Un seul tarif, sans engagement de durée. Prélèvement automatique chaque mois par carte ou SEPA, sécurisé par Mollie." : "Un seul tarif, sans engagement de durée. Paiement sécurisé par carte via SumUp."} />

      {outcome === "paid" ? (
        <StatusMessage tone="success" className="mb-6">
          Paiement reçu, merci. Votre abonnement est à jour jusqu’au {fmt(fresh.paidUntil)}. Votre facture vous a été envoyée par email.
        </StatusMessage>
      ) : outcome === "failed" || outcome === "expired" ? (
        <StatusMessage tone="error" className="mb-6">Le paiement n’a pas abouti. Aucun montant n’a été prélevé : vous pouvez réessayer ci-dessous.</StatusMessage>
      ) : outcome ? (
        <StatusMessage tone="pending" className="mb-6">
          Le paiement n’est pas encore confirmé. Si vous avez bien payé, il sera pris en compte dans les minutes qui suivent (un virement SEPA peut prendre quelques jours).
        </StatusMessage>
      ) : null}

      <Card className="mb-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="eyebrow">Votre situation</p>
            <p className="mt-2 text-[17px] font-semibold text-ink">{statusLine}</p>
            {fresh.cancelAtPeriodEnd ? (
              <p className="mt-1 text-[14px] text-ink-muted">Résiliation demandée : l’abonnement s’arrêtera à la fin de la période payée.</p>
            ) : automatic && access.state === "active" ? (
              <p className="mt-1 text-[14px] text-ink-muted">Prélèvement automatique programmé le {fmt(fresh.paidUntil)} sur votre moyen de paiement enregistré.</p>
            ) : null}
            <dl className="mt-5 grid max-w-sm grid-cols-[1fr_auto] gap-y-1.5 text-[14px]">
              <dt className="text-ink-muted">Abonnement mensuel HT</dt>
              <dd className="text-right tabular-nums text-ink">{formatEuros(a.exVatCents)}</dd>
              {a.vatRate > 0 ? (
                <>
                  <dt className="text-ink-muted">TVA {a.vatRate.toLocaleString("fr-FR")} %</dt>
                  <dd className="text-right tabular-nums text-ink">{formatEuros(a.vatCents)}</dd>
                </>
              ) : (
                <>
                  <dt className="text-ink-muted">TVA</dt>
                  <dd className="text-right text-ink">non applicable</dd>
                </>
              )}
              <dt className="border-t border-line pt-1.5 font-semibold text-ink">Total par mois</dt>
              <dd className="border-t border-line pt-1.5 text-right font-semibold tabular-nums text-ink">{formatEuros(a.totalCents)}</dd>
            </dl>
          </div>
          <div className="w-full max-w-xs">
            {provider ? (
              access.state === "cancelled" || fresh.cancelAtPeriodEnd || (automatic && access.state === "active") ? (
                automatic && access.state === "active" ? (
                  <p className="flex items-start gap-2 rounded-xl bg-success-tint px-4 py-3 text-[13px] leading-5 text-ink">
                    <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-success" />
                    Rien à faire : le renouvellement est automatique. Pour changer de carte, résiliez puis réactivez avec le nouveau moyen de paiement.
                  </p>
                ) : null
              ) : (
                <ActionForm action={startPaymentAction} submitLabel={access.state === "active" ? `Payer le mois suivant · ${formatEuros(a.totalCents)}` : `Payer ${formatEuros(a.totalCents)} et activer`} pendingLabel="Ouverture du paiement…" className="flex flex-col gap-3">
                  <p className="flex items-start gap-2 text-[13px] leading-5 text-ink-muted">
                    <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-success" />
                    {provider === "mollie"
                      ? `Vous serez redirigé vers la page de paiement sécurisée Mollie (carte ou SEPA). Le moyen de paiement est enregistré chez Mollie pour les mois suivants ; ${offer.brandName} n’y a jamais accès.`
                      : `Vous serez redirigé vers la page de paiement sécurisée SumUp. ${offer.brandName} ne voit jamais votre carte.`}
                  </p>
                </ActionForm>
              )
            ) : (
              <StatusMessage tone="pending">Le paiement en ligne sera activé très prochainement. Nous vous préviendrons par email.</StatusMessage>
            )}
          </div>
        </div>
      </Card>

      <Card className="mb-6">
        <h2 className="flex items-center gap-2 text-[18px]">
          <CreditCard aria-hidden="true" className="size-4 text-brand" /> Historique des paiements
        </h2>
        {payments.length === 0 ? (
          <p className="mt-2 text-[14px] text-ink-muted">Aucun paiement pour l’instant.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line text-[14px]">
            {payments.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                <span className="text-ink">
                  Du {fmt(p.periodStart)} au {fmt(p.periodEnd)}
                </span>
                <span className="flex items-center gap-3">
                  <span className="tabular-nums text-ink">{formatEuros(p.amountCents)}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[12px] font-medium ${p.status === "paid" ? "bg-success-tint text-success" : p.status === "pending" ? "bg-soft-tint text-brand" : "bg-page text-ink-muted ring-1 ring-line"}`}>
                    {p.status === "paid" ? `Payé le ${fmt(p.paidAt)}` : p.status === "pending" ? "En attente" : p.status === "failed" ? "Échoué" : "Expiré"}
                  </span>
                  {p.status === "pending" && p.hostedUrl ? (
                    <a href={p.hostedUrl} className="font-medium text-brand underline-offset-4 hover:underline">
                      Payer
                    </a>
                  ) : null}
                  {p.status === "paid" && p.invoiceNumber ? (
                    <a href={`/app/abonnement/factures/${p.id}`} target="_blank" rel="noopener" className="font-medium text-brand underline-offset-4 hover:underline">
                      Facture {p.invoiceNumber}
                    </a>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {access.state === "active" || access.state === "past_due" ? (
        <Card>
          <h2 className="text-[18px]">Résiliation</h2>
          <p className="mt-1 text-[14px] leading-6 text-ink-muted">Sans engagement : l’abonnement s’arrête à la fin de la période déjà payée, vos données restent accessibles.</p>
          <ActionForm action={cancelSubscriptionAction} submitLabel={fresh.cancelAtPeriodEnd ? "Annuler la résiliation" : "Résilier en fin de période"} variant="secondary" className="mt-3 flex flex-col gap-3">
            {fresh.cancelAtPeriodEnd ? <input type="hidden" name="resume" value="1" /> : null}
          </ActionForm>
        </Card>
      ) : null}
    </div>
  );
}
