import { ArrowRight } from "lucide-react";
import { AgendaPreview, ReminderCard } from "@/components/previews/AgendaPreview";
import { Button } from "@/components/ui/Button";
import { offer } from "@/config/offer";
import { byMode, cta, hero } from "@/content/fr/landing";
import { CtaLink } from "./CtaLink";

type Delay = { "--d": string } & React.CSSProperties;
const d = (ms: number): Delay => ({ "--d": `${ms}ms` });

/** Premier écran : le produit visible immédiatement, un centre blanc et lisible. */
export function Hero() {
  const primary = byMode(cta.primary);
  const caption = byMode(hero.reassuranceCaption);

  return (
    <section id="hero" aria-labelledby="hero-title" className="relative isolate overflow-x-clip pb-8 pt-4 md:pb-14 md:pt-14">
      <div className="container-page">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <p className="enter inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1 text-[12px] font-medium text-ink-muted md:text-[13px]" style={d(0)}>
            <span aria-hidden="true" className="size-1.5 rounded-full bg-brand" />
            {hero.eyebrow}
          </p>
          <h1 id="hero-title" className="display enter mt-4 md:mt-6" style={d(60)}>
            {hero.title[0]}
            <br />
            {hero.title[1]}
          </h1>
          <p className="enter mt-3 max-w-[22rem] text-[15px] leading-[23px] text-ink-muted sm:max-w-[40rem] md:mt-5 md:text-[18px] md:leading-[30px]" style={d(140)}>
            {hero.intro}
          </p>
          <div className="enter mt-5 flex w-full max-w-[360px] flex-col items-center gap-1 sm:w-auto sm:max-w-none sm:flex-row sm:gap-3 md:mt-8" style={d(220)}>
            <CtaLink href={primary.href} placement="hero" signup={offer.launchMode === "live"} fullWidth className="sm:w-auto sm:whitespace-nowrap">
              {primary.label}
            </CtaLink>
            {/* Bouton sur grand écran, lien texte sur téléphone pour garder l'agenda dans le premier écran. */}
            <span className="hidden sm:block">
              <Button href={cta.secondary.href} variant="secondary" className="whitespace-nowrap">
                {cta.secondary.label}
                <ArrowRight aria-hidden="true" />
              </Button>
            </span>
            <span className="sm:hidden">
              <Button href={cta.secondary.href} variant="link" className="min-h-10">
                {cta.secondary.label}
                <ArrowRight aria-hidden="true" />
              </Button>
            </span>
          </div>
          <p className="enter mt-1 text-[13px] text-ink-muted md:mt-5 md:text-[14px]" style={d(300)}>
            {hero.reassurance.join(" · ")}
            {caption ? <span className="hidden text-[13px] text-ink-muted/80 md:inline"> · {caption}</span> : null}
          </p>
        </div>

        {/* Aperçu de l'agenda : fenêtre blanche, halo pâle, carte « rappel envoyé ». */}
        <figure id="produit" className="enter relative mx-auto mt-5 max-w-[1080px] md:mt-12" style={d(360)}>
          <div aria-hidden="true" className="hero-halo -inset-x-10 -bottom-10 -top-6 md:-inset-x-24" />
          <div className="demo-stage relative">
            <div className="product-perspective">
              <AgendaPreview alt={hero.previewAlt} className="product-window-host" />
            </div>
            <ReminderCard className="-right-1 top-[64%] sm:-right-4 sm:bottom-[6%] sm:top-auto lg:-right-10 lg:bottom-[7%]" />
            <span
              aria-hidden="true"
              className="demo-card absolute left-6 -top-7 hidden items-center gap-2 rounded-full border border-line bg-card py-1.5 pl-2.5 pr-3 text-[12px] font-medium text-ink shadow-float lg:inline-flex"
            >
              <span className="size-2 rounded-full bg-success" />
              {hero.floatingPill}
            </span>
          </div>
          <figcaption className="mx-auto mt-5 text-center text-[12px] text-ink-muted md:mt-7 md:text-[13px]">{byMode(hero.previewCaption)}</figcaption>
        </figure>
      </div>
    </section>
  );
}
