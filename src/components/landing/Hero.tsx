import { ArrowRight, CalendarPlus, Mail } from "lucide-react";
import { AgendaPreview } from "@/components/previews/AgendaPreview";
import { BlurWords } from "@/components/ui/BlurWords";
import { Button } from "@/components/ui/Button";
import { offer } from "@/config/offer";
import { byMode, cta, hero } from "@/content/fr/landing";
import { CtaLink } from "./CtaLink";
import { FloatCard } from "./FloatCard";

type Delay = { "--d": string } & React.CSSProperties;
const d = (ms: number): Delay => ({ "--d": `${ms}ms` });

/**
 * Premier écran : dégradé mesh doux, centre blanc, produit visible immédiatement.
 * La fenêtre de l'agenda chevauche le bas du hero et repose sur le fond de page.
 */
export function Hero() {
  const primary = byMode(cta.primary);
  const caption = byMode(hero.reassuranceCaption);

  return (
    <section id="hero" aria-labelledby="hero-title" className="relative isolate overflow-x-clip pt-6 md:pt-14">
      <div aria-hidden="true" className="hero-mesh" />
      <div aria-hidden="true" className="hero-halo hero-halo-left" />
      <div aria-hidden="true" className="hero-halo hero-halo-right" />

      <div className="container-page">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <p className="enter inline-flex items-center gap-2 rounded-full border border-line bg-card/90 px-3 py-1 text-[12px] font-medium text-ink-muted shadow-card md:text-[13px]" style={d(0)}>
            <span aria-hidden="true" className="size-1.5 rounded-full bg-brand" />
            {hero.eyebrow}
          </p>
          <h1 id="hero-title" className="display mt-4 max-w-[12ch] md:mt-7">
            <BlurWords text={hero.title[0]} delay={80} />
            <br />
            <BlurWords text={hero.title[1]} delay={200} />
          </h1>
          <p className="mt-3 max-w-[22rem] text-[15px] leading-[24px] text-ink-muted sm:max-w-[40rem] md:mt-6 md:text-[18px] md:leading-[30px]">
            <BlurWords text={hero.intro} delay={420} stagger={22} />
          </p>
          <div className="enter mt-5 flex w-full max-w-[360px] flex-col items-center gap-2.5 sm:w-auto sm:max-w-none sm:flex-row md:mt-8" style={d(220)}>
            <CtaLink href={primary.href} placement="hero" signup={offer.launchMode === "live"} fullWidth className="sm:w-auto sm:whitespace-nowrap">
              {primary.label}
            </CtaLink>
            <Button href={cta.secondary.href} variant="secondary" fullWidth className="sm:w-auto sm:whitespace-nowrap">
              {cta.secondary.label}
              <ArrowRight aria-hidden="true" />
            </Button>
          </div>
          <p className="enter mt-3 text-[13px] text-ink-muted md:mt-5 md:text-[14px]" style={d(300)}>
            {byMode(hero.reassurance).join(" · ")}
            {caption ? <span className="hidden sm:inline"> · {caption}</span> : null}
          </p>
        </div>

        {/* Aperçu de l'agenda : fenêtre blanche qui sort du dégradé, deux cartes flottantes. */}
        <figure id="produit" className="enter relative mx-auto mt-6 max-w-[1120px] md:mt-12" style={d(360)}>
          <div className="demo-stage relative">
            <div className="product-perspective">
              <AgendaPreview alt={hero.previewAlt} />
            </div>
            <FloatCard
              icon={CalendarPlus}
              tone="mint"
              title={hero.floatingPill.title}
              text={hero.floatingPill.text}
              tilt={-1.5}
              drift
              className="-left-2 top-[50%] hidden sm:flex lg:-left-8 lg:top-[40%]"
            />
            <FloatCard
              icon={Mail}
              tone="brand"
              title={hero.floatingCard.title}
              text={hero.floatingCard.text}
              tilt={1.5}
              demo
              className="-right-2 top-[66%] sm:-right-4 sm:top-auto sm:bottom-[9%] lg:-right-8 lg:bottom-auto lg:top-[40%]"
            />
          </div>
          <figcaption className="mx-auto mt-5 text-center text-[12px] text-ink-muted md:mt-7 md:text-[13px]">{byMode(hero.previewCaption)}</figcaption>
        </figure>
      </div>
    </section>
  );
}
