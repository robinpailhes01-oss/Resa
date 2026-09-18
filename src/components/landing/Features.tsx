import { Section, SectionHeading } from "@/components/ui/Section";
import { byMode, features } from "@/content/fr/landing";

export function Features() {
  return (
    <Section id="fonctionnalites" labelledBy="fonctionnalites-title">
      <SectionHeading id="fonctionnalites-title" eyebrow={byMode(features.eyebrow)} title={features.title} />
      <ul className="grid gap-10 border-t border-line pt-10 md:grid-cols-3 md:gap-8 md:pt-12">
        {features.cards.map((card, index) => (
          <li
            key={card.title}
            className="reveal flex flex-col md:pr-6"
            style={{ "--d": `${index * 90}ms` } as React.CSSProperties}
          >
            <span aria-hidden="true" className="mb-5 block h-0.5 w-8 rounded-full bg-accent" />
            <h3 className="text-[22px] leading-7 md:text-[24px] md:leading-8">{card.title}</h3>
            <p className="mt-3 text-ink-muted">{card.text}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
