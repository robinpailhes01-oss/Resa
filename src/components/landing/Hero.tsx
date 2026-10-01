import Image from "next/image";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { offer } from "@/config/offer";
import { byMode, cta, hero } from "@/content/fr/landing";
import { CtaLink } from "./CtaLink";

type Delay = { "--d": string } & React.CSSProperties;
const d = (ms: number): Delay => ({ "--d": `${ms}ms` });

/**
 * Premier écran, composé comme les visuels de marque : un aplat bleu poudré dans
 * un passe-partout crème, le titre en minuscules, une annotation manuscrite et
 * la nature morte au combiné décroché, qui porte la promesse.
 */
export function Hero() {
  const primary = byMode(cta.primary);
  const caption = byMode(hero.reassuranceCaption);

  return (
    <section id="hero" aria-labelledby="hero-title" className="pt-2 md:pt-4">
      <div className="container-page !px-3 sm:!px-5 md:!px-8">
        <div className="powder-panel grain relative isolate overflow-hidden rounded-[22px] md:rounded-[28px]">
          {/* Voile plus sombre derrière le texte : lisibilité du crème sans changer la couleur du mur. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[62%] bg-[radial-gradient(ellipse_at_50%_30%,rgba(38,52,66,0.32),transparent_70%)]" />

          <div className="relative flex items-start justify-between px-5 pt-5 md:px-10 md:pt-8">
            <span className="index-tag enter !text-page/80" style={d(0)}>
              {hero.index}
            </span>
            <p className="script enter -rotate-6 text-right text-[22px] text-page md:text-[30px]" style={d(120)}>
              {hero.note}
              <svg aria-hidden="true" viewBox="0 0 120 10" className="ml-auto mt-1 block h-2 w-24 md:w-32" fill="none">
                <path d="M2 7c30-5 70-6 116-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </p>
          </div>

          <div className="relative mx-auto flex max-w-4xl flex-col items-center px-5 pt-4 text-center md:pt-2">
            <h1 id="hero-title" className="display enter" style={d(60)}>
              {hero.title[0]}
              <br />
              {hero.title[1]}
            </h1>
            <p className="enter mt-5 inline-flex items-center gap-2.5 rounded-full bg-card/95 py-2 pl-2.5 pr-5 text-[15px] font-semibold text-ink shadow-[0_8px_24px_-14px_rgba(20,28,38,0.55)] ring-1 ring-page/60 md:mt-7 md:text-[17px]" style={d(160)}>
              <span aria-hidden="true" className="inline-flex size-6 items-center justify-center rounded-full bg-accent/30">
                <span className="size-3 rounded-full bg-lilac-ink" />
              </span>
              <span>{hero.rotator.lead}</span>
              <span className="sr-only">{hero.rotator.words.join(", ")}</span>
              <span aria-hidden="true" className="word-rotator font-display text-powder-deep">
                <span className="word-rotator__track">
                  {[...hero.rotator.words, hero.rotator.words[0]].map((word, i) => (
                    <span key={i}>{word}</span>
                  ))}
                </span>
              </span>
            </p>
            <p className="enter mt-5 max-w-[34rem] text-[15px] leading-6 text-page md:mt-7 md:text-[17px] md:leading-7" style={d(220)}>
              {hero.intro}
            </p>
            <div className="enter mt-6 flex w-full max-w-[360px] flex-col items-center gap-2.5 sm:w-auto sm:max-w-none sm:flex-row md:mt-8" style={d(280)}>
              <CtaLink href={primary.href} placement="hero" signup={offer.launchMode === "live"} variant="inverse" fullWidth className="sm:w-auto sm:whitespace-nowrap">
                {primary.label}
              </CtaLink>
              <Button href={hero.secondary.href} variant="ghost" fullWidth className="!text-page hover:!bg-page/10 sm:w-auto sm:whitespace-nowrap">
                <Eye aria-hidden="true" />
                {hero.secondary.label}
              </Button>
            </div>
            <p className="enter mt-3 text-[13px] text-page/90 md:mt-4 md:text-[14px]" style={d(320)}>
              {byMode(hero.reassurance).join(" · ")}
              {caption ? <span className="hidden sm:inline"> · {caption}</span> : null}
            </p>
          </div>

          <div className="relative mt-4 md:-mt-10">
            <Image
              src="/brand/nature-morte.webp"
              alt={hero.imageAlt}
              width={1155}
              height={832}
              priority
              sizes="(min-width: 1280px) 1200px, 100vw"
              className="blend-top h-auto w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
