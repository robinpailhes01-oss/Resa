import { AgendaPreview } from "@/components/previews/AgendaPreview";
import { Button } from "@/components/ui/Button";
import { offer } from "@/config/offer";
import { byMode, cta, hero } from "@/content/fr/landing";
import { CtaLink } from "./CtaLink";
import { FloatingBadgeMobile, FloatingCards, HeroArcs, HeroIcons } from "./HeroDecor";

type Delay = { "--d": string } & React.CSSProperties;
const d = (ms: number): Delay => ({ "--d": `${ms}ms` });

export function Hero() {
  const primary = byMode(cta.primary);
  const pricePrefix = byMode(hero.pricePrefix);
  const priceCaption = byMode(hero.priceCaption);

  return (
    <section id="hero" aria-labelledby="hero-title" className="relative overflow-x-clip pb-14 pt-5 md:pb-24 md:pt-10">
      <div aria-hidden="true" className="hero-glow pointer-events-none absolute inset-0 -z-10" />
      <HeroArcs />
      <HeroIcons />

      <div className="container-page">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <p className="enter mb-3 text-[14px] font-medium text-brand md:mb-5 md:text-[15px]" style={d(0)}>
            {hero.eyebrow}
          </p>
          <h1 id="hero-title" className="max-w-[272px] text-display-xs sm:max-w-none sm:text-display-sm md:text-display-md xl:text-display">
            <span className="line-mask">
              <span style={d(60)}>{hero.title[0]}</span>
            </span>
            <span className="line-mask">
              <span style={d(140)}>{hero.title[1]}</span>
            </span>
          </h1>
          <p className="enter mt-4 max-w-[290px] text-[15px] leading-[22px] text-ink-muted md:hidden" style={d(200)}>
            {hero.introShort}
          </p>
          <p className="enter mt-6 hidden max-w-2xl text-[19px] leading-8 text-ink-muted md:block" style={d(240)}>
            {hero.intro}
          </p>

          <div className="enter mt-4 md:mt-5" style={d(300)}>
            <p className="text-brand">
              {pricePrefix ? <span className="hidden text-[24px] font-bold tracking-tight md:inline">{pricePrefix}{" "}: </span> : null}
              <span className="text-[26px] font-bold tracking-[-0.02em]">{hero.price}</span>
              <span className="text-[26px] font-bold tracking-tight md:text-[24px]"> {hero.priceUnit}</span>
            </p>
            {priceCaption ? <p className="mt-1.5 text-[13px] text-ink-muted md:hidden">{priceCaption}</p> : null}
            <p className="mt-0.5 text-[13px] text-ink-muted md:mt-1 md:text-[15px]">{hero.priceNote}</p>
          </div>

          <div className="enter mt-6 flex w-full flex-col gap-2.5 px-5 sm:w-auto sm:flex-row sm:items-center sm:gap-3 sm:px-0 md:mt-8" style={d(380)}>
            <CtaLink href={primary.href} placement="hero" signup={offer.launchMode === "live"} fullWidth className="sm:w-auto sm:whitespace-nowrap">
              {primary.label}
            </CtaLink>
            <Button href={cta.secondary.href} variant="secondary" fullWidth className="sm:w-auto sm:whitespace-nowrap">
              {cta.secondary.label}
            </Button>
          </div>
          <p className="enter mt-4 hidden text-small text-ink-muted md:block" style={d(440)}>
            {byMode(hero.microcopy)}
          </p>
        </div>

        {/* Aperçu sur un socle lilas translucide, cartes flottantes autour. */}
        <figure id="apercu" className="enter relative mx-auto mt-9 max-w-6xl md:mt-16" style={d(360)}>
          <div className="relative">
            <div aria-hidden="true" className="preview-halo" />
            <div className="preview-glass rounded-[26px] p-3.5 sm:p-4 md:rounded-[28px] md:p-6">
              <AgendaPreview alt={hero.previewAlt} animate />
            </div>
            <FloatingCards />
            <FloatingBadgeMobile />
          </div>
          <figcaption className="mx-auto mt-8 flex max-w-xs items-center gap-4 text-small text-ink-muted">
            <span aria-hidden="true" className="h-px flex-1 bg-line" />
            {byMode(hero.previewCaption)}
            <span aria-hidden="true" className="h-px flex-1 bg-line" />
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
