"use client";

import { useEffect } from "react";
import { offer } from "@/config/offer";
import { track } from "@/lib/analytics";

/** pricing_view : 50 % du bloc prix visible pendant 1 s, une fois par page (§15). */
export function PricingViewTracker({ targetId }: { targetId: string }) {
  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target || !("IntersectionObserver" in window)) return;
    let timer: number | null = null;
    let sent = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (sent) return;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          timer = window.setTimeout(() => {
            sent = true;
            track({ name: "pricing_view", launch_mode: offer.launchMode });
            observer.disconnect();
          }, 1000);
        } else if (timer) {
          window.clearTimeout(timer);
          timer = null;
        }
      },
      { threshold: [0, 0.5, 1] },
    );
    observer.observe(target);
    return () => {
      if (timer) window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [targetId]);
  return null;
}
