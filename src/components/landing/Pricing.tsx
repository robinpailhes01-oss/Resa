import { ArrowRight, Check } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { offer } from "@/config/offer";
import { byMode, cta, pricing } from "@/content/fr/landing";
import { CtaLink } from "./CtaLink";
import { PricingViewTracker } from "./PricingViewTracker";

export function Pricing() {
  const primary = byMode(cta.primary);
  const pricePrefix = byMode(pricing.pricePrefix);

  return (
    <Section id="tarif" labelledBy="tarif-title">
      <SectionHeading id="tarif-title" title={pricing.title} intro={pricing.intro} />
      <div
        id="tarif-card"
        className="reveal mx-auto grid max-w-[720px] overflow-hidden rounded-card bg-card ring-1 ring-line md:grid-cols-2"
      >
        <div className="flex flex-col p-6 md:p-8">
          <p className="text-[16px] font-semibold text-ink">{pricing.planName}</p>
          {pricePrefix ? <p className="mt-4 text-small font-medium text-ink-muted">{pricePrefix}</p> : null}
          <p className="flex flex-wrap items-baseline gap-x-2 text-brand">
            <span className="text-price-sm font-bold tracking-tight md:text-[56px] md:leading-[60px]">{pricing.price}</span>
            <span className="text-[16px] font-medium text-ink-muted">{pricing.priceUnit}</span>
          </p>
          <p className="mt-2 text-ink-muted">{pricing.scope}</p>
          <div className="mt-6 md:mt-auto md:pt-8">
            <CtaLink href={primary.href} placement="pricing" signup={offer.launchMode === "live"} fullWidth>
              {primary.label}
              <ArrowRight aria-hidden="true" />
            </CtaLink>
            <p className="mt-3 text-small text-ink-muted">{byMode(pricing.afterCta)}</p>
          </div>
        </div>
        <div className="border-t border-line p-6 md:border-l md:border-t-0 md:p-8">
          <h3 className="text-[16px] font-semibold text-ink">{pricing.inclusionsTitle}</h3>
          <ul className="mt-4 space-y-3">
            {pricing.inclusions.map((item) => (
              <li key={item} className="flex items-start gap-3 text-[16px] leading-6 text-ink">
                <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-success-tint text-success">
                  <Check aria-hidden="true" className="size-3.5" strokeWidth={3} />
                </span>
                {item}
              </li>
            ))}
          </ul>
          <ul className="mt-6 space-y-2 border-t border-line pt-5 text-small text-ink-muted">
            {pricing.mentions.map((mention) => (
              <li key={mention}>{mention}</li>
            ))}
          </ul>
        </div>
      </div>
      <PricingViewTracker targetId="tarif-card" />
    </Section>
  );
}
