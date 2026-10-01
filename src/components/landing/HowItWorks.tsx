import { Section, SectionHeading } from "@/components/ui/Section";
import { howItWorks } from "@/content/fr/landing";

type Delay = { "--d": string } & React.CSSProperties;

/** Trois étapes indexées [001] [002] [003], comme les visuels : la typographie fait le travail. */
export function HowItWorks() {
  return (
    <Section id="etapes" labelledBy="etapes-title" className="!pt-10 md:!pt-16">
      <SectionHeading id="etapes-title" index={howItWorks.index} eyebrow={howItWorks.eyebrow} title={howItWorks.title} />
      <ol className="mt-10 grid border-t border-ink/15 md:mt-14 md:grid-cols-3">
        {howItWorks.steps.map((step, i) => (
          <li
            key={step.title}
            className="reveal flex flex-col gap-3 border-b border-ink/15 py-7 md:border-b-0 md:border-l md:px-8 md:py-10 md:first:border-l-0 md:first:pl-0"
            style={{ "--d": `${i * 100}ms` } as Delay}
          >
            <span className="index-tag">
              {howItWorks.stepLabel} {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="heading-3 mt-2">{step.title}</h3>
            <p className="max-w-sm text-[15px] leading-6 text-ink-muted md:text-[16px]">{step.text}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
