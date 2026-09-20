import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/app/ActionForm";
import { ConfirmButton } from "@/components/app/ConfirmButton";
import { TextArea } from "@/components/app/Fields";
import { Card, PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/Button";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { formatDateTimeFr, formatDuration, formatPriceCents, formatTimeFr, toZonedParts } from "@/lib/time";
import { requireEstablishment } from "@/server/auth/guards";
import { setBookingStatusAction, updateBookingNotesAction } from "@/server/app/actions/bookings";
import { getBooking, type BookingStatus } from "@/server/app/bookings";

export const metadata: Metadata = { title: "Rendez-vous" };

const labels: Record<BookingStatus, string> = { pending: "En attente", confirmed: "Confirmé", completed: "Terminé", cancelled: "Annulé", no_show: "Absent" };
const badge: Record<BookingStatus, string> = {
  pending: "bg-accent-tint text-[#8a4b1f]",
  confirmed: "bg-success-tint text-success",
  completed: "bg-soft-tint text-brand",
  cancelled: "bg-error-tint text-error",
  no_show: "bg-page text-ink-muted ring-1 ring-line",
};

export default async function RendezVousPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { establishment } = await requireEstablishment();
  const { id } = await params;
  const query = await searchParams;
  const booking = await getBooking(establishment.id, id);
  if (!booking) notFound();
  const tz = establishment.timezone;
  const dateKey = toZonedParts(booking.startsAt, tz).dateKey;
  const setStatus = (status: BookingStatus) => setBookingStatusAction.bind(null, booking.id, status);
  const active = booking.status === "confirmed" || booking.status === "pending";

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title={booking.serviceName}
        intro={`${formatDateTimeFr(booking.startsAt, tz)} – ${formatTimeFr(booking.endsAt, tz)} · ${formatDuration(booking.durationMin)}`}
        actions={
          <Button href={`/app/agenda?date=${dateKey}`} variant="secondary" size="compact">
            Retour à l’agenda
          </Button>
        }
      />
      {query.cree ? (
        <StatusMessage tone="success" className="mb-6">
          Rendez-vous enregistré.{booking.client?.email ? " La confirmation par email part dans quelques instants." : ""}
        </StatusMessage>
      ) : null}
      <Card className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className={`rounded-full px-3 py-1 text-[13px] font-semibold ${badge[booking.status]}`}>{labels[booking.status]}</span>
          <span className="text-[13px] text-ink-muted">{booking.source === "online" ? "Réservé en ligne" : "Ajouté par vous"}</span>
        </div>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-[12px] font-medium uppercase tracking-wide text-ink-muted">Cliente</dt>
            <dd className="mt-1 text-[16px] font-semibold text-ink">
              {booking.client ? (
                <Link href={`/app/clients/${booking.client.id}`} className="underline-offset-4 hover:underline">
                  {`${booking.client.firstName} ${booking.client.lastName}`.trim()}
                </Link>
              ) : (
                "—"
              )}
            </dd>
            {booking.client?.email ? <dd className="text-[14px] text-ink-muted">{booking.client.email}</dd> : null}
            {booking.client?.phone ? <dd className="text-[14px] text-ink-muted">{booking.client.phone}</dd> : null}
          </div>
          <div>
            <dt className="text-[12px] font-medium uppercase tracking-wide text-ink-muted">Avec</dt>
            <dd className="mt-1 text-[16px] font-semibold text-ink">{booking.practitionerName}</dd>
            <dt className="mt-3 text-[12px] font-medium uppercase tracking-wide text-ink-muted">Prix</dt>
            <dd className="mt-1 text-[16px] font-semibold text-ink">{booking.priceCents > 0 ? formatPriceCents(booking.priceCents) : "—"}</dd>
          </div>
        </dl>
        {booking.clientNotes ? (
          <div className="mt-5 rounded-xl bg-page p-4 text-[14px]">
            <div className="text-[12px] font-medium uppercase tracking-wide text-ink-muted">Message de la cliente</div>
            <p className="mt-1 text-ink">{booking.clientNotes}</p>
          </div>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-line pt-5">
          {booking.status === "pending" ? <ConfirmButton action={setStatus("confirmed")} variant="primary">Confirmer</ConfirmButton> : null}
          {active ? <ConfirmButton action={setStatus("completed")}>Marquer terminé</ConfirmButton> : null}
          {active ? <ConfirmButton action={setStatus("no_show")}>Cliente absente</ConfirmButton> : null}
          {active ? (
            <ConfirmButton action={setStatus("cancelled")} variant="danger" confirm="Annuler ce rendez-vous ? La cliente recevra un email d’annulation si elle a une adresse.">
              Annuler le rendez-vous
            </ConfirmButton>
          ) : null}
          {!active && booking.status !== "completed" ? <ConfirmButton action={setStatus("confirmed")}>Réactiver</ConfirmButton> : null}
        </div>
      </Card>
      <Card>
        <ActionForm action={updateBookingNotesAction} submitLabel="Enregistrer la note" variant="secondary">
          <input type="hidden" name="id" value={booking.id} />
          <TextArea id="notes" name="notes" label="Note interne" maxLength={600} defaultValue={booking.notes ?? ""} help="Visible uniquement par vous." />
        </ActionForm>
      </Card>
    </div>
  );
}
