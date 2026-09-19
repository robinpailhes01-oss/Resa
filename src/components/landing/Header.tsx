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

/** Barre flottante blanche, navigation compacte et menu tactile sur téléphone. */
export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const primary = byMode(cta.primary);
  const compactLabel = byMode(nav.compactCta);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
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
    <header className="sticky top-0 z-40 pt-3 md:pt-4">
      <div className="container-page !max-w-[960px]">
        <div
          className={cn(
            "flex h-14 items-center justify-between gap-4 rounded-2xl bg-card/95 pl-4 pr-1.5 ring-1 backdrop-blur-md transition-shadow duration-200 md:h-16 md:pl-5",
            scrolled ? "shadow-[0_12px_40px_-12px_rgba(105,80,232,0.18)] ring-line" : "shadow-card ring-line",
          )}
        >
          <Link href="/" className="inline-flex items-center rounded-md" aria-label={`${offer.brandName} – accueil`}>
            <Logo height={30} />
          </Link>

          <nav aria-label="Navigation principale" className="hidden md:block">
            <ul className="flex items-center gap-6">
              {nav.links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="inline-flex min-h-11 items-center rounded-md text-[13px] font-medium text-ink-muted transition-colors hover:text-brand">
                    {link.label}
                  </a>
                </li>
              ))}
              {offer.launchMode === "live" && offer.loginUrl ? (
                <li>
                  <a href={offer.loginUrl} className="rounded-md py-2 text-[14px] font-medium text-ink/80 hover:text-brand">
                    {nav.login}
                  </a>
                </li>
              ) : null}
            </ul>
          </nav>

          <div className="flex items-center gap-1">
            <span className="hidden md:block">
              <Button href={primary.href} onClick={onCta} size="compact" className="rounded-xl px-4">
                {primary.label}
              </Button>
            </span>
            <button
              ref={toggleRef}
              type="button"
              className="inline-flex size-11 items-center justify-center rounded-xl text-ink hover:bg-soft-tint md:hidden"
              aria-expanded={open}
              aria-controls={menuId}
              aria-label={open ? nav.closeMenu : nav.openMenu}
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>
      </div>

      <div id={menuId} hidden={!open} className="container-page mt-2 md:hidden">
        <nav aria-label="Navigation mobile" className="rounded-2xl bg-card px-5 py-3 shadow-preview ring-1 ring-line">
          <ul className="flex flex-col">
            {nav.links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => close(false)}
                  className="block rounded-md py-3 text-[17px] font-medium text-ink hover:text-brand"
                >
                  {link.label}
                </a>
              </li>
            ))}
            {offer.launchMode === "live" && offer.loginUrl ? (
              <li>
                <a href={offer.loginUrl} className="block rounded-md py-3 text-[17px] font-medium text-ink hover:text-brand">
                  {nav.login}
                </a>
              </li>
            ) : null}
            <li className="pb-2 pt-3">
              <Button href={primary.href} onClick={() => { onCta(); close(false); }} fullWidth>
                {compactLabel}
              </Button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
