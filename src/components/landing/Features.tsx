import { Section, SectionHeading } from "@/components/ui/Section";
import { byMode, features } from "@/content/fr/landing";
import { featureIcons, featureMinis } from "./FeatureCards";

export function Features() {
  return (
    <Section id="fonctionnalites" labelledBy="fonctionnalites-title" tone="page" className="!pt-8 md:!pt-16">
      <SectionHeading
        id="fonctionnalites-title"
        eyebrow={byMode(features.eyebrow)}
        title={features.title}
        intro={features.intro}
        introShort={features.intro}
      />
      <ul className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3 md:gap-5">
        {features.cards.map((card, index) => {
          const Icon = featureIcons[card.icon];
          const Mini = featureMinis[card.icon];
          return (
            <li
              key={card.title}
              className="reveal flex items-center gap-4 rounded-2xl bg-card p-4 ring-1 ring-line md:items-stretch md:gap-5 md:p-6"
              style={{ "--d": `${index * 90}ms` } as React.CSSProperties}
            >
              <div className="flex min-w-0 flex-1 items-center gap-4 md:flex-col md:items-start md:justify-center md:gap-0">
                <span
                  aria-hidden="true"
                  className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-soft-tint text-brand md:size-14"
                >
                  <Icon className="size-6 md:size-7" strokeWidth={1.8} />
                </span>
                <div className="min-w-0">
                  <h3 className="text-[16px] leading-6 text-ink md:mt-5 md:text-[19px] md:leading-7">{card.title}</h3>
                  <p className="mt-0.5 text-[14px] leading-5 text-ink-muted md:hidden">{card.textShort}</p>
                  <p className="mt-2 hidden text-[15px] leading-6 text-ink-muted md:block">{card.text}</p>
                </div>
              </div>
              <div className="hidden w-[46%] shrink-0 items-center md:flex">
                <Mini />
              </div>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
