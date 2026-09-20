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
  const active =
    pathname === href || (!exact && pathname.startsWith(`${href}/`));
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-[14px] font-medium transition-colors",
        active
          ? "bg-soft-tint text-brand"
          : "text-ink-muted hover:bg-page hover:text-brand",
      )}
    >
      {icon}
      {children}
    </Link>
  );
}
