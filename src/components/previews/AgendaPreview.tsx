import { Calendar, ChevronLeft, ChevronRight, Mail, Plus, Settings, Sparkles, Users } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { demo } from "@/content/fr/landing";
import { cn } from "@/lib/cn";
import { AppFrame, Avatar } from "./AppFrame";

type Slot = { start: number; end: number; title: string; client: string; tone: "soft" | "accent"; selected?: boolean };

/** Heures décimales : 9.5 = 09:30. Grille de 09:00 à 18:00. */
const DAY_START = 9;
const DAY_END = 18;
const HOURS = Array.from({ length: DAY_END - DAY_START + 1 }, (_, i) => DAY_START + i);

const columns: Array<{ name: string; role: string; initials: string; slots: Slot[] }> = [
  {
    ...demo.practitioners[0],
    slots: [
      { start: 9, end: 10, title: "Rehaussement de cils", client: "Chloé Bernard", tone: "soft" },
      { start: 11, end: 12, title: "Massage relaxant", client: "Nina Moreau", tone: "accent" },
      { start: 14, end: 15, title: demo.reference.service, client: demo.reference.client, tone: "soft", selected: true },
      { start: 16, end: 17, title: "Beauté des mains", client: "Laura Simon", tone: "soft" },
    ],
  },
  {
    ...demo.practitioners[1],
    slots: [
      { start: 9.5, end: 10.5, title: "Soin du visage", client: "Julie Martin", tone: "accent" },
      { start: 12, end: 13, title: "Épilation sourcils", client: "Anna Lefèvre", tone: "soft" },
      { start: 14, end: 15, title: "Épilation maillot", client: "Sarah Petit", tone: "accent" },
    ],
  },
  {
    ...demo.practitioners[2],
    slots: [
      { start: 9, end: 10, title: "Épilation demi-jambes", client: "Léa Dubois", tone: "soft" },
      { start: 14.5, end: 15.5, title: "Massage dos", client: "Émilie Bertrand", tone: "soft" },
    ],
  },
];

function formatHour(h: number): string {
  const hours = Math.floor(h);
  const minutes = Math.round((h - hours) * 60);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function SlotCard({ slot, rowHeight, order }: { slot: Slot; rowHeight: number; order: number }) {
  const top = (slot.start - DAY_START) * rowHeight;
  const height = (slot.end - slot.start) * rowHeight - 3;
  return (
    <div
      className={cn(
        "slot absolute inset-x-1 rounded-md px-2 py-1.5 text-[10px] leading-[1.3]",
        slot.tone === "soft" ? "bg-soft-tint" : "bg-accent-tint",
        slot.selected && "ring-2 ring-brand",
      )}
      style={{ top, height, "--i": order } as React.CSSProperties}
    >
      <div className="text-ink-muted">
        {formatHour(slot.start)} – {formatHour(slot.end)}
      </div>
      <div className="truncate font-semibold text-brand">{slot.title}</div>
      <div className="truncate text-ink-muted">{slot.client}</div>
    </div>
  );
}

function Sidebar() {
  const items = [
    { icon: Calendar, label: "Agenda", active: true },
    { icon: Users, label: "Clients" },
    { icon: Sparkles, label: "Prestations" },
    { icon: Mail, label: "Emails" },
    { icon: Settings, label: "Paramètres" },
  ];
  return (
    <aside className="hidden w-40 shrink-0 flex-col border-r border-line bg-page/70 p-3 @2xl:flex">
      <Logo height={18} className="mb-5 ml-1" />
      <ul className="space-y-0.5">
        {items.map(({ icon: Icon, label, active }) => (
          <li
            key={label}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap rounded-md px-2 py-1.5 text-[11px]",
              active ? "bg-soft font-semibold text-brand" : "text-ink-muted",
            )}
          >
            <Icon className="size-3.5" strokeWidth={1.8} />
            {label}
          </li>
        ))}
      </ul>
      <div className="mt-auto flex items-center gap-2 border-t border-line pt-3">
        <Avatar initials="MA" tone="accent" size="sm" />
        <div className="text-[10px] leading-tight">
          <div className="font-semibold text-brand">{demo.salon}</div>
          <div className="text-ink-muted">{demo.salonType}</div>
        </div>
      </div>
    </aside>
  );
}

