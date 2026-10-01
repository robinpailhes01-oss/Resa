"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarCheck,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  ExternalLink,
  Gauge,
  LayoutDashboard,
  Mail,
  Phone,
  Plus,
  Search,
  Settings,
  Sparkles,
  Store,
  UserRound,
  UserX,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { demoPro as t, type DemoBooking, type DemoStatus } from "@/content/fr/demo-pro";
import { cn } from "@/lib/cn";

type View = "dashboard" | "agenda" | "clients" | "page" | "services" | "team" | "emails" | "payments" | "settings";

const icons: Record<View, typeof LayoutDashboard> = {
  dashboard: LayoutDashboard,
  agenda: CalendarDays,
  clients: UserRound,
  page: Store,
  services: Sparkles,
  team: Users,
  emails: Mail,
  payments: Wallet,
  settings: Settings,
};

const tones = {
  soft: { card: "bg-soft-tint hover:bg-soft", dot: "bg-powder" },
  accent: { card: "bg-accent-tint hover:bg-[#e6dcf2]", dot: "bg-accent" },
};

const badge: Record<DemoStatus, string> = {
  pending: "bg-accent-tint text-lilac-ink",
  confirmed: "bg-success-tint text-success",
  completed: "bg-soft-tint text-brand",
  cancelled: "bg-error-tint text-error",
  no_show: "bg-page text-ink-muted ring-1 ring-line",
};

const toMin = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));
const toHHMM = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
const client = (id: string) => t.clients.find((c) => c.id === id)!;
const service = (id: string) => t.services.find((s) => s.id === id)!;
const practitioner = (id: string) => t.practitioners.find((p) => p.id === id)!;

