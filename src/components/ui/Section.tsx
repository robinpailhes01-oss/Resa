import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type SectionProps = {
  id: string;
  labelledBy: string;
  className?: string;
  children: ReactNode;
  /** Surfaces blanches, avec variante colorée pour les blocs d'accent. */
  tone?: "page" | "card" | "dark";
};

const tones = {
  page: "bg-page",
  card: "bg-card",
  dark: "bg-brand text-white [&_h2]:text-white",
};

export function Section({ id, labelledBy, className, children, tone = "page" }: SectionProps) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={cn("py-14 md:py-20", tones[tone], className)}>
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
    <div className="mx-auto mb-7 flex max-w-3xl flex-col items-center gap-3 text-center md:mb-10">
      {eyebrow ? <p className="text-small font-medium text-ink-muted">{eyebrow}</p> : null}
      <h2 id={id} className="max-w-[300px] text-[32px] leading-[35px] md:max-w-none md:text-[44px] md:leading-[50px]">
        {title}
      </h2>
      {introShort ? <p className="max-w-[310px] text-[15px] leading-6 text-ink-muted md:hidden">{introShort}</p> : null}
      {intro ? (
        <p className={cn("max-w-xl text-[16px] leading-7 text-ink-muted", "hidden md:block")}>
          {intro}
        </p>
      ) : null}
    </div>
  );
}
