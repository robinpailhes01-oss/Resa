import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Mail, Plus, Settings, Sparkles, Users } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { demo } from "@/content/fr/landing";
import { cn } from "@/lib/cn";
import { AppFrame, Avatar } from "./AppFrame";
import { DemoPhoto } from "./DemoPhoto";

/*
 * Aperçu de l'agenda : HTML/CSS uniquement, données fictives (Maison Alba,
 * Camille et ses clientes n'existent pas). Le cadre s'adapte à sa largeur via
 * les container queries : trois praticiens sur grand écran, la journée de
 * Camille seule sur téléphone.
 */

type Tone = "soft" | "accent" | "success";
type Slot = { start: number; end: number; title: string; client: string; tone: Tone; demo?: boolean };

const toneClasses: Record<Tone, { bg: string; bar: string }> = {
  soft: { bg: "bg-soft-tint", bar: "bg-brand" },
  accent: { bg: "bg-accent-tint", bar: "bg-accent" },
  success: { bg: "bg-success-tint", bar: "bg-mint" },
};

/** Journée de Camille : le premier rendez-vous est celui que la démonstration pose dans l'agenda. */
const camille: Slot[] = demo.camilleDay.map((slot, i) => ({ ...slot, demo: i === 0 }));

const columns: Array<{ name: string; role: string; initials: string; portrait?: boolean; slots: Slot[] }> = [
  { ...demo.practitioners[0], portrait: true, slots: camille },
  {
    ...demo.practitioners[1],
    slots: [
      { start: 10, end: 11, title: "Soin visage", client: "Manon Dubois", tone: "accent" },
      { start: 14, end: 15, title: demo.reference.service, client: demo.reference.client, tone: "soft" },
      { start: 16, end: 17, title: "Modelage bien-être", client: "Nathalie Robert", tone: "success" },
    ],
  },
  {
    ...demo.practitioners[2],
    slots: [
      { start: 9.5, end: 10.5, title: "Manucure", client: "Léa Girard", tone: "success" },
      { start: 13, end: 14, title: "Pose semi-permanent", client: "Amélie Thomas", tone: "soft" },
      { start: 15.5, end: 16.5, title: "Manucure", client: "Chloé Rousseau", tone: "accent" },
    ],
  },
];

function formatHour(h: number): string {
  const hours = Math.floor(h);
  const minutes = Math.round((h - hours) * 60);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function SlotCard({ slot, dayStart, rowHeight, dense = false }: { slot: Slot; dayStart: number; rowHeight: number; dense?: boolean }) {
  const top = (slot.start - dayStart) * rowHeight + 3;
  const height = (slot.end - slot.start) * rowHeight - 6;
  const tone = toneClasses[slot.tone];
  return (
    <div
      className={cn("absolute inset-x-1.5 flex overflow-hidden rounded-lg", tone.bg, slot.demo && "demo-slot")}
      style={{ top, height }}
    >
      <span className={cn("my-1.5 ml-1.5 w-[3px] shrink-0 rounded-full", tone.bar)} />
      <div className={cn("min-w-0 px-2 leading-[1.35]", dense ? "py-1 text-[11px]" : "py-1.5 text-[12px]")}>
        <div className="truncate font-semibold text-ink">{slot.title}</div>
        <div className="truncate text-ink-muted">
          {formatHour(slot.start)} – {formatHour(slot.end)} · {slot.client}
        </div>
      </div>
    </div>
  );
}

function Sidebar() {
  const items = [
    { icon: CalendarDays, label: "Agenda", active: true },
    { icon: Users, label: "Clients" },
    { icon: Sparkles, label: "Prestations" },
    { icon: Mail, label: "Emails" },
    { icon: Settings, label: "Paramètres" },
  ];
  return (
    <aside className="hidden w-48 shrink-0 flex-col border-r border-line bg-page/70 p-4 @3xl:flex">
      <Logo height={22} className="mb-6 ml-1" />
      <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-line bg-card p-2">
        <DemoPhoto variant="salon" className="size-8 rounded-lg" />
        <div className="min-w-0 flex-1 leading-tight">
          <div className="truncate text-[12px] font-semibold text-ink">{demo.salon}</div>
          <div className="truncate text-[11px] text-ink-muted">{demo.salonType}</div>
        </div>
        <ChevronDown className="size-3.5 text-ink-muted" />
      </div>
      <ul className="space-y-0.5">
        {items.map(({ icon: Icon, label, active }) => (
          <li
            key={label}
            className={cn(
              "flex items-center gap-2.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-[12px] font-medium",
              active ? "bg-soft-tint text-brand" : "text-ink-muted",
            )}
          >
            <Icon className="size-4" strokeWidth={1.8} />
            {label}
          </li>
        ))}
      </ul>
    </aside>
  );
}

function Toolbar() {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="text-[14px] font-bold tracking-tight text-ink">Agenda</div>
        <span className="hidden items-center overflow-hidden rounded-lg border border-line text-[11px] @lg:inline-flex">
          <span className="px-2 py-1 text-ink-muted">
            <ChevronLeft className="size-3.5" />
          </span>
          <span className="border-x border-line px-2.5 py-1 font-medium text-ink">Aujourd’hui</span>
          <span className="px-2 py-1 text-ink-muted">
            <ChevronRight className="size-3.5" />
          </span>
        </span>
        <span className="hidden whitespace-nowrap text-[12px] font-medium text-ink-muted @2xl:inline">{demo.date.short}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden overflow-hidden rounded-lg border border-line p-0.5 text-[11px] @xl:inline-flex">
          <span className="rounded-md bg-soft-tint px-2.5 py-1 font-semibold text-brand">Jour</span>
          <span className="px-2.5 py-1 text-ink-muted">Semaine</span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1.5 text-[11px] font-semibold text-white">
          <Plus className="size-3.5" />
          Nouveau rendez-vous
        </span>
      </div>
    </div>
  );
}

