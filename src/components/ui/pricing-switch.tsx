"use client";

import { useId, useState, type KeyboardEvent, type ReactNode } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { BorderBeam } from "@/components/ui/border-beam";
import { CtaLink } from "@/components/landing/CtaLink";
import { offer } from "@/config/offer";
import { cn } from "@/lib/cn";
import type { PricingProfile } from "@/content/fr/landing";

type PricingSwitchProps = {
  profiles: PricingProfile[];
  selectorLabel: string;
  badge: string;
  price: string;
  priceUnit: string;
  priceCaption: string | null;
  billing: string;
  scope: string;
  cta: { label: string; href: string };
  /** Contenu affiché sous la carte (aide, mentions). */
  children?: ReactNode;
};

/**
 * Sélecteur en pilule et carte tarifaire qui se met à jour avec une courte
 * animation (CSS uniquement). Une seule offre : le sélecteur change la
 * présentation, jamais le prix.
 */
export function PricingSwitch({ profiles, selectorLabel, badge, price, priceUnit, priceCaption, billing, scope, cta, children }: PricingSwitchProps) {
  const [value, setValue] = useState(profiles[0]?.value ?? "");
  const baseId = useId();
  const current = profiles.find((p) => p.value === value) ?? profiles[0];

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const delta = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const next = profiles[(index + delta + profiles.length) % profiles.length];
    setValue(next.value);
    document.getElementById(`${baseId}-tab-${next.value}`)?.focus();
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div role="tablist" aria-label={selectorLabel} className="inline-flex rounded-full bg-soft-tint p-1">
        {profiles.map((profile, index) => {
          const selected = profile.value === current.value;
          return (
            <button
              key={profile.value}
              type="button"
              role="tab"
              id={`${baseId}-tab-${profile.value}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setValue(profile.value)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={cn(
                "min-h-11 min-w-28 rounded-full px-5 text-[14px] font-medium transition-colors md:min-w-32 md:px-6",
                selected ? "bg-card text-ink shadow-card" : "text-ink-muted hover:text-ink",
              )}
            >
              {profile.label}
            </button>
          );
        })}
      </div>

      <div id="tarif-card" className="relative w-full max-w-[880px] rounded-[32px] bg-soft-tint p-1">
        <BorderBeam radius={32} />
        <div
          key={current.value}
          id={`${baseId}-panel`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${current.value}`}
          className="tab-panel-in grid grid-cols-1 items-start gap-8 rounded-[28px] bg-card p-6 shadow-card md:grid-cols-[1.2fr_auto_1fr] md:gap-10 md:p-9"
        >
          <div className="flex flex-col gap-6 md:order-3">
            <div className="flex flex-col gap-2">
              <span className="inline-flex w-fit items-center rounded-full bg-brand px-3 py-1 text-[12px] font-semibold text-white">{badge}</span>
              <h3 className="mt-2 text-[20px] font-semibold tracking-[-0.01em] text-ink">{current.name}</h3>
              <p className="text-[14.5px] leading-6 text-ink-muted">{current.description}</p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-ink">
                <span className="text-[52px] font-bold leading-none tracking-[-0.04em] tabular-nums md:text-[60px]">{price}</span>
                <span className="ml-2 text-[17px] font-medium text-ink-muted">{priceUnit}</span>
              </p>
              <p className="text-[13.5px] text-ink-muted">{priceCaption ?? billing}</p>
              <p className="text-[13.5px] text-ink-muted">{scope}</p>
            </div>
            <CtaLink href={cta.href} placement="pricing" signup={offer.launchMode === "live"} fullWidth>
              {cta.label}
              <ArrowUpRight aria-hidden="true" />
            </CtaLink>
          </div>

          <div className="hidden w-px self-stretch bg-line md:order-2 md:block" aria-hidden="true" />

          <ul className="flex flex-col gap-3 md:order-1 md:pt-1">
            {current.features.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-[15px] leading-6 text-ink">
                <span className="mt-1 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                  <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
      {children}
    </div>
  );
}
