import { Section, SectionHeading } from "@/components/ui/Section";
import { byMode, howItWorks } from "@/content/fr/landing";

export function HowItWorks() {
  return (
    <Section id="fonctionnement" labelledBy="fonctionnement-title">
      <SectionHeading id="fonctionnement-title" eyebrow={byMode(howItWorks.eyebrow)} title={howItWorks.title} />
      <ol className="grid gap-8 md:grid-cols-3 md:gap-6">
        {howItWorks.steps.map((step, index) => (
          <li key={step.title} className="reveal flex gap-4 md:flex-col md:gap-5" style={{ transitionDelay: `${index * 40}ms` }}>
            <span
              aria-hidden="true"
              className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-accent-tint text-[18px] font-bold text-brand"
            >
              {index + 1}
            </span>
            <div>
              <h3 className="text-[20px] leading-7 md:text-[22px] md:leading-8">
                <span className="sr-only">Étape {index + 1} : </span>
                {step.title}
              </h3>
              <p className="mt-2 text-ink-muted">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
