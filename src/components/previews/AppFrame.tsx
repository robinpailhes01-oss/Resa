import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type AppFrameProps = {
  /** Description courte lue par les technologies d'assistance à la place du contenu fictif. */
  alt: string;
  children: ReactNode;
  className?: string;
};

/**
 * Cadre commun des aperçus produit : fenêtre blanche, bordure fine.
 * Le contenu intérieur est décoratif (données fictives) et remplacé par une
 * description courte pour les lecteurs d'écran.
 */
export function AppFrame({ alt, children, className }: AppFrameProps) {
  return (
    <div role="img" aria-label={alt} className={cn("@container", className)}>
      <div aria-hidden="true" className="product-window select-none overflow-hidden text-ink">
        {children}
      </div>
    </div>
  );
}

export function Avatar({ initials, tone = "soft", size = "md" }: { initials: string; tone?: "soft" | "accent" | "mint"; size?: "sm" | "md" }) {
  const tones = {
    soft: "bg-soft-tint text-brand",
    accent: "bg-accent-tint text-[#b4613a]",
    mint: "bg-success-tint text-success",
  };
  const sizes = { sm: "size-6 text-[10px]", md: "size-8 text-[11px]" };
  return (
    <span className={cn("inline-flex shrink-0 items-center justify-center rounded-full font-bold", tones[tone], sizes[size])}>
      {initials}
    </span>
  );
}
