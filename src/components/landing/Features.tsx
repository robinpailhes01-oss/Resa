import { BarChart3, CalendarCheck, Globe, MessageSquareHeart, Send } from "lucide-react";
import { AgendaPreview } from "@/components/previews/AgendaPreview";
import { BookingPreview } from "@/components/previews/BookingPreview";
import { EmailPreview } from "@/components/previews/EmailPreview";
import { Section } from "@/components/ui/Section";
import { byMode, features } from "@/content/fr/landing";
import { FloatCard } from "./FloatCard";

type Delay = { "--d": string } & React.CSSProperties;
const stepIcons = [CalendarCheck, Send, MessageSquareHeart];

/**
 * Composition éditoriale : un grand bloc produit sur fond lavande, l'aperçu
 * dépassant de son conteneur, puis deux cartes avec halos et interfaces.
 */
export function Features() {
  const [booking, emails] = features.cards;
  return (
    <Section id="fonctionnalites" labelledBy="fonctionnalites-title" className="!pt-8 md:!pt-12">
      <article className="reveal panel-lavender relative overflow-hidden rounded-[28px] md:rounded-[32px]">
        <div className="grid gap-8 px-6 pt-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-center md:gap-12 md:px-12 md:pt-14">
          <div className="max-w-md pb-2 md:pb-14">
            <p className="eyebrow">{byMode(features.eyebrow)}</p>
            <h2 id="fonctionnalites-title" className="heading-2 mt-3">
              {features.main.title}
            </h2>
            <p className="mt-4 text-[16px] leading-7 text-ink-muted md:text-[17px]">{features.main.text}</p>
          </div>
          <div className="relative -mb-10 -mr-6 md:-mb-16 md:-mr-4 lg:-mr-2">
            <AgendaPreview alt={features.main.alt} variant="day" className="[&_.product-window]:rounded-b-none [&_.product-window]:border-b-0" />
            <FloatCard icon={BarChart3} tone="brand" title={features.main.chip.title} text={features.main.chip.text} tilt={1} drift className="-right-1 top-[36%] hidden sm:flex md:-right-4" />
          </div>
        </div>
      </article>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <article className="reveal card card-hover relative flex flex-col overflow-hidden" style={{ "--d": "80ms" } as Delay}>
          <div className="px-6 pt-7 md:px-8 md:pt-9">
            <h3 className="heading-3">{booking.title}</h3>
            <p className="mt-3 text-[15px] leading-6 text-ink-muted md:text-[16px]">{booking.text}</p>
          </div>
          <div className="relative mt-auto px-6 pb-8 pt-8 md:px-8 md:pb-10 md:pt-10">
            <div aria-hidden="true" className="halo-peach absolute inset-x-0 bottom-0 top-6 -z-0" />
            <BookingPreview alt={booking.alt} className="relative" />
            <FloatCard icon={Globe} tone="peach" title={booking.chip.title} text={booking.chip.text} tilt={-1.5} drift className="-left-1 bottom-3 hidden sm:flex md:-left-3" />
          </div>
        </article>
        <article className="reveal card card-hover relative flex flex-col overflow-hidden" style={{ "--d": "160ms" } as Delay}>
          <div className="px-6 pt-7 md:px-8 md:pt-9">
            <h3 className="heading-3">{emails.title}</h3>
            <p className="mt-3 text-[15px] leading-6 text-ink-muted md:text-[16px]">{emails.text}</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {emails.steps.map((step, i) => {
                const Icon = stepIcons[i];
                return (
                  <li key={step} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-page px-2.5 py-1 text-[12px] font-medium text-ink">
                    <Icon className="size-3.5 text-brand" strokeWidth={2} aria-hidden="true" />
                    {step}
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="relative mt-auto px-6 pt-8 md:px-8 md:pt-10">
            <div aria-hidden="true" className="halo-ice absolute inset-x-0 bottom-0 top-6 -z-0" />
            <EmailPreview alt={emails.alt} className="relative [&_.product-window]:rounded-b-none [&_.product-window]:border-b-0" />
            <FloatCard icon={Send} tone="ice" title={emails.chip.title} text={emails.chip.text} tilt={1.5} drift className="-right-1 top-1 hidden sm:flex md:-right-3" />
          </div>
        </article>
      </div>
    </Section>
  );
}
