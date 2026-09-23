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
 * Navigation qui se transforme au scroll : barre pleine largeur et transparente
 * en haut de page, capsule blanche floutée dès que l'on descend, compacte tant
 * que l'on descend, restaurée dès que l'on remonte. Le lien de la section
 * visible est souligné. Les ancres gardent une marge (--nav-offset).
 */
export function Header() {
  const [open, setOpen] = useState(false);
  const [floating, setFloating] = useState(false);
  const [compact, setCompact] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const primary = byMode(cta.primary);
  const primaryHref = useAttributionHref(primary.href);

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;
    const update = () => {
      const y = window.scrollY;
      const delta = y - lastY;
      setFloating(y > 8);
      if (delta > 6) setCompact(y > 160);
      else if (delta < -6) setCompact(false);
      const marker = y + window.innerHeight * 0.34;
      let next: string | null = null;
      for (const link of nav.links) {
        const id = link.href.split("#")[1];
        const section = id ? document.getElementById(id) : null;
        if (section && section.offsetTop <= marker) next = link.href;
      }
      setActive(window.location.pathname === "/" ? next : null);
      lastY = y;
      frame = 0;
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
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
    <header className={cn("nav-root sticky top-0 z-40", (floating || open) && "is-floating", compact && !open && "is-compact")}>
      <div className="container-page">
        <div className="nav-shell">
          <Link href="/" className="inline-flex shrink-0 items-center rounded-md" aria-label={`${offer.brandName} – accueil`}>
            <Logo height={26} />
          </Link>

          <nav aria-label="Navigation principale" className="nav-links hidden md:block">
            <ul className="flex items-center gap-7">
              {nav.links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} aria-current={active === link.href ? "location" : undefined} className="nav-link inline-flex min-h-11 items-center text-[14px] font-medium text-ink-muted transition-colors hover:text-ink">
                    {link.label}
                  </a>
                </li>
              ))}
              {offer.launchMode === "live" && offer.loginUrl ? (
                <li>
                  <a href={offer.loginUrl} className="nav-link inline-flex min-h-11 items-center text-[14px] font-medium text-ink-muted hover:text-ink">
                    {nav.login}
                  </a>
                </li>
              ) : null}
            </ul>
          </nav>

          <div className="flex shrink-0 items-center gap-1">
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
                <a href={link.href} onClick={() => close(false)} className="block rounded-md py-3.5 text-[16px] font-medium text-ink hover:text-brand">
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
