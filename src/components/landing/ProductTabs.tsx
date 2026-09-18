"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { preview, type PreviewTabId } from "@/content/fr/landing";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";

type ProductTabsProps = {
  panels: Record<PreviewTabId, ReactNode>;
};

/**
 * Onglets accessibles (§6) : boutons avec rôle tab, flèches gauche/droite,
 * Début/Fin, Tab vers le panneau. Sans JavaScript, les trois aperçus
 * restent consultables dans l'ordre (classe html.js absente).
 */
export function ProductTabs({ panels }: ProductTabsProps) {
  const [active, setActive] = useState<PreviewTabId>(preview.tabs[0].id);
  const baseId = useId();
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const pendingFocus = useRef<PreviewTabId | null>(null);

  useEffect(() => {
    if (pendingFocus.current) {
      tabRefs.current[pendingFocus.current]?.focus();
      pendingFocus.current = null;
    }
  }, [active]);

  const select = (id: PreviewTabId, viaKeyboard = false) => {
    if (id === active) return;
    setActive(id);
    if (viaKeyboard) pendingFocus.current = id;
    track({ name: "preview_tab_change", tab: id });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const ids = preview.tabs.map((t) => t.id);
    const index = ids.indexOf(active);
    let next: PreviewTabId | null = null;
    if (event.key === "ArrowRight") next = ids[(index + 1) % ids.length];
    else if (event.key === "ArrowLeft") next = ids[(index - 1 + ids.length) % ids.length];
    else if (event.key === "Home") next = ids[0];
    else if (event.key === "End") next = ids[ids.length - 1];
    if (next) {
      event.preventDefault();
      select(next, true);
    }
  };

  return (
    <div className="product-tabs">
      <div
        role="tablist"
        aria-label="Aperçus du produit"
        className="mx-auto mb-8 flex w-full max-w-md gap-1 rounded-button bg-soft-tint p-1"
      >
        {preview.tabs.map((tab) => {
          const selected = tab.id === active;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[tab.id] = el;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(tab.id)}
              onKeyDown={onKeyDown}
              className={cn(
                "min-h-11 flex-1 rounded-[8px] px-3 text-[15px] font-semibold transition-colors duration-150",
                selected ? "bg-card text-brand shadow-card" : "text-ink-muted hover:text-brand",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-10">
        {preview.tabs.map((tab) => {
          const selected = tab.id === active;
          return (
            <figure
              key={tab.id}
              role="tabpanel"
              id={`${baseId}-panel-${tab.id}`}
              aria-labelledby={`${baseId}-tab-${tab.id}`}
              tabIndex={0}
              data-active={selected}
              className="product-panel rounded-card"
            >
              {panels[tab.id]}
              <figcaption className="mt-5 text-center text-ink-muted">
                <span className="block font-semibold text-brand [html:not(.js)_&]:mb-1">{tab.label}</span>
                {tab.caption}
              </figcaption>
            </figure>
          );
        })}
      </div>
    </div>
  );
}
