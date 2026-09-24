import type { ReactNode } from "react";
import { Logo } from "@/components/ui/Logo";
import { offer } from "@/config/offer";
import type { Establishment } from "@/server/auth/guards";
import { businessTypeLabel } from "@/server/app/establishments";

/** Gabarit de la page de réservation publique : en-tête établissement, contenu, pied discret. */
export function BookingShell({ establishment, children, wide = false, hideTitle = false }: { establishment: Establishment; children: ReactNode; wide?: boolean; hideTitle?: boolean }) {
  const location = [establishment.city].filter(Boolean).join(" · ");
  const width = wide ? "max-w-5xl" : "max-w-3xl";
  return (
    <div className="min-h-screen bg-page">
      <header className="border-b border-line bg-card/80 backdrop-blur-md">
        <div className={`mx-auto flex ${width} items-center justify-between px-4 py-3`}>
          <span className="text-[13px] text-ink-muted">Votre rendez-vous chez</span>
          <Logo height={18} />
        </div>
      </header>
      <main id="contenu" className={`mx-auto ${width} px-4 py-8 md:py-12`}>
        {hideTitle ? null : (
          <div className="mb-8">
            <h1 className="text-[28px] leading-9 md:text-[34px] md:leading-10">{establishment.name}</h1>
            <p className="mt-1 text-[15px] text-ink-muted">
              {businessTypeLabel(establishment.businessType)}
              {location ? ` · ${location}` : ""}
            </p>
          </div>
        )}
        {children}
      </main>
      <footer className={`mx-auto ${width} px-4 pb-10 text-[12px] text-ink-muted`}>
        Réservation propulsée par {offer.brandName}. Les horaires sont affichés à l’heure de Paris.
      </footer>
    </div>
  );
}

export function Steps({ current }: { current: 1 | 2 | 3 | 4 }) {
  const steps = ["Prestation", "Créneau", "Coordonnées", "Confirmation"];
  return (
    <ol className="mb-6 flex items-center gap-2 text-[13px]">
      {steps.map((label, i) => {
        const n = (i + 1) as 1 | 2 | 3 | 4;
        const done = n < current;
        const active = n === current;
        return (
          <li key={label} className="flex items-center gap-2">
            <span className={`inline-flex size-6 items-center justify-center rounded-full text-[12px] font-bold ${done || active ? "bg-brand text-white" : "bg-card text-ink-muted ring-1 ring-line"}`}>{n}</span>
            <span className={`hidden sm:inline ${active ? "font-semibold text-brand" : "text-ink-muted"}`}>{label}</span>
            {i < steps.length - 1 ? <span className="h-px w-4 bg-line sm:w-8" aria-hidden="true" /> : null}
          </li>
        );
      })}
    </ol>
  );
}