/** Démo cliquable de l'espace pro : même habillage que l'application, données d'exemple en mémoire. */
export function ProDemo({ days, signupHref, contactHref }: { days: Array<{ offset: number; label: string }>; signupHref: string; contactHref: string | null }) {
  const [view, setView] = useState<View>("dashboard");
  const [bookings, setBookings] = useState<DemoBooking[]>(t.bookings);
  const [dayOffset, setDayOffset] = useState(0);
  const [openBooking, setOpenBooking] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const today = days.find((d) => d.offset === 0)!;
  const notify = (text: string) => {
    setToast(text);
    window.setTimeout(() => setToast(null), 3500);
  };
  const go = (v: View) => {
    setView(v);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const setStatus = (id: string, status: DemoStatus) => {
    setBookings((all) => all.map((b) => (b.id === id ? { ...b, status } : b)));
    if (status === "cancelled") notify(t.booking.cancelled);
  };
  const selected = bookings.find((b) => b.id === openBooking) ?? null;

  return (
    <div className="min-h-screen bg-page">
      <div className="sticky top-0 z-40 border-b border-line bg-card/95 backdrop-blur">
        <div className="flex items-center justify-between gap-3 px-3 py-2.5 md:px-6">
          <Link href="/" className="inline-flex items-center gap-1.5 rounded-full bg-[#c4501b] px-3.5 py-1.5 text-[13px] font-semibold text-white">
            <ArrowLeft aria-hidden="true" className="size-4" /> {t.banner.back}
          </Link>
          <div className="min-w-0 text-center">
            <p className="truncate text-[14px] font-semibold text-ink">{t.banner.title}</p>
            <p className="hidden truncate text-[12px] text-ink-muted sm:block">{t.banner.text}</p>
          </div>
          <Link href={signupHref} className="rounded-full bg-ink px-3.5 py-1.5 text-[13px] font-semibold text-page">
            {t.banner.cta}
          </Link>
        </div>
      </div>

      <div className="md:flex">
        <aside className="border-b border-line bg-card md:sticky md:top-[53px] md:flex md:h-[calc(100vh-53px)] md:w-[260px] md:shrink-0 md:flex-col md:border-b-0 md:border-r">
          <div className="hidden px-6 pb-5 pt-6 md:block">
            <Logo height={24} />
          </div>
          <div className="mx-4 mb-4 hidden items-center gap-3 rounded-2xl border border-line bg-page px-3 py-3 md:flex">
            <span aria-hidden="true" className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-powder-deep font-display text-[15px] font-medium text-page">MA</span>
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold text-ink">{t.salon}</p>
              <Link href="/demo/reservation" className="inline-flex items-center gap-1 text-[12px] text-ink-muted hover:text-brand">
                Voir ma page <ExternalLink className="size-3" />
              </Link>
            </div>
          </div>
          <nav aria-label="Navigation de la démo" className="px-3 py-2 md:flex-1 md:overflow-y-auto md:py-0">
            <ul className="flex gap-1 overflow-x-auto md:flex-col md:gap-5 md:overflow-visible">
              {t.nav.groups.map((group) => (
                <li key={group.label} className="contents md:block">
                  <p className="eyebrow mb-1.5 hidden px-3 md:block">{group.label}</p>
                  <ul className="contents md:flex md:flex-col md:gap-0.5">
                    {group.items.map(([key, label]) => {
                      const Icon = icons[key as View];
                      const active = view === key;
                      return (
                        <li key={key} className="shrink-0">
                          <button
                            type="button"
                            onClick={() => go(key as View)}
                            aria-current={active ? "page" : undefined}
                            className={cn(
                              "group relative flex min-h-10 w-full items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2 text-left text-[14px] transition-colors",
                              active ? "bg-soft-tint font-semibold text-ink" : "font-medium text-ink-muted hover:bg-soft-tint/60 hover:text-ink",
                            )}
                          >
                            {active ? <span aria-hidden="true" className="absolute inset-y-2 left-0 hidden w-[3px] rounded-full bg-brand md:block" /> : null}
                            <Icon className={cn("size-[18px] shrink-0", active ? "text-brand" : "text-ink-muted group-hover:text-brand")} strokeWidth={1.7} />
                            {label}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ul>
          </nav>
          {contactHref ? (
            <div className="m-4 hidden rounded-2xl bg-soft-tint p-4 md:block">
              <p className="text-[13px] font-semibold text-ink">{t.help.title}</p>
              <p className="mt-1 text-[12px] leading-5 text-ink-muted">{t.help.text}</p>
              <a href={contactHref} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-powder-deep px-3 py-1.5 text-[12px] font-semibold text-page">
                <Phone className="size-3.5" /> {t.help.cta}
              </a>
            </div>
          ) : null}
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 md:px-10 md:py-10">
          <div className="mx-auto w-full max-w-[1080px]">
            {view === "dashboard" ? (
              <Dashboard today={today.label} bookings={bookings} onOpen={setOpenBooking} onCreate={() => setCreating(true)} onAgenda={() => go("agenda")} />
            ) : view === "agenda" ? (
              <Agenda
                day={days.find((d) => d.offset === dayOffset) ?? today}
                canPrev={days.some((d) => d.offset === dayOffset - 1)}
                canNext={days.some((d) => d.offset === dayOffset + 1)}
                onMove={(delta) => setDayOffset((o) => o + delta)}
                onToday={() => setDayOffset(0)}
                bookings={bookings.filter((b) => b.day === dayOffset)}
                onOpen={setOpenBooking}
                onCreate={() => setCreating(true)}
              />
            ) : view === "clients" ? (
              <Clients bookings={bookings} days={days} />
            ) : view === "services" ? (
              <Services />
            ) : view === "team" ? (
              <Team />
            ) : view === "emails" ? (
              <Emails />
            ) : view === "payments" ? (
              <Payments />
            ) : view === "page" ? (
              <PageView />
            ) : (
              <SettingsView />
            )}
          </div>
        </main>
      </div>

      {selected ? <BookingPanel booking={selected} dayLabel={days.find((d) => d.offset === selected.day)?.label ?? ""} onClose={() => setOpenBooking(null)} onStatus={setStatus} /> : null}
      {creating ? (
        <CreatePanel
          onClose={() => setCreating(false)}
          onCreate={(b) => {
            setBookings((all) => [...all, b]);
            setCreating(false);
            setDayOffset(b.day);
            notify(t.create.added);
          }}
        />
      ) : null}
      {toast ? (
        <div role="status" className="fixed inset-x-4 bottom-5 z-50 mx-auto max-w-md rounded-2xl bg-ink px-4 py-3 text-[14px] text-page shadow-lift">
          {toast}
        </div>
      ) : null}
    </div>
  );
}

function Header({ title, intro, action }: { title: string; intro?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-7 flex flex-col gap-4 border-b border-line pb-6 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-[30px] leading-9 tracking-[-0.03em] md:text-[38px] md:leading-[44px]">{title}</h1>
        {intro ? <p className="mt-2 max-w-2xl text-[15px] leading-6 text-ink-muted">{intro}</p> : null}
      </div>
      {action}
    </div>
  );
}

const card = "rounded-[20px] bg-card p-5 shadow-card ring-1 ring-line md:p-7";
const primaryBtn = "inline-flex min-h-10 items-center justify-center gap-2 rounded-button bg-ink px-4 text-[14px] font-semibold text-page hover:bg-ink-hover";
const secondaryBtn = "inline-flex min-h-10 items-center justify-center gap-2 rounded-button border border-ink/10 bg-card px-4 text-[14px] font-semibold text-ink shadow-card hover:border-ink/20";

function BookingRow({ b, onOpen }: { b: DemoBooking; onOpen: (id: string) => void }) {
  const s = service(b.serviceId);
  return (
    <button type="button" onClick={() => onOpen(b.id)} className="flex w-full items-center gap-4 py-3 text-left transition-colors hover:bg-page/60">
      <span className="w-12 shrink-0 font-display text-[16px] font-semibold tabular-nums text-ink">{b.start}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-semibold text-ink">{client(b.clientId).name}</span>
        <span className="block truncate text-[13px] text-ink-muted">
          {s.name} · {practitioner(b.practitionerId).name}
        </span>
      </span>
      {b.deposit ? <span className="hidden rounded-full bg-success-tint px-2 py-0.5 text-[11px] font-semibold text-success sm:inline">Acompte {b.deposit} €</span> : null}
      <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-[12px] font-semibold", badge[b.status])}>{t.status[b.status]}</span>
      <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-ink-muted" />
    </button>
  );
}

function Dashboard({ today, bookings, onOpen, onCreate, onAgenda }: { today: string; bookings: DemoBooking[]; onOpen: (id: string) => void; onCreate: () => void; onAgenda: () => void }) {
  const todays = bookings.filter((b) => b.day === 0 && b.status !== "cancelled").sort((a, b) => toMin(a.start) - toMin(b.start));
  const revenue = todays.reduce((sum, b) => sum + service(b.serviceId).price, 0);
  const upcoming = todays.filter((b) => b.status === "confirmed" || b.status === "pending");
  const max = Math.max(...t.stats.perDay);
  const d = t.dashboard;
  return (
    <div>
      <section className="powder-panel grain relative isolate mb-8 overflow-hidden rounded-[22px] md:rounded-[28px]">
        <Image src="/brand/ciseaux.webp" alt="" width={974} height={494} aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 -z-10 hidden h-full w-[52%] object-cover opacity-90 [mask-image:linear-gradient(to_right,transparent,#000_55%)] md:block" />
        <div className="relative px-6 py-8 md:px-10 md:py-11">
          <p className="eyebrow !text-page/85">{today}</p>
          <h1 className="mt-3 text-[36px] leading-none tracking-[-0.04em] text-page md:text-[52px]">{d.hello(t.owner)}</h1>
          <p className="mt-4 max-w-md text-[15px] leading-6 text-page md:text-[16px]">{d.today(todays.length, revenue)}</p>
          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            <button type="button" onClick={onCreate} className="inline-flex min-h-10 items-center gap-2 rounded-button bg-page px-4 text-[14px] font-semibold text-ink shadow-[0_8px_24px_-12px_rgba(20,28,38,0.5)] hover:bg-card">
              <Plus className="size-4" /> {d.newBooking}
            </button>
            <button type="button" onClick={onAgenda} className="inline-flex min-h-10 items-center gap-2 rounded-button px-4 text-[14px] font-semibold text-page hover:bg-page/10">
              <CalendarDays className="size-4" /> {d.agenda}
            </button>
          </div>
        </div>
      </section>

      <div className={cn(card, "mb-8")}>
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="heading-3">{d.upcoming}</h2>
          <span className="index-tag">[{String(upcoming.length).padStart(3, "0")}]</span>
        </div>
        {upcoming.length === 0 ? (
          <p className="mt-3 text-[14px] text-ink-muted">{d.none}</p>
        ) : (
          <div className="mt-2 divide-y divide-line">
            {upcoming.map((b) => (
              <BookingRow key={b.id} b={b} onOpen={onOpen} />
            ))}
          </div>
        )}
      </div>

      <p className="eyebrow mb-3">{d.activity}</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: d.tiles.bookings, value: t.stats.bookings, foot: t.stats.bookingsDelta, icon: CalendarCheck },
          { label: d.tiles.revenue, value: t.stats.revenue, foot: t.stats.revenueDelta, icon: Wallet },
          { label: d.tiles.fill, value: t.stats.fill, foot: null, icon: Gauge },
          { label: d.tiles.cancellations, value: t.stats.cancellations, foot: null, icon: UserX },
        ].map((tile) => (
          <div key={tile.label} className="rounded-[20px] bg-card p-5 shadow-card ring-1 ring-line">
            <div className="flex items-center justify-between">
              <p className="eyebrow">{tile.label}</p>
              <span className="inline-flex size-8 items-center justify-center rounded-xl bg-soft-tint text-brand">
                <tile.icon className="size-4" />
              </span>
            </div>
            <p className="mt-4 font-display text-[40px] font-medium leading-none tracking-[-0.03em] text-ink">{tile.value}</p>
            {tile.foot ? <p className="mt-3 inline-flex rounded-full bg-success-tint px-2 py-0.5 text-[12px] font-semibold text-success">{tile.foot}</p> : null}
          </div>
        ))}
      </div>

      <div className={cn(card, "mt-6")}>
        <h2 className="heading-3">{d.chart}</h2>
        <div className="mt-5 flex h-36 items-end gap-1" aria-hidden="true">
          {t.stats.perDay.map((n, i) => (
            <span key={i} className={cn("flex-1 rounded-t-md", i === t.stats.perDay.length - 1 ? "bg-powder-deep" : "bg-powder/60")} style={{ height: `${Math.max(3, (n / max) * 100)}%` }} />
          ))}
        </div>
      </div>

      <div className={cn(card, "mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between")}>
        <div className="flex items-center gap-4">
          <div aria-hidden="true" className="grid shrink-0 grid-cols-2 gap-1 overflow-hidden rounded-2xl">
            {t.pageView.photos.map((src) => (
              <Image key={src} src={src} alt="" width={96} height={96} className="size-11 object-cover" />
            ))}
          </div>
          <div>
            <h2 className="heading-3">{d.page.title}</h2>
            <p className="mt-1 text-[14px] text-ink-muted">{d.page.text}</p>
          </div>
        </div>
        <Link href="/demo/reservation" className={primaryBtn}>
          {d.page.open} <ExternalLink className="size-4" />
        </Link>
      </div>
    </div>
  );
}

function Agenda({
  day,
  canPrev,
  canNext,
  onMove,
  onToday,
  bookings,
  onOpen,
  onCreate,
}: {
  day: { offset: number; label: string };
  canPrev: boolean;
  canNext: boolean;
  onMove: (delta: number) => void;
  onToday: () => void;
  bookings: DemoBooking[];
  onOpen: (id: string) => void;
  onCreate: () => void;
}) {
  const start = 9 * 60;
  const end = 19 * 60;
  const rowHeight = 56;
  const hours: number[] = [];
  for (let m = start; m <= end; m += 60) hours.push(m);
  const active = bookings.filter((b) => b.status !== "cancelled");
  return (
    <div>
      <Header
        title={t.agenda.title}
        intro={t.agenda.count(active.length)}
        action={
          <button type="button" onClick={onCreate} className={primaryBtn}>
            <Plus className="size-4" /> {t.dashboard.newBooking}
          </button>
        }
      />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button type="button" disabled={!canPrev} onClick={() => onMove(-1)} aria-label={t.agenda.prev} className={cn(secondaryBtn, "!px-3 disabled:opacity-40")}>
          <ChevronLeft className="size-4" />
        </button>
        <button type="button" onClick={onToday} className={secondaryBtn}>
          {t.agenda.today}
        </button>
        <button type="button" disabled={!canNext} onClick={() => onMove(1)} aria-label={t.agenda.next} className={cn(secondaryBtn, "!px-3 disabled:opacity-40")}>
          <ChevronRight className="size-4" />
        </button>
        <p className="ml-2 font-display text-[18px] font-semibold capitalize text-ink">{day.label}</p>
      </div>
      <div className="overflow-x-auto rounded-2xl bg-card ring-1 ring-line">
        <div className="min-w-[560px]">
          <div className="grid border-b border-line" style={{ gridTemplateColumns: `56px repeat(${t.practitioners.length}, minmax(0, 1fr))` }}>
            <div />
            {t.practitioners.map((p) => (
              <div key={p.id} className="flex items-center gap-2 border-l border-line px-3 py-3">
                <span aria-hidden="true" className={cn("size-2.5 rounded-full", tones[p.tone].dot)} />
                <span className="text-[14px] font-semibold text-ink">{p.name}</span>
              </div>
            ))}
          </div>
          <div className="relative grid" style={{ gridTemplateColumns: `56px repeat(${t.practitioners.length}, minmax(0, 1fr))`, height: ((end - start) / 60) * rowHeight }}>
            <div className="relative">
              {hours.map((m) => (
                <span key={m} className="absolute right-2 -translate-y-1/2 text-[11px] tabular-nums text-ink-muted" style={{ top: ((m - start) / 60) * rowHeight }}>
                  {toHHMM(m)}
                </span>
              ))}
            </div>
            {t.practitioners.map((p) => (
              <div key={p.id} className="relative border-l border-line">
                {hours.map((m) => (
                  <span key={m} aria-hidden="true" className="absolute inset-x-0 border-t border-line/70" style={{ top: ((m - start) / 60) * rowHeight }} />
                ))}
                {active
                  .filter((b) => b.practitionerId === p.id)
                  .map((b) => {
                    const top = ((toMin(b.start) - start) / 60) * rowHeight;
                    const height = (b.durationMin / 60) * rowHeight - 4;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => onOpen(b.id)}
                        className={cn("absolute inset-x-1.5 overflow-hidden rounded-xl px-2.5 py-1 text-left leading-tight transition-colors", tones[p.tone].card, b.status === "completed" && "opacity-70")}
                        style={{ top: top + 2, height }}
                      >
                        <span className="block truncate text-[12px] font-semibold text-ink">
                          {b.start} · {client(b.clientId).name}
                        </span>
                        <span className="block truncate text-[11px] text-ink-muted">{service(b.serviceId).name}</span>
                      </button>
                    );
                  })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Clients({ bookings, days }: { bookings: DemoBooking[]; days: Array<{ offset: number; label: string }> }) {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const list = useMemo(() => t.clients.filter((c) => c.name.toLowerCase().includes(query.toLowerCase().trim())), [query]);
  const open = t.clients.find((c) => c.id === openId);
  const v = t.clientsView;
  if (open) {
    const history = bookings.filter((b) => b.clientId === open.id).sort((a, b) => b.day - a.day);
    return (
      <div>
        <button type="button" onClick={() => setOpenId(null)} className="mb-4 inline-flex items-center gap-1 text-[14px] font-medium text-brand">
          <ChevronLeft className="size-4" /> {v.title}
        </button>
        <Header title={open.name} intro={`${open.email} · ${open.phone}`} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className={card}>
            <p className="eyebrow">{v.visits(open.visits)}</p>
            <p className="mt-3 font-display text-[36px] font-medium text-ink">{open.spent} €</p>
            <p className="text-[13px] text-ink-muted">{v.spent}</p>
          </div>
          <div className={card}>
            <p className="eyebrow">{v.notes}</p>
            <p className="mt-3 text-[15px] leading-6 text-ink">{open.note || "—"}</p>
          </div>
        </div>
        <div className={cn(card, "mt-4")}>
          <h2 className="heading-3">{v.history}</h2>
          <ul className="mt-3 divide-y divide-line text-[14px]">
            {history.length === 0 ? <li className="py-3 text-ink-muted">—</li> : null}
            {history.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <span className="capitalize text-ink">
                  {days.find((d) => d.offset === b.day)?.label} · {b.start}
                </span>
                <span className="text-ink-muted">{service(b.serviceId).name}</span>
                <span className={cn("rounded-full px-2.5 py-0.5 text-[12px] font-semibold", badge[b.status])}>{t.status[b.status]}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
  return (
    <div>
      <Header title={v.title} intro={v.intro} />
      <label className="relative mb-4 block max-w-sm">
        <span className="sr-only">{v.search}</span>
        <Search aria-hidden="true" className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={v.search} className="min-h-11 w-full rounded-field border border-control bg-card pl-10 pr-4 text-[15px] text-ink focus:border-brand focus:outline-none" />
      </label>
      <div className={cn(card, "!p-0")}>
        <ul className="divide-y divide-line">
          {list.map((c) => (
            <li key={c.id}>
              <button type="button" onClick={() => setOpenId(c.id)} className="flex w-full items-center gap-4 px-5 py-3.5 text-left hover:bg-page/60">
                <span aria-hidden="true" className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-soft-tint text-[14px] font-semibold text-brand">
                  {c.name.charAt(0)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-semibold text-ink">{c.name}</span>
                  <span className="block truncate text-[13px] text-ink-muted">{c.phone}</span>
                </span>
                <span className="text-[13px] text-ink-muted">{v.visits(c.visits)}</span>
                <ChevronRight aria-hidden="true" className="size-4 text-ink-muted" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Services() {
  const [active, setActive] = useState<Record<string, boolean>>(Object.fromEntries(t.services.map((s) => [s.id, s.active])));
  const v = t.servicesView;
  return (
    <div>
      <Header title={v.title} intro={v.intro} action={<span className={primaryBtn}><Plus className="size-4" /> {v.add}</span>} />
      <div className={cn(card, "!p-0")}>
        <ul className="divide-y divide-line">
          {t.services.map((s) => (
            <li key={s.id} className="flex items-center gap-4 px-5 py-3.5">
              {s.image ? (
                <Image src={s.image} alt="" width={96} height={96} className="size-14 shrink-0 rounded-xl object-cover" />
              ) : (
                <span aria-hidden="true" className="size-14 shrink-0 rounded-xl bg-[repeating-linear-gradient(135deg,var(--color-soft-tint)_0_6px,var(--color-page)_6px_12px)]" />
              )}
              <span className="min-w-0 flex-1">
                <span className={cn("block truncate text-[15px] font-semibold", active[s.id] ? "text-ink" : "text-ink-muted")}>{s.name}</span>
                <span className="block text-[13px] text-ink-muted">
                  {s.durationMin} min · {s.price} €
                </span>
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={active[s.id]}
                onClick={() => setActive((a) => ({ ...a, [s.id]: !a[s.id] }))}
                className="flex items-center gap-2 text-[13px] font-medium text-ink-muted"
              >
                <span className="hidden sm:inline">{active[s.id] ? v.online : v.hidden}</span>
                <span className={cn("relative h-6 w-11 rounded-full transition-colors", active[s.id] ? "bg-success" : "bg-line")}>
                  <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition-[left]", active[s.id] ? "left-[22px]" : "left-0.5")} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Team() {
  const v = t.teamView;
  return (
    <div>
      <Header title={v.title} intro={v.intro} action={<span className={primaryBtn}><Plus className="size-4" /> {v.add}</span>} />
      <div className="grid gap-4 sm:grid-cols-2">
        {t.practitioners.map((p) => (
          <div key={p.id} className={cn(card, "flex items-center gap-4")}>
            <span aria-hidden="true" className={cn("inline-flex size-12 items-center justify-center rounded-full text-[16px] font-semibold text-ink", tones[p.tone].card)}>{p.name.charAt(0)}</span>
            <div>
              <p className="text-[16px] font-semibold text-ink">{p.name}</p>
              <p className="text-[14px] text-ink-muted">{p.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Toggle({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={onClick} className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", on ? "bg-success" : "bg-line")}>
      <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition-[left]", on ? "left-[22px]" : "left-0.5")} />
    </button>
  );
}

function Emails() {
  const v = t.emailsView;
  const [on, setOn] = useState<Record<string, boolean>>(Object.fromEntries(v.items.map((i) => [i.key, true])));
  return (
    <div>
      <Header title={v.title} intro={v.intro} />
      <div className={cn(card, "!p-0")}>
        <ul className="divide-y divide-line">
          {v.items.map((i) => (
            <li key={i.key} className="flex items-center justify-between gap-4 px-5 py-4">
              <span>
                <span className="block text-[15px] font-semibold text-ink">{i.label}</span>
                <span className="block text-[13px] text-ink-muted">{i.help}</span>
              </span>
              <Toggle on={on[i.key]} label={i.label} onClick={() => setOn((s) => ({ ...s, [i.key]: !s[i.key] }))} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Payments() {
  const v = t.paymentsView;
  const [mode, setMode] = useState("deposit");
  return (
    <div>
      <Header title={v.title} intro={v.intro} />
      <div className={cn(card, "mb-6 flex flex-wrap items-center justify-between gap-3")}>
        <div>
          <p className="eyebrow">{v.account}</p>
          <p className="mt-2 font-display text-[22px] text-ink">{t.salon} SAS</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-success-tint px-3 py-1 text-[13px] font-semibold text-success">
          <CreditCard className="size-4" /> {v.ready}
        </span>
      </div>
      <div className={cn(card, "mb-6")}>
        <h2 className="heading-3">{v.rule}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {v.modes.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setMode(m.key)}
              aria-pressed={mode === m.key}
              className={cn("rounded-2xl border px-4 py-4 text-left text-[15px] font-semibold transition-[border-color,box-shadow]", mode === m.key ? "border-brand text-ink shadow-[0_0_0_3px_rgba(74,97,121,0.14)]" : "border-line text-ink-muted hover:border-ink/20")}
            >
              {m.label}
            </button>
          ))}
        </div>
        <p className="mt-4 text-[14px] font-medium text-ink">{v.example(mode)}</p>
      </div>
      <div className={card}>
        <h2 className="heading-3">{v.last}</h2>
        <ul className="mt-3 divide-y divide-line text-[14px]">
          {v.payments.map((p) => (
            <li key={p.who} className="flex items-center justify-between gap-3 py-3">
              <span className="min-w-0 truncate text-ink">{p.who}</span>
              <span className="flex shrink-0 items-center gap-3">
                <span className="font-semibold tabular-nums text-ink">{p.amount}</span>
                <span className={cn("rounded-full px-2.5 py-0.5 text-[12px] font-medium", p.status === "Payé" ? "bg-success-tint text-success" : "bg-page text-ink-muted ring-1 ring-line")}>{p.status}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function PageView() {
  const v = t.pageView;
  return (
    <div>
      <Header
        title={v.title}
        intro={v.intro}
        action={
          <Link href="/demo/reservation" className={secondaryBtn}>
            {v.open} <ExternalLink className="size-4" />
          </Link>
        }
      />
      <p className="mb-6 rounded-field border border-control bg-card px-4 py-3 text-[14px] text-ink-muted">{v.link}</p>
      <div className={cn(card, "mb-6")}>
        <h2 className="heading-3">Photos</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {v.photos.map((src, i) => (
            <div key={src} className="relative overflow-hidden rounded-2xl ring-1 ring-line">
              <Image src={src} alt="" width={400} height={300} className="aspect-[4/3] w-full object-cover" />
              {i === 0 ? <span className="absolute left-2 top-2 rounded-full bg-ink/80 px-2.5 py-0.5 text-[12px] font-semibold text-page">Couverture</span> : null}
            </div>
          ))}
        </div>
      </div>
      <div className={card}>
        <h2 className="heading-3">Bio</h2>
        <p className="mt-3 text-[16px] text-ink">{v.bio}</p>
      </div>
    </div>
  );
}

function SettingsView() {
  const v = t.settingsView;
  return (
    <div>
      <Header title={v.title} intro={v.intro} />
      <div className={card}>
        <dl className="divide-y divide-line text-[15px]">
          {v.rows.map(([k, val]) => (
            <div key={k} className="flex flex-col gap-1 py-3 sm:flex-row sm:justify-between">
              <dt className="text-ink-muted">{k}</dt>
              <dd className="font-medium text-ink sm:text-right">{val}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

function Panel({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-[24px] bg-card p-6 shadow-lift sm:rounded-[24px]" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="text-[22px] leading-7">{title}</h2>
          <button type="button" onClick={onClose} aria-label={t.booking.actions.close} className="inline-flex size-9 items-center justify-center rounded-full hover:bg-page">
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function BookingPanel({ booking: b, dayLabel, onClose, onStatus }: { booking: DemoBooking; dayLabel: string; onClose: () => void; onStatus: (id: string, s: DemoStatus) => void }) {
  const s = service(b.serviceId);
  const c = client(b.clientId);
  const a = t.booking.actions;
  const live = b.status === "confirmed" || b.status === "pending";
  const end = toHHMM(toMin(b.start) + b.durationMin);
  return (
    <Panel title={s.name} onClose={onClose}>
      <p className="-mt-2 mb-4 text-[14px] capitalize text-ink-muted">
        {dayLabel} · {b.start} – {end}
      </p>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className={cn("rounded-full px-3 py-1 text-[13px] font-semibold", badge[b.status])}>{t.status[b.status]}</span>
        <span className="text-[13px] text-ink-muted">{b.source === "online" ? t.booking.online : t.booking.manual}</span>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-4 text-[14px]">
        <div>
          <dt className="eyebrow">{t.booking.client}</dt>
          <dd className="mt-1 font-semibold text-ink">{c.name}</dd>
          <dd className="text-ink-muted">{c.phone}</dd>
        </div>
        <div>
          <dt className="eyebrow">{t.booking.with}</dt>
          <dd className="mt-1 font-semibold text-ink">{practitioner(b.practitionerId).name}</dd>
          <dt className="eyebrow mt-3">{t.booking.price}</dt>
          <dd className="mt-1 font-semibold text-ink">{s.price} €</dd>
        </div>
      </dl>
      {b.deposit ? <p className="mt-4 rounded-xl bg-success-tint px-3 py-2 text-[13px] font-medium text-success">{t.booking.deposit(b.deposit)}</p> : null}
      {b.note || c.note ? (
        <div className="mt-4 rounded-xl bg-page px-3 py-2 text-[13px] text-ink">
          <span className="font-semibold">{t.booking.note} : </span>
          {b.note || c.note}
        </div>
      ) : null}
      <div className="mt-6 flex flex-wrap gap-2 border-t border-line pt-5">
        {b.status === "pending" ? (
          <button type="button" onClick={() => onStatus(b.id, "confirmed")} className={primaryBtn}>
            {a.confirm}
          </button>
        ) : null}
        {live ? (
          <>
            <button type="button" onClick={() => onStatus(b.id, "completed")} className={secondaryBtn}>
              {a.done}
            </button>
            <button type="button" onClick={() => onStatus(b.id, "no_show")} className={secondaryBtn}>
              {a.noShow}
            </button>
            <button type="button" onClick={() => onStatus(b.id, "cancelled")} className={cn(secondaryBtn, "!text-error")}>
              {a.cancel}
            </button>
          </>
        ) : (
          <button type="button" onClick={() => onStatus(b.id, "confirmed")} className={secondaryBtn}>
            {a.reactivate}
          </button>
        )}
      </div>
    </Panel>
  );
}

function CreatePanel({ onClose, onCreate }: { onClose: () => void; onCreate: (b: DemoBooking) => void }) {
  const c = t.create;
  const [clientId, setClientId] = useState(t.clients[6].id);
  const [serviceId, setServiceId] = useState(t.services[0].id);
  const [practitionerId, setPractitionerId] = useState(t.practitioners[0].id);
  const [time, setTime] = useState("17:30");
  const select = "min-h-11 w-full rounded-field border border-control bg-card px-3 text-[15px] text-ink focus:border-brand focus:outline-none";
  return (
    <Panel title={c.title} onClose={onClose}>
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          onCreate({ id: `new-${Date.now()}`, day: 0, start: time, durationMin: service(serviceId).durationMin, practitionerId, clientId, serviceId, status: "confirmed", source: "manual" });
        }}
      >
        <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
          {c.client}
          <select value={clientId} onChange={(e) => setClientId(e.target.value)} className={select}>
            {t.clients.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
          {c.service}
          <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} className={select}>
            {t.services.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name} · {x.price} €
              </option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
            {c.practitioner}
            <select value={practitionerId} onChange={(e) => setPractitionerId(e.target.value)} className={select}>
              {t.practitioners.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
            {c.time}
            <select value={time} onChange={(e) => setTime(e.target.value)} className={select}>
              {["11:30", "12:00", "17:00", "17:30", "18:00"].map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button type="submit" className={cn(primaryBtn, "mt-2")}>
          {c.submit}
        </button>
      </form>
    </Panel>
  );
}
