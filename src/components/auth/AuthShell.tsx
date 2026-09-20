import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { offer } from "@/config/offer";

/** Gabarit des écrans de connexion : logo, carte centrée, lien de bas de page. */
export function AuthShell({ title, intro, children, footer }: { title: string; intro?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <main id="contenu" className="flex min-h-screen flex-col items-center bg-page px-4 py-10 md:py-16">
      <Link href="/" className="mb-8 inline-flex rounded-md" aria-label={`${offer.brandName} – accueil`}>
        <Logo height={28} />
      </Link>
      <div className="w-full max-w-md rounded-3xl bg-card p-6 ring-1 ring-line md:p-8">
        <h1 className="text-[26px] leading-8 md:text-[28px] md:leading-9">{title}</h1>
        {intro ? <p className="mt-2 text-[15px] leading-6 text-ink-muted">{intro}</p> : null}
        <div className="mt-6">{children}</div>
      </div>
      {footer ? <p className="mt-6 text-center text-[15px] text-ink-muted">{footer}</p> : null}
    </main>
  );
}
