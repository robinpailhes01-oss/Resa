import Image from "next/image";
import { Section } from "@/components/ui/Section";
import { offer } from "@/config/offer";
import { byMode, cta, testimonialsSection } from "@/content/fr/landing";
import { testimonials } from "@/content/fr/testimonials";
import { CtaLink } from "./CtaLink";

type Delay = { "--d": string } & React.CSSProperties;

/**
 * Section « Avis ». Tant qu'aucun témoignage autorisé n'est renseigné dans
 * src/content/fr/testimonials.ts, un bloc de pré-lancement est affiché ;
 * les cartes remplacent automatiquement ce bloc dès le premier avis réel.
 */
export function Testimonials() {
  const primary = byMode(cta.primary);
  const hasTestimonials = testimonials.length > 0;

  return (
    <Section id="avis" labelledBy="avis-title" className="!pt-8 md:!pt-12">
      {hasTestimonials ? (
        <>
          <div className="reveal mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
            <p className="eyebrow">{testimonialsSection.label}</p>
            <h2 id="avis-title" className="heading-2">
              {testimonialsSection.title}
            </h2>
          </div>
          <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((item, i) => (
              <li key={`${item.firstName}-${item.establishment}`} className="reveal card card-hover flex flex-col p-6" style={{ "--d": `${i * 80}ms` } as Delay}>
                <blockquote className="flex-1 text-[16px] leading-7 text-ink">« {item.quote} »</blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  {item.photo ? (
                    <Image src={item.photo} alt="" width={40} height={40} className="size-10 rounded-full object-cover" />
                  ) : (
                    <span aria-hidden="true" className="inline-flex size-10 items-center justify-center rounded-full bg-soft-tint text-[13px] font-bold text-brand">
                      {item.firstName.charAt(0)}
                    </span>
                  )}
                  <div className="leading-tight">
                    <div className="text-[14px] font-semibold text-ink">{item.firstName}</div>
                    <div className="text-[13px] text-ink-muted">
                      {item.establishment} · {item.activity}
                    </div>
                  </div>
                </figcaption>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="reveal card mx-auto flex max-w-3xl flex-col items-center px-6 py-12 text-center md:px-12 md:py-16">
          <p className="eyebrow">{testimonialsSection.label}</p>
          <h2 id="avis-title" className="heading-2 mt-3">
            {testimonialsSection.pending.title}
          </h2>
          <p className="mt-4 max-w-xl text-[16px] leading-7 text-ink-muted md:text-[17px]">{testimonialsSection.pending.text}</p>
          <CtaLink href={primary.href} placement="footer" signup={offer.launchMode === "live"} className="mt-8">
            {primary.label}
          </CtaLink>
        </div>
      )}
    </Section>
  );
}
