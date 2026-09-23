import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type MarqueeProps = {
  children: ReactNode;
  className?: string;
  /** Défile de gauche à droite au lieu de droite à gauche. */
  reverse?: boolean;
  /** Met le défilement en pause au survol. */
  pauseOnHover?: boolean;
  /** Durée d'un tour complet (CSS `--duration`). */
  duration?: string;
  /** Texte annoncé aux lecteurs d'écran pour la piste. */
  label?: string;
  /** Nombre de copies de la piste pour remplir les grands écrans. */
  repeat?: number;
};

/**
 * Bandeau défilant en CSS uniquement (aucune bibliothèque). Le contenu est
 * dupliqué pour un défilement continu ; la copie est masquée aux lecteurs
 * d'écran. Avec prefers-reduced-motion, le bandeau devient une rangée
 * fixe que l'on peut faire défiler au doigt ou à la souris.
 */
export function Marquee({ children, className, reverse = false, pauseOnHover = true, duration = "40s", label, repeat = 4 }: MarqueeProps) {
  return (
    <div className={cn("marquee", className)} data-reverse={reverse} data-pause={pauseOnHover} style={{ "--duration": duration } as React.CSSProperties} aria-label={label}>
      {Array.from({ length: Math.max(2, repeat) }, (_, i) => (
        <ul key={i} className="marquee-track" aria-hidden={i > 0 ? "true" : undefined}>
          {children}
        </ul>
      ))}
    </div>
  );
}
