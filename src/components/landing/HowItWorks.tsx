import { ArrowRight } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { howItWorks } from "@/content/fr/landing";

type Delay = { "--d": string } & React.CSSProperties;

/** Trois étapes numérotées reliées par un trait : la typographie fait le travail. */
export function HowItWorks() {
  return (
    <Section id="etapes" labelledBy="etapes-title" className="!pt-8 md:!pt-12">
      <SectionHeading id="etapes-title" eyebrow={howItWorks.eyebrow} title={howItWorks.title} />
      <ol className="relative mx-auto mt-10 grid max-w-5xl gap-8 md:mt-14 md:grid-cols-3 md:gap-6">
        <span aria-hidden="true" className="absolute inset-x-[16%] top-6 hidden h-px bg-line md:block" />
        {howItWorks.steps.map((step, i) => (
          <li key={step.title} className="reveal relative flex flex-col items-center gap-4 text-center" style={{ "--d": `${i * 100}ms` } as Delay}>
            <span className="relative z-10 inline-flex size-12 items-center justify-center rounded-full border border-line bg-card text-[13px] font-semibold tabular-nums text-brand shadow-card">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="max-w-xs">
              <h3 className="text-[17px] font-semibold tracking-tight text-ink md:text-[18px]">{step.title}</h3>
              <p className="mt-2 text-[15px] leading-6 text-ink-muted">{step.text}</p>
            </div>
            {i < howItWorks.steps.length - 1 ? <ArrowRight aria-hidden="true" className="mt-1 size-4 rotate-90 text-ink-muted/50 md:hidden" /> : null}
          </li>
        ))}
      </ol>
    </Section>
  );
}
