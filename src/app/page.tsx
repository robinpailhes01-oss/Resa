import { Faq } from "@/components/landing/Faq";
import { Features } from "@/components/landing/Features";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Pricing } from "@/components/landing/Pricing";
import { ProductPreview } from "@/components/landing/ProductPreview";
import { RevealObserver } from "@/components/landing/Reveal";
import { Waitlist } from "@/components/landing/Waitlist";
import { offer } from "@/config/offer";
import { formatMonthlyPriceExVatCompact } from "@/lib/format";

const WAITLIST_STATES = ["ok", "email", "limite", "erreur"] as const;
type WaitlistState = (typeof WAITLIST_STATES)[number];

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const raw = typeof params.inscription === "string" ? params.inscription : null;
  const initialState = (WAITLIST_STATES as readonly string[]).includes(raw ?? "") ? (raw as WaitlistState) : null;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: offer.brandName,
        url: offer.siteUrl,
        ...(offer.supportEmail ? { email: offer.supportEmail } : {}),
      },
      {
        "@type": "WebSite",
        name: offer.brandName,
        url: offer.siteUrl,
        inLanguage: "fr",
        description: `Réservation en ligne, agenda partagé et emails automatiques pour les pros de la beauté. ${formatMonthlyPriceExVatCompact(offer.monthlyPriceExVat)}.`,
      },
    ],
  };

  return (
    <>
      <Header />
      <main id="contenu" className="flex-1">
        <Hero />
        <Features />
        <ProductPreview />
        <HowItWorks />
        <Pricing />
        <Faq />
        <Waitlist initialState={initialState} />
      </main>
      <Footer />
      <RevealObserver />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    </>
  );
}
