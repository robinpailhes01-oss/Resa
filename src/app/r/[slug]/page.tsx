import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ActionForm } from "@/components/app/ActionForm";
import { Grid2, TextArea, TextInput } from "@/components/app/Fields";
import { BookingShell, Steps } from "@/components/booking/BookingShell";
import { StatusMessage } from "@/components/ui/StatusMessage";
import {
  addDaysToDateKey,
  formatDateKeyLong,
  formatDateKeyShort,
  formatDuration,
  formatPriceCents,
  isDateKey,
  todayDateKey,
  weekdayOfDateKey,
} from "@/lib/time";
import { publicBookAction } from "@/server/app/actions/public-booking";
import { availableSlots } from "@/server/app/bookings";
import { getEstablishmentBySlug } from "@/server/app/establishments";
import { effectiveRanges } from "@/server/app/hours";
import { listPractitioners } from "@/server/app/practitioners";
import { listServices } from "@/server/app/services";
import { cn } from "@/lib/cn";
import { canAcceptOnlineBookings, resolveAccess } from "@/lib/trial";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const e = await getEstablishmentBySlug(slug).catch(() => null);
  return {
    title: e ? `Réserver chez ${e.name}` : "Réservation",
    robots: { index: false, follow: false },
  };
}

type Query = Record<string, string | string[] | undefined>;
const q = (params: Query, key: string) =>
  typeof params[key] === "string" ? (params[key] as string) : "";

