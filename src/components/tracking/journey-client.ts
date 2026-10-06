"use client";

/** Signale une étape du parcours depuis l'espace pro (lien copié, erreur). Ne bloque jamais l'interface. */
export function reportJourney(name: "link_copied" | "error", detail?: string) {
  try {
    void fetch("/api/track/journey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, detail }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // La mesure ne doit jamais casser l'espace pro.
  }
}
