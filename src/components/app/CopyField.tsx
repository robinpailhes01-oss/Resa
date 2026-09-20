"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyField({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-stretch gap-2">
      <input
        readOnly
        value={value}
        className="min-h-12 flex-1 rounded-field border border-line bg-page px-4 text-[15px] text-ink"
        onFocus={(e) => e.currentTarget.select()}
      />
      <button
        type="button"
        className="btn inline-flex min-h-12 items-center gap-2 rounded-xl bg-brand px-4 text-[14px] font-semibold text-white hover:bg-brand-hover"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            // Sélection manuelle possible dans le champ.
          }
        }}
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        {copied ? "Copié" : "Copier"}
      </button>
    </div>
  );
}
