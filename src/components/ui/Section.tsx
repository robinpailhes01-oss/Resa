import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type SectionProps = {
  id: string;
  labelledBy: string;
  className?: string;
  children: ReactNode;
  tone?: "page" | "card" | "soft";
};

const tones = {
  page: "",
  card: "bg-card",
  soft: "bg-soft-tint",
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
  align?: "left" | "center";
};

export function SectionHeading({ id, eyebrow, title, intro, align = "center" }: SectionHeadingProps) {
  return (
    <div className={cn("mb-10 flex flex-col gap-3 md:mb-14", align === "center" && "items-center text-center")}>
      {eyebrow ? (
        <p className="text-small font-semibold uppercase tracking-[0.12em] text-ink-muted">{eyebrow}</p>
      ) : null}
      <h2 id={id} className="text-h2-sm md:text-h2">
        {title}
      </h2>
      {intro ? <p className="prose-measure text-ink-muted">{intro}</p> : null}
    </div>
  );
}
