"use client";

import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}

/** Garde l'origine de campagne lorsque l'inscription ouvre une autre page. */
export function useAttributionHref(href: string) {
  return useSyncExternalStore(subscribe, () => {
    if (href !== "/preinscription") return href;
    const current = new URLSearchParams(window.location.search);
    const params = new URLSearchParams();
    for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content"]) {
      const value = current.get(key);
      if (value) params.set(key, value.slice(0, 64));
    }
    return params.size ? `${href}?${params}` : href;
  }, () => href);
}
