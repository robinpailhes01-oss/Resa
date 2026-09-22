import { Check } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { offer } from "@/config/offer";
import { byMode, cta, pricing } from "@/content/fr/landing";
import { CtaLink } from "./CtaLink";
import { PricingViewTracker } from "./PricingViewTracker";

/** Bande tarif sur fond lilas : offre, prix, inclusions et bouton. */
export function Pricing() {
  const primary = byMode(cta.primary);
  const caption = byMode(pricing.priceCaption);

  return (
    <Section id="tarif" labelledBy="tarif-title" tone="page" className="reso-pricing md:!pt-4 md:!pb-14">
      <div
        id="tarif-card"
        className="pricing-panel reveal mx-auto rounded-[24px] px-5 py-7 md:px-9 md:py-10"
      >
        <div className="pricing-layout grid gap-5 lg:grid-cols-[1.05fr_1fr_1.15fr] lg:items-center lg:gap-7">
          <div className="text-center lg:text-left">
            <p className="text-small font-semibold uppercase tracking-[0.12em] text-brand">{pricing.label}</p>
            <h2 id="tarif-title" className="mx-auto mt-2 max-w-[280px] text-[28px] leading-8 lg:mx-0 lg:text-[30px] lg:leading-9">
              {pricing.title}
            </h2>
            <p className="mt-3 hidden text-[14px] leading-6 text-ink-muted lg:block">{pricing.intro}</p>
          </div>

          <div className="pricing-amount text-center lg:border-x lg:border-soft lg:px-3">
            <p className="whitespace-nowrap text-ink">
              <span className="text-[48px] font-extrabold leading-none tracking-[-0.05em] xl:text-[56px]">{pricing.price}</span>
              <span className="text-[21px] font-bold tracking-tight"> {pricing.priceUnit}</span>
            </p>
            {caption ? <p className="mt-3 text-[15px] text-ink-muted">{caption}</p> : null}
            <p className="pricing-scope mt-1 text-[12px] text-ink-muted">{pricing.scope}</p>
          </div>

          <div className="flex flex-col items-center lg:items-start">
            <ul className="hidden space-y-2 border-t border-soft pt-5 md:block lg:border-0 lg:pt-0">
              {pricing.highlights.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-[13px] leading-5 text-ink-muted">
                  <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-soft text-brand">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <ul className="pricing-highlights md:hidden">
              {pricing.highlightsCompact.map((item) => (
                <li key={item}>
                  <span><Check aria-hidden="true" size={12} strokeWidth={3} /></span>
                  {item}
                </li>
              ))}
            </ul>
            <CtaLink
              href={primary.href}
              placement="pricing"
              signup={offer.launchMode === "live"}
              fullWidth
              className="mt-6 max-w-sm whitespace-nowrap lg:w-full lg:text-[14px]"
            >
              {primary.label}
            </CtaLink>
          </div>
        </div>
      </div>
      <PricingViewTracker targetId="tarif-card" />
    </Section>
  );
}
