import type { ComponentType, SVGProps } from "react";
import { cn } from "@/lib/cn";

type Tone = "brand" | "peach" | "mint" | "ice";
const tones: Record<Tone, string> = {
  brand: "bg-soft-tint text-brand",
  peach: "bg-accent-tint text-[#c2653a]",
  mint: "bg-success-tint text-success",
  ice: "bg-ice text-[#2f5ed6]",
};

type FloatCardProps = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  text?: string;
  tone?: Tone;
  /** Rotation en degrés (−2 à 2). */
  tilt?: number;
  /** Dérive lente de quelques pixels (désactivée en mouvement réduit). */
  drift?: boolean;
  /** Pilotée par la démonstration de l'agenda (apparition différée). */
  demo?: boolean;
  className?: string;
};

/**
 * Petite carte flottante posée devant une interface : fond blanc, bordure
 * légère, ombre fine, icône colorée. Décorative (état fictif du produit).
 */
export function FloatCard({ icon: Icon, title, text, tone = "brand", tilt = 0, drift = false, demo = false, className }: FloatCardProps) {
  return (
    <div
      aria-hidden="true"
      data-float={drift && !demo ? "" : undefined}
      className={cn("float-card pointer-events-none absolute z-10 flex items-center gap-2.5 rounded-2xl p-2.5 pr-3.5", demo && "demo-card", className)}
      style={{ "--tilt": `${tilt}deg` } as React.CSSProperties}
    >
      <span className={cn("inline-flex size-8 shrink-0 items-center justify-center rounded-xl", tones[tone])}>
        <Icon className="size-4" strokeWidth={1.9} />
      </span>
      <div className="min-w-0 leading-tight">
        <div className="whitespace-nowrap text-[12px] font-semibold text-ink">{title}</div>
        {text ? <div className="mt-0.5 whitespace-nowrap text-[11px] text-ink-muted">{text}</div> : null}
      </div>
    </div>
  );
}
