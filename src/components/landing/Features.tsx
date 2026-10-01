import Image from "next/image";
import { CalendarCheck, Check, Globe, MessageSquareHeart, Send, Wallet } from "lucide-react";
import { BookingPreview } from "@/components/previews/BookingPreview";
import { EmailPreview } from "@/components/previews/EmailPreview";
import { Section, SectionHeading } from "@/components/ui/Section";
import { byMode, features } from "@/content/fr/landing";
import { FloatCard } from "./FloatCard";

type Delay = { "--d": string } & React.CSSProperties;
const stepIcons = [CalendarCheck, Send, MessageSquareHeart];

/**
 * Deux preuves produit (réservation, emails) sur des socles ivoire, puis un
 * bandeau nature morte pour les avis Google.
 */
export function Features() {
  const [booking, emails] = features.cards;
  return (
    <Section id="fonctionnalites" labelledBy="fonctionnalites-title" className="!pt-10 md:!pt-16">
      <SectionHeading id="fonctionnalites-title" index={features.index} eyebrow={byMode(features.eyebrow)} title={features.title} />

      <div className="mt-10 grid gap-5 md:mt-14 md:grid-cols-2 md:gap-6">
        <article className="reveal card relative flex flex-col overflow-hidden" style={{ "--d": "60ms" } as Delay}>
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
        <article className="reveal card relative flex flex-col overflow-hidden" style={{ "--d": "140ms" } as Delay}>
          <div className="px-6 pt-7 md:px-8 md:pt-9">
            <h3 className="heading-3">{emails.title}</h3>
            <p className="mt-3 text-[15px] leading-6 text-ink-muted md:text-[16px]">{emails.text}</p>
            <ol className="mt-4 flex flex-wrap gap-2">
              {emails.steps.map((step, i) => {
                const Icon = stepIcons[i];
                return (
                  <li key={step} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-page px-2.5 py-1 text-[12px] font-medium text-ink">
                    <Icon className="size-3.5 text-brand" strokeWidth={2} aria-hidden="true" />
                    {step}
                  </li>
                );
              })}
            </ol>
          </div>
          <div className="relative mt-auto px-6 pt-8 md:px-8 md:pt-10">
            <div aria-hidden="true" className="halo-ice absolute inset-x-0 bottom-0 top-6 -z-0" />
            <EmailPreview alt={emails.alt} className="relative [&_.product-window]:rounded-b-none [&_.product-window]:border-b-0" />
            <FloatCard icon={Send} tone="ice" title={emails.chip.title} text={emails.chip.text} tilt={1.5} drift className="-right-1 top-1 hidden sm:flex md:-right-3" />
          </div>
        </article>
      </div>

      <article className="reveal relative mt-5 grid gap-6 rounded-[22px] bg-card p-6 shadow-card ring-1 ring-line md:mt-6 md:grid-cols-12 md:items-center md:rounded-[28px] md:p-10">
        <div className="md:col-span-7">
          <p className="eyebrow flex items-center gap-2">
            <Wallet aria-hidden="true" className="size-4" /> {features.payments.eyebrow}
          </p>
          <h3 className="heading-3 mt-3 !text-[26px] md:!text-[32px]">{features.payments.title}</h3>
          <p className="mt-4 text-[15px] leading-6 text-ink-muted md:text-[16px] md:leading-7">{features.payments.text}</p>
        </div>
        <ul className="flex flex-col gap-2.5 md:col-span-5">
          {features.payments.points.map((point) => (
            <li key={point} className="flex items-center gap-3 rounded-2xl bg-page px-4 py-3 text-[15px] font-medium text-ink ring-1 ring-line">
              <span aria-hidden="true" className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-success-tint text-success">
                <Check className="size-4" />
              </span>
              {point}
            </li>
          ))}
        </ul>
      </article>

      <article className="reveal panel-dark text-page grain relative mt-5 grid overflow-hidden rounded-[22px] md:mt-6 md:grid-cols-12 md:rounded-[28px]">
        <div className="relative z-10 flex flex-col justify-center px-6 py-9 md:col-span-5 md:px-10 md:py-12">
          <h3 className="heading-3 !text-[26px] !text-page md:!text-[32px]">{features.reviews.title}</h3>
          <p className="mt-4 text-[15px] leading-6 text-page md:text-[16px] md:leading-7">{features.reviews.text}</p>
        </div>
        <div className="relative md:col-span-7">
          <Image src="/brand/outils.webp" alt={features.reviews.alt} width={920} height={490} sizes="(min-width: 768px) 60vw, 100vw" className="h-full w-full object-cover" />
        </div>
      </article>
    </Section>
  );
}
