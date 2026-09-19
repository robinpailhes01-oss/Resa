import { Calendar, CalendarCheck, Flower2, Heart, Leaf, Mail, Scissors, Star, User } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { hero } from "@/content/fr/landing";
import { cn } from "@/lib/cn";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

/** Arcs concentriques derrière le premier écran, centrés sur le titre. */
export function HeroArcs() {
  const radii = [260, 400, 540, 680, 820];
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-[300px] -z-10 -translate-x-1/2 -translate-y-1/2 md:top-[330px]"
      width="1700"
      height="1700"
      viewBox="0 0 1700 1700"
      style={{
        maskImage: "radial-gradient(closest-side, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 72%)",
        WebkitMaskImage: "radial-gradient(closest-side, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 72%)",
      }}
    >
      {radii.map((r) => (
        <circle key={r} cx="850" cy="850" r={r} fill="none" stroke="#493344" strokeOpacity="0.1" strokeWidth="1" />
      ))}
    </svg>
  );
}

/* Positions : téléphone (classes de base) puis grand écran (préfixe md:). Même côté sur les deux. */
const icons: Array<{ icon: Icon; tone: string; className: string; delay: number }> = [
  { icon: Calendar, tone: "text-brand", className: "left-2 top-[56px] md:left-[9%] md:top-[120px]", delay: 700 },
  { icon: Flower2, tone: "text-[#7B5E8E]", className: "left-2 top-[282px] md:left-[4%] md:top-[240px]", delay: 820 },
  { icon: Scissors, tone: "text-[#C9773F]", className: "hidden md:flex md:left-[10%] md:top-[370px]", delay: 940 },
  { icon: Heart, tone: "text-[#C9773F]", className: "right-2 top-[52px] md:right-[9%] md:top-[110px]", delay: 760 },
  { icon: Leaf, tone: "text-success", className: "right-2 top-[282px] md:right-[4%] md:top-[240px]", delay: 880 },
  { icon: User, tone: "text-brand", className: "hidden md:flex md:right-[10%] md:top-[370px]", delay: 1000 },
];

/** Pastilles d'icônes posées sur les arcs : le métier, pas des logos partenaires. */
export function HeroIcons() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {icons.map(({ icon: Icon, tone, className, delay }, i) => (
        <span
          key={i}
          className={cn(
            "enter absolute flex items-center justify-center rounded-full bg-card shadow-[0_8px_24px_rgba(73,51,68,0.10),0_0_0_1px_rgba(217,209,216,0.8)]",
            "size-10 [&_svg]:size-[18px] md:size-14 md:[&_svg]:size-6",
            className,
            tone,
          )}
          style={{ "--d": `${delay}ms` } as React.CSSProperties}
        >
          <Icon strokeWidth={1.8} />
        </span>
      ))}
    </div>
  );
}

const cardIcons: Record<string, Icon> = { reminder: Mail, confirmed: CalendarCheck, review: Star };
const cardPlacement: Record<string, string> = {
  reminder: "right-[-2%] top-[8%] rotate-[5deg] xl:right-[-4%]",
  confirmed: "left-[-3%] bottom-[14%] rotate-[-6deg] xl:left-[-5%]",
  review: "right-[-1%] bottom-[4%] rotate-[4deg] xl:right-[-3%]",
};

/** Cartes flottantes légèrement inclinées autour de l'aperçu (desktop). */
export function FloatingCards() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block">
      {hero.floatingCards.map((card, i) => {
        const Icon = cardIcons[card.id];
        return (
          <div
            key={card.id}
            className={cn(
              "enter absolute w-52 rounded-2xl bg-card p-4 shadow-[0_24px_60px_-12px_rgba(73,51,68,0.25)] ring-1 ring-line/70",
              cardPlacement[card.id],
            )}
            style={{ "--d": `${1200 + i * 150}ms` } as React.CSSProperties}
          >
            <span className="mb-2 inline-flex size-9 items-center justify-center rounded-xl bg-soft-tint text-brand">
              <Icon className="size-5" strokeWidth={1.8} />
            </span>
            <div className="text-[13px] font-semibold text-ink">{card.title}</div>
            <p className="mt-1 text-[11px] leading-4 text-ink-muted">{card.text}</p>
          </div>
        );
      })}
    </div>
  );
}

/** Version téléphone : une seule pastille « Rappel par email envoyé ». */
export function FloatingBadgeMobile() {
  const card = hero.floatingCards[0];
  return (
    <div
      aria-hidden="true"
      className="enter absolute -right-2 top-6 z-10 w-36 rounded-2xl bg-card p-3 shadow-[0_18px_40px_-10px_rgba(73,51,68,0.28)] ring-1 ring-line/70 lg:hidden"
      style={{ "--d": "1200ms" } as React.CSSProperties}
    >
      <span className="mb-1.5 inline-flex size-8 items-center justify-center rounded-lg bg-soft-tint text-brand">
        <Mail className="size-4" strokeWidth={1.8} />
      </span>
      <div className="text-[12px] font-semibold leading-4 text-ink">{card.short}</div>
    </div>
  );
}
