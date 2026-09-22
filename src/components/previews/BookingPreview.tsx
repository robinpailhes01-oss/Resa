import { ArrowRight, Check, ChevronDown } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { demo } from "@/content/fr/landing";
import { cn } from "@/lib/cn";
import { AppFrame } from "./AppFrame";
import { DemoPhoto } from "./DemoPhoto";

/* Page de réservation vue par la cliente : prestation choisie, créneau en cours (données fictives). */

const steps = ["Prestation", "Créneau", "Coordonnées"];
const days = [
  { label: "Lun.", day: "21", active: true },
  { label: "Mar.", day: "22" },
  { label: "Mer.", day: "23" },
  { label: "Jeu.", day: "24" },
  { label: "Ven.", day: "25" },
];
const slots = ["09:00", "10:30", "14:00", "15:30", "17:00"];

export function BookingPreview({ alt, className }: { alt: string; className?: string }) {
  const r = demo.reference;
  return (
    <AppFrame alt={alt} className={className}>
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <DemoPhoto variant="salon" className="size-7 rounded-md" />
          <div className="leading-tight">
            <div className="text-[12px] font-semibold text-ink">{demo.salon}</div>
            <div className="text-[11px] text-ink-muted">
              {demo.salonType} · {demo.city}
            </div>
          </div>
        </div>
        <Logo height={16} />
      </div>
      <div className="px-4 py-4">
        <ol className="mb-4 flex items-center gap-2 text-[11px]">
          {steps.map((step, i) => {
            const done = i === 0;
            const current = i === 1;
            return (
              <li key={step} className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "inline-flex size-5 items-center justify-center rounded-full text-[10px] font-bold",
                    done || current ? "bg-ink text-white" : "border border-line text-ink-muted",
                  )}
                >
                  {done ? <Check className="size-3" strokeWidth={3} /> : i + 1}
                </span>
                <span className={cn(current ? "font-semibold text-ink" : "text-ink-muted")}>{step}</span>
                {i < steps.length - 1 ? <span className="mx-0.5 h-px w-4 bg-line" /> : null}
              </li>
            );
          })}
        </ol>

        <div className="mb-3 flex items-center justify-between">
          <div className="text-[13px] font-bold tracking-tight text-ink">Choisissez votre créneau</div>
          <span className="inline-flex items-center gap-1 rounded-lg border border-line px-2 py-1 text-[11px] font-medium text-ink">
            {r.practitioner} <ChevronDown className="size-3 text-ink-muted" />
          </span>
        </div>
        <div className="mb-3 grid grid-cols-5 gap-1.5">
          {days.map((d) => (
            <span
              key={d.day}
              className={cn(
                "rounded-lg border py-1.5 text-center text-[11px] leading-tight",
                d.active ? "border-ink bg-ink font-semibold text-white" : "border-line text-ink",
              )}
            >
              <span className="block text-[10px] opacity-80">{d.label}</span>
              <span className="block font-semibold">{d.day}</span>
            </span>
          ))}
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {slots.map((slot) => (
            <span
              key={slot}
              className={cn(
                "rounded-lg border py-1.5 text-center text-[11px] font-medium tabular-nums",
                slot === r.start ? "border-brand bg-soft-tint text-brand" : "border-line text-ink",
              )}
            >
              {slot}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl border border-line bg-page/70 px-3 py-2.5">
          <div className="min-w-0 leading-tight">
            <div className="truncate text-[12px] font-semibold text-ink">
              {r.service} · {r.duration}
            </div>
            <div className="text-[11px] text-ink-muted">
              {demo.date.short} à {r.start} · {r.price}
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-ink px-2.5 py-1.5 text-[11px] font-semibold text-white">
            Continuer <ArrowRight className="size-3" />
          </span>
        </div>
      </div>
    </AppFrame>
  );
}
