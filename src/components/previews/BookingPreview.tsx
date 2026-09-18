import { ArrowRight, Calendar, Check, ChevronDown, Clock, User } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { demo } from "@/content/fr/landing";
import { cn } from "@/lib/cn";
import { AppFrame } from "./AppFrame";

const steps = ["Prestation", "Créneau", "Coordonnées", "Confirmation"];
const days = [
  { label: "Lun.", day: "21", active: true },
  { label: "Mar.", day: "22" },
  { label: "Mer.", day: "23" },
  { label: "Jeu.", day: "24" },
  { label: "Ven.", day: "25" },
];
const slots = ["09:00", "10:30", "14:00", "15:30", "17:00"];

function Steps() {
  return (
    <ol className="flex items-center gap-2 text-[10px] @sm:gap-3">
      {steps.map((step, i) => {
        const done = i === 0;
        const current = i === 1;
        return (
          <li key={step} className="flex items-center gap-1.5">
            <span
              className={cn(
                "inline-flex size-5 items-center justify-center rounded-full text-[9px] font-bold",
                done || current ? "bg-brand text-white" : "bg-soft-tint text-ink-muted",
              )}
            >
              {done ? <Check className="size-3" strokeWidth={3} /> : i + 1}
            </span>
            <span className={cn("hidden @lg:inline", current ? "font-semibold text-brand" : "text-ink-muted")}>{step}</span>
            {i < steps.length - 1 ? <span className="hidden h-px w-4 bg-line @lg:block @2xl:w-8" /> : null}
          </li>
        );
      })}
    </ol>
  );
}

function Summary() {
  const r = demo.reference;
  return (
    <div className="rounded-lg border border-line p-3 text-[10px] @sm:text-[11px]">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[12px] font-bold text-brand">Votre réservation</span>
        <span className="underline text-ink-muted">Modifier</span>
      </div>
      <div className="mb-2 flex items-center gap-2 border-b border-line pb-2">
        <span className="size-9 shrink-0 rounded-md bg-accent-tint" />
        <div className="leading-tight">
          <div className="font-semibold text-ink">{r.service}</div>
          <div className="text-ink-muted">{r.duration}</div>
        </div>
      </div>
      <dl className="space-y-1.5">
        <div className="flex items-center gap-2">
          <User className="size-3 text-ink-muted" />
          <dt className="w-16 text-ink-muted">Praticienne</dt>
          <dd className="font-medium">{r.practitioner}</dd>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="size-3 text-ink-muted" />
          <dt className="w-16 text-ink-muted">Date</dt>
          <dd className="font-medium">{demo.date.short}</dd>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="size-3 text-ink-muted" />
          <dt className="w-16 text-ink-muted">Créneau</dt>
          <dd className="font-medium">{r.start}</dd>
        </div>
      </dl>
      <div className="mt-2 flex items-center justify-between border-t border-line pt-2">
        <div>
          <div className="text-[12px] font-bold text-ink">Total</div>
          <div className="text-ink-muted">Paiement sur place</div>
        </div>
        <div className="text-[14px] font-bold text-brand">{r.price}</div>
      </div>
      <span className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded-md bg-brand py-1.5 text-[10px] font-semibold text-white">
        Continuer <ArrowRight className="size-3" />
      </span>
    </div>
  );
}

export function BookingPreview({ alt, className }: { alt: string; className?: string }) {
  return (
    <AppFrame alt={alt} className={className}>
      <div className="flex items-center justify-between border-b border-line px-3 py-2 @sm:px-4">
        <Logo height={16} />
        <span className="text-[10px] text-ink-muted @sm:text-[11px]">Votre rendez-vous chez {demo.salon}</span>
      </div>
      <div className="h-12 bg-[linear-gradient(120deg,#f3e3d4_0%,#e9d9cf_45%,#ddd5e5_100%)] @sm:h-16" />
      <div className="px-3 py-3 @sm:px-4">
        <div className="mb-3">
          <div className="text-[13px] font-bold text-brand @sm:text-[15px]">{demo.salon}</div>
          <div className="text-[10px] text-ink-muted">
            {demo.salonType} · {demo.city}
          </div>
        </div>
        <div className="mb-3">
          <Steps />
        </div>
        <div className="grid gap-3 @2xl:grid-cols-[1.5fr_1fr]">
          <div className="rounded-lg border border-line p-3">
            <div className="mb-2 text-[12px] font-bold text-brand">Choisissez votre créneau</div>
            <div className="mb-2 flex items-center gap-2 text-[10px]">
              <span className="text-ink-muted">Avec</span>
              <span className="inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 font-medium">
                {demo.reference.practitioner} <ChevronDown className="size-3 text-ink-muted" />
              </span>
            </div>
            <div className="mb-1 text-[10px] font-semibold text-ink">Septembre 2026</div>
            <div className="mb-3 grid grid-cols-5 gap-1">
              {days.map((d) => (
                <span
                  key={d.day}
                  className={cn(
                    "rounded-md border py-1.5 text-center text-[10px] leading-tight",
                    d.active ? "border-brand bg-brand font-semibold text-white" : "border-line text-ink",
                  )}
                >
                  <span className="block">{d.label}</span>
                  <span className="block font-semibold">{d.day}</span>
                </span>
              ))}
            </div>
            <div className="mb-1 text-[10px] font-semibold text-ink">Créneaux disponibles</div>
            <div className="grid grid-cols-5 gap-1">
              {slots.map((slot) => (
                <span
                  key={slot}
                  className={cn(
                    "rounded-md border py-1.5 text-center text-[10px] font-medium",
                    slot === demo.reference.start ? "border-brand bg-brand text-white" : "border-line text-ink",
                  )}
                >
                  {slot}
                </span>
              ))}
            </div>
          </div>
          <Summary />
        </div>
      </div>
    </AppFrame>
  );
}
