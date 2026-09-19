import { CalendarDays, ChevronRight, ClipboardList, Mail, MapPin, Scissors } from "lucide-react";
import { demo } from "@/content/fr/landing";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/previews/AppFrame";

/* Mini-interfaces décoratives des cartes de fonctionnalités (données fictives). */

const frame = "w-full rounded-xl bg-card p-3 text-[10px] shadow-[0_10px_30px_-12px_rgba(73,51,68,0.25)] ring-1 ring-line";

export function BookingMini() {
  const items = [
    { name: "Coupe & brushing", meta: "1 h · 45 €", tone: "bg-soft" },
    { name: "Soin visage", meta: "1 h · 60 €", tone: "bg-accent-tint" },
    { name: "Manucure", meta: "45 min · 35 €", tone: "bg-success-tint" },
  ];
  return (
    <div aria-hidden="true" className={frame}>
      <div className="mb-2 font-semibold text-ink">Choisir une prestation</div>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item.name} className="flex items-center gap-2 rounded-lg border border-line px-2 py-1.5">
            <span className={cn("size-3 shrink-0 rounded-full", item.tone)} />
            <div className="min-w-0 flex-1 leading-tight">
              <div className="truncate font-semibold text-ink">{item.name}</div>
              <div className="text-[9px] text-ink-muted">{item.meta}</div>
            </div>
            <ChevronRight className="size-3 text-ink-muted" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AgendaMini() {
  const rows = [
    { p: demo.practitioners[0], blocks: [{ l: 4, w: 30, t: "bg-soft" }, { l: 50, w: 26, t: "bg-soft" }] },
    { p: demo.practitioners[1], blocks: [{ l: 20, w: 28, t: "bg-accent-tint" }, { l: 62, w: 30, t: "bg-accent-tint" }] },
    { p: demo.practitioners[2], blocks: [{ l: 8, w: 24, t: "bg-success-tint" }, { l: 44, w: 34, t: "bg-success-tint" }] },
  ];
  return (
    <div aria-hidden="true" className={frame}>
      <div className="mb-2 flex gap-1">
        {["Jour", "Semaine", "Mois"].map((l, i) => (
          <span key={l} className={cn("rounded px-1.5 py-0.5 text-[9px]", i === 0 ? "bg-soft-tint font-semibold text-brand" : "text-ink-muted")}>
            {l}
          </span>
        ))}
      </div>
      <div className="space-y-2">
        {rows.map(({ p, blocks }, i) => (
          <div key={p.name} className="flex items-center gap-2">
            <Avatar initials={p.initials} tone={(["soft", "accent", "brand"] as const)[i]} size="sm" />
            <div className="relative h-6 flex-1 rounded-md bg-page">
              {blocks.map((b, j) => (
                <span key={j} className={cn("absolute inset-y-1 rounded", b.t)} style={{ left: `${b.l}%`, width: `${b.w}%` }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EmailMini() {
  return (
    <div aria-hidden="true" className={frame}>
      <div className="font-semibold text-ink">Bonjour Julie,</div>
      <div className="mt-1 text-ink">Votre rendez-vous est confirmé !</div>
      <ul className="mt-2 space-y-1.5 text-ink-muted">
        <li className="flex items-center gap-2">
          <CalendarDays className="size-3 text-brand" /> {demo.date.short} à 09h00
        </li>
        <li className="flex items-center gap-2">
          <Scissors className="size-3 text-brand" /> Coupe & brushing
        </li>
        <li className="flex items-center gap-2">
          <MapPin className="size-3 text-brand" /> {demo.salon}
        </li>
      </ul>
      <div className="mt-2 text-ink">À très bientôt !</div>
    </div>
  );
}

export const featureIcons = { calendar: CalendarDays, agenda: ClipboardList, mail: Mail } as const;
export const featureMinis = { calendar: BookingMini, agenda: AgendaMini, mail: EmailMini } as const;
