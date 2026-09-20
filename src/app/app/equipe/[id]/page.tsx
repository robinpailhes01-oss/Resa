import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/app/ConfirmButton";
import { HoursForm } from "@/components/app/HoursForm";
import { Card, PageHeader } from "@/components/app/PageHeader";
import { PractitionerForm } from "@/components/app/PractitionerForm";
import { requireEstablishment } from "@/server/auth/guards";
import { deletePractitionerAction, updatePractitionerAction } from "@/server/app/actions/catalog";
import { listOpeningHours } from "@/server/app/hours";
import { getPractitioner } from "@/server/app/practitioners";

export const metadata: Metadata = { title: "Praticien" };

export default async function PraticienPage({ params }: { params: Promise<{ id: string }> }) {
  const { establishment } = await requireEstablishment();
  const { id } = await params;
  const practitioner = await getPractitioner(establishment.id, id);
  if (!practitioner) notFound();
  const hours = await listOpeningHours(establishment.id, practitioner.id);
  const remove = deletePractitionerAction.bind(null, practitioner.id);
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={practitioner.name}
        intro={practitioner.roleTitle ?? undefined}
        actions={
          <ConfirmButton action={remove} variant="danger" confirm="Retirer ce praticien ? S’il a des rendez-vous, il sera simplement désactivé.">
            Retirer
          </ConfirmButton>
        }
      />
      <Card>
        <PractitionerForm action={updatePractitionerAction} practitioner={practitioner} submitLabel="Enregistrer" />
      </Card>
      <h2 className="mb-3 mt-10 text-[20px]">Horaires de {practitioner.name}</h2>
      <Card>
        <HoursForm
          hours={hours}
          practitionerId={practitioner.id}
          intro={hours.length === 0 ? "Ce praticien suit les horaires de l’établissement. Enregistrez des horaires ici pour lui donner un planning propre." : "Horaires propres à ce praticien. Ils remplacent ceux de l’établissement."}
        />
      </Card>
    </div>
  );
}
