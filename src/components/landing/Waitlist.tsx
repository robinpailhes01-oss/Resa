import { ArrowRight } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { offer } from "@/config/offer";
import { byMode, cta, waitlist } from "@/content/fr/landing";
import { CtaLink } from "./CtaLink";
import { WaitlistForm } from "./WaitlistForm";

type WaitlistProps = { initialState: "ok" | "email" | "limite" | "erreur" | null };

export function Waitlist({ initialState }: WaitlistProps) {
  if (offer.launchMode === "live") {
    const primary = byMode(cta.primary);
    return (
      <Section id="inscription" labelledBy="inscription-title" tone="soft">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <h2 id="inscription-title" className="text-h2-sm md:text-h2">
            {waitlist.liveBlock.title}
          </h2>
          <p className="mt-3 text-ink-muted">{waitlist.liveBlock.intro}</p>
          <CtaLink href={primary.href} placement="footer" signup className="mt-8">
            {primary.label}
            <ArrowRight aria-hidden="true" />
          </CtaLink>
        </div>
      </Section>
    );
  }

  return (
    <Section id="inscription" labelledBy="inscription-title" tone="soft">
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <h2 id="inscription-title" className="text-h2-sm md:text-h2">
            {waitlist.title}
          </h2>
          <p className="mt-4 text-ink-muted">{waitlist.intro}</p>
        </div>
        <div className="relative rounded-card bg-card p-6 shadow-card ring-1 ring-line/60 md:p-8 lg:col-span-7">
          <WaitlistForm initialState={initialState} />
        </div>
      </div>
    </Section>
  );
}
