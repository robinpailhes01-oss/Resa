import { ArrowRight } from "lucide-react";
import { AgendaPreview } from "@/components/previews/AgendaPreview";
import { Button } from "@/components/ui/Button";
import { offer, isPrelaunch } from "@/config/offer";
import { byMode, cta, hero } from "@/content/fr/landing";
import { CtaLink } from "./CtaLink";

type Delay = { "--d": string } & React.CSSProperties;
const d = (ms: number): Delay => ({ "--d": `${ms}ms` });

export function Hero() {
  const primary = byMode(cta.primary);
  const pricePrefix = byMode(hero.pricePrefix);

  return (
    <section id="hero" aria-labelledby="hero-title" className="relative overflow-x-clip pb-20 pt-10 md:pb-32 md:pt-20">
      <div aria-hidden="true" className="hero-glow pointer-events-none absolute inset-0 -z-10" />
      <div className="container-page">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="flex min-w-0 flex-col lg:col-span-6">
            <p className="enter mb-5 text-small font-medium text-ink-muted" style={d(0)}>
              {hero.eyebrow}
            </p>
            <h1 id="hero-title" className="text-display-sm lg:text-[48px] lg:leading-[54px] xl:text-display">
              <span className="line-mask">
                <span style={d(60)}>{hero.title[0]}</span>
              </span>
              <span className="line-mask">
                <span style={d(140)}>{hero.title[1]}</span>
              </span>
            </h1>
            <p className="enter prose-measure mt-6 text-ink-muted" style={d(260)}>
              {hero.intro}
            </p>

            <div className="enter mt-9 md:mt-11" style={d(340)}>
              {pricePrefix ? <p className="text-small font-medium text-ink-muted">{pricePrefix}</p> : null}
              <p className="flex flex-wrap items-baseline gap-x-3 text-brand">
                <span className="text-price-sm font-bold tracking-[-0.03em] md:text-price">{hero.price}</span>
                <span className="text-[18px] font-medium text-ink-muted md:text-[20px]">{hero.priceUnit}</span>
              </p>
              <p className="mt-1 font-medium text-ink">{hero.priceNote}</p>
              {isPrelaunch ? <p className="mt-2 text-small text-ink-muted">{hero.prelaunchNotice}</p> : null}
            </div>

            <div className="enter mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center md:mt-10" style={d(430)}>
              <CtaLink
                href={primary.href}
                placement="hero"
                signup={offer.launchMode === "live"}
                fullWidth
                className="sm:w-auto sm:whitespace-nowrap"
              >
                {primary.label}
                <ArrowRight aria-hidden="true" />
              </CtaLink>
              <Button href={cta.secondary.href} variant="ghost" fullWidth className="sm:w-auto sm:whitespace-nowrap">
                {cta.secondary.label}
                <ArrowRight aria-hidden="true" />
              </Button>
            </div>
            <p className="enter mt-3 text-small text-ink-muted" style={d(520)}>
              {byMode(hero.microcopy)}
            </p>
          </div>

          {/* Sur grand écran, l'aperçu déborde du cadre jusqu'au bord droit de la fenêtre. */}
          <figure
            className="enter min-w-0 lg:col-span-6 lg:mr-[min(-40px,calc((1280px-100vw)/2-40px))]"
            style={d(200)}
          >
            <AgendaPreview alt={hero.previewAlt} badge={hero.previewBadge} compact animate />
            <figcaption className="mt-6 text-small text-ink-muted">{byMode(hero.previewCaption)}</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
