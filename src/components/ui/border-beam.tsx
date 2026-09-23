import { cn } from "@/lib/cn";

type BorderBeamProps = {
  className?: string;
  /** Longueur du liseré lumineux, en pixels. */
  size?: number;
  /** Durée d'un tour complet. */
  duration?: string;
  /** Rayon des coins du parent (le liseré suit le même arrondi). */
  radius?: number;
};

/**
 * Liseré lumineux qui parcourt le bord de son parent (position: relative
 * requis). CSS uniquement : un dégradé se déplace sur un `offset-path`
 * rectangulaire et n'est visible qu'à travers un masque limité à la bordure.
 * Sans prise en charge d'`offset-path` ou avec prefers-reduced-motion, rien
 * ne s'affiche.
 */
export function BorderBeam({ className, size = 90, duration = "7s", radius = 32 }: BorderBeamProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("border-beam", className)}
      style={{ "--beam-size": `${size}px`, "--beam-duration": duration, "--beam-radius": `${radius}px` } as React.CSSProperties}
    />
  );
}
