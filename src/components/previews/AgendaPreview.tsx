import { Calendar, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Mail, Plus, Settings, Sparkles, Users } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { demo } from "@/content/fr/landing";
import { cn } from "@/lib/cn";
import { AppFrame, Avatar } from "./AppFrame";
import { DemoPhoto } from "./DemoPhoto";

type Tone = "soft" | "accent" | "success";
type Slot = { start: number; end: number; title: string; client: string; tone: Tone };

/** Heures décimales : 9.5 = 09:30. Grille de 08:00 à 18:00. */
const DAY_START = 8;
const DAY_END = 18;
const HOURS = Array.from({ length: DAY_END - DAY_START + 1 }, (_, i) => DAY_START + i);

const columns: Array<{ name: string; role: string; initials: string; slots: Slot[] }> = [
  {
    ...demo.practitioners[0],
    slots: [
      { start: 9, end: 10, title: "Coupe & brushing", client: "Julie Martin", tone: "soft" },
      { start: 11, end: 12.5, title: "Coloration", client: "Élodie Bernard", tone: "soft" },
      { start: 14, end: 15, title: "Coupe & brushing", client: "Sophie Leroy", tone: "soft" },
      { start: 16, end: 17, title: "Soin capillaire", client: "Laura Petit", tone: "soft" },
    ],
  },
  {
    ...demo.practitioners[1],
    slots: [
      { start: 10, end: 11, title: "Soin visage", client: "Manon Dubois", tone: "accent" },
      { start: 13, end: 14, title: "Soin visage", client: "Claire Moreau", tone: "accent" },
      { start: 14, end: 15, title: demo.reference.service, client: demo.reference.client, tone: "accent" },
      { start: 15.5, end: 16.5, title: "Modelage bien-être", client: "Nathalie Robert", tone: "accent" },
    ],
  },
  {
    ...demo.practitioners[2],
    slots: [
      { start: 9.5, end: 10.5, title: "Manucure", client: "Léa Girard", tone: "success" },
      { start: 12, end: 13, title: "Pose de vernis semi-permanent", client: "Amélie Thomas", tone: "success" },
      { start: 14.5, end: 15.5, title: "Manucure", client: "Chloé Rousseau", tone: "success" },
      { start: 17, end: 18, title: "Dépose + nouvelle pose", client: "Inès Morel", tone: "success" },
    ],
  },
];

const toneClasses: Record<Tone, { bg: string; bar: string }> = {
  soft: { bg: "bg-soft-tint", bar: "bg-[#a699ff]" },
  accent: { bg: "bg-accent-tint", bar: "bg-accent" },
  success: { bg: "bg-success-tint", bar: "bg-[#8FC7A9]" },
};

function formatHour(h: number): string {
  const hours = Math.floor(h);
  const minutes = Math.round((h - hours) * 60);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/** Ordre d'apparition des rendez-vous : chronologique, toutes colonnes confondues. */
function fillOrder(slot: Slot): number {
  const all = columns.flatMap((c) => c.slots).sort((a, b) => a.start - b.start || a.title.localeCompare(b.title));
  return all.findIndex((s) => s === slot);
}

function SlotCard({ slot, rowHeight }: { slot: Slot; rowHeight: number }) {
  const top = (slot.start - DAY_START) * rowHeight + 2;
  const height = (slot.end - slot.start) * rowHeight - 4;
  const tone = toneClasses[slot.tone];
  return (
    <div
      className={cn("slot absolute inset-x-1.5 flex overflow-hidden rounded-md text-[10px] leading-[1.3]", tone.bg)}
      style={{ top, height, "--i": fillOrder(slot) } as React.CSSProperties}
    >
      <span className={cn("w-[3px] shrink-0", tone.bar)} />
      <div className="min-w-0 px-2 py-1">
        <div className="truncate font-semibold text-ink">{slot.title}</div>
        <div className="text-ink-muted">
          {formatHour(slot.start)} – {formatHour(slot.end)}
        </div>
        <div className="truncate text-ink-muted">{slot.client}</div>
      </div>
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
    <aside className="hidden w-44 shrink-0 flex-col border-r border-line bg-[#fafaff] p-3 @2xl:flex">
      <Logo height={24} className="mb-5 ml-1" />
      <div className="mb-3 flex items-center gap-2 rounded-lg bg-card p-2 ring-1 ring-line">
        <DemoPhoto variant="salon" className="size-8 rounded-md" />
        <div className="min-w-0 flex-1 leading-tight">
          <div className="truncate text-[11px] font-semibold text-ink">{demo.salon}</div>
          <div className="truncate text-[9px] text-ink-muted">{demo.salonType}</div>
        </div>
        <ChevronDown className="size-3 text-ink-muted" />
      </div>
      <ul className="space-y-0.5">
        {items.map(({ icon: Icon, label, active }) => (
          <li
            key={label}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap rounded-md px-2 py-1.5 text-[11px]",
              active ? "bg-soft-tint font-semibold text-brand" : "text-ink-muted",
            )}
          >
            <Icon className="size-3.5" strokeWidth={1.8} />
            {label}
          </li>
        ))}
      </ul>
    </aside>
  );
}

