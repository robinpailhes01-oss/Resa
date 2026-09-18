/**
 * Événements de suivi (cahier des charges §15).
 *
 * Aucun outil tiers n'est chargé dans cette version : les événements sont
 * émis sur `window` (CustomEvent « reso:track ») et poussés dans
 * `window.dataLayer` s'il existe. Brancher un outil de mesure exige de
 * vérifier son régime de consentement avant d'écouter ces événements.
 * Aucune valeur de champ, email ou jeton ne transite ici.
 */
import type { LaunchMode } from "@/config/offer";

export type Placement = "header" | "hero" | "pricing" | "footer";

export type TrackEvent =
  | { name: "cta_click"; placement: Placement; launch_mode: LaunchMode }
  | { name: "pricing_view"; launch_mode: LaunchMode }
  | { name: "preview_tab_change"; tab: "agenda" | "booking" | "emails" }
  | { name: "waitlist_submit"; launch_mode: LaunchMode }
  | { name: "waitlist_accepted"; source: "landing" }
  | { name: "waitlist_error"; category: "validation" | "rate_limit" | "server" }
  | { name: "signup_click"; placement: Placement };

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function track(event: TrackEvent): void {
  if (typeof window === "undefined") return;
  const { name, ...props } = event;
  try {
    window.dispatchEvent(new CustomEvent("reso:track", { detail: { event: name, ...props } }));
    window.dataLayer?.push({ event: name, ...props });
  } catch {
    // Le suivi ne doit jamais casser la page.
  }
}
