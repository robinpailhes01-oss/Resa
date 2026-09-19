import { AgendaPreview } from "@/components/previews/AgendaPreview";
import { BookingPreview } from "@/components/previews/BookingPreview";
import { EmailsPreview } from "@/components/previews/EmailsPreview";
import { byMode, features, preview } from "@/content/fr/landing";
import { cn } from "@/lib/cn";

/**
 * Trois écrans qui s'enchaînent : un titre court, une ligne, le produit.
 * Fusionne les sections « fonctionnalités » et « aperçu » du cahier des
 * charges, avec leurs textes et légendes exacts.
 */
const screens = [
  { card: features.cards[0], tab: preview.tabs[1], Visual: BookingPreview, tone: "card" as const },
  { card: features.cards[1], tab: preview.tabs[2], Visual: EmailsPreview, tone: "page" as const },
  { card: features.cards[2], tab: preview.tabs[0], Visual: AgendaPreview, tone: "card" as const },
];

export function Features() {
  const eyebrow = byMode(features.eyebrow);
  return (
    <div id="fonctionnalites" aria-labelledby="fonctionnalites-title">
      <h2 id="fonctionnalites-title" className="sr-only">
        {features.title}
      </h2>
      {screens.map(({ card, tab, Visual, tone }, index) => (
        <section
          key={card.title}
          id={index === 0 ? "apercu" : undefined}
          aria-labelledby={`screen-${index}-title`}
          className={cn("py-20 md:py-32", tone === "card" ? "bg-card" : "bg-page")}
        >
          <div className="container-page">
            <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
              {index === 0 && eyebrow ? <p className="mb-4 text-small font-medium text-ink-muted">{eyebrow}</p> : null}
              <h3 id={`screen-${index}-title`} className="reveal text-h2-sm md:text-h2">
                {card.title}.
              </h3>
              <p className="reveal mt-4 text-[17px] leading-7 text-ink-muted md:hidden" style={{ "--d": "80ms" } as React.CSSProperties}>
                {card.textShort}
              </p>
              <p
                className="reveal mt-5 hidden max-w-xl text-[19px] leading-8 text-ink-muted md:block md:text-[21px] md:leading-9"
                style={{ "--d": "80ms" } as React.CSSProperties}
              >
                {card.text}
              </p>
            </div>
            <figure className="reveal mx-auto mt-12 max-w-5xl md:mt-20" style={{ "--d": "160ms" } as React.CSSProperties}>
              <Visual alt={tab.alt} />
              <figcaption className="mt-6 text-center text-small text-ink-muted">{tab.caption}</figcaption>
            </figure>
          </div>
        </section>
      ))}
      <p className="sr-only">{byMode(preview.prelaunchNote)}</p>
    </div>
  );
}
