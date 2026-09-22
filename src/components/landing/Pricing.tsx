import { Check } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { offer } from "@/config/offer";
import { byMode, cta, pricing } from "@/content/fr/landing";
import { CtaLink } from "./CtaLink";
import { PricingViewTracker } from "./PricingViewTracker";

/** Carte tarifaire compacte et centrée ; précisions discrètes en dessous. */
export function Pricing() {
  const primary = byMode(cta.primary);
  const caption = byMode(pricing.priceCaption);

  return (
    <Section id="tarif" labelledBy="tarif-title" className="!pt-8 md:!pt-12">
      <div id="tarif-card" className="reveal card mx-auto max-w-[520px] px-6 py-8 text-center md:px-10 md:py-10">
        <p className="eyebrow">{pricing.label}</p>
        <h2 id="tarif-title" className="heading-2 mt-3">
          {pricing.title[0]}
          <br />
          {pricing.title[1]}
        </h2>
        <p className="mt-6 text-ink">
          <span className="text-[44px] font-bold leading-none tracking-[-0.04em] md:text-[52px]">{pricing.price}</span>
          <span className="ml-1.5 text-[16px] font-medium text-ink-muted">{pricing.priceUnit}</span>
        </p>
        {caption ? <p className="mt-2 text-[13px] text-ink-muted">{caption}</p> : null}
        <p className="mt-1 text-[14px] text-ink-muted">{pricing.scope}</p>
        <ul className="mx-auto mt-6 flex max-w-[360px] flex-col gap-2.5 border-t border-line pt-6 text-left">
          {pricing.highlights.map((item) => (
            <li key={item} className="flex items-start gap-3 text-[15px] leading-6 text-ink">
              <span className="mt-1 inline-flex size-4.5 shrink-0 items-center justify-center rounded-full bg-soft-tint text-brand">
                <Check className="size-3" strokeWidth={3} />
              </span>
              {item}
            </li>
          ))}
        </ul>
        <CtaLink href={primary.href} placement="pricing" signup={offer.launchMode === "live"} fullWidth className="mt-7">
          {primary.label}
        </CtaLink>
      </div>
      <ul className="reveal mx-auto mt-5 max-w-[520px] space-y-1 text-center text-[13px] leading-5 text-ink-muted" style={{ "--d": "100ms" } as React.CSSProperties}>
        {pricing.mentions.map((mention) => (
          <li key={mention}>{mention}</li>
        ))}
        <li>{byMode(pricing.afterCta)}</li>
      </ul>
      <PricingViewTracker targetId="tarif-card" />
    </Section>
  );
}
