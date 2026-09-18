import { ArrowRight } from "lucide-react";
import { AgendaPreview } from "@/components/previews/AgendaPreview";
import { Button } from "@/components/ui/Button";
import { offer, isPrelaunch } from "@/config/offer";
import { byMode, cta, hero } from "@/content/fr/landing";
import { CtaLink } from "./CtaLink";
import { HeroArcs, HeroChips } from "./HeroChips";

type Delay = { "--d": string } & React.CSSProperties;
const d = (ms: number): Delay => ({ "--d": `${ms}ms` });

export function Hero() {
  const primary = byMode(cta.primary);
  const pricePrefix = byMode(hero.pricePrefix);

  return (
    <section id="hero" aria-labelledby="hero-title" className="relative overflow-x-clip pb-8 pt-8 md:pb-12 md:pt-12">
      <div aria-hidden="true" className="hero-glow pointer-events-none absolute inset-0 -z-10" />
      <HeroArcs />
      <HeroChips />

      <div className="container-page">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <p
            className="enter mb-4 inline-flex items-center gap-2 text-[13px] font-medium text-ink-muted md:mb-6 md:rounded-full md:bg-card md:px-3.5 md:py-1.5 md:text-small md:ring-1 md:ring-line"
            style={d(0)}
          >
            <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
            {hero.eyebrow}
          </p>
          <h1 id="hero-title" className="text-display-sm md:text-display">
            <span className="line-mask">
              <span style={d(60)}>{hero.title[0]}</span>
            </span>
            <span className="line-mask">
              <span style={d(140)}>{hero.title[1]}</span>
            </span>
          </h1>
          <p className="enter mt-5 max-w-xl text-ink-muted md:hidden" style={d(200)}>
            {hero.introShort}
          </p>
          <p className="enter mt-6 hidden max-w-xl text-ink-muted md:block" style={d(260)}>
            {hero.intro}
          </p>

          <div className="enter mt-7 md:mt-8" style={d(300)}>
            {pricePrefix ? <p className="text-small font-medium text-ink-muted">{pricePrefix}</p> : null}
            <p className="flex flex-wrap items-baseline justify-center gap-x-3 text-brand">
              <span className="text-price-sm font-bold tracking-[-0.03em] md:text-price">{hero.price}</span>
              <span className="text-[18px] font-medium text-ink-muted md:text-[20px]">{hero.priceUnit}</span>
            </p>
            <p className="mt-1 font-medium text-ink md:hidden">{hero.priceNoteShort}</p>
            <p className="mt-1 hidden font-medium text-ink md:block">{hero.priceNote}</p>
            {isPrelaunch ? <p className="mt-2 hidden text-small text-ink-muted md:block">{hero.prelaunchNotice}</p> : null}
          </div>

          <div className="enter mt-7 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center md:mt-8" style={d(380)}>
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
            <span className="hidden md:block">
              <Button href={cta.secondary.href} variant="secondary" className="whitespace-nowrap">
                {cta.secondary.label}
              </Button>
            </span>
          </div>
          <p className="enter mt-3 text-[13px] text-ink-muted md:mt-4 md:text-small" style={d(460)}>
            {byMode(hero.microcopy)}
            {isPrelaunch ? <span className="md:hidden"> Tarif et fonctionnalités confirmés à l’ouverture.</span> : null}
          </p>
        </div>

        {/* L'aperçu se fond dans la page vers le bas. */}
        <figure className="enter relative mx-auto mt-10 max-w-5xl md:mt-16" style={d(300)}>
          <div className="hero-fade max-h-[300px] overflow-hidden md:max-h-[520px]">
            <AgendaPreview alt={hero.previewAlt} animate />
          </div>
          <figcaption className="mt-2 text-center text-small text-ink-muted">{byMode(hero.previewCaption)}</figcaption>
        </figure>
      </div>
    </section>
  );
}
