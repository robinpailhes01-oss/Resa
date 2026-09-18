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
    <header
      className={cn(
        "sticky top-0 z-40 border-b bg-page/92 backdrop-blur-md transition-[border-color] duration-200 md:border-0 md:bg-transparent md:pt-4 md:backdrop-blur-none",
        scrolled ? "border-line" : "border-transparent",
      )}
    >
      <div className="container-page">
        <div
          className={cn(
            "flex h-14 items-center justify-between gap-4 md:h-16 md:rounded-full md:bg-card/90 md:pl-6 md:pr-2 md:ring-1 md:backdrop-blur-md md:transition-shadow md:duration-200",
            scrolled ? "md:shadow-preview md:ring-line" : "md:shadow-card md:ring-line/70",
          )}
        >
          <Link href="/" className="inline-flex items-center rounded-md" aria-label={`${offer.brandName} – accueil`}>
            <Logo height={24} />
          </Link>

          <nav aria-label="Navigation principale" className="hidden md:block">
            <ul className="flex items-center gap-7">
              {nav.links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="rounded-md py-2 text-[15px] font-medium text-ink transition-colors hover:text-brand"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              {offer.launchMode === "live" && offer.loginUrl ? (
                <li>
                  <a href={offer.loginUrl} className="rounded-md py-2 text-[15px] font-medium text-ink hover:text-brand">
                    {nav.login}
                  </a>
                </li>
              ) : null}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <span className="hidden md:block">
              <Button href={primary.href} onClick={onCta} size="compact" className="rounded-full px-5">
                {primary.label}
              </Button>
            </span>
            <span className="md:hidden">
              <Button href={primary.href} onClick={onCta} size="compact" className="rounded-full px-4">
                {compactLabel}
              </Button>
            </span>
            <button
              ref={toggleRef}
              type="button"
              className="inline-flex size-11 items-center justify-center rounded-full text-brand hover:bg-brand/5 md:hidden"
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
        <nav aria-label="Navigation mobile" className="rounded-3xl bg-card px-5 py-3 shadow-preview ring-1 ring-line">
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
          </ul>
        </nav>
      </div>
    </header>
  );
}
