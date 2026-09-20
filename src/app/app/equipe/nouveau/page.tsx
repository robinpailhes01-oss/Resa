import type { Metadata } from "next";
import { Card, PageHeader } from "@/components/app/PageHeader";
import { PractitionerForm } from "@/components/app/PractitionerForm";
import { requireEstablishment } from "@/server/auth/guards";
import { createPractitionerAction } from "@/server/app/actions/catalog";

export const metadata: Metadata = { title: "Nouveau praticien" };

export default async function NouveauPraticienPage() {
  await requireEstablishment();
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Nouveau praticien" />
      <Card>
        <PractitionerForm action={createPractitionerAction} submitLabel="Ajouter" />
      </Card>
    </div>
  );
}
