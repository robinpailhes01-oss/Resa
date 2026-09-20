import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/app/ConfirmButton";
import { Card, PageHeader } from "@/components/app/PageHeader";
import { ServiceForm } from "@/components/app/ServiceForm";
import { requireEstablishment } from "@/server/auth/guards";
import { deleteServiceAction, updateServiceAction } from "@/server/app/actions/catalog";
import { listPractitioners } from "@/server/app/practitioners";
import { getService } from "@/server/app/services";

export const metadata: Metadata = { title: "Prestation" };

export default async function PrestationPage({ params }: { params: Promise<{ id: string }> }) {
  const { establishment } = await requireEstablishment();
  const { id } = await params;
  const [service, practitioners] = await Promise.all([getService(establishment.id, id), listPractitioners(establishment.id)]);
  if (!service) notFound();
  const remove = deleteServiceAction.bind(null, service.id);
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title={service.name}
        actions={
          <ConfirmButton action={remove} variant="danger" confirm="Supprimer cette prestation ? Si des rendez-vous y sont liés, elle sera simplement masquée.">
            Supprimer
          </ConfirmButton>
        }
      />
      <Card>
        <ServiceForm action={updateServiceAction} service={service} practitioners={practitioners} submitLabel="Enregistrer" />
      </Card>
    </div>
  );
}
