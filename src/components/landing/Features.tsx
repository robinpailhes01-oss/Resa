import { Section, SectionHeading } from "@/components/ui/Section";
import { IconTile } from "@/components/ui/IconTile";
import { byMode, features } from "@/content/fr/landing";
import { AgendaMini, BookingMini, EmailsMini, featureIcons } from "./FeatureCards";

const minis = { calendar: BookingMini, mail: EmailsMini, users: AgendaMini } as const;
const tones = { calendar: "brand", mail: "success", users: "soft" } as const;
const panels = {
  calendar: "bg-[linear-gradient(160deg,#F4EEF6_0%,#FBF3EC_100%)]",
  mail: "bg-[linear-gradient(160deg,#FBF3EC_0%,#EEF4EF_100%)]",
  users: "bg-[linear-gradient(160deg,#EFEAF4_0%,#F8E6D9_100%)]",
} as const;

export function Features() {
  return (
    <Section id="fonctionnalites" labelledBy="fonctionnalites-title">
      <SectionHeading id="fonctionnalites-title" eyebrow={byMode(features.eyebrow)} title={features.title} />
      <ul className="grid gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
        {features.cards.map((card, index) => {
          const Mini = minis[card.icon];
          return (
            <li
              key={card.title}
              className="reveal flex flex-col overflow-hidden rounded-card bg-card ring-1 ring-line md:last:col-span-2 lg:last:col-span-1"
              style={{ "--d": `${index * 90}ms` } as React.CSSProperties}
            >
              <div className={`flex h-48 items-center justify-center px-6 md:h-56 ${panels[card.icon]}`}>
                <Mini />
              </div>
              <div className="flex flex-col p-5 md:p-7">
                <div className="flex items-center gap-3">
                  <IconTile icon={featureIcons[card.icon]} tone={tones[card.icon]} size="sm" />
                  <h3 className="text-[20px] leading-7 md:text-[22px]">{card.title}</h3>
                </div>
                <p className="mt-2 text-ink-muted md:hidden">{card.textShort}</p>
                <p className="mt-3 hidden text-ink-muted md:block">{card.text}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
