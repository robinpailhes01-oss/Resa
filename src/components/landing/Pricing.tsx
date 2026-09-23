import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PricingSwitch } from "@/components/ui/pricing-switch";
import { Section } from "@/components/ui/Section";
import { byMode, cta, pricing } from "@/content/fr/landing";
import { PricingViewTracker } from "./PricingViewTracker";

/** Une offre, deux façons de la lire : sélecteur de profil, carte animée, précisions discrètes. */
export function Pricing() {
  const primary = byMode(cta.primary);

  return (
    <Section id="tarif" labelledBy="tarif-title" className="!pt-8 md:!pt-12">
      <div className="reveal reveal-blur mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
        <p className="inline-flex items-center rounded-full bg-soft-tint px-3.5 py-1.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-brand">{pricing.label}</p>
        <h2 id="tarif-title" className="heading-2">
          {pricing.title[0]}
          <br />
          {pricing.title[1]}
        </h2>
        <p className="max-w-xl text-[16px] leading-7 text-ink-muted md:text-[17px]">{pricing.intro}</p>
      </div>
      <div className="reveal mt-10" style={{ "--d": "80ms" } as React.CSSProperties}>
        <PricingSwitch
          profiles={pricing.profiles}
          selectorLabel={pricing.selectorLabel}
          badge={byMode(pricing.badge)}
          price={pricing.price}
          priceUnit={pricing.priceUnit}
          priceCaption={byMode(pricing.priceCaption)}
          billing={byMode(pricing.billing)}
          scope={pricing.scope}
          cta={primary}
        >
          <div className="flex flex-col items-center gap-1 text-center">
            <p className="text-[15px] text-ink-muted">{pricing.help.text}</p>
            <Button href={pricing.help.href} variant="link" className="text-brand">
              {pricing.help.label}
              <ArrowUpRight aria-hidden="true" />
            </Button>
          </div>
          <ul className="mx-auto max-w-[620px] space-y-1 text-center text-[13px] leading-5 text-ink-muted">
            {pricing.mentions.map((mention) => (
              <li key={mention}>{mention}</li>
            ))}
            <li>{byMode(pricing.afterCta)}</li>
          </ul>
        </PricingSwitch>
      </div>
      <PricingViewTracker targetId="tarif-card" />
    </Section>
  );
}
