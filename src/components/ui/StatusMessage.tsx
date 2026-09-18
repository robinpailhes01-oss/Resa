import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "success" | "error" | "pending";

const tones: Record<Tone, { box: string; icon: ReactNode }> = {
  success: {
    box: "bg-success-tint text-success border-success/30",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 20 20" className="size-5 shrink-0" fill="currentColor">
        <path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm3.7 6.2-4.4 4.6a.9.9 0 0 1-1.3 0L6.3 11a.9.9 0 1 1 1.3-1.3l1.1 1.1 3.7-3.9a.9.9 0 1 1 1.3 1.3Z" />
      </svg>
    ),
  },
  error: {
    box: "bg-error-tint text-error border-error/30",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 20 20" className="size-5 shrink-0" fill="currentColor">
        <path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm-.9 4.5h1.8v5h-1.8v-5Zm.9 8.3a1.1 1.1 0 1 1 0-2.2 1.1 1.1 0 0 1 0 2.2Z" />
      </svg>
    ),
  },
  pending: {
    box: "bg-soft-tint text-brand border-soft",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 20 20" className="size-5 shrink-0" fill="currentColor">
        <path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm.9 4v3.6l2.6 1.6a.9.9 0 1 1-.9 1.5l-3-1.8a.9.9 0 0 1-.5-.8V6a.9.9 0 0 1 1.8 0Z" />
      </svg>
    ),
  },
};

type StatusMessageProps = {
  tone: Tone;
  children: ReactNode;
  className?: string;
  id?: string;
};

/** Message d'état avec icône et texte ; l'annonce accessible est gérée par le parent (aria-live). */
export function StatusMessage({ tone, children, className, id }: StatusMessageProps) {
  return (
    <div
      id={id}
      className={cn("flex items-start gap-3 rounded-field border px-4 py-3 text-[15px] leading-6", tones[tone].box, className)}
    >
      <span className="mt-0.5">{tones[tone].icon}</span>
      <div>{children}</div>
    </div>
  );
}
