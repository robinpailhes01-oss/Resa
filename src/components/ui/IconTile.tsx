import type { ComponentType, SVGProps } from "react";
import { cn } from "@/lib/cn";

type Tone = "brand" | "accent" | "soft" | "success";

const tones: Record<Tone, string> = {
  brand: "text-brand",
  accent: "text-[#C9773F]",
  soft: "text-[#7B5E8E]",
  success: "text-success",
};

type IconTileProps = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  tone?: Tone;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = { sm: "size-8 [&_svg]:size-4", md: "size-10 [&_svg]:size-5", lg: "size-12 [&_svg]:size-6" };

/** Tuile d'icône : carré blanc arrondi, ombre douce, glyphe coloré. */
export function IconTile({ icon: Icon, tone = "brand", size = "md", className }: IconTileProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-xl bg-card shadow-[0_2px_8px_rgba(73,51,68,0.08),0_0_0_1px_rgba(217,209,216,0.9)]",
        sizes[size],
        tones[tone],
        className,
      )}
    >
      <Icon strokeWidth={2} />
    </span>
  );
}
