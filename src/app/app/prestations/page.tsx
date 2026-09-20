import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Card, EmptyState, PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/Button";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { formatDuration, formatPriceCents } from "@/lib/time";
import { requireEstablishment } from "@/server/auth/guards";
import { listPractitioners } from "@/server/app/practitioners";
import { listServices } from "@/server/app/services";

export const metadata: Metadata = { title: "Prestations" };

export default async function PrestationsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { establishment } = await requireEstablishment();
  const params = await searchParams;
  const [services, practitioners] = await Promise.all([listServices(establishment.id, true), listPractitioners(establishment.id)]);
  const byId = new Map(practitioners.map((p) => [p.id, p.name]));

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Prestations"
        intro="Ce que vos clientes peuvent réserver, avec la durée et le prix."
        actions={
          <Button href="/app/prestations/nouvelle" size="compact">
            <Plus aria-hidden="true" /> Ajouter une prestation
          </Button>
        }
      />
      {params.bienvenue ? (
        <StatusMessage tone="success" className="mb-6">
          Votre établissement est créé. Ajoutez maintenant vos prestations, puis votre équipe et vos horaires.
        </StatusMessage>
      ) : null}
      {services.length === 0 ? (
        <EmptyState
          title="Aucune prestation pour l’instant"
          text="Ajoutez votre première prestation : nom, durée et prix. Elle apparaîtra aussitôt sur votre page de réservation."
          action={
            <Button href="/app/prestations/nouvelle">
              <Plus aria-hidden="true" /> Ajouter une prestation
            </Button>
          }
        />
      ) : (
        <Card className="!p-0">
          <ul className="divide-y divide-line">
            {services.map((s) => (
              <li key={s.id}>
                <Link href={`/app/prestations/${s.id}`} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-page md:px-6">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-[16px] font-semibold text-ink">{s.name}</span>
                      {!s.active ? <span className="rounded-full bg-page px-2 py-0.5 text-[11px] font-medium text-ink-muted ring-1 ring-line">Masquée</span> : null}
                    </div>
                    <div className="mt-0.5 text-[13px] text-ink-muted">
                      {formatDuration(s.durationMin)}
                      {s.bufferMin ? ` + ${s.bufferMin} min de battement` : ""}
                      {" · "}
                      {s.practitionerIds.length === 0 ? "tous les praticiens" : s.practitionerIds.map((id) => byId.get(id)).filter(Boolean).join(", ")}
                    </div>
                  </div>
                  <div className="text-[16px] font-semibold text-brand">{s.priceCents > 0 ? formatPriceCents(s.priceCents) : "—"}</div>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
