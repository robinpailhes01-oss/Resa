import { AgendaPreview } from "@/components/previews/AgendaPreview";
import { BookingPreview } from "@/components/previews/BookingPreview";
import { EmailPreview } from "@/components/previews/EmailPreview";
import { Section } from "@/components/ui/Section";
import { byMode, features } from "@/content/fr/landing";

type Delay = { "--d": string } & React.CSSProperties;

/** Composition éditoriale : un grand bloc produit, puis deux cartes complémentaires. */
export function Features() {
  const [booking, emails] = features.cards;
  return (
    <Section id="fonctionnalites" labelledBy="fonctionnalites-title" className="!pt-10 md:!pt-16">
      <article className="reveal card overflow-hidden">
        <div className="grid gap-8 p-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-center md:gap-10 md:p-10">
          <div className="max-w-md">
            <p className="eyebrow">{byMode(features.eyebrow)}</p>
            <h2 id="fonctionnalites-title" className="heading-2 mt-3">
              {features.main.title}
            </h2>
            <p className="mt-4 text-[16px] leading-7 text-ink-muted md:text-[17px]">{features.main.text}</p>
          </div>
          <div className="-mb-12 -mr-6 md:-mb-16 md:-mr-10">
            <AgendaPreview alt={features.main.alt} closeup className="[&_.product-window]:rounded-b-none [&_.product-window]:rounded-r-none [&_.product-window]:border-b-0 [&_.product-window]:border-r-0 [&_.product-window]:shadow-none" />
          </div>
        </div>
      </article>

      <div className="mt-5 grid gap-5 md:grid-cols-2 md:gap-6">
        <article className="reveal card card-hover flex flex-col overflow-hidden" style={{ "--d": "80ms" } as Delay}>
          <div className="p-6 md:p-8">
            <h3 className="heading-3">{booking.title}</h3>
            <p className="mt-3 text-[15px] leading-6 text-ink-muted md:text-[16px]">{booking.text}</p>
          </div>
          <div className="mt-auto px-6 md:px-8">
            <BookingPreview alt={booking.alt} className="[&_.product-window]:rounded-b-none [&_.product-window]:border-b-0 [&_.product-window]:shadow-none" />
          </div>
        </article>
        <article className="reveal card card-hover flex flex-col overflow-hidden" style={{ "--d": "160ms" } as Delay}>
          <div className="p-6 md:p-8">
            <h3 className="heading-3">{emails.title}</h3>
            <p className="mt-3 text-[15px] leading-6 text-ink-muted md:text-[16px]">{emails.text}</p>
          </div>
          <div className="mt-auto px-6 md:px-8">
            <EmailPreview alt={emails.alt} className="[&_.product-window]:rounded-b-none [&_.product-window]:border-b-0 [&_.product-window]:shadow-none" />
          </div>
        </article>
      </div>
    </Section>
  );
}
