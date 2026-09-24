import type { ReactNode } from "react";
import Link from "next/link";
import {
  CalendarDays,
  LogOut,
  Mail,
  Settings,
  Sparkles,
  Users,
  UserRound,
  ExternalLink,
  LayoutDashboard,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import type { Establishment } from "@/server/auth/guards";
import { AccessBanner } from "./AccessBanner";
import { FeedbackWidget } from "./FeedbackWidget";
import { signOut } from "@/server/auth/actions";
import { cn } from "@/lib/cn";
import { NavLink } from "./NavLink";

const items = [
  {
    href: "/app",
    label: "Tableau de bord",
    icon: LayoutDashboard,
    exact: true,
  },
  { href: "/app/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/app/clients", label: "Clients", icon: UserRound },
  { href: "/app/prestations", label: "Prestations", icon: Sparkles },
  { href: "/app/equipe", label: "Équipe", icon: Users },
  { href: "/app/emails", label: "Emails automatiques", icon: Mail },
  { href: "/app/parametres", label: "Paramètres", icon: Settings },
];

export function AppShell({
  establishment,
  children,
}: {
  establishment: Establishment | null;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-page md:flex">
      <aside className="border-b border-line bg-card md:sticky md:top-0 md:flex md:h-screen md:w-60 md:shrink-0 md:flex-col md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-5 py-4 md:py-6">
          <Link
            href="/app"
            className="inline-flex rounded-md"
            aria-label="Reso – tableau de bord"
          >
            <Logo height={24} />
          </Link>
          {establishment ? (
            <a
              href={`/r/${establishment.slug}`}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1 text-[12px] font-medium text-ink-muted hover:text-brand md:hidden"
            >
              Ma page <ExternalLink className="size-3.5" />
            </a>
          ) : null}
        </div>
        {establishment ? (
          <nav
            aria-label="Navigation de l’espace"
            className="px-3 pb-3 md:flex-1"
          >
            <ul className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
              {items.map((item) => (
                <li key={item.href} className="shrink-0">
                  <NavLink
                    href={item.href}
                    exact={item.exact}
                    icon={<item.icon className="size-4" strokeWidth={1.8} />}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
        <div className={cn("hidden border-t border-line px-4 py-4 md:block")}>
          {establishment ? (
            <div className="mb-3 min-w-0">
              <div className="truncate text-[14px] font-semibold text-ink">
                {establishment.name}
              </div>
              <a
                href={`/r/${establishment.slug}`}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-1 text-[12px] text-ink-muted hover:text-brand"
              >
                Voir ma page de réservation <ExternalLink className="size-3" />
              </a>
            </div>
          ) : null}
          <form action={signOut}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-md text-[13px] font-medium text-ink-muted hover:text-brand"
            >
              <LogOut className="size-4" /> Se déconnecter
            </button>
          </form>
        </div>
      </aside>
      <main id="contenu" className="min-w-0 flex-1 px-4 py-6 md:px-10 md:py-10">
        {establishment ? <AccessBanner establishment={establishment} /> : null}
        {children}
      </main>
      <FeedbackWidget />
    </div>
  );
}