function Toolbar() {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line px-3 py-2.5 @sm:px-4">
      <div className="min-w-0">
        <div className="whitespace-nowrap text-[12px] font-bold text-brand @sm:text-[14px]">Mon agenda</div>
        <div className="truncate text-[10px] text-ink-muted @sm:text-[11px]">{demo.date.long}</div>
      </div>
      {
        <div className="hidden items-center gap-1.5 text-[10px] @xl:flex">
          <span className="rounded-md border border-line px-2 py-1">Aujourd’hui</span>
          <span className="rounded-md border border-line p-1">
            <ChevronLeft className="size-3" />
          </span>
          <span className="rounded-md border border-line p-1">
            <ChevronRight className="size-3" />
          </span>
          <span className="ml-1 inline-flex rounded-md border border-line p-0.5">
            <span className="rounded bg-soft px-2 py-0.5 font-semibold text-brand">Jour</span>
            <span className="px-2 py-0.5 text-ink-muted">Semaine</span>
          </span>
        </div>
      }
      <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md bg-brand px-2 py-1.5 text-[10px] font-semibold text-white">
        <Plus className="size-3" />
        <span className="hidden @md:inline">Nouveau rendez-vous</span>
        <span className="@md:hidden">Nouveau</span>
      </span>
    </div>
  );
}

function DetailPanel() {
  const r = demo.reference;
  return (
    <aside className="hidden w-44 shrink-0 border-l border-line p-3 text-[10px] @4xl:block">
      <div className="mb-3 text-[12px] font-bold text-brand">Détail du rendez-vous</div>
      <div className="mb-3 flex items-center gap-2 rounded-md border border-line p-2">
        <Avatar initials="EL" size="sm" />
        <div className="leading-tight">
          <div className="font-semibold text-ink">{r.client}</div>
          <div className="text-ink-muted">Cliente depuis mars 2024</div>
        </div>
      </div>
      <dl className="space-y-2">
        <div>
          <dt className="text-ink-muted">Prestation</dt>
          <dd className="font-semibold text-ink">{r.service}</dd>
        </div>
        <div>
          <dt className="text-ink-muted">Horaire</dt>
          <dd className="font-semibold text-ink">
            {r.start} – {r.end} · {r.duration}
          </dd>
        </div>
        <div>
          <dt className="text-ink-muted">Avec</dt>
          <dd className="font-semibold text-ink">{r.practitioner}</dd>
        </div>
        <div>
          <dt className="text-ink-muted">Statut</dt>
          <dd>
            <span className="inline-block rounded-full bg-success-tint px-2 py-0.5 font-semibold text-success">Confirmé</span>
          </dd>
        </div>
        <div>
          <dt className="text-ink-muted">Rappel client</dt>
          <dd className="font-semibold text-ink">Email prévu 24 h avant</dd>
        </div>
      </dl>
    </aside>
  );
}

