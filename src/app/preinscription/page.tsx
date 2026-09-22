import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Faq } from "@/components/landing/Faq";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { RevealObserver } from "@/components/landing/Reveal";
import { Waitlist } from "@/components/landing/Waitlist";
import { byMode, pricing } from "@/content/fr/landing";

export const metadata: Metadata = {
  title: "Préinscription",
  alternates: { canonical: "/preinscription" },
  robots: { index: false, follow: true },
};

const states = ["ok", "email", "limite", "erreur"] as const;
type State = (typeof states)[number];

export default async function PreinscriptionPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const raw = typeof params.inscription === "string" ? params.inscription : null;
  const initialState = (states as readonly string[]).includes(raw ?? "") ? raw as State : null;

  return (
    <>
      <Header />
      <main id="contenu" className="flex-1">
        <div className="container-page pt-6">
          <Link href="/" className="inline-flex min-h-11 items-center gap-1.5 text-[14px] font-medium text-ink-muted hover:text-ink">
            <ArrowLeft aria-hidden="true" className="size-4" />
            Retour à l’accueil
          </Link>
        </div>
        <Waitlist initialState={initialState} headingAs="h1" />
        <div className="container-page">
          <ul className="mx-auto max-w-2xl space-y-1 text-center text-[13px] leading-5 text-ink-muted">
            <li className="font-medium text-ink">
              {pricing.price} {pricing.priceUnit} · {pricing.scope}
            </li>
            {pricing.highlights.map((item) => <li key={item}>{item}.</li>)}
            {pricing.mentions.map((mention) => <li key={mention}>{mention}</li>)}
            <li>{byMode(pricing.afterCta)}</li>
          </ul>
        </div>
        <Faq />
      </main>
      <Footer />
      <RevealObserver />
    </>
  );
}
