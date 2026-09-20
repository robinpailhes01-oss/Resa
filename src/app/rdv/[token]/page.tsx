import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/app/ActionForm";
import { BookingShell } from "@/components/booking/BookingShell";
import { Button } from "@/components/ui/Button";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { formatDateTimeFr, formatDuration, formatPriceCents } from "@/lib/time";
import { cancelByClientAction } from "@/server/app/actions/public-booking";
import {
  getBookingByManageToken,
  isCancellableByClient,
} from "@/server/app/bookings";
import { getEstablishmentById } from "@/server/app/establishments";

export const metadata: Metadata = {
  title: "Votre rendez-vous",
  robots: { index: false, follow: false },
};

export default async function RendezVousClientPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { token } = await params;
  const query = await searchParams;
  const booking = await getBookingByManageToken(token);
  if (!booking) notFound();
  const establishment = await getEstablishmentById(booking.establishmentId);
  if (!establishment) notFound();
  const tz = establishment.timezone;
  const cancellable = isCancellableByClient(
    booking,
    establishment.cancellationHours,
  );
  const address = [
    establishment.addressLine,
    [establishment.postalCode, establishment.city].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <BookingShell establishment={establishment}>
      {query.nouveau ? (
        <StatusMessage tone="success" className="mb-6">
          Votre rendez-vous est confirmé.
          {booking.client?.email
            ? ` Un email de confirmation est envoyé à ${booking.client.email}.`
            : ""}
        </StatusMessage>
      ) : null}
      {query.annule ? (
        <StatusMessage tone="success" className="mb-6">
          Votre rendez-vous est annulé.
        </StatusMessage>
      ) : null}
      <div className="rounded-2xl bg-card p-5 ring-1 ring-line md:p-6">
        <h2 className="text-[22px]">
          {booking.status === "cancelled"
            ? "Rendez-vous annulé"
            : "Votre rendez-vous"}
        </h2>
        <dl className="mt-4 space-y-2 text-[15px]">
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">Prestation</dt>
            <dd className="text-right font-medium text-ink">
              {booking.serviceName}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">Date</dt>
            <dd className="text-right font-medium text-ink">
              {formatDateTimeFr(booking.startsAt, tz)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">Durée</dt>
            <dd className="font-medium text-ink">
              {formatDuration(booking.durationMin)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">Avec</dt>
            <dd className="font-medium text-ink">{booking.practitionerName}</dd>
          </div>
          {booking.priceCents > 0 ? (
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Prix</dt>
              <dd className="font-medium text-ink">
                {formatPriceCents(booking.priceCents)} · paiement sur place
              </dd>
            </div>
          ) : null}
          {address ? (
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Adresse</dt>
              <dd className="text-right font-medium text-ink">{address}</dd>
            </div>
          ) : null}
        </dl>
        {booking.status !== "cancelled" && establishment.bookingTerms ? (
          <div className="mt-5 rounded-xl bg-page px-4 py-3 text-[13px] leading-5 text-ink-muted">
            <p className="font-semibold text-ink">
              Conditions de {establishment.name}
            </p>
            <p className="mt-1 whitespace-pre-line">
              {establishment.bookingTerms}
            </p>
          </div>
        ) : null}
        {booking.status !== "cancelled" ? (
          <div className="mt-6 border-t border-line pt-5">
            {cancellable ? (
              <ActionForm
                action={cancelByClientAction}
                submitLabel="Annuler ce rendez-vous"
                pendingLabel="Annulation…"
                variant="secondary"
                className="flex flex-col gap-3"
              >
                <input type="hidden" name="token" value={token} />
                <p className="text-[14px] text-ink-muted">
                  Un empêchement ? Vous pouvez annuler en ligne jusqu’à{" "}
                  {establishment.cancellationHours} h avant.
                </p>
              </ActionForm>
            ) : (
              <p className="text-[14px] text-ink-muted">
                Pour modifier ou annuler ce rendez-vous, contactez directement{" "}
                {establishment.name}
                {establishment.phone ? ` au ${establishment.phone}` : ""}.
              </p>
            )}
          </div>
        ) : (
          <div className="mt-6">
            <Button href={`/r/${establishment.slug}`}>
              Reprendre rendez-vous
            </Button>
          </div>
        )}
      </div>
    </BookingShell>
  );
}
