"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { consentBanner as t } from "@/content/fr/acquisition";
import { ATTRIBUTION_COOKIE, ATTRIBUTION_MAX_AGE_S, attributionFromUrl, decodeAttribution, encodeAttribution, isTrackedPath, withoutAdIds } from "@/lib/attribution";
import { CONSENT_COOKIE, CONSENT_EVENT, CONSENT_MAX_AGE_S, CONSENT_OPEN_EVENT, parseConsent, readCookie, type ConsentChoice } from "@/lib/consent";

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || "";
const VISIT_KEY = "reso_visit_sent";

type Fbq = ((...args: unknown[]) => void) & { callMethod?: (...args: unknown[]) => void; queue: unknown[]; loaded: boolean; version: string; push: unknown };

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

function setCookie(name: string, value: string, maxAge: number) {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${value}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`;
}

/** Charge le Pixel Meta (code officiel « fbevents.js »), une seule fois. */
function loadPixel() {
  if (!PIXEL_ID || window.fbq) return;
  const fbq = function (...args: unknown[]) {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue.push(args);
  } as Fbq;
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];
  window.fbq = fbq;
  window._fbq = fbq;
  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);
  fbq("init", PIXEL_ID);
}

/** Choix de cookies lu dans `document.cookie`, mis à jour à chaque changement (événement CONSENT_EVENT). */
const SSR = "ssr";
const readConsentCookie = () => readCookie(document.cookie, CONSENT_COOKIE) ?? "";
function subscribeConsent(onChange: () => void) {
  window.addEventListener(CONSENT_EVENT, onChange);
  return () => window.removeEventListener(CONSENT_EVENT, onChange);
}

/** Événements internes du site (src/lib/analytics.ts) traduits pour Meta. */
const META_EVENTS: Record<string, [method: "track" | "trackCustom", name: string]> = {
  pricing_view: ["track", "ViewContent"],
  signup_click: ["trackCustom", "SignupClick"],
  cta_click: ["trackCustom", "CtaClick"],
  waitlist_accepted: ["track", "Lead"],
};

/**
 * Mesure du site Reso : origine des visites, bandeau de consentement, Pixel Meta.
 * Rien ne s'exécute dans l'espace pro, l'admin, ni sur les pages des salons et de leurs clients.
 */
export function Tracking() {
  const pathname = usePathname();
  const tracked = isTrackedPath(pathname);
  const stored = useSyncExternalStore(subscribeConsent, readConsentCookie, () => SSR);
  const ready = stored !== SSR;
  const consent = parseConsent(stored);
  const [open, setOpen] = useState(false);

  // Origine du premier contact, visite comptée une fois par session.
  useEffect(() => {
    if (!tracked) return;
    const choice = parseConsent(readConsentCookie());
    const existing = decodeAttribution(readCookie(document.cookie, ATTRIBUTION_COOKIE));
    const fresh = attributionFromUrl(new URL(location.href), document.referrer || null, new Date());
    if (fresh && !existing) {
      setCookie(ATTRIBUTION_COOKIE, encodeAttribution(choice === "ads" ? fresh : withoutAdIds(fresh)), ATTRIBUTION_MAX_AGE_S);
    }
    try {
      if (!sessionStorage.getItem(VISIT_KEY)) {
        sessionStorage.setItem(VISIT_KEY, "1");
        const origin = existing ?? fresh;
        void fetch("/api/track/visit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ utm_source: origin?.utm_source ?? "", utm_campaign: origin?.utm_campaign ?? "", utm_content: origin?.utm_content ?? "" }),
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // Stockage indisponible (navigation privée) : la visite n'est pas comptée.
    }
  }, [tracked]);

  // Pixel : chargé seulement après accord, PageView à chaque page suivie.
  useEffect(() => {
    if (!tracked || consent !== "ads" || !PIXEL_ID) return;
    loadPixel();
    window.fbq?.("track", "PageView");
  }, [tracked, consent, pathname]);

  // Événements du site vers Meta, et réouverture du bandeau depuis « Gérer les cookies ».
  useEffect(() => {
    const onTrack = (e: Event) => {
      if (consent !== "ads" || !window.fbq) return;
      const detail = (e as CustomEvent<{ event: string }>).detail;
      const mapped = META_EVENTS[detail?.event];
      if (mapped) window.fbq(mapped[0], mapped[1]);
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("reso:track", onTrack);
    window.addEventListener(CONSENT_OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener("reso:track", onTrack);
      window.removeEventListener(CONSENT_OPEN_EVENT, onOpen);
    };
  }, [consent]);

  const choose = (choice: ConsentChoice) => {
    setCookie(CONSENT_COOKIE, choice, CONSENT_MAX_AGE_S);
    setOpen(false);
    if (choice === "ads") {
      // Le clic Meta encore présent dans l'adresse est rattaché maintenant que l'accord est donné.
      const existing = decodeAttribution(readCookie(document.cookie, ATTRIBUTION_COOKIE));
      const fresh = attributionFromUrl(new URL(location.href), document.referrer || null, new Date());
      if (fresh?.fbclid && (!existing || !existing.fbclid)) {
        setCookie(ATTRIBUTION_COOKIE, encodeAttribution({ ...(existing ?? fresh), fbclid: fresh.fbclid, fbclidAt: fresh.fbclidAt }), ATTRIBUTION_MAX_AGE_S);
      }
    } else {
      const existing = decodeAttribution(readCookie(document.cookie, ATTRIBUTION_COOKIE));
      if (existing?.fbclid) setCookie(ATTRIBUTION_COOKIE, encodeAttribution(withoutAdIds(existing)), ATTRIBUTION_MAX_AGE_S);
    }
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: choice }));
  };

  const show = ready && tracked && Boolean(PIXEL_ID) && (consent === null || open);
  if (!show) return null;

  return (
    <div role="dialog" aria-live="polite" aria-label={t.label} className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl rounded-2xl border border-line bg-card p-4 shadow-[0_20px_50px_rgba(31,39,51,0.18)] sm:inset-x-6 sm:bottom-6 sm:p-5">
      <p className="text-[14px] leading-6 text-ink">
        {t.text}{" "}
        <Link href="/confidentialite#cookies" className="font-semibold text-brand underline underline-offset-2">
          {t.more}
        </Link>
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => choose("none")} className="min-h-11 flex-1 rounded-full border border-ink/15 bg-card px-5 text-[15px] font-semibold text-ink">
          {t.refuse}
        </button>
        <button type="button" onClick={() => choose("ads")} className="min-h-11 flex-1 rounded-full bg-ink px-5 text-[15px] font-semibold text-white">
          {t.accept}
        </button>
      </div>
    </div>
  );
}

/** Lien « Gérer les cookies » (pied de page, politique de confidentialité). */
export function ManageCookiesButton({ className }: { className?: string }) {
  if (!PIXEL_ID) return null;
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new CustomEvent(CONSENT_OPEN_EVENT))}>
      {t.manage}
    </button>
  );
}
