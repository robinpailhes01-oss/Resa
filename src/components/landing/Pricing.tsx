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
    <Section id="tarif" labelledBy="tarif-title" tone="page" className="!pt-4 md:!pt-10">
      <div
        id="tarif-card"
        className="reveal mx-auto max-w-6xl rounded-[28px] bg-soft-tint px-5 py-9 md:px-12 md:py-14"
      >
        <div className="grid gap-8 md:grid-cols-[1.1fr_1fr_1.1fr] md:items-center md:gap-10">
          <div className="text-center md:text-left">
            <p className="text-small font-semibold uppercase tracking-[0.12em] text-brand">{pricing.label}</p>
            <h2 id="tarif-title" className="mt-3 text-[30px] leading-9 md:text-[34px] md:leading-10">
              {pricing.title}
            </h2>
            <p className="mt-3 hidden text-[15px] leading-6 text-ink-muted md:block">{pricing.intro}</p>
          </div>

          <div className="text-center md:border-x md:border-line/80 md:px-6">
            <p className="text-ink">
              <span className="text-[56px] font-bold leading-none tracking-[-0.04em] text-brand md:text-[60px]">{pricing.price}</span>
              <span className="text-[24px] font-bold tracking-tight text-brand"> {pricing.priceUnit}</span>
            </p>
            {caption ? <p className="mt-3 text-[15px] text-ink-muted">{caption}</p> : null}
            <p className="mt-1 hidden text-[13px] text-ink-muted md:block">{pricing.scope}</p>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <ul className="space-y-2.5">
              {pricing.highlights.map((item) => (
                <li key={item} className="flex items-center gap-3 text-[15px] text-ink">
                  <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <CtaLink
              href={primary.href}
              placement="pricing"
              signup={offer.launchMode === "live"}
              fullWidth
              className="mt-7 sm:w-auto sm:whitespace-nowrap md:w-full"
            >
              {primary.label}
            </CtaLink>
          </div>
        </div>

        <ul className="mt-8 flex flex-col gap-1 border-t border-line/80 pt-5 text-center text-[12px] leading-5 text-ink-muted md:flex-row md:justify-between md:text-left">
          {pricing.mentions.map((mention) => (
            <li key={mention}>{mention}</li>
          ))}
          <li>{byMode(pricing.afterCta)}</li>
        </ul>
      </div>
      <PricingViewTracker targetId="tarif-card" />
    </Section>
  );
}
