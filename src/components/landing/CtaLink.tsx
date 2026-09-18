"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { offer } from "@/config/offer";
import { track, type Placement } from "@/lib/analytics";

type CtaLinkProps = {
  href: string;
  placement: Placement;
  /** true si le lien mène au vrai parcours de création de compte. */
  signup?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "inverse";
  size?: "md" | "compact";
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
};

/** Bouton d'appel à l'action instrumenté (cta_click / signup_click). */
export function CtaLink({ placement, signup, ...props }: CtaLinkProps) {
  return (
    <Button
      {...props}
      onClick={() => {
        track({ name: "cta_click", placement, launch_mode: offer.launchMode });
        if (signup) track({ name: "signup_click", placement });
      }}
    />
  );
}
