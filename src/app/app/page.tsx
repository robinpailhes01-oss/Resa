import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";
import { ArrowRight, CalendarCheck, CalendarDays, Gauge, Plus, UserX, Wallet } from "lucide-react";
import { BookingsChart } from "@/components/app/BookingsChart";
import { OnboardingChecklist } from "@/components/app/OnboardingChecklist";
import { Card } from "@/components/app/PageHeader";
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
import { listPhotos } from "@/server/app/photos";
import { listReviews } from "@/server/app/reviews";
import { pageEditor } from "@/content/fr/app";

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

  const [stats, todayBookings, services, hours, practitioners, photos, reviews] =
    await Promise.all([
      getDashboardStats(establishment.id, tz, periodKey, now),
      listBookingsForDay(establishment.id, today, tz),
      listServices(establishment.id),
      listOpeningHours(establishment.id, null),
      listPractitioners(establishment.id),
      listPhotos(establishment.id),
      listReviews(establishment.id),
    ]);
  const shownReviews = reviews.filter((r) => !r.hidden).length;
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
      <section className="powder-panel grain relative isolate mb-8 overflow-hidden rounded-[22px] md:rounded-[28px]">
        <Image
          src="/brand/ciseaux.webp"
          alt=""
          width={974}
          height={494}
          sizes="520px"
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 -z-10 hidden h-full w-[52%] object-cover opacity-90 [mask-image:linear-gradient(to_right,transparent,#000_55%)] md:block"
        />
        <div className="relative px-6 py-8 md:px-10 md:py-11">
          <p className="eyebrow !text-page/85">{formatDateKeyLong(today)}</p>
          <h1 className="mt-3 text-[36px] leading-none tracking-[-0.04em] text-page md:text-[52px]">Bonjour {user.fullName.split(" ")[0]}</h1>
          <p className="mt-4 max-w-md text-[15px] leading-6 text-page md:text-[16px]">
            {activeToday.length === 0
              ? "Aucun rendez-vous aujourd’hui."
              : `${activeToday.length} rendez-vous aujourd’hui${todayRevenue > 0 ? `, pour ${formatPriceCents(todayRevenue)}` : ""}.`}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            <Button href="/app/rendez-vous/nouveau" variant="inverse" size="compact">
              <Plus className="size-4" /> Nouveau rendez-vous
            </Button>
            <Button href="/app/agenda" variant="ghost" size="compact" className="!text-page hover:!bg-page/10">
              <CalendarDays className="size-4" /> Agenda du jour
            </Button>
          </div>
        </div>
      </section>
      <OnboardingChecklist steps={steps} slug={establishment.slug} />

      <Card className="mb-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div aria-hidden="true" className="hidden shrink-0 grid-cols-2 gap-1 overflow-hidden rounded-2xl sm:grid">
              {[0, 1, 2, 3].map((i) =>
                photos[i] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={photos[i].url} alt="" loading="lazy" className="size-12 object-cover" />
                ) : (
                  <span key={i} className="size-12 bg-soft-tint" />
                ),
              )}
            </div>
            <div className="min-w-0">
              <h2 className="heading-3">{pageEditor.dashboard.title}</h2>
              <p className="mt-1 text-[14px] text-ink-muted">{pageEditor.dashboard.text}</p>
              <ul className="mt-3 flex flex-wrap gap-2 text-[12px] font-medium">
                {[
                  { label: pageEditor.dashboard.photos(photos.length), ok: photos.length > 0 },
                  { label: pageEditor.dashboard.services(services.length), ok: services.length > 0 },
                  { label: pageEditor.dashboard.reviews(shownReviews), ok: shownReviews > 0 },
                  { label: pageEditor.dashboard.about(Boolean(establishment.description)), ok: Boolean(establishment.description) },
                ].map((chip) => (
                  <li key={chip.label} className={cn("rounded-full px-2.5 py-1", chip.ok ? "bg-success-tint text-success" : "bg-page text-ink-muted ring-1 ring-line")}>
                    {chip.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <Button href="/app/ma-page" size="compact" className="shrink-0 self-start md:self-center">
            {pageEditor.dashboard.edit} <ArrowRight aria-hidden="true" />
          </Button>
        </div>
      </Card>

      <Card className="mb-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="heading-3">À venir aujourd’hui</h2>
          <p className="index-tag">
            [{String(activeToday.length).padStart(3, "0")}]
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
                  className="flex items-center gap-4 py-3 text-[14px] transition-colors hover:text-brand"
                >
                  <span className="w-14 shrink-0 font-mono text-[15px] font-medium tabular-nums text-ink">
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

      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Activité</p>
          <h2 className="heading-3 mt-1">{periodLabel}</h2>
        </div>
        <nav
          aria-label="Période"
          className="flex max-w-full gap-1 overflow-x-auto rounded-full bg-card p-1 ring-1 ring-line"
        >
          {PERIODS.map((p) => (
            <Link
              key={p.key}
              href={p.key === "mois" ? "/app" : `/app?periode=${p.key}`}
              aria-current={p.key === periodKey ? "page" : undefined}
              className={cn(
                "min-h-9 shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors sm:px-4",
                p.key === periodKey
                  ? "bg-ink text-page"
                  : "text-ink-muted hover:text-ink",
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
          icon={<CalendarCheck className="size-4" strokeWidth={1.8} />}
          value={c.bookings}
          hint={`${c.online} en ligne · ${c.manual} ajoutés à la main`}
          footer={
            <DeltaBadge value={delta(c.bookings, stats.previous.bookings)} />
          }
        />
        <StatTile
          label="Revenus"
          icon={<Wallet className="size-4" strokeWidth={1.8} />}
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
          label="Remplissage"
          icon={<Gauge className="size-4" strokeWidth={1.8} />}
          value={pct(stats.fillRate)}
          hint={
            stats.openMinutes > 0
              ? `${formatDuration(c.bookedMinutes)} réservées sur ${formatDuration(stats.openMinutes)} d’ouverture`
              : "Définissez vos horaires pour le calculer"
          }
        />
        <StatTile
          label="Annulations"
          icon={<UserX className="size-4" strokeWidth={1.8} />}
          value={c.cancelled + c.noShows}
          hint={`${c.cancelled} annulation${c.cancelled > 1 ? "s" : ""} · ${c.noShows} absence${c.noShows > 1 ? "s" : ""}`}
          footer={
            <span className="text-[12px] leading-5 text-ink-muted">
              Taux de perte : {pct(c.lossRate)} · {stats.newClients} nouveau
              {stats.newClients > 1 ? "x" : ""} client
              {stats.newClients > 1 ? "s" : ""}
            </span>
          }
        />
      </div>

      <Card className="mt-6">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="heading-3">Rendez-vous par jour</h2>
          <span className="index-tag whitespace-nowrap">
            {c.bookings} sur la période
          </span>
        </div>
        <div className="mt-4">
          <BookingsChart data={c.perDay} todayKey={today} />
        </div>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="heading-3">Prestations les plus demandées</h2>
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
                        className="h-full rounded-full bg-powder"
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
          <h2 className="heading-3">Par praticien</h2>
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
