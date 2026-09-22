"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { offer } from "@/config/offer";
import { byMode, cta, nav } from "@/content/fr/landing";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { useAttributionHref } from "@/lib/useAttributionHref";

/**
 * Navigation blanche, fine et flottante : logo, liens de sections, CTA noir.
 * Sticky, avec une ombre très douce après le scroll. Les sections ont une marge
 * d'ancrage (--nav-offset) pour que leurs titres ne passent jamais dessous.
 */
export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const primary = byMode(cta.primary);
  const primaryHref = useAttributionHref(primary.href);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = useCallback((restoreFocus: boolean) => {
    setOpen(false);
    if (restoreFocus) toggleRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close(true);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  const onCta = () => {
    track({ name: "cta_click", placement: "header", launch_mode: offer.launchMode });
    if (offer.launchMode === "live") track({ name: "signup_click", placement: "header" });
  };

  return (
    <header className="sticky top-0 z-40 pt-2 md:pt-4">
      <div className="container-page">
        <div
          className={cn(
            "flex h-12 items-center justify-between gap-4 rounded-2xl border bg-card/90 pl-4 pr-1.5 backdrop-blur-md transition-[box-shadow,border-color] duration-300 md:h-14 md:pl-5 md:pr-2",
            scrolled || open ? "border-line shadow-[0_8px_30px_-12px_rgba(23,23,27,0.14)]" : "border-transparent shadow-none",
          )}
        >
          <Link href="/" className="inline-flex items-center rounded-md" aria-label={`${offer.brandName} – accueil`}>
            <Logo height={26} />
          </Link>

          <nav aria-label="Navigation principale" className="hidden md:block">
            <ul className="flex items-center gap-7">
              {nav.links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="inline-flex min-h-11 items-center rounded-md text-[14px] font-medium text-ink-muted transition-colors hover:text-ink">
                    {link.label}
                  </a>
                </li>
              ))}
              {offer.launchMode === "live" && offer.loginUrl ? (
                <li>
                  <a href={offer.loginUrl} className="inline-flex min-h-11 items-center rounded-md text-[14px] font-medium text-ink-muted hover:text-ink">
                    {nav.login}
                  </a>
                </li>
              ) : null}
            </ul>
          </nav>

          <div className="flex items-center gap-1">
            <span className="hidden md:block">
              <Button href={primaryHref} onClick={onCta} size="compact">
                {primary.label}
              </Button>
            </span>
            <button
              ref={toggleRef}
              type="button"
              className="inline-flex size-11 items-center justify-center rounded-xl text-ink hover:bg-page md:hidden"
              aria-expanded={open}
              aria-controls={menuId}
              aria-label={open ? nav.closeMenu : nav.openMenu}
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </div>

      <div id={menuId} hidden={!open} className="container-page mt-2 md:hidden">
        <nav aria-label="Navigation mobile" className="card px-4 py-2 shadow-lift">
          <ul className="flex flex-col divide-y divide-line">
            {nav.links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => close(false)}
                  className="block rounded-md py-3.5 text-[16px] font-medium text-ink hover:text-brand"
                >
                  {link.label}
                </a>
              </li>
            ))}
            {offer.launchMode === "live" && offer.loginUrl ? (
              <li>
                <a href={offer.loginUrl} className="block rounded-md py-3.5 text-[16px] font-medium text-ink hover:text-brand">
                  {nav.login}
                </a>
              </li>
            ) : null}
            <li className="pb-2 pt-3">
              <Button href={primaryHref} onClick={() => { onCta(); close(false); }} fullWidth>
                {primary.label}
              </Button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
