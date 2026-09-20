import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Card, PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/Button";
import { requireEstablishment } from "@/server/auth/guards";
import { PRACTITIONER_LIMIT, listPractitioners } from "@/server/app/practitioners";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Équipe" };

const dot = { soft: "bg-soft", accent: "bg-accent", success: "bg-[#8FC7A9]" } as const;

export default async function EquipePage() {
  const { establishment } = await requireEstablishment();
  const practitioners = await listPractitioners(establishment.id, true);
  const active = practitioners.filter((p) => p.active).length;
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Équipe"
        intro={`${active} praticien${active > 1 ? "s" : ""} actif${active > 1 ? "s" : ""} sur ${PRACTITIONER_LIMIT} inclus dans votre offre.`}
        actions={
          active < PRACTITIONER_LIMIT ? (
            <Button href="/app/equipe/nouveau" size="compact">
              <Plus aria-hidden="true" /> Ajouter un praticien
            </Button>
          ) : null
        }
      />
      <Card className="!p-0">
        <ul className="divide-y divide-line">
          {practitioners.map((p) => (
            <li key={p.id}>
              <Link href={`/app/equipe/${p.id}`} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-page md:px-6">
                <span className={cn("size-3 shrink-0 rounded-full", dot[p.color])} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[16px] font-semibold text-ink">{p.name}</span>
                    {!p.active ? <span className="rounded-full bg-page px-2 py-0.5 text-[11px] font-medium text-ink-muted ring-1 ring-line">Inactif</span> : null}
                  </div>
                  <div className="text-[13px] text-ink-muted">{p.roleTitle ?? "Praticien"}</div>
                </div>
                <span className="text-[13px] font-medium text-brand">Horaires et détails</span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
