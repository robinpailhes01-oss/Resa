import { Section } from "@/components/ui/Section";
import { offer } from "@/config/offer";
import { byMode, cta, waitlist } from "@/content/fr/landing";
import { CtaLink } from "./CtaLink";
import { WaitlistForm } from "./WaitlistForm";

type WaitlistProps = { headingAs?: "h1" | "h2"; initialState: "ok" | "email" | "limite" | "erreur" | null };

/** Inscription : une carte blanche centrée, dans la continuité des cartes de la page. */
export function Waitlist({ initialState, headingAs: Heading = "h2" }: WaitlistProps) {
  if (offer.launchMode === "live") {
    const primary = byMode(cta.primary);
    return (
      <Section id="inscription" labelledBy="inscription-title" className="!pt-6 md:!pt-10">
        <div className="card mx-auto flex max-w-2xl flex-col items-center px-6 py-12 text-center md:px-12">
          <Heading id="inscription-title" className="heading-2">
            {waitlist.liveBlock.title}
          </Heading>
          <p className="mt-3 text-ink-muted">{waitlist.liveBlock.intro}</p>
          <CtaLink href={primary.href} placement="footer" signup className="mt-8">
            {primary.label}
          </CtaLink>
        </div>
      </Section>
    );
  }

  return (
    <Section id="inscription" labelledBy="inscription-title" className="!pt-6 md:!pt-10">
      <div className="card mx-auto max-w-2xl p-5 md:p-10">
        <div className="mb-7 text-center md:mb-9">
          <Heading id="inscription-title" className="heading-2">
            {waitlist.title}
          </Heading>
          <p className="mt-3 text-[15px] leading-6 text-ink-muted md:text-[16px]">{waitlist.intro}</p>
        </div>
        <WaitlistForm initialState={initialState} />
      </div>
    </Section>
  );
}
