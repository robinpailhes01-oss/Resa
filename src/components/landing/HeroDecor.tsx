import { Calendar, CalendarCheck, Flower2, Heart, Leaf, Mail, Scissors, Star, User } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { hero } from "@/content/fr/landing";
import { cn } from "@/lib/cn";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

/** Arcs concentriques derrière le premier écran, centrés sur le titre. */
export function HeroArcs() {
  const radii = [150, 250, 360, 500, 680, 860];
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-[170px] -z-10 -translate-x-1/2 -translate-y-1/2 md:top-[200px]"
      width="1700"
      height="1700"
      viewBox="0 0 1700 1700"
      style={{
        maskImage: "radial-gradient(closest-side, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 72%)",
        WebkitMaskImage: "radial-gradient(closest-side, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 72%)",
      }}
    >
      {radii.map((r) => (
        <circle key={r} cx="850" cy="850" r={r} fill="none" stroke="#a699ff" strokeOpacity="0.32" strokeWidth="1" />
      ))}
    </svg>
  );
}

/* Positions : téléphone (classes de base) puis grand écran (préfixe md:). Même côté sur les deux. */
const icons: Array<{ icon: Icon; tone: string; className: string; delay: number }> = [
  { icon: Calendar, tone: "text-brand", className: "left-3 top-[62px] md:left-[13%] md:top-[100px]", delay: 700 },
  { icon: Flower2, tone: "text-brand", className: "left-1 top-[155px] md:left-[7%] md:top-[220px]", delay: 820 },
  { icon: Scissors, tone: "text-[#e78075]", className: "hidden md:flex md:left-[13%] md:top-[335px]", delay: 940 },
  { icon: Heart, tone: "text-[#e78075]", className: "right-3 top-[60px] md:right-[13%] md:top-[85px]", delay: 760 },
  { icon: Leaf, tone: "text-[#58a982]", className: "right-1 top-[152px] md:right-[7%] md:top-[220px]", delay: 880 },
  { icon: User, tone: "text-brand", className: "right-1 top-[262px] md:right-[13%] md:top-[330px]", delay: 1000 },
];

/** Pastilles d'icônes posées sur les arcs : le métier, pas des logos partenaires. */
export function HeroIcons() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {icons.map(({ icon: Icon, tone, className, delay }, i) => (
        <span
          key={i}
          className={cn(
            "enter absolute flex items-center justify-center rounded-full bg-card shadow-[0_8px_24px_rgba(105,80,232,0.07)] ring-1 ring-line/70",
            "size-8 [&_svg]:size-[17px] sm:size-10 md:size-14 md:[&_svg]:size-6",
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
  reminder: "right-[-3%] top-[16%] rotate-[-7deg] xl:right-[-7%]",
  confirmed: "left-[-3%] bottom-[12%] rotate-[7deg] xl:left-[-7%]",
  review: "right-[-2%] bottom-[3%] rotate-[-6deg] xl:right-[-6%]",
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
              "enter absolute w-44 rounded-2xl bg-card p-4 shadow-[0_18px_55px_-16px_rgba(105,80,232,0.24)] ring-1 ring-line/70 xl:w-52",
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

/** Version téléphone : une seule pastille « Rappel par email envoyé », avec son étincelle. */
export function FloatingBadgeMobile() {
  const card = hero.floatingCards[0];
  return (
    <div
      aria-hidden="true"
      className="enter absolute -right-1 -top-6 z-10 w-[112px] rounded-xl bg-card px-3 py-2.5 shadow-[0_14px_40px_-12px_rgba(105,80,232,0.28)] ring-1 ring-line/60 sm:hidden"
      style={{ "--d": "1200ms" } as React.CSSProperties}
    >
      <svg viewBox="0 0 32 32" className="absolute -right-1 -top-6 size-9 text-brand" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
        <path d="M16 4v8" />
        <path d="M6 9l5.5 5.5" />
        <path d="M26 9l-5.5 5.5" />
      </svg>
      <span className="mb-1 inline-flex size-7 items-center justify-center text-brand">
        <Mail className="size-[18px]" strokeWidth={1.8} />
      </span>
      <div className="text-[11px] font-semibold leading-[15px] text-ink sm:text-[13px]">{card.short}</div>
    </div>
  );
}
