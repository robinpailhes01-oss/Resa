import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type SectionProps = {
  id: string;
  labelledBy: string;
  className?: string;
  children: ReactNode;
  /** Fond de page ou surface blanche. */
  tone?: "page" | "card";
};

const tones = {
  page: "bg-page",
  card: "bg-card",
};

export function Section({ id, labelledBy, className, children, tone = "page" }: SectionProps) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={cn("py-16 md:py-24", tones[tone], className)}>
      <div className="container-page">{children}</div>
    </section>
  );
}

type SectionHeadingProps = {
  id: string;
  /** Étiquette d'index des visuels de marque (« [002] »). */
  index?: string;
  eyebrow?: string | null;
  title: string;
  intro?: string;
  align?: "center" | "left" | "split";
  className?: string;
};

/** Ligne d'étiquette : index mono, filet, capitales espacées. */
export function SectionKicker({ index, eyebrow, className }: { index?: string; eyebrow?: string | null; className?: string }) {
  if (!index && !eyebrow) return null;
  return (
    <p className={cn("flex items-center gap-3", className)}>
      {index ? <span className="index-tag">{index}</span> : null}
      {index && eyebrow ? <span aria-hidden="true" className="h-px w-8 bg-current opacity-30" /> : null}
      {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
    </p>
  );
}

/**
 * Titre de section. « split » : étiquette à gauche, titre et intro à droite,
 * composition éditoriale des visuels de marque.
 */
export function SectionHeading({ id, index, eyebrow, title, intro, align = "split", className }: SectionHeadingProps) {
  if (align === "split") {
    return (
      <div className={cn("reveal reveal-blur grid gap-4 md:grid-cols-12 md:gap-8", className)}>
        <SectionKicker index={index} eyebrow={eyebrow} className="self-start md:col-span-4 md:pt-4" />
        <div className="md:col-span-8">
          <h2 id={id} className="heading-2 max-w-[18ch]">
            {title}
          </h2>
          {intro ? <p className="mt-4 max-w-xl text-[16px] leading-7 text-ink-muted md:text-[17px]">{intro}</p> : null}
        </div>
      </div>
    );
  }
  return (
    <div className={cn("reveal reveal-blur flex max-w-2xl flex-col gap-3", align === "center" ? "mx-auto items-center text-center" : "items-start text-left", className)}>
      <SectionKicker index={index} eyebrow={eyebrow} />
      <h2 id={id} className="heading-2">
        {title}
      </h2>
      {intro ? <p className="max-w-xl text-[16px] leading-7 text-ink-muted md:text-[17px]">{intro}</p> : null}
    </div>
  );
}
