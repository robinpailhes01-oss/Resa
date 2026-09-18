import { Section, SectionHeading } from "@/components/ui/Section";
import { byMode, howItWorks } from "@/content/fr/landing";

export function HowItWorks() {
  return (
    <Section id="fonctionnement" labelledBy="fonctionnement-title">
      <SectionHeading id="fonctionnement-title" eyebrow={byMode(howItWorks.eyebrow)} title={howItWorks.title} />
      <ol className="grid gap-10 md:grid-cols-3 md:gap-8">
        {howItWorks.steps.map((step, index) => (
          <li
            key={step.title}
            className="reveal flex gap-5 border-t border-line pt-6 md:flex-col md:gap-6"
            style={{ "--d": `${index * 90}ms` } as React.CSSProperties}
          >
            <span aria-hidden="true" className="text-[44px] font-light leading-none tracking-[-0.04em] text-brand/30 md:text-[64px]">
              {index + 1}
            </span>
            <div>
              <h3 className="text-[22px] leading-7 md:text-[24px] md:leading-8">
                <span className="sr-only">Étape {index + 1} : </span>
                {step.title}
              </h3>
              <p className="mt-3 text-ink-muted">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
