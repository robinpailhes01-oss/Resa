"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Carte avec un projecteur lavande qui suit le curseur (ordinateur uniquement).
 * Aucun état React : la position est écrite dans des variables CSS.
 */
export function SpotlightCard({ children, className, as: Tag = "article", style }: { children: ReactNode; className?: string; as?: "article" | "div"; style?: React.CSSProperties }) {
  const ref = useRef<HTMLElement>(null);
  const onMove = (event: React.MouseEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--sx", `${event.clientX - rect.left}px`);
    el.style.setProperty("--sy", `${event.clientY - rect.top}px`);
  };
  return (
    <Tag ref={ref as React.RefObject<HTMLDivElement>} onMouseMove={onMove} className={cn("spotlight", className)} style={style}>
      <span aria-hidden="true" className="spotlight-glow" />
      {children}
    </Tag>
  );
}
