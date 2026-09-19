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
    <section id="hero" aria-labelledby="hero-title" className="relative isolate overflow-x-clip pb-10 pt-9 md:pb-16 md:pt-14">
      <div aria-hidden="true" className="hero-glow pointer-events-none absolute inset-0 -z-10" />
      <HeroArcs />
      <HeroIcons />

      <div className="container-page">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <p className="enter mb-4 text-[13px] font-medium text-brand md:mb-6 md:text-[15px]" style={d(0)}>
            {hero.eyebrow}
          </p>
          <h1 id="hero-title" className="hero-title">
            <span className="line-mask">
              <span style={d(60)}>{hero.title[0]}</span>
            </span>
            <span className="line-mask">
              <span style={d(140)}>{hero.title[1]}<br className="sm:hidden" /><span className="hidden sm:inline"> </span>{hero.title[2]}</span>
            </span>
          </h1>
          <p className="enter mt-5 max-w-[310px] text-[15px] leading-[23px] text-ink-muted md:hidden" style={d(200)}>
            {hero.introShort}
          </p>
          <p className="enter mt-5 hidden max-w-3xl text-[16px] leading-7 text-ink-muted md:block" style={d(240)}>
            {hero.intro}
          </p>

          <div className="enter mt-3" style={d(300)}>
            <p className="text-brand">
              {pricePrefix ? <span className="hidden text-[24px] font-bold tracking-tight md:inline">{pricePrefix}{" "}: </span> : null}
              <span className="text-[26px] font-bold tracking-[-0.02em]">{hero.price}</span>
              <span className="text-[26px] font-bold tracking-tight md:text-[24px]"> {hero.priceUnit}</span>
            </p>
            {priceCaption ? <p className="mt-1.5 text-[13px] text-ink-muted md:hidden">{priceCaption}</p> : null}
            <p className="mt-0.5 text-[13px] text-ink-muted md:mt-1 md:text-[15px]">{hero.priceNote}</p>
          </div>

          <div className="enter mt-5 flex w-full max-w-[320px] flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:items-center sm:gap-4 md:mt-6" style={d(380)}>
            <CtaLink href={primary.href} placement="hero" signup={offer.launchMode === "live"} fullWidth className="sm:w-auto sm:whitespace-nowrap">
              {primary.label}
            </CtaLink>
            <Button href={cta.secondary.href} variant="secondary" fullWidth className="sm:w-auto sm:whitespace-nowrap">
              {cta.secondary.label}
            </Button>
          </div>
        </div>

        {/* Aperçu sur un socle lilas translucide, cartes flottantes autour. */}
        <figure id="apercu" className="enter relative mx-auto mt-12 max-w-[1040px] md:mt-14" style={d(360)}>
          <div className="relative">
            <div aria-hidden="true" className="preview-halo" />
            <div className="preview-glass rounded-[24px] p-2.5 sm:p-3 md:rounded-[22px] md:p-3.5">
              <AgendaPreview alt={hero.previewAlt} animate />
            </div>
            <FloatingCards />
            <FloatingBadgeMobile />
          </div>
          <figcaption className="mx-auto mt-7 flex max-w-xs items-center gap-4 text-[12px] text-ink-muted">
            <span aria-hidden="true" className="h-px flex-1 bg-line" />
            {byMode(hero.previewCaption)}
            <span aria-hidden="true" className="h-px flex-1 bg-line" />
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