function Toolbar() {
  return (
    <div className="border-b border-line px-3 py-2.5 @sm:px-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[13px] font-bold text-ink @sm:text-[15px]">Mon agenda</div>
        <div className="flex items-center gap-2">
          <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md bg-brand px-2 py-1.5 text-[10px] font-semibold text-white">
            <Plus className="size-3" />
            <span className="hidden @md:inline">Nouveau rendez-vous</span>
            <span className="@md:hidden">Nouveau</span>
          </span>
          <Avatar initials="MA" tone="accent" size="sm" />
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2 text-[10px]">
        <div className="hidden items-center gap-1 @lg:flex">
          <span className="rounded-md border border-line p-1">
            <ChevronLeft className="size-3" />
          </span>
          <span className="rounded-md border border-line px-2 py-1">Aujourd’hui</span>
          <span className="rounded-md border border-line p-1">
            <ChevronRight className="size-3" />
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-md border border-line px-2 py-1 font-medium text-ink">
          <CalendarDays className="size-3 text-ink-muted" />
          {demo.date.short}
        </span>
        <span className="hidden rounded-md border border-line p-0.5 @lg:inline-flex">
          <span className="rounded bg-soft-tint px-2 py-0.5 font-semibold text-brand">Jour</span>
          <span className="px-2 py-0.5 text-ink-muted">Semaine</span>
          <span className="px-2 py-0.5 text-ink-muted">Mois</span>
        </span>
      </div>
    </div>
  );
}

/** Vue large : trois colonnes praticiens (dès 448 px de largeur de cadre). */
function DesktopGrid() {
  const rowHeight = 44;
  return (
    <div className="hidden @md:block">
      <div className="grid grid-cols-[44px_repeat(3,1fr)] border-b border-line">
        <div />
        {columns.map((column, i) => (
          <div key={column.name} className="flex items-center gap-2 border-l border-line px-2 py-2">
            <Avatar initials={column.initials} tone={(["soft", "accent", "brand"] as const)[i]} size="sm" />
            <div className="leading-tight">
              <div className="text-[11px] font-semibold text-ink">{column.name}</div>
              <div className="truncate text-[9px] text-ink-muted">{column.role}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-[44px_repeat(3,1fr)]" style={{ height: (DAY_END - DAY_START) * rowHeight + 8 }}>
        <div className="relative">
          {HOURS.map((hour, i) => (
            <div key={hour} className="absolute right-2 text-[9px] text-ink-muted" style={{ top: i * rowHeight - 5 }}>
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
              <SlotCard key={slot.title + slot.start} slot={slot} rowHeight={rowHeight} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Créneaux de la journée de Camille tels que présentés sur téléphone (maquette). */
const mobileSlots: Slot[] = [
  { start: 9, end: 10, title: "Coupe & brushing", client: "Julie Martin", tone: "soft" },
  { start: 11, end: 12.5, title: "Coloration", client: "Élodie Bernard", tone: "accent" },
  { start: 14, end: 15, title: "Soin capillaire", client: "Sophie Leroy", tone: "success" },
];

/** Vue téléphone dédiée : un praticien, une chronologie lisible. */
function MobileTimeline() {
  const camille = columns[0];
  const start = 8;
  const hours = Array.from({ length: 9 }, (_, i) => start + i);
  return (
    <div className="mobile-agenda @md:hidden">
      <div className="agenda-salon">
        <DemoPhoto variant="salon" className="agenda-salon-photo rounded-md" />
        <div className="min-w-0 flex-1 leading-tight">
          <div className="font-semibold text-ink">{demo.salon}</div>
          <div className="agenda-salon-type text-ink-muted">{demo.salonType}</div>
        </div>
        <ChevronDown size={14} className="text-ink-muted" />
      </div>
      <div className="agenda-toolbar">
        <div className="agenda-heading">Mon agenda</div>
        <div className="agenda-date">
          <ChevronLeft size={13} className="text-ink-muted" />
          <span><CalendarDays size={14} />{demo.date.short}</span>
          <ChevronRight size={13} className="text-ink-muted" />
        </div>
        <div className="agenda-practitioner">
          <DemoPhoto variant="practitioner" className="agenda-portrait rounded-full" />
          <div className="leading-tight">
            <div className="font-semibold text-ink">{camille.name}</div>
            <div className="text-ink-muted">{camille.role}</div>
          </div>
        </div>
      </div>
      <div className="agenda-timeline">
        <div className="relative">
          {hours.map((hour, i) => (
            <div key={hour} className="agenda-hour" style={{ top: `calc(${i} * var(--agenda-hour) - 5px)` }}>
              {formatHour(hour)}
            </div>
          ))}
        </div>
        <div className="relative border-l border-line/50">
          {hours.map((hour, i) => (
            <div key={hour} className="absolute inset-x-0 border-t border-line/50" style={{ top: `calc(${i} * var(--agenda-hour))` }} />
          ))}
          {mobileSlots.map((slot, i) => {
            const tone = toneClasses[slot.tone];
            return (
              <div
                key={slot.title + slot.start}
                className={cn("slot agenda-slot", tone.bg)}
                style={{ top: `calc(${slot.start - start} * var(--agenda-hour) + 2px)`, "--i": i } as React.CSSProperties}
              >
                <span className={cn("w-0.5 shrink-0", tone.bar)} />
                <div className="agenda-slot-copy">
                  <div className="truncate font-semibold text-ink">{slot.title}</div>
                  <div className="text-ink-muted">{formatHour(slot.start)} – {formatHour(slot.end)}</div>
                  <div className="truncate text-ink-muted">{slot.client}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

type AgendaPreviewProps = {
  alt: string;
  className?: string;
  /** Les rendez-vous se posent un à un à l'arrivée (signature du premier écran). */
  animate?: boolean;
};

export function AgendaPreview({ alt, className, animate = false }: AgendaPreviewProps) {
  return (
    <div className={cn("relative", animate && "agenda-fill", className)}>
      <AppFrame alt={alt}>
        <div className="flex">
          <Sidebar />
          <div className="min-w-0 flex-1">
            <div className="hidden @md:block">
              <Toolbar />
            </div>
            <DesktopGrid />
            <MobileTimeline />
          </div>
        </div>
      </AppFrame>
    </div>
  );
}
