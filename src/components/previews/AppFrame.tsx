import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type AppFrameProps = {
  /** Description courte lue par les technologies d'assistance à la place du contenu fictif. */
  alt: string;
  children: ReactNode;
  className?: string;
  padded?: boolean;
};

/**
 * Cadre commun des aperçus produit : fond lilas discret, carte blanche
 * avec ombre unique (§3). Le contenu intérieur est décoratif et remplacé
 * par une description courte pour les lecteurs d'écran.
 */
export function AppFrame({ alt, children, className, padded = true }: AppFrameProps) {
  return (
    <div
      role="img"
      aria-label={alt}
      className={cn("@container", padded && "", className)}
    >
      <div
        aria-hidden="true"
        className="overflow-hidden rounded-card bg-card text-ink shadow-preview ring-1 ring-line select-none"
      >
        {children}
      </div>
    </div>
  );
}

export function Avatar({ initials, tone = "soft", size = "md" }: { initials: string; tone?: "soft" | "accent" | "brand"; size?: "sm" | "md" }) {
  const tones = {
    soft: "bg-soft text-brand",
    accent: "bg-accent-tint text-brand",
    brand: "bg-brand text-white",
  };
  const sizes = { sm: "size-6 text-[9px]", md: "size-8 text-[11px]" };
  return (
    <span className={cn("inline-flex shrink-0 items-center justify-center rounded-full font-bold", tones[tone], sizes[size])}>
      {initials}
    </span>
  );
}
