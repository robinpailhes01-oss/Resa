import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type SectionProps = {
  id: string;
  labelledBy: string;
  className?: string;
  children: ReactNode;
  tone?: "page" | "card" | "soft" | "dark";
};

/* Une seule couleur de fond sur toute la page ; seule la fin (inscription + footer) passe en prune. */
const tones = {
  page: "",
  card: "",
  soft: "",
  dark: "bg-brand text-white [&_h2]:text-white",
};

export function Section({ id, labelledBy, className, children, tone = "page" }: SectionProps) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={cn("py-16 md:py-28", tones[tone], className)}>
      <div className="container-page">{children}</div>
    </section>
  );
}

type SectionHeadingProps = {
  id: string;
  eyebrow?: string | null;
  title: string;
  intro?: string;
  align?: "left" | "center";
};

export function SectionHeading({ id, eyebrow, title, intro, align = "center" }: SectionHeadingProps) {
  return (
    <div className={cn("mb-10 flex max-w-2xl flex-col gap-3 md:mb-14", align === "center" && "mx-auto items-center text-center")}>
      {eyebrow ? <p className="text-small font-medium text-ink-muted">{eyebrow}</p> : null}
      <h2 id={id} className="text-h2-sm md:text-h2">
        {title}
      </h2>
      {intro ? <p className="prose-measure text-ink-muted">{intro}</p> : null}
    </div>
  );
}
