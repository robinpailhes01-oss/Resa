import { CalendarDays, Mail, Users } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { byMode, features } from "@/content/fr/landing";

const icons = { calendar: CalendarDays, mail: Mail, users: Users } as const;

export function Features() {
  return (
    <Section id="fonctionnalites" labelledBy="fonctionnalites-title">
      <SectionHeading id="fonctionnalites-title" eyebrow={byMode(features.eyebrow)} title={features.title} />
      <ul className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
        {features.cards.map((card, index) => {
          const Icon = icons[card.icon];
          return (
            <li
              key={card.title}
              className="reveal flex flex-col rounded-card bg-card p-6 shadow-card ring-1 ring-line/60 md:p-8 md:last:col-span-2 lg:last:col-span-1"
              style={{ transitionDelay: `${index * 40}ms` }}
            >
              <span className="mb-5 inline-flex size-12 items-center justify-center rounded-full bg-soft-tint text-brand">
                <Icon aria-hidden="true" className="size-6" strokeWidth={1.8} />
              </span>
              <h3 className="text-[20px] leading-7 md:text-[22px] md:leading-8">{card.title}</h3>
              <p className="mt-2 text-ink-muted">{card.text}</p>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
