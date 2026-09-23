import { Check, Sparkles } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { offer } from "@/config/offer";
import { byMode, cta, pricing } from "@/content/fr/landing";
import { CtaLink } from "./CtaLink";
import { PricingViewTracker } from "./PricingViewTracker";

/** Grande carte tarifaire horizontale sur fond doux ; précisions discrètes en dessous. */
export function Pricing() {
  const primary = byMode(cta.primary);
  const caption = byMode(pricing.priceCaption);

  return (
    <Section id="tarif" labelledBy="tarif-title" className="!pt-8 md:!pt-12">
      <div id="tarif-card" className="reveal panel-pricing relative mx-auto max-w-[1120px] overflow-hidden rounded-[28px] border border-ink/8 shadow-card md:rounded-[32px]">
        <span className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1.5 text-[12px] font-semibold text-white md:right-8 md:top-8">
          <Sparkles className="size-3.5" aria-hidden="true" />
          {byMode(pricing.badge)}
        </span>
        <div className="grid gap-10 px-6 py-10 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] md:gap-12 md:px-12 md:py-14">
          <div className="pt-6 md:pt-0">
            <p className="eyebrow">{pricing.label}</p>
            <h2 id="tarif-title" className="heading-2 mt-3">
              {pricing.title[0]}
              <br />
              {pricing.title[1]}
            </h2>
            <p className="mt-7 text-ink">
              <span className="text-[52px] font-bold leading-none tracking-[-0.04em] md:text-[64px]">{pricing.price}</span>
              <span className="ml-2 text-[17px] font-medium text-ink-muted">{pricing.priceUnit}</span>
            </p>
            {caption ? <p className="mt-3 text-[14px] text-ink-muted">{caption}</p> : null}
            <p className="mt-1 text-[14px] text-ink-muted">{pricing.scope}</p>
          </div>
          <div className="flex flex-col justify-center md:pt-6">
            <ul className="flex flex-col gap-3">
              {pricing.highlights.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[15px] leading-6 text-ink md:text-[16px]">
                  <span className="mt-1 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <CtaLink href={primary.href} placement="pricing" signup={offer.launchMode === "live"} fullWidth className="mt-8">
              {primary.label}
            </CtaLink>
          </div>
        </div>
      </div>
      <ul className="reveal mx-auto mt-6 max-w-[620px] space-y-1 text-center text-[13px] leading-5 text-ink-muted" style={{ "--d": "100ms" } as React.CSSProperties}>
        {pricing.mentions.map((mention) => (
          <li key={mention}>{mention}</li>
        ))}
        <li>{byMode(pricing.afterCta)}</li>
      </ul>
      <PricingViewTracker targetId="tarif-card" />
    </Section>
  );
}
