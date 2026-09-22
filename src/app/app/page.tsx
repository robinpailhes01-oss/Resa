import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, CalendarDays, Plus } from "lucide-react";
import { BookingsChart } from "@/components/app/BookingsChart";
import { OnboardingChecklist } from "@/components/app/OnboardingChecklist";
import { Card, PageHeader } from "@/components/app/PageHeader";
import { DeltaBadge, StatTile } from "@/components/app/StatTile";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { PERIODS, delta, isPeriodKey, type PeriodKey } from "@/lib/stats";
import {
  formatDateKeyLong,
  formatDateKeyShort,
  formatDuration,
  formatPriceCents,
  formatTimeFr,
  todayDateKey,
} from "@/lib/time";
import { getUserEstablishment, requireUser } from "@/server/auth/guards";
import { listBookingsForDay } from "@/server/app/bookings";
import { listOpeningHours } from "@/server/app/hours";
import { listPractitioners } from "@/server/app/practitioners";
import { listServices } from "@/server/app/services";
import { getDashboardStats } from "@/server/app/stats";
import { launchNotice } from "@/content/fr/app";

export const metadata: Metadata = { title: "Tableau de bord" };

const pct = (v: number | null) =>
  v === null ? "—" : `${Math.round(v * 100)} %`;
const statusLabel: Record<string, string> = {
  pending: "À confirmer",
  confirmed: "Confirmé",
  completed: "Terminé",
  cancelled: "Annulé",
  no_show: "Absente",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser("/app");
  const establishment = await getUserEstablishment(user.id);
  if (!establishment) redirect("/app/bienvenue");

  const params = await searchParams;
  const periodKey: PeriodKey =
    typeof params.periode === "string" && isPeriodKey(params.periode)
      ? params.periode
      : "mois";
  const tz = establishment.timezone;
  const today = todayDateKey(tz);
  const now = new Date();

  const [stats, todayBookings, services, hours, practitioners] =
    await Promise.all([
      getDashboardStats(establishment.id, tz, periodKey, now),
      listBookingsForDay(establishment.id, today, tz),
      listServices(establishment.id),
      listOpeningHours(establishment.id, null),
      listPractitioners(establishment.id),
    ]);
  const c = stats.current;
  const activeToday = todayBookings.filter(
    (b) =>
      b.status === "pending" ||
      b.status === "confirmed" ||
      b.status === "completed",
  );
  const upcomingToday = activeToday
    .filter((b) => b.endsAt.getTime() >= now.getTime())
    .slice(0, 6);
  const todayRevenue = activeToday.reduce((a, b) => a + b.priceCents, 0);

  const steps = [
    {
      href: "/app/prestations",
      label: "Prestations",
      done: services.length > 0,
      hint: services.length
        ? `${services.length} prestation${services.length > 1 ? "s" : ""}`
        : "Ajoutez ce que l’on peut réserver",
    },
    {
      href: "/app/parametres/horaires",
      label: "Horaires",
      done: hours.length > 0,
      hint: hours.length
        ? "Horaires définis"
        : "Vos jours et heures d’ouverture",
    },
    {
      href: "/app/equipe",
      label: "Équipe",
      done: practitioners.length > 0,
      hint: `${practitioners.length} praticien${practitioners.length > 1 ? "s" : ""}`,
    },
  ];
  const periodLabel = `${formatDateKeyShort(stats.period.startKey)} – ${formatDateKeyShort(stats.period.endKey)}`;

  return (
    <div>
      <PageHeader
        title={`Bonjour ${user.fullName.split(" ")[0]}`}
        intro={formatDateKeyLong(today)}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button href="/app/agenda" variant="secondary" size="compact">
              <CalendarDays className="size-4" /> Agenda du jour
            </Button>
            <Button href="/app/rendez-vous/nouveau" size="compact">
              <Plus className="size-4" /> Nouveau rendez-vous
            </Button>
          </div>
        }
      />
      <OnboardingChecklist steps={steps} slug={establishment.slug} />
      <p className="mb-6 rounded-xl border border-line bg-soft-tint/60 px-4 py-3 text-[14px] leading-6 text-ink">
        <span className="font-semibold">{launchNotice.title} · </span>
        {launchNotice.text}
      </p>

      <Card className="mb-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-[18px]">Aujourd’hui</h2>
          <p className="text-[14px] text-ink-muted">
            {activeToday.length} rendez-vous
            {todayRevenue > 0 ? ` · ${formatPriceCents(todayRevenue)}` : ""}
          </p>
        </div>
        {upcomingToday.length === 0 ? (
          <p className="mt-3 text-[14px] text-ink-muted">
            {activeToday.length === 0
              ? "Aucun rendez-vous aujourd’hui."
              : "Tous les rendez-vous du jour sont passés."}
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {upcomingToday.map((b) => (
              <li key={b.id}>
                <Link
                  href={`/app/rendez-vous/${b.id}`}
                  className="flex items-center gap-4 py-2.5 text-[14px] hover:text-brand"
                >
                  <span className="w-12 shrink-0 font-semibold tabular-nums text-ink">
                    {formatTimeFr(b.startsAt, tz)}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    <span className="font-medium text-ink">
                      {b.serviceName}
                    </span>
                    <span className="text-ink-muted">
                      {" · "}
                      {b.client
                        ? `${b.client.firstName} ${b.client.lastName}`.trim()
                        : "Sans fiche"}{" "}
                      · {b.practitionerName}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "hidden shrink-0 rounded-full px-2 py-0.5 text-[12px] font-medium sm:inline",
                      b.status === "pending"
                        ? "bg-accent-tint text-ink"
                        : "bg-success-tint text-success",
                    )}
                  >
                    {statusLabel[b.status]}
                  </span>
                  <ArrowRight
                    className="size-4 shrink-0 text-ink-muted"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[18px]">
          Activité{" "}
          <span className="font-normal text-ink-muted">· {periodLabel}</span>
        </h2>
        <nav
          aria-label="Période"
          className="flex gap-1 rounded-xl bg-card p-1 ring-1 ring-line"
        >
          {PERIODS.map((p) => (
            <Link
              key={p.key}
              href={p.key === "mois" ? "/app" : `/app?periode=${p.key}`}
              aria-current={p.key === periodKey ? "page" : undefined}
              className={cn(
                "rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors",
                p.key === periodKey
                  ? "bg-brand text-white"
                  : "text-ink-muted hover:text-brand",
              )}
            >
              {p.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Rendez-vous"
          value={c.bookings}
          hint={`${c.online} en ligne · ${c.manual} ajoutés à la main`}
          footer={
            <DeltaBadge value={delta(c.bookings, stats.previous.bookings)} />
          }
        />
        <StatTile
          label="Chiffre d’affaires réalisé"
          value={formatPriceCents(c.revenueDoneCents)}
          hint={
            c.revenueUpcomingCents > 0
              ? `+ ${formatPriceCents(c.revenueUpcomingCents)} à venir`
              : "Rendez-vous passés, hors annulations"
          }
          footer={
            <DeltaBadge
              value={delta(c.revenueDoneCents, stats.previous.revenueDoneCents)}
            />
          }
        />
        <StatTile
          label="Taux de remplissage"
          value={pct(stats.fillRate)}
          hint={
            stats.openMinutes > 0
              ? `${formatDuration(c.bookedMinutes)} réservées sur ${formatDuration(stats.openMinutes)} d’ouverture`
              : "Définissez vos horaires pour le calculer"
          }
        />
        <StatTile
          label="Annulations et absences"
          value={c.cancelled + c.noShows}
          hint={`${c.cancelled} annulation${c.cancelled > 1 ? "s" : ""} · ${c.noShows} absence${c.noShows > 1 ? "s" : ""}`}
          footer={
            <span className="text-[12px] text-ink-muted">
              Taux de perte : {pct(c.lossRate)} · {stats.newClients} nouvelle
              {stats.newClients > 1 ? "s" : ""} cliente
              {stats.newClients > 1 ? "s" : ""}
            </span>
          }
        />
      </div>

      <Card className="mt-6">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-[18px]">Rendez-vous par jour</h2>
          <span className="text-[13px] text-ink-muted">
            {c.bookings} sur la période
          </span>
        </div>
        <div className="mt-4">
          <BookingsChart data={c.perDay} todayKey={today} />
        </div>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-[18px]">Prestations les plus demandées</h2>
          {c.topServices.length === 0 ? (
            <p className="mt-3 text-[14px] text-ink-muted">
              Aucun rendez-vous sur la période.
            </p>
          ) : (
            <ol className="mt-3 space-y-3">
              {c.topServices.map((s) => {
                const share = c.bookings > 0 ? s.count / c.bookings : 0;
                return (
                  <li key={s.name} className="text-[14px]">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="min-w-0 truncate font-medium text-ink">
                        {s.name}
                      </span>
                      <span className="shrink-0 tabular-nums text-ink-muted">
                        {s.count} · {formatPriceCents(s.revenueCents)}
                      </span>
                    </div>
                    <div
                      className="mt-1 h-1.5 overflow-hidden rounded-full bg-soft-tint"
                      aria-hidden="true"
                    >
                      <div
                        className="h-full rounded-full bg-brand"
                        style={{
                          width: `${Math.max(2, Math.round(share * 100))}%`,
                        }}
                      />
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </Card>
        <Card>
          <h2 className="text-[18px]">Par praticien</h2>
          {stats.perPractitioner.length === 0 ? (
            <p className="mt-3 text-[14px] text-ink-muted">
              Aucun praticien actif.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {stats.perPractitioner.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-3 py-2.5 text-[14px]"
                >
                  <span className="min-w-0 truncate font-medium text-ink">
                    {p.name}
                  </span>
                  <span className="shrink-0 tabular-nums text-ink-muted">
                    {p.count} rdv · {formatDuration(p.bookedMinutes)} ·
                    remplissage {pct(p.fillRate)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
