import type { ReactNode } from "react";
import Link from "next/link";
import { Footer } from "@/components/landing/Footer";
import { Logo } from "@/components/ui/Logo";
import { offer } from "@/config/offer";

type SimplePageProps = {
  title: string;
  intro?: string;
  children: ReactNode;
  /** Largeur du contenu : « narrow » pour les écrans d'état, « prose » pour les textes légaux. */
  width?: "narrow" | "prose";
};

/** Gabarit des pages annexes : header réduit, contenu centré, footer commun. */
export function SimplePage({ title, intro, children, width = "prose" }: SimplePageProps) {
  return (
    <>
      <header className="border-b border-line bg-page">
        <div className="container-page flex h-16 items-center md:h-20">
          <Link href="/" className="inline-flex items-center rounded-md" aria-label={`${offer.brandName} – accueil`}>
            <Logo height={26} />
          </Link>
        </div>
      </header>
      <main id="contenu" className="flex-1 py-12 md:py-20">
        <div className={`container-page ${width === "narrow" ? "max-w-2xl" : "max-w-3xl"}`}>
          <h1 className="heading-2">{title}</h1>
          {intro ? <p className="mt-4 text-ink-muted">{intro}</p> : null}
          <div className="prose-page mt-10">{children}</div>
        </div>
      </main>
      <Footer />
    </>
  );
}
