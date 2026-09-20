import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { AgendaDay } from "@/components/app/AgendaDay";
import { OnboardingChecklist } from "@/components/app/OnboardingChecklist";
import { EmptyState, PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/Button";
import { addDaysToDateKey, formatDateKeyLong, isDateKey, todayDateKey } from "@/lib/time";
import { requireEstablishment } from "@/server/auth/guards";
import { listBookingsForDay } from "@/server/app/bookings";
import { listOpeningHours } from "@/server/app/hours";
import { listPractitioners } from "@/server/app/practitioners";
import { listServices } from "@/server/app/services";

export const metadata: Metadata = { title: "Agenda" };

export default async function AgendaPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { establishment } = await requireEstablishment();
  const params = await searchParams;
  const today = todayDateKey(establishment.timezone);
  const dateKey = typeof params.date === "string" && isDateKey(params.date) ? params.date : today;

  const [practitioners, bookings, services, hours] = await Promise.all([
    listPractitioners(establishment.id),
    listBookingsForDay(establishment.id, dateKey, establishment.timezone),
    listServices(establishment.id),
    listOpeningHours(establishment.id, null),
  ]);

  const opening = hours.length ? Math.min(...hours.map((h) => h.startMin)) : 9 * 60;
  const closing = hours.length ? Math.max(...hours.map((h) => h.endMin)) : 19 * 60;
  const startMin = Math.max(0, Math.floor(opening / 60) * 60 - 60);
  const endMin = Math.min(24 * 60, Math.ceil(closing / 60) * 60 + 60);

  const steps = [
    { href: "/app/prestations", label: "Prestations", done: services.length > 0, hint: services.length ? `${services.length} prestation${services.length > 1 ? "s" : ""}` : "Ajoutez ce que l’on peut réserver" },
    { href: "/app/parametres/horaires", label: "Horaires", done: hours.length > 0, hint: hours.length ? "Horaires définis" : "Vos jours et heures d’ouverture" },
    { href: "/app/equipe", label: "Équipe", done: practitioners.length > 0, hint: `${practitioners.length} praticien${practitioners.length > 1 ? "s" : ""}` },
  ];

  const nav = (target: string, label: string, icon: React.ReactNode) => (
    <Link href={`/app/agenda?date=${target}`} aria-label={label} className="inline-flex size-10 items-center justify-center rounded-lg ring-1 ring-line hover:bg-page">
      {icon}
    </Link>
  );

  return (
    <div>
      <PageHeader
        title="Agenda"
        intro={formatDateKeyLong(dateKey)}
        actions={
          <>
            <div className="flex items-center gap-1.5">
              {nav(addDaysToDateKey(dateKey, -1), "Jour précédent", <ChevronLeft className="size-4" />)}
              <Link href="/app/agenda" className="inline-flex min-h-10 items-center rounded-lg px-3 text-[14px] font-medium ring-1 ring-line hover:bg-page">
                Aujourd’hui
              </Link>
              {nav(addDaysToDateKey(dateKey, 1), "Jour suivant", <ChevronRight className="size-4" />)}
              <label className="sr-only" htmlFor="agenda-date">
                Choisir une date
              </label>
              <form action="/app/agenda" className="contents">
                <input
                  id="agenda-date"
                  type="date"
                  name="date"
                  defaultValue={dateKey}
                  className="min-h-10 rounded-lg border border-line bg-card px-2 text-[14px] text-ink"
                />
                <button type="submit" className="sr-only">
                  Afficher
                </button>
              </form>
            </div>
            <Button href={`/app/rendez-vous/nouveau?date=${dateKey}`} size="compact">
              <Plus aria-hidden="true" /> Nouveau rendez-vous
            </Button>
          </>
        }
      />
      <OnboardingChecklist steps={steps} slug={establishment.slug} />
      {practitioners.length === 0 ? (
        <EmptyState title="Aucun praticien actif" text="Ajoutez au moins un praticien pour afficher l’agenda." action={<Button href="/app/equipe/nouveau">Ajouter un praticien</Button>} />
      ) : (
        <AgendaDay timeZone={establishment.timezone} practitioners={practitioners} bookings={bookings} startMin={startMin} endMin={endMin} />
      )}
      <p className="mt-4 text-[13px] text-ink-muted">
        {bookings.filter((b) => b.status === "confirmed" || b.status === "pending").length} rendez-vous ce jour. Cliquez sur un rendez-vous pour le détail.
      </p>
    </div>
  );
}