/** Vue large : trois colonnes praticiens (dès 576 px de largeur de cadre). */
function DesktopGrid({ dayStart, dayEnd, rowHeight }: { dayStart: number; dayEnd: number; rowHeight: number }) {
  const hours = Array.from({ length: dayEnd - dayStart + 1 }, (_, i) => dayStart + i);
  return (
    <div className="hidden @xl:block">
      <div className="grid grid-cols-[52px_repeat(3,1fr)] border-b border-line">
        <div />
        {columns.map((column, i) => (
          <div key={column.name} className="flex items-center gap-2.5 border-l border-line px-3 py-2.5">
            {column.portrait ? (
              <DemoPhoto variant="practitioner" className="size-7 rounded-full" />
            ) : (
              <Avatar initials={column.initials} tone={(["soft", "accent", "mint"] as const)[i]} size="sm" />
            )}
            <div className="min-w-0 leading-tight">
              <div className="text-[12px] font-semibold text-ink">{column.name}</div>
              <div className="truncate text-[11px] text-ink-muted">{column.role}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-[52px_repeat(3,1fr)]" style={{ height: (dayEnd - dayStart) * rowHeight + 10 }}>
        <div className="relative">
          {hours.map((hour, i) => (
            <div key={hour} className="absolute right-2.5 text-[11px] tabular-nums text-ink-muted" style={{ top: i * rowHeight - 7 }}>
              {formatHour(hour)}
            </div>
          ))}
        </div>
        {columns.map((column) => (
          <div key={column.name} className="relative border-l border-line">
            {hours.slice(0, -1).map((hour, i) => (
              <div key={hour} className="absolute inset-x-0 border-t border-line/80" style={{ top: i * rowHeight }} />
            ))}
            {column.slots.map((slot) => (
              <SlotCard key={slot.title + slot.start} slot={slot} dayStart={dayStart} rowHeight={rowHeight} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Journée de Camille, une seule colonne lisible : vue téléphone et vue rapprochée. */
function DayTimeline({ rowHeight = 38, dayEnd = 16, className }: { rowHeight?: number; dayEnd?: number; className?: string }) {
  const dayStart = 8;
  const hours = Array.from({ length: dayEnd - dayStart + 1 }, (_, i) => dayStart + i);
  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-3 border-b border-line px-3.5 py-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <DemoPhoto variant="salon" className="size-8 rounded-lg" />
          <div className="min-w-0 leading-tight">
            <div className="truncate text-[12px] font-semibold text-ink">{demo.salon}</div>
            <div className="truncate text-[11px] text-ink-muted">{demo.salonType}</div>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-ink px-2 py-1.5 text-[11px] font-semibold text-white">
          <Plus className="size-3.5" />
          Nouveau
        </span>
      </div>
      <div className="flex items-center justify-between px-3.5 pb-2 pt-3">
        <div className="text-[15px] font-bold tracking-tight text-ink">Agenda</div>
        <span className="inline-flex items-center gap-2 rounded-lg border border-line px-2 py-1 text-[11px] font-medium text-ink">
          <ChevronLeft className="size-3.5 text-ink-muted" />
          <CalendarDays className="size-3.5 text-brand" />
          {demo.date.short}
          <ChevronRight className="size-3.5 text-ink-muted" />
        </span>
      </div>
      <div className="flex items-center gap-2.5 px-3.5 pb-2.5">
        <DemoPhoto variant="practitioner" className="size-7 rounded-full" />
        <div className="leading-tight">
          <div className="text-[12px] font-semibold text-ink">{columns[0].name}</div>
          <div className="text-[11px] text-ink-muted">{columns[0].role}</div>
        </div>
      </div>
      <div className="grid grid-cols-[44px_1fr] border-t border-line" style={{ height: (dayEnd - dayStart) * rowHeight + 10 }}>
        <div className="relative">
          {hours.map((hour, i) => (
            <div key={hour} className="absolute right-2 text-[11px] tabular-nums text-ink-muted" style={{ top: i * rowHeight - 7 }}>
              {formatHour(hour)}
            </div>
          ))}
        </div>
        <div className="relative border-l border-line">
          {hours.slice(0, -1).map((hour, i) => (
            <div key={hour} className="absolute inset-x-0 border-t border-line/80" style={{ top: i * rowHeight }} />
          ))}
          {camille.map((slot) => (
            <SlotCard key={slot.title + slot.start} slot={slot} dayStart={dayStart} rowHeight={rowHeight} dense={rowHeight < 44} />
          ))}
        </div>
      </div>
    </div>
  );
}

type AgendaPreviewProps = {
  alt: string;
  className?: string;
  /** « day » : la journée de Camille seule, plus grande (vue rapprochée). */
  variant?: "full" | "day";
};

export function AgendaPreview({ alt, className, variant = "full" }: AgendaPreviewProps) {
  if (variant === "day") {
    return (
      <AppFrame alt={alt} className={className}>
        <DayTimeline rowHeight={48} dayEnd={15} />
      </AppFrame>
    );
  }
  return (
    <AppFrame alt={alt} className={className}>
      <div className="flex">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <div className="hidden @xl:block">
            <Toolbar />
          </div>
          <DesktopGrid dayStart={8} dayEnd={18} rowHeight={48} />
          <DayTimeline className="@xl:hidden" />
        </div>
      </div>
    </AppFrame>
  );
}
