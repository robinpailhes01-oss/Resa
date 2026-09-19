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
      <Section id="inscription" labelledBy="inscription-title" tone="page" className="!pt-4 md:!pt-10">
        <div className="mx-auto flex max-w-2xl flex-col items-center rounded-[28px] bg-card px-6 py-12 text-center ring-1 ring-line md:px-12">
          <Heading id="inscription-title" className="text-[30px] leading-9 md:text-[34px] md:leading-10">
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
    <Section id="inscription" labelledBy="inscription-title" tone="page" className="!pt-4 md:!pt-10">
      <div className="reveal mx-auto max-w-2xl rounded-[24px] bg-card p-5 shadow-preview ring-1 ring-line md:p-10">
        <div className="mb-7 text-center md:mb-9">
          <Heading id="inscription-title" className="text-[30px] leading-9 md:text-[34px] md:leading-10">
            {waitlist.title}
          </Heading>
          <p className="mt-3 text-[15px] leading-6 text-ink-muted md:text-[16px]">{waitlist.intro}</p>
        </div>
        <WaitlistForm initialState={initialState} />
      </div>
    </Section>
  );
}
