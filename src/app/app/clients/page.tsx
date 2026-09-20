import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { Card, EmptyState, PageHeader } from "@/components/app/PageHeader";
import { formatDateKeyShort, toZonedParts } from "@/lib/time";
import { requireEstablishment } from "@/server/auth/guards";
import { listClients } from "@/server/app/clients";

export const metadata: Metadata = { title: "Clients" };

export default async function ClientsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { establishment } = await requireEstablishment();
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const clients = await listClients(establishment.id, q);
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Clients"
        intro="Votre fichier se remplit automatiquement à chaque réservation."
        actions={
          <form action="/app/clients" className="relative">
            <label htmlFor="q" className="sr-only">
              Rechercher
            </label>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
            <input id="q" name="q" defaultValue={q} placeholder="Nom, email, téléphone" className="min-h-10 rounded-lg border border-line bg-card pl-9 pr-3 text-[14px] text-ink" />
          </form>
        }
      />
      {clients.length === 0 ? (
        <EmptyState title={q ? "Aucun résultat" : "Aucune cliente pour l’instant"} text={q ? "Essayez un autre nom ou un autre email." : "Les clientes apparaîtront ici dès leur première réservation, en ligne ou ajoutée par vous."} />
      ) : (
        <Card className="!p-0">
          <ul className="divide-y divide-line">
            {clients.map((c) => (
              <li key={c.id}>
                <Link href={`/app/clients/${c.id}`} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-page md:px-6">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-soft-tint text-[13px] font-bold text-brand">
                    {(c.firstName[0] ?? "").toUpperCase()}
                    {(c.lastName[0] ?? "").toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[16px] font-semibold text-ink">{`${c.firstName} ${c.lastName}`.trim()}</div>
                    <div className="truncate text-[13px] text-ink-muted">{[c.email, c.phone].filter(Boolean).join(" · ") || "Sans coordonnées"}</div>
                  </div>
                  <div className="text-right text-[13px] text-ink-muted">
                    <div>{c.bookingCount} rendez-vous</div>
                    {c.lastBookingAt ? <div>Dernier : {formatDateKeyShort(toZonedParts(c.lastBookingAt, establishment.timezone).dateKey)}</div> : null}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
