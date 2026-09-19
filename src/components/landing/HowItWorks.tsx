import { Section, SectionHeading } from "@/components/ui/Section";
import { byMode, howItWorks } from "@/content/fr/landing";

export function HowItWorks() {
  return (
    <Section id="fonctionnement" labelledBy="fonctionnement-title" tone="page">
      <SectionHeading id="fonctionnement-title" eyebrow={byMode(howItWorks.eyebrow)} title={howItWorks.title} />
      <ol className="mx-auto grid max-w-5xl gap-12 md:grid-cols-3 md:gap-10">
        {howItWorks.steps.map((step, index) => (
          <li
            key={step.title}
            className="reveal flex flex-col items-center text-center"
            style={{ "--d": `${index * 90}ms` } as React.CSSProperties}
          >
            <span aria-hidden="true" className="text-[56px] font-light leading-none tracking-[-0.05em] text-brand/30 md:text-[72px]">
              {index + 1}
            </span>
            <h3 className="mt-5 text-[22px] leading-7 md:text-[24px] md:leading-8">
              <span className="sr-only">Étape {index + 1} : </span>
              {step.title}
            </h3>
            <p className="mt-3 max-w-xs text-ink-muted">{step.text}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
