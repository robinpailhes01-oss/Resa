import { ChevronRight } from "lucide-react";
import { AgendaPreview } from "@/components/previews/AgendaPreview";
import { Button } from "@/components/ui/Button";
import { offer, isPrelaunch } from "@/config/offer";
import { byMode, cta, hero } from "@/content/fr/landing";
import { CtaLink } from "./CtaLink";

type Delay = { "--d": string } & React.CSSProperties;
const d = (ms: number): Delay => ({ "--d": `${ms}ms` });

/** Premier écran : un titre, une ligne, un prix, un bouton. Puis le produit, grand. */
export function Hero() {
  const primary = byMode(cta.primary);
  const pricePrefix = byMode(hero.pricePrefix);

  return (
    <section id="hero" aria-labelledby="hero-title" className="overflow-x-clip bg-page pb-20 pt-16 md:pb-32 md:pt-28">
      <div className="container-page">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <p className="enter mb-5 text-small font-medium text-ink-muted md:mb-7" style={d(0)}>
            {hero.eyebrow}
          </p>
          <h1 id="hero-title" className="text-display-sm tracking-[-0.035em] md:text-display-md xl:text-display">
            <span className="line-mask">
              <span style={d(60)}>{hero.title[0]}</span>
            </span>
            <span className="line-mask">
              <span style={d(140)}>{hero.title[1]}</span>
            </span>
          </h1>
          <p className="enter mt-6 max-w-md text-[17px] leading-7 text-ink-muted md:hidden" style={d(200)}>
            {hero.introShort}
          </p>
          <p className="enter mt-7 hidden max-w-2xl text-[21px] leading-9 text-ink-muted md:block" style={d(260)}>
            {hero.intro}
          </p>

          <div className="enter mt-10 md:mt-14" style={d(320)}>
            {pricePrefix ? <p className="text-small font-medium text-ink-muted">{pricePrefix}</p> : null}
            <p className="mt-1 flex flex-wrap items-baseline justify-center gap-x-3 text-brand">
              <span className="text-price-sm font-bold tracking-[-0.04em] md:text-price">{hero.price}</span>
              <span className="text-[18px] font-medium text-ink-muted md:text-[22px]">{hero.priceUnit}</span>
            </p>
            <p className="mt-2 text-[16px] font-medium text-ink md:hidden">{hero.priceNoteShort}</p>
            <p className="mt-2 hidden text-[17px] font-medium text-ink md:block">{hero.priceNote}</p>
          </div>

          <div className="enter mt-9 flex flex-col items-center gap-3 sm:flex-row sm:gap-7 md:mt-10" style={d(400)}>
            <CtaLink href={primary.href} placement="hero" signup={offer.launchMode === "live"} className="whitespace-nowrap">
              {primary.label}
            </CtaLink>
            <Button href={cta.secondary.href} variant="link" className="whitespace-nowrap">
              {cta.secondary.label}
              <ChevronRight aria-hidden="true" />
            </Button>
          </div>
          <p className="enter mt-5 max-w-md text-[13px] leading-5 text-ink-muted md:text-small md:leading-6" style={d(480)}>
            {byMode(hero.microcopy)}
            {isPrelaunch ? <> {hero.prelaunchNotice}</> : null}
          </p>
        </div>

        <figure className="enter mx-auto mt-16 max-w-6xl md:mt-28" style={d(360)}>
          <AgendaPreview alt={hero.previewAlt} animate />
          <figcaption className="mt-6 text-center text-small text-ink-muted">{byMode(hero.previewCaption)}</figcaption>
        </figure>
      </div>
    </section>
  );
}
