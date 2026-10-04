"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type PageTab = { id: string; label: string; content: ReactNode };

/** Onglets collants de la fiche (Prendre RDV · Avis · À propos) ; l'ancre #avis ouvre directement le bon onglet. */
export function PageTabs({ tabs }: { tabs: PageTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fromHash = () => {
      const id = window.location.hash.slice(1);
      if (tabs.some((t) => t.id === id)) setActive(id);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [tabs]);

  const select = (id: string) => {
    setActive(id);
    window.history.replaceState(null, "", id === tabs[0]?.id ? window.location.pathname + window.location.search : `#${id}`);
    const el = bar.current;
    if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ block: "start" });
  };

  return (
    <div>
      <div ref={bar} className="sticky top-0 z-20 -mx-4 scroll-mt-0 border-b border-line bg-page/95 px-4 backdrop-blur-md md:mx-0 md:px-0">
        <div role="tablist" className="flex gap-6">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`onglet-${t.id}`}
              aria-selected={active === t.id}
              aria-controls={`panneau-${t.id}`}
              onClick={() => select(t.id)}
              className={cn(
                "relative -mb-px border-b-2 py-3.5 text-[15px] font-semibold transition-colors",
                active === t.id ? "border-ink text-ink" : "border-transparent text-ink-muted hover:text-ink",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      {tabs.map((t) => (
        <div key={t.id} id={`panneau-${t.id}`} role="tabpanel" aria-labelledby={`onglet-${t.id}`} hidden={active !== t.id} className="pt-6">
          {t.content}
        </div>
      ))}
    </div>
  );
}
