import { BellRing, CalendarCheck, MailCheck, MessageSquareHeart } from "lucide-react";
import { IconTile } from "@/components/ui/IconTile";
import { demo } from "@/content/fr/landing";
import { cn } from "@/lib/cn";

/**
 * Petites cartes flottantes autour du premier écran : des états réels du
 * produit (fictifs, Maison Alba), pas des logos partenaires.
 */
const chips = [
  {
    icon: CalendarCheck,
    tone: "brand" as const,
    title: "Nouveau rendez-vous",
    text: `${demo.reference.client} · ${demo.reference.start}`,
    className: "left-[max(2rem,calc(50%-560px))] top-[120px] xl:top-[140px]",
    delay: 900,
  },
  {
    icon: MailCheck,
    tone: "success" as const,
    title: "Confirmation envoyée",
    text: "Juste après la réservation",
    className: "right-[max(2rem,calc(50%-560px))] top-[170px] xl:top-[200px]",
    delay: 1050,
  },
  {
    icon: BellRing,
    tone: "accent" as const,
    title: "Rappel programmé",
    text: "24 h avant le rendez-vous",
    className: "left-[max(3rem,calc(50%-480px))] top-[330px] xl:top-[360px]",
    delay: 1200,
  },
  {
    icon: MessageSquareHeart,
    tone: "soft" as const,
    title: "Avis demandé",
    text: "Après la visite",
    className: "right-[max(3rem,calc(50%-500px))] top-[380px] xl:top-[420px]",
    delay: 1350,
  },
];

export function HeroChips() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block">
      {chips.map((chip) => (
        <div
          key={chip.title}
          className={cn(
            "enter absolute flex items-center gap-3 rounded-2xl bg-card/95 py-2.5 pl-2.5 pr-4 shadow-preview ring-1 ring-line",
            chip.className,
          )}
          style={{ "--d": `${chip.delay}ms` } as React.CSSProperties}
        >
          <IconTile icon={chip.icon} tone={chip.tone} size="md" />
          <div className="leading-tight">
            <div className="text-[13px] font-semibold text-ink">{chip.title}</div>
            <div className="text-[12px] text-ink-muted">{chip.text}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Arcs concentriques très discrets derrière le premier écran. */
export function HeroArcs() {
  const radii = [300, 440, 580, 720];
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-[430px] -z-10 hidden -translate-x-1/2 -translate-y-1/2 md:block"
      width="1500"
      height="1500"
      viewBox="0 0 1500 1500"
      style={{ maskImage: "radial-gradient(closest-side, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 78%)", WebkitMaskImage: "radial-gradient(closest-side, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 78%)" }}
    >
      {radii.map((r) => (
        <circle key={r} cx="750" cy="750" r={r} fill="none" stroke="#493344" strokeOpacity="0.12" strokeWidth="1" />
      ))}
    </svg>
  );
}
