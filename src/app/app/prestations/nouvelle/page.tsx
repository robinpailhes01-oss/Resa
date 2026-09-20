import type { Metadata } from "next";
import { Card, PageHeader } from "@/components/app/PageHeader";
import { ServiceForm } from "@/components/app/ServiceForm";
import { requireEstablishment } from "@/server/auth/guards";
import { createServiceAction } from "@/server/app/actions/catalog";
import { listPractitioners } from "@/server/app/practitioners";

export const metadata: Metadata = { title: "Nouvelle prestation" };

export default async function NouvellePrestationPage() {
  const { establishment } = await requireEstablishment();
  const practitioners = await listPractitioners(establishment.id);
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Nouvelle prestation" />
      <Card>
        <ServiceForm action={createServiceAction} practitioners={practitioners} submitLabel="Ajouter la prestation" />
      </Card>
    </div>
  );
}
