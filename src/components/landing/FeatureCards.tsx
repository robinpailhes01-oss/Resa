import { BellRing, CalendarDays, Check, MailCheck, MessageSquareHeart, Users } from "lucide-react";
import { IconTile } from "@/components/ui/IconTile";
import { demo } from "@/content/fr/landing";
import { cn } from "@/lib/cn";

/* Mini-interfaces décoratives des cartes de fonctionnalités (données fictives). */

export function BookingMini() {
  const days = ["Lun. 21", "Mar. 22", "Mer. 23"];
  const slots = ["09:00", "10:30", "14:00", "15:30"];
  return (
    <div aria-hidden="true" className="w-full max-w-[280px] rounded-xl bg-card p-3 text-[11px] shadow-card ring-1 ring-line">
      <div className="mb-2 font-semibold text-ink">Choisissez votre créneau</div>
      <div className="mb-2 grid grid-cols-3 gap-1">
        {days.map((day, i) => (
          <span
            key={day}
            className={cn("rounded-md border py-1 text-center", i === 0 ? "border-brand bg-brand font-semibold text-white" : "border-line text-ink")}
          >
            {day}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-1">
        {slots.map((slot) => (
          <span
            key={slot}
            className={cn("rounded-md border py-1 text-center font-medium", slot === demo.reference.start ? "border-brand bg-brand text-white" : "border-line text-ink")}
          >
            {slot}
          </span>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between rounded-md bg-page px-2 py-1.5">
        <span className="text-ink-muted">{demo.reference.service}</span>
        <span className="font-semibold text-brand">{demo.reference.price}</span>
      </div>
    </div>
  );
}

export function EmailsMini() {
  const rows = [
    { icon: MailCheck, tone: "success" as const, title: "Confirmation envoyée", when: "à l’instant" },
    { icon: BellRing, tone: "accent" as const, title: "Rappel programmé", when: "24 h avant" },
    { icon: MessageSquareHeart, tone: "soft" as const, title: "Demande d’avis", when: "24 h après" },
  ];
  return (
    <div aria-hidden="true" className="flex w-full max-w-[280px] flex-col gap-2">
      {rows.map((row, i) => (
        <div
          key={row.title}
          className="flex items-center gap-3 rounded-xl bg-card py-2 pl-2 pr-3 text-[11px] shadow-card ring-1 ring-line"
          style={{ marginLeft: `${i * 10}px`, marginRight: `${(2 - i) * 10}px` }}
        >
          <IconTile icon={row.icon} tone={row.tone} size="sm" />
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate font-semibold text-ink">{row.title}</div>
            <div className="text-ink-muted">{demo.reference.client} · {row.when}</div>
          </div>
          <Check className="size-3.5 text-success" strokeWidth={3} />
        </div>
      ))}
    </div>
  );
}

export function AgendaMini() {
  const cols = [
    { name: "Camille", blocks: [{ top: 0, h: 22, tone: "soft" }, { top: 34, h: 30, tone: "accent" }] },
    { name: "Sophie", blocks: [{ top: 10, h: 26, tone: "accent" }, { top: 48, h: 20, tone: "soft" }] },
    { name: "Manon", blocks: [{ top: 4, h: 18, tone: "soft" }, { top: 40, h: 28, tone: "soft" }] },
  ];
  return (
    <div aria-hidden="true" className="w-full max-w-[280px] rounded-xl bg-card p-3 text-[10px] shadow-card ring-1 ring-line">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-semibold text-ink">{demo.date.short}</span>
        <span className="rounded-md bg-soft px-1.5 py-0.5 font-semibold text-brand">Jour</span>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {cols.map((col) => (
          <div key={col.name}>
            <div className="mb-1 truncate text-center text-ink-muted">{col.name}</div>
            <div className="relative h-[76px] rounded-md bg-page">
              {col.blocks.map((b, i) => (
                <span
                  key={i}
                  className={cn("absolute inset-x-1 rounded", b.tone === "soft" ? "bg-soft" : "bg-accent-tint")}
                  style={{ top: `${b.top}%`, height: `${b.h}%` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const featureIcons = { calendar: CalendarDays, mail: MailCheck, users: Users } as const;
