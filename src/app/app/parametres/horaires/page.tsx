import type { Metadata } from "next";
import { HoursForm } from "@/components/app/HoursForm";
import { Card, PageHeader } from "@/components/app/PageHeader";
import { requireEstablishment } from "@/server/auth/guards";
import { listOpeningHours } from "@/server/app/hours";

export const metadata: Metadata = { title: "Horaires" };

export default async function HorairesPage() {
  const { establishment } = await requireEstablishment();
  const hours = await listOpeningHours(establishment.id, null);
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Horaires de l’établissement" intro="Ces horaires s’appliquent à toute l’équipe, sauf pour les praticiens qui ont leurs propres horaires." />
      <Card>
        <HoursForm hours={hours} practitionerId={null} />
      </Card>
    </div>
  );
}
