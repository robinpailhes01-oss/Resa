"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function NavLink({
  href,
  icon,
  children,
  exact = false,
}: {
  href: string;
  icon: ReactNode;
  children: ReactNode;
  /** Actif uniquement sur l'URL exacte (pour la racine de l'espace). */
  exact?: boolean;
}) {
  const pathname = usePathname();
  const active = pathname === href || (!exact && pathname.startsWith(`${href}/`));
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex min-h-10 items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2 text-[14px] transition-colors",
        active ? "bg-soft-tint font-semibold text-ink" : "font-medium text-ink-muted hover:bg-soft-tint/60 hover:text-ink",
      )}
    >
      {active ? <span aria-hidden="true" className="absolute inset-y-2 left-0 hidden w-[3px] rounded-full bg-brand md:block" /> : null}
      <span className={cn("shrink-0 transition-colors", active ? "text-brand" : "text-ink-muted group-hover:text-brand")}>{icon}</span>
      {children}
    </Link>
  );
}