/** Vue large : trois colonnes praticiens (dès 448 px de largeur de cadre). */
function DesktopGrid() {
  const rowHeight = 34;
  return (
    <div className="hidden @md:block">
      <div className="grid grid-cols-[44px_repeat(3,1fr)] border-b border-line">
        <div />
        {columns.map((column) => (
          <div key={column.name} className="flex items-center gap-2 border-l border-line px-2 py-2">
            <Avatar initials={column.initials} tone={column.name === "Sophie" ? "accent" : "soft"} size="sm" />
            <div className="leading-tight">
              <div className="text-[11px] font-semibold text-ink">{column.name}</div>
              <div className="text-[9px] text-ink-muted">{column.role}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-[44px_repeat(3,1fr)]" style={{ height: (DAY_END - DAY_START) * rowHeight }}>
        <div className="relative">
          {HOURS.slice(0, -1).map((hour, i) => (
            <div key={hour} className="absolute right-1.5 text-[9px] text-ink-muted" style={{ top: i * rowHeight - 5 }}>
              {formatHour(hour)}
            </div>
          ))}
        </div>
        {columns.map((column) => (
          <div key={column.name} className="relative border-l border-line">
            {HOURS.slice(0, -1).map((hour, i) => (
              <div key={hour} className="absolute inset-x-0 border-t border-line/70" style={{ top: i * rowHeight }} />
            ))}
            {column.slots.map((slot) => (
              <SlotCard key={slot.title + slot.start} slot={slot} rowHeight={rowHeight} order={fillOrder(slot)} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Vue mobile dédiée : un praticien à la fois, liste lisible. */
function MobileList() {
  const camille = columns[0];
  return (
    <div className="@md:hidden">
      <div className="flex min-w-0 gap-1.5 overflow-hidden border-b border-line px-3 py-2">
        {columns.map((column, i) => (
          <span
            key={column.name}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[10px]",
              i === 0 ? "border-brand bg-soft font-semibold text-brand" : "border-line text-ink-muted",
            )}
          >
            <Avatar initials={column.initials} size="sm" tone={i === 0 ? "brand" : "soft"} />
            {column.name}
          </span>
        ))}
      </div>
      <ul className="divide-y divide-line px-3">
        {camille.slots.map((slot, i) => (
          <li
            key={slot.title}
            className={cn("slot flex gap-3 py-2.5", slot.selected && "bg-soft-tint/60 -mx-3 px-3")}
            style={{ "--i": i } as React.CSSProperties}
          >
            <div className="w-12 shrink-0 text-[10px] leading-tight text-ink-muted">
              <div className="font-semibold text-ink">{formatHour(slot.start)}</div>
              <div>{formatHour(slot.end)}</div>
            </div>
            <div className={cn("w-1 shrink-0 rounded-full", slot.tone === "soft" ? "bg-soft" : "bg-accent")} />
            <div className="min-w-0 text-[11px] leading-tight">
              <div className="truncate font-semibold text-brand">{slot.title}</div>
              <div className="truncate text-ink-muted">{slot.client}</div>
            </div>
            {slot.selected ? (
              <span className="ml-auto self-center rounded-full bg-success-tint px-2 py-0.5 text-[9px] font-semibold text-success">
                Confirmé
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

type AgendaPreviewProps = {
  alt: string;
  className?: string;
  badge?: string;
  /** Sans barre latérale ni panneau de détail : pour le premier écran. */
  compact?: boolean;
  /** Les rendez-vous se posent un à un à l'arrivée (signature du premier écran). */
  animate?: boolean;
};

/** Ordre d'apparition des rendez-vous : chronologique, toutes colonnes confondues. */
function fillOrder(slot: Slot): number {
  const all = columns.flatMap((c) => c.slots).sort((a, b) => a.start - b.start || a.title.localeCompare(b.title));
  return all.findIndex((s) => s === slot);
}

export function AgendaPreview({ alt, className, badge, compact = false, animate = false }: AgendaPreviewProps) {
  return (
    <div className={cn("relative", animate && "agenda-fill", className)}>
      <AppFrame alt={alt}>
        <div className="flex">
          {!compact ? <Sidebar /> : null}
          <div className="min-w-0 flex-1">
            <Toolbar />
            <DesktopGrid />
            <MobileList />
          </div>
          {!compact ? <DetailPanel /> : null}
        </div>
      </AppFrame>
      {badge ? (
        <div
          aria-hidden="true"
          className="badge-in absolute -bottom-3 left-4 inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-card px-3 py-1.5 text-small font-semibold text-brand shadow-card ring-1 ring-line sm:left-6"
        >
          <span className="inline-flex size-6 items-center justify-center rounded-full bg-accent-tint">
            <Mail className="size-3.5" strokeWidth={2} />
          </span>
          {badge}
        </div>
      ) : null}
    </div>
  );
}
