import { Section } from "@/components/ui/Section";
import { offer } from "@/config/offer";
import { byMode, cta, waitlist } from "@/content/fr/landing";
import { CtaLink } from "./CtaLink";
import { WaitlistForm } from "./WaitlistForm";

type WaitlistProps = { initialState: "ok" | "email" | "limite" | "erreur" | null };

/** Fin de page en prune : un titre, le formulaire, rien d'autre. */
export function Waitlist({ initialState }: WaitlistProps) {
  if (offer.launchMode === "live") {
    const primary = byMode(cta.primary);
    return (
      <Section id="inscription" labelledBy="inscription-title" tone="dark">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <h2 id="inscription-title" className="text-h2-sm md:text-h2">
            {waitlist.liveBlock.title}
          </h2>
          <p className="mt-4 text-[19px] leading-8 text-white/80">{waitlist.liveBlock.intro}</p>
          <CtaLink href={primary.href} placement="footer" signup variant="inverse" className="mt-9">
            {primary.label}
          </CtaLink>
        </div>
      </Section>
    );
  }

  return (
    <Section id="inscription" labelledBy="inscription-title" tone="dark">
      <div className="mx-auto flex max-w-2xl flex-col items-center">
        <div className="text-center">
          <h2 id="inscription-title" className="text-h2-sm md:text-h2">
            {waitlist.title}
          </h2>
          <p className="mt-4 hidden text-[19px] leading-8 text-white/80 md:block">{waitlist.intro}</p>
        </div>
        <div className="reveal mt-10 w-full rounded-card bg-card p-5 text-ink md:mt-14 md:p-8">
          <WaitlistForm initialState={initialState} />
        </div>
      </div>
    </Section>
  );
}