export default async function ReservationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Query>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const establishment = await getEstablishmentBySlug(slug);
  if (!establishment) notFound();

  if (!establishment.bookingEnabled || !canAcceptOnlineBookings(resolveAccess(establishment))) {
    return (
      <BookingShell establishment={establishment}>
        <StatusMessage tone="pending">
          La réservation en ligne est momentanément fermée. Contactez
          directement l’établissement
          {establishment.phone ? ` au ${establishment.phone}` : ""}.
        </StatusMessage>
      </BookingShell>
    );
  }

  const [services, practitioners] = await Promise.all([
    listServices(establishment.id),
    listPractitioners(establishment.id),
  ]);
  const service = services.find((s) => s.id === q(query, "service")) ?? null;
  const eligible = service
    ? practitioners.filter(
        (p) =>
          service.practitionerIds.length === 0 ||
          service.practitionerIds.includes(p.id),
      )
    : practitioners;
  const practitionerParam = q(query, "praticien");
  const practitioner =
    eligible.find((p) => p.id === practitionerParam) ??
    (eligible.length === 1 ? eligible[0] : null);
  const today = todayDateKey(establishment.timezone);
  const date = isDateKey(q(query, "date")) ? q(query, "date") : today;
  const time = q(query, "heure");
  const base = `/r/${slug}`;
  const link = (extra: Record<string, string | undefined>) => {
    const sp = new URLSearchParams();
    const merged = {
      service: service?.id,
      praticien: practitioner?.id,
      date,
      ...extra,
    };
    for (const [k, v] of Object.entries(merged)) if (v) sp.set(k, v);
    return `${base}?${sp.toString()}`;
  };

  // Étape 1 : prestation
  if (!service) {
    return (
      <BookingShell establishment={establishment}>
        {establishment.description ? (
          <p className="mb-6 max-w-xl text-[15px] leading-6 text-ink-muted">
            {establishment.description}
          </p>
        ) : null}
        <Steps current={1} />
        <h2 className="mb-4 text-[22px]">Choisissez une prestation</h2>
        {services.length === 0 ? (
          <StatusMessage tone="pending">
            Aucune prestation n’est encore proposée à la réservation en ligne.
          </StatusMessage>
        ) : (
          <ul className="grid gap-3">
            {services.map((s) => (
              <li key={s.id}>
                <Link
                  href={`${base}?service=${s.id}`}
                  className="flex items-center gap-4 rounded-2xl bg-card p-4 ring-1 ring-line transition-colors hover:ring-brand/50 md:p-5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-[16px] font-semibold text-ink">
                      {s.name}
                    </div>
                    <div className="mt-0.5 text-[13px] text-ink-muted">
                      {formatDuration(s.durationMin)}
                      {s.description ? ` · ${s.description}` : ""}
                    </div>
                  </div>
                  <div className="text-[16px] font-semibold text-brand">
                    {s.priceCents > 0 ? formatPriceCents(s.priceCents) : ""}
                  </div>
                  <ChevronRight className="size-4 text-ink-muted" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </BookingShell>
    );
  }

  // Étape 2 : praticien + date + créneau
  const summary = (
    <aside className="rounded-2xl bg-card p-5 ring-1 ring-line">
      <div className="flex items-center justify-between">
        <h3 className="text-[16px] font-semibold text-ink">
          Votre réservation
        </h3>
        <Link
          href={base}
          className="text-[13px] font-medium text-brand underline-offset-4 hover:underline"
        >
          Modifier
        </Link>
      </div>
      <dl className="mt-3 space-y-1.5 text-[14px]">
        <div className="flex justify-between gap-3">
          <dt className="text-ink-muted">Prestation</dt>
          <dd className="text-right font-medium text-ink">{service.name}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-ink-muted">Durée</dt>
          <dd className="font-medium text-ink">
            {formatDuration(service.durationMin)}
          </dd>
        </div>
        {practitioner ? (
          <div className="flex justify-between gap-3">
            <dt className="text-ink-muted">Avec</dt>
            <dd className="font-medium text-ink">{practitioner.name}</dd>
          </div>
        ) : null}
        {time ? (
          <div className="flex justify-between gap-3">
            <dt className="text-ink-muted">Créneau</dt>
            <dd className="text-right font-medium text-ink">
              {formatDateKeyLong(date, false)} à {time}
            </dd>
          </div>
        ) : null}
        {service.priceCents > 0 ? (
          <div className="flex justify-between gap-3 border-t border-line pt-2">
            <dt className="text-ink-muted">Total</dt>
            <dd className="text-[16px] font-bold text-brand">
              {formatPriceCents(service.priceCents)}
            </dd>
          </div>
        ) : null}
      </dl>
      <p className="mt-3 text-[12px] text-ink-muted">Paiement sur place.</p>
    </aside>
  );

  if (!practitioner || !time) {
    const slots = practitioner
      ? await availableSlots({
          establishmentId: establishment.id,
          practitionerId: practitioner.id,
          dateKey: date,
          timeZone: establishment.timezone,
          durationMin: service.durationMin,
          bufferMin: service.bufferMin,
          stepMin: establishment.slotStepMin,
          minLeadMin: establishment.minLeadMin,
        })
      : [];
    const maxDate = addDaysToDateKey(today, establishment.maxHorizonDays);
    const openWeekdays = practitioner
      ? new Set(
          (await effectiveRanges(establishment.id, practitioner.id)).map(
            (r) => r.weekday,
          ),
        )
      : new Set<number>();
    const days = Array.from({ length: 7 }, (_, i) =>
      addDaysToDateKey(date, i - (i > 0 ? 0 : 0)),
    );

    return (
      <BookingShell establishment={establishment}>
        <Steps current={2} />
        <div className="grid gap-6 md:grid-cols-[1fr_300px]">
          <div className="rounded-2xl bg-card p-5 ring-1 ring-line">
            <h2 className="text-[22px]">Choisissez votre créneau</h2>
            {eligible.length > 1 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {eligible.map((p) => (
                  <Link
                    key={p.id}
                    href={link({ praticien: p.id, heure: undefined })}
                    className={cn(
                      "rounded-full px-3.5 py-2 text-[14px] font-medium ring-1 transition-colors",
                      practitioner?.id === p.id
                        ? "bg-brand text-white ring-brand"
                        : "bg-card text-ink ring-line hover:ring-brand/50",
                    )}
                  >
                    {p.name}
                  </Link>
                ))}
              </div>
            ) : null}
            {practitioner ? (
              <>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-[15px] font-semibold text-ink">
                    {formatDateKeyLong(date)}
                  </span>
                  <div className="flex gap-1">
                    <Link
                      href={link({
                        date: addDaysToDateKey(date, -7),
                        heure: undefined,
                      })}
                      aria-label="Semaine précédente"
                      className={cn(
                        "inline-flex size-9 items-center justify-center rounded-lg ring-1 ring-line",
                        addDaysToDateKey(date, -7) < today &&
                          date <= today &&
                          "pointer-events-none opacity-40",
                      )}
                    >
                      <ChevronLeft className="size-4" />
                    </Link>
                    <Link
                      href={link({
                        date: addDaysToDateKey(date, 7),
                        heure: undefined,
                      })}
                      aria-label="Semaine suivante"
                      className={cn(
                        "inline-flex size-9 items-center justify-center rounded-lg ring-1 ring-line",
                        addDaysToDateKey(date, 7) > maxDate &&
                          "pointer-events-none opacity-40",
                      )}
                    >
                      <ChevronRight className="size-4" />
                    </Link>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-7 gap-1.5">
                  {days.map((d) => {
                    const disabled =
                      d < today ||
                      d > maxDate ||
                      !openWeekdays.has(weekdayOfDateKey(d));
                    const selected = d === date;
                    return (
                      <Link
                        key={d}
                        href={link({ date: d, heure: undefined })}
                        aria-disabled={disabled}
                        className={cn(
                          "rounded-lg py-2 text-center text-[12px] leading-tight ring-1",
                          selected
                            ? "bg-brand text-white ring-brand"
                            : "bg-card text-ink ring-line hover:ring-brand/50",
                          disabled && "pointer-events-none opacity-35",
                        )}
                      >
                        <span className="block">
                          {formatDateKeyShort(d).split(" ")[0]}
                        </span>
                        <span className="block text-[14px] font-semibold">
                          {d.slice(8)}
                        </span>
                      </Link>
                    );
                  })}
                </div>
                <h3 className="mt-6 text-[15px] font-semibold text-ink">
                  Créneaux disponibles
                </h3>
                {slots.length === 0 ? (
                  <p className="mt-2 text-[14px] text-ink-muted">
                    Aucun créneau ce jour-là. Essayez un autre jour.
                  </p>
                ) : (
                  <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-5">
                    {slots.map((s) => (
                      <Link
                        key={s.label}
                        href={link({ heure: s.label })}
                        className="rounded-lg bg-card py-2.5 text-center text-[14px] font-medium text-ink ring-1 ring-line transition-colors hover:bg-brand hover:text-white hover:ring-brand"
                      >
                        {s.label}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="mt-4 text-[14px] text-ink-muted">
                Choisissez d’abord une praticienne.
              </p>
            )}
          </div>
          {summary}
        </div>
      </BookingShell>
    );
  }

  // Étape 3 : coordonnées
  return (
    <BookingShell establishment={establishment}>
      <Steps current={3} />
      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <div className="rounded-2xl bg-card p-5 ring-1 ring-line">
          <h2 className="text-[22px]">Vos coordonnées</h2>
          <p className="mt-1 text-[14px] text-ink-muted">
            <Link
              href={link({ heure: undefined })}
              className="font-medium text-brand underline-offset-4 hover:underline"
            >
              Changer de créneau
            </Link>
          </p>
          <div className="mt-5">
            <ActionForm
              action={publicBookAction}
              submitLabel="Confirmer le rendez-vous"
              pendingLabel="Confirmation…"
            >
              <>
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="serviceId" value={service.id} />
                <input
                  type="hidden"
                  name="practitionerId"
                  value={practitioner.id}
                />
                <input type="hidden" name="date" value={date} />
                <input type="hidden" name="time" value={time} />
                <div
                  aria-hidden="true"
                  className="absolute -left-[9999px] h-px w-px overflow-hidden"
                >
                  <label htmlFor="website">Ne pas remplir</label>
                  <input
                    id="website"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>
                <Grid2>
                  <TextInput
                    id="firstName"
                    name="firstName"
                    label="Prénom"
                    autoComplete="given-name"
                    required
                    maxLength={60}
                  />
                  <TextInput
                    id="lastName"
                    name="lastName"
                    label="Nom"
                    autoComplete="family-name"
                    required
                    maxLength={60}
                  />
                </Grid2>
                <TextInput
                  id="email"
                  name="email"
                  label="Email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  required
                  maxLength={254}
                  help="Pour recevoir la confirmation et le rappel."
                />
                <TextInput
                  id="phone"
                  name="phone"
                  label="Téléphone"
                  type="tel"
                  autoComplete="tel"
                  required
                  maxLength={30}
                />
                <TextArea
                  id="clientNotes"
                  name="clientNotes"
                  label="Un message pour l’établissement (facultatif)"
                  maxLength={400}
                />
                {establishment.bookingTerms ? (
                  <div className="rounded-xl bg-page px-4 py-3 text-[13px] leading-5 text-ink-muted">
                    <p className="font-semibold text-ink">
                      Conditions de {establishment.name}
                    </p>
                    <p className="mt-1 whitespace-pre-line">
                      {establishment.bookingTerms}
                    </p>
                  </div>
                ) : null}
                <p className="text-[12px] leading-5 text-ink-muted">
                  Vos coordonnées servent uniquement à gérer ce rendez-vous.
                  Annulation possible en ligne jusqu’à{" "}
                  {establishment.cancellationHours} h avant.
                  {establishment.bookingTerms
                    ? " En confirmant, vous acceptez les conditions ci-dessus."
                    : ""}
                </p>
              </>
            </ActionForm>
          </div>
        </div>
        {summary}
      </div>
    </BookingShell>
  );
}
