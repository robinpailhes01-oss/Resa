"use client";

import { useTransition, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";

type ConfirmButtonProps = {
  action: () => Promise<void>;
  confirm?: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "md" | "compact";
  className?: string;
};

/** Bouton qui exécute une action serveur après confirmation. */
export function ConfirmButton({
  action,
  confirm,
  children,
  variant = "secondary",
  size = "compact",
  className,
}: ConfirmButtonProps) {
  const [pending, startTransition] = useTransition();
  const danger = variant === "danger";
  return (
    <Button
      type="button"
      variant={danger ? "secondary" : variant}
      size={size}
      disabled={pending}
      aria-busy={pending}
      className={`${danger ? "!text-error ring-error/40 hover:!bg-error-tint" : ""} ${className ?? ""}`}
      onClick={() => {
        if (confirm && !window.confirm(confirm)) return;
        startTransition(async () => {
          await action();
        });
      }}
    >
      {children}
    </Button>
  );
}
