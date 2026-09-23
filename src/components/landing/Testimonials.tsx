import { Section } from "@/components/ui/Section";
import { TestimonialMarquee } from "@/components/ui/testimonial-marquee";
import { offer } from "@/config/offer";
import { byMode, cta, testimonialsSection } from "@/content/fr/landing";
import { testimonials } from "@/content/fr/testimonials";
import { CtaLink } from "./CtaLink";

type Delay = { "--d": string } & React.CSSProperties;

/**
 * Section « Avis ». Tant qu'aucun témoignage autorisé n'est renseigné dans
 * src/content/fr/testimonials.ts, un bloc de pré-lancement est affiché ;
 * un bandeau d'avis défilant remplace automatiquement ce bloc dès le premier
 * avis réel.
 */
export function Testimonials() {
  const primary = byMode(cta.primary);
  const hasTestimonials = testimonials.length > 0;

  return (
    <Section id="avis" labelledBy="avis-title" className="!pt-8 md:!pt-12">
      {hasTestimonials ? (
        <>
          <div className="reveal reveal-blur mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
            <p className="eyebrow">{testimonialsSection.label}</p>
            <h2 id="avis-title" className="heading-2">
              {testimonialsSection.title}
            </h2>
          </div>
          <div className="reveal mt-10" style={{ "--d": "80ms" } as Delay}>
            <TestimonialMarquee items={testimonials} label={testimonialsSection.label} />
          </div>
        </>
      ) : (
        <div className="reveal panel-dark relative mx-auto flex max-w-[1120px] flex-col items-center overflow-hidden rounded-[28px] px-6 py-14 text-center text-white md:rounded-[32px] md:px-12 md:py-20">
          <svg aria-hidden="true" viewBox="0 0 120 96" className="pointer-events-none absolute -right-4 top-6 h-24 w-auto text-white/12 md:right-12 md:top-10 md:h-32" fill="currentColor">
            <path d="M0 96V58C0 26 14 8 44 0l6 12C34 18 26 30 26 44h22v52H0Zm72 0V58c0-32 14-50 44-58l6 12c-16 6-24 18-24 32h22v52H72Z" />
          </svg>
          <p className="eyebrow !text-white/70">{testimonialsSection.label}</p>
          <h2 id="avis-title" className="heading-2 mt-3 !text-white">
            {testimonialsSection.pending.title}
          </h2>
          <p className="mt-4 max-w-xl text-[16px] leading-7 text-white/80 md:text-[17px]">{testimonialsSection.pending.text}</p>
          <CtaLink href={primary.href} placement="footer" signup={offer.launchMode === "live"} variant="inverse" className="mt-8">
            {primary.label}
          </CtaLink>
        </div>
      )}
    </Section>
  );
}
