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
  eyebrow?: string | null;
  title: string;
  intro?: string;
  align?: "center" | "left";
  className?: string;
};

/** Titre de section : petit label, titre serré, une ligne d'intro. */
export function SectionHeading({ id, eyebrow, title, intro, align = "center", className }: SectionHeadingProps) {
  return (
    <div className={cn("reveal flex max-w-2xl flex-col gap-3", align === "center" ? "mx-auto items-center text-center" : "items-start text-left", className)}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2 id={id} className="heading-2">
        {title}
      </h2>
      {intro ? <p className="max-w-xl text-[16px] leading-7 text-ink-muted md:text-[17px]">{intro}</p> : null}
    </div>
  );
}
