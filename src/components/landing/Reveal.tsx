"use client";

import { useEffect } from "react";

/**
 * Active l'apparition unique des éléments `.reveal` (distance ≤ 12 px)
 * via IntersectionObserver. Sans JavaScript, tout est visible d'emblée.
 */
export function RevealObserver() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (elements.length === 0) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) {
      elements.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return null;
}
