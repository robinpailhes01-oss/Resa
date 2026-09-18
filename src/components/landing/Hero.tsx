import { ArrowRight } from "lucide-react";
import { AgendaPreview } from "@/components/previews/AgendaPreview";
import { Button } from "@/components/ui/Button";
import { offer, isPrelaunch } from "@/config/offer";
import { byMode, cta, hero } from "@/content/fr/landing";
import { CtaLink } from "./CtaLink";

export function Hero() {
  const primary = byMode(cta.primary);
  const pricePrefix = byMode(hero.pricePrefix);

  return (
    <section id="hero" aria-labelledby="hero-title" className="pb-16 pt-8 md:pb-24 md:pt-14">
      <div className="container-page">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="flex min-w-0 flex-col lg:col-span-6 xl:col-span-6">
            <p className="mb-4 text-small font-semibold uppercase tracking-[0.12em] text-ink-muted">{hero.eyebrow}</p>
            <h1 className="text-display-sm lg:text-[48px] lg:leading-[54px] xl:text-display">
              <span className="block">{hero.title[0]}</span>
              <span className="block">{hero.title[1]}</span>
            </h1>
            <p className="prose-measure mt-5 text-ink-muted md:mt-6">{hero.intro}</p>

            <div className="mt-8 md:mt-10">
              {pricePrefix ? (
                <p className="text-small font-semibold uppercase tracking-[0.12em] text-ink-muted">{pricePrefix}</p>
              ) : null}
              <p className="flex flex-wrap items-baseline gap-x-3 text-brand">
                <span className="text-price-sm font-bold tracking-tight md:text-price">{hero.price}</span>
                <span className="text-[18px] font-medium text-ink-muted md:text-[20px]">{hero.priceUnit}</span>
              </p>
              <p className="mt-1 font-medium text-ink">{hero.priceNote}</p>
              {isPrelaunch ? <p className="mt-2 text-small text-ink-muted">{hero.prelaunchNotice}</p> : null}
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center md:mt-8">
              <CtaLink
                href={primary.href}
                placement="hero"
                signup={offer.launchMode === "live"}
                fullWidth
                className="sm:w-auto"
              >
                {primary.label}
                <ArrowRight aria-hidden="true" />
              </CtaLink>
              <Button href={cta.secondary.href} variant="secondary" fullWidth className="sm:w-auto">
                {cta.secondary.label}
              </Button>
            </div>
            <p className="mt-3 text-small text-ink-muted">{byMode(hero.microcopy)}</p>
          </div>

          <figure className="min-w-0 lg:col-span-6">
            <AgendaPreview alt={hero.previewAlt} badge={hero.previewBadge} compact />
            <figcaption className="mt-6 text-small text-ink-muted">{byMode(hero.previewCaption)}</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
