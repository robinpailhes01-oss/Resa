"use client";

import { useEffect } from "react";
import { reportJourney } from "./journey-client";

const MAX_PER_PAGE = 3;

/**
 * Erreurs JavaScript rencontrées par un pro dans son espace : signalées (message court,
 * sans données saisies) pour repérer les bugs qui font abandonner. 3 au plus par page.
 */
export function ErrorReporter() {
  useEffect(() => {
    let sent = 0;
    const send = (message: string) => {
      if (sent >= MAX_PER_PAGE) return;
      sent += 1;
      reportJourney("error", `écran ${location.pathname} : ${message}`.slice(0, 160));
    };
    const onError = (e: ErrorEvent) => send(e.message || "erreur");
    const onRejection = (e: PromiseRejectionEvent) => send(e.reason instanceof Error ? e.reason.message : "erreur");
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);
  return null;
}
