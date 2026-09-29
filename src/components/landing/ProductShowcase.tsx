import { CalendarPlus, Mail } from "lucide-react";
import { AgendaPreview } from "@/components/previews/AgendaPreview";
import { Section, SectionHeading } from "@/components/ui/Section";
import { byMode, hero, productShowcase } from "@/content/fr/landing";
import { FloatCard } from "./FloatCard";

/**
 * L'agenda, preuve produit : titre éditorial en deux colonnes, puis la fenêtre
 * posée sur un socle pierre qui s'élargit en entrant dans l'écran (moment signature).
 */
export function ProductShowcase() {
  return (
    <Section id="produit" labelledBy="produit-title" className="!pb-10 md:!pb-16">
      <SectionHeading id="produit-title" index={productShowcase.index} eyebrow={productShowcase.eyebrow} title={productShowcase.title} intro={productShowcase.text} />

      <figure className="relative mt-10 md:mt-14">
        <div aria-hidden="true" className="widen-on-scroll absolute inset-0 -z-0 rounded-[22px] bg-stone md:rounded-[28px]" />
        <div className="demo-stage relative px-3 pb-6 pt-6 sm:px-6 md:px-12 md:pb-12 md:pt-12">
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
            className="left-1 top-[46%] hidden sm:flex lg:left-4 lg:top-[40%]"
          />
          <FloatCard
            icon={Mail}
            tone="brand"
            title={hero.floatingCard.title}
            text={hero.floatingCard.text}
            tilt={1.5}
            demo
            className="right-1 top-[70%] sm:right-2 lg:right-4 lg:top-[40%]"
          />
        </div>
        <figcaption className="relative mx-auto pb-5 text-center text-[12px] text-ink-muted md:pb-7 md:text-[13px]">{byMode(hero.previewCaption)}</figcaption>
      </figure>
    </Section>
  );
}
