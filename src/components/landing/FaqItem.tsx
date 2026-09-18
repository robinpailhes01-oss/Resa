"use client";

import { useId, useState } from "react";
import { Minus, Plus } from "lucide-react";

type FaqItemProps = { question: string; answer: string };

/**
 * Accordéon FAQ (§8, §11) : bouton pleine largeur avec aria-expanded.
 * La réponse est toujours dans le HTML ; sans JavaScript elle reste visible.
 */
export function FaqItem({ question, answer }: FaqItemProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonId = `${panelId}-button`;

  return (
    <li className="border-b border-line">
      <h3 className="text-[17px] leading-6 md:text-[18px]">
        <button
          type="button"
          id={buttonId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
          className="flex min-h-14 w-full items-center justify-between gap-4 py-4 text-left font-semibold text-brand transition-colors hover:text-brand-hover"
        >
          <span>{question}</span>
          <span aria-hidden="true" className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-soft-tint">
            {open ? <Minus className="size-4" /> : <Plus className="size-4" />}
          </span>
        </button>
      </h3>
      <div id={panelId} role="region" aria-labelledby={buttonId} data-open={open} className="faq-panel">
        <div>
          <p className="prose-measure pb-5 text-ink-muted">{answer}</p>
        </div>
      </div>
    </li>
  );
}
