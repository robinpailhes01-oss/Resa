import { Check } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { offer } from "@/config/offer";
import { byMode, cta, pricing } from "@/content/fr/landing";
import { CtaLink } from "./CtaLink";
import { PricingViewTracker } from "./PricingViewTracker";

/** Tarif sans carte : une phrase, un chiffre, un bouton, puis la liste. */
export function Pricing() {
  const primary = byMode(cta.primary);
  const pricePrefix = byMode(pricing.pricePrefix);

  return (
    <Section id="tarif" labelledBy="tarif-title" tone="card">
      <SectionHeading id="tarif-title" title={pricing.title} intro={pricing.intro} />
      <div id="tarif-card" className="reveal mx-auto flex max-w-3xl flex-col items-center text-center">
        {pricePrefix ? <p className="text-small font-medium text-ink-muted">{pricePrefix}</p> : null}
        <p className="mt-1 flex flex-wrap items-baseline justify-center gap-x-3 text-brand">
          <span className="text-[64px] font-bold leading-none tracking-[-0.04em] md:text-[88px]">{pricing.price}</span>
          <span className="text-[20px] font-medium text-ink-muted md:text-[24px]">{pricing.priceUnit}</span>
        </p>
        <p className="mt-4 text-[17px] font-medium text-ink md:text-[19px]">{pricing.scope}</p>
        <CtaLink href={primary.href} placement="pricing" signup={offer.launchMode === "live"} className="mt-8 whitespace-nowrap">
          {primary.label}
        </CtaLink>
        <p className="mt-4 text-small text-ink-muted">{byMode(pricing.afterCta)}</p>

        <ul className="mt-14 grid w-full max-w-2xl gap-x-10 gap-y-4 text-left sm:grid-cols-2 md:mt-20">
          {pricing.inclusions.map((item) => (
            <li key={item} className="flex items-start gap-3 text-[16px] leading-6 text-ink md:text-[17px] md:leading-7">
              <Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-brand" strokeWidth={2.5} />
              {item}
            </li>
          ))}
        </ul>
        <ul className="mt-10 max-w-xl space-y-1.5 text-small text-ink-muted">
          {pricing.mentions.map((mention) => (
            <li key={mention}>{mention}</li>
          ))}
        </ul>
      </div>
      <PricingViewTracker targetId="tarif-card" />
    </Section>
  );
}
