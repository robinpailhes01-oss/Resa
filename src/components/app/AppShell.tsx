import type { ReactNode } from "react";
import Link from "next/link";
import { CalendarDays, CreditCard, ExternalLink, LayoutDashboard, LogOut, Mail, Settings, Sparkles, UserRound, Users } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import type { Establishment } from "@/server/auth/guards";
import { AccessBanner } from "./AccessBanner";
import { FeedbackWidget } from "./FeedbackWidget";
import { signOut } from "@/server/auth/actions";
import { NavLink } from "./NavLink";

type Item = { href: string; label: string; icon: typeof LayoutDashboard; exact?: boolean };

/** Trois familles : le quotidien, le catalogue, le compte. Les libellés de groupe n'existent que sur grand écran. */
const groups: Array<{ label: string; items: Item[] }> = [
  {
    label: "Pilotage",
    items: [
      { href: "/app", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
      { href: "/app/agenda", label: "Agenda", icon: CalendarDays },
      { href: "/app/clients", label: "Clients", icon: UserRound },
    ],
  },
  {
    label: "Mon établissement",
    items: [
      { href: "/app/prestations", label: "Prestations", icon: Sparkles },
      { href: "/app/equipe", label: "Équipe", icon: Users },
      { href: "/app/emails", label: "Emails automatiques", icon: Mail },
    ],
  },
  {
    label: "Compte",
    items: [
      { href: "/app/abonnement", label: "Abonnement", icon: CreditCard },
      { href: "/app/parametres", label: "Paramètres", icon: Settings },
    ],
  },
];

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

export function AppShell({ establishment, children }: { establishment: Establishment | null; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-page md:flex">
      <aside className="border-b border-line bg-card md:sticky md:top-0 md:flex md:h-screen md:w-[272px] md:shrink-0 md:flex-col md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-5 pb-2 pt-4 md:px-6 md:pb-5 md:pt-7">
          <Link href="/app" className="inline-flex rounded-md" aria-label="Reso – tableau de bord">
            <Logo height={26} />
          </Link>
          {establishment ? (
            <a href={`/r/${establishment.slug}`} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-[12px] font-medium text-ink-muted hover:text-brand md:hidden">
              Ma page <ExternalLink className="size-3.5" />
            </a>
          ) : null}
        </div>

        {establishment ? (
          <div className="mx-4 mb-4 hidden items-center gap-3 rounded-2xl border border-line bg-page px-3 py-3 md:flex">
            <span aria-hidden="true" className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-powder-deep font-display text-[15px] font-medium text-page">
              {initials(establishment.name)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold text-ink">{establishment.name}</p>
              <a href={`/r/${establishment.slug}`} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-[12px] text-ink-muted hover:text-brand">
                Voir ma page <ExternalLink className="size-3" />
              </a>
            </div>
          </div>
        ) : null}

        {establishment ? (
          <nav aria-label="Navigation de l’espace" className="px-3 pb-3 md:flex-1 md:overflow-y-auto">
            <ul className="flex gap-1 overflow-x-auto md:flex-col md:gap-5 md:overflow-visible">
              {groups.map((group) => (
                <li key={group.label} className="contents md:block">
                  <p className="eyebrow mb-1.5 hidden px-3 md:block">{group.label}</p>
                  <ul className="contents md:flex md:flex-col md:gap-0.5">
                    {group.items.map((item) => (
                      <li key={item.href} className="shrink-0">
                        <NavLink href={item.href} exact={item.exact} icon={<item.icon className="size-[18px]" strokeWidth={1.7} />}>
                          {item.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        <div className="hidden border-t border-line px-4 py-4 md:block">
          <form action={signOut}>
            <button type="submit" className="inline-flex min-h-10 w-full items-center gap-3 rounded-xl px-3 text-[14px] font-medium text-ink-muted transition-colors hover:bg-soft-tint/60 hover:text-ink">
              <LogOut className="size-[18px]" strokeWidth={1.7} /> Se déconnecter
            </button>
          </form>
        </div>
      </aside>

      <main id="contenu" className="min-w-0 flex-1 px-4 py-6 md:px-10 md:py-10 lg:px-14">
        <div className="mx-auto w-full max-w-[1120px]">
          {establishment ? <AccessBanner establishment={establishment} /> : null}
          {children}
        </div>
      </main>
      <FeedbackWidget />
    </div>
  );
}
