import type { Metadata } from "next";
import Link from "next/link";
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

export default async function PreinscriptionPage({ searchParams }: PageProps<"/preinscription">) {
  const params = await searchParams;
  const raw = typeof params.inscription === "string" ? params.inscription : null;
  const initialState = (states as readonly string[]).includes(raw ?? "") ? raw as State : null;

  return (
    <>
      <Header />
      <main id="contenu" className="flex-1">
        <div className="container-page pt-6">
          <Link href="/" className="inline-flex min-h-11 items-center text-[14px] text-brand">← Retour à Reso</Link>
        </div>
        <Waitlist initialState={initialState} headingAs="h1" />
        <div className="container-page">
          <ul className="mx-auto max-w-2xl space-y-2 text-center text-[13px] leading-5 text-ink-muted">
            <li>{pricing.price} {pricing.priceUnit} · {pricing.scope}</li>
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
