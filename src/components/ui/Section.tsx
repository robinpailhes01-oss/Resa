import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type SectionProps = {
  id: string;
  labelledBy: string;
  className?: string;
  children: ReactNode;
  /** Deux fonds seulement : ivoire (page) et blanc (card) ; prune pour la fin de page. */
  tone?: "page" | "card" | "dark";
};

const tones = {
  page: "bg-page",
  card: "bg-card",
  dark: "bg-brand text-white [&_h2]:text-white",
};

export function Section({ id, labelledBy, className, children, tone = "page" }: SectionProps) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={cn("py-20 md:py-32", tones[tone], className)}>
      <div className="container-page">{children}</div>
    </section>
  );
}

type SectionHeadingProps = {
  id: string;
  eyebrow?: string | null;
  title: string;
  intro?: string;
  /** Intro courte affichée sur téléphone ; à défaut, l'intro est masquée sur téléphone. */
  introShort?: string;
};

/** Titre de section à la manière d'Apple : grand, serré, centré, une seule ligne dessous. */
export function SectionHeading({ id, eyebrow, title, intro, introShort }: SectionHeadingProps) {
  return (
    <div className="mx-auto mb-12 flex max-w-3xl flex-col items-center gap-4 text-center md:mb-20">
      {eyebrow ? <p className="text-small font-medium text-ink-muted">{eyebrow}</p> : null}
      <h2 id={id} className="text-h2-sm md:text-h2">
        {title}
      </h2>
      {introShort ? <p className="text-[17px] leading-7 text-ink-muted md:hidden">{introShort}</p> : null}
      {intro ? (
        <p className={cn("max-w-xl text-[19px] leading-8 text-ink-muted md:text-[21px] md:leading-9", "hidden md:block")}>
          {intro}
        </p>
      ) : null}
    </div>
  );
}
