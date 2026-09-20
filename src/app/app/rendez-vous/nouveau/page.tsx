import type { Metadata } from "next";
import { ActionForm } from "@/components/app/ActionForm";
import {
  Grid2,
  SelectInput,
  TextArea,
  TextInput,
} from "@/components/app/Fields";
import { Card, PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/Button";
import { formatDuration, isDateKey, todayDateKey } from "@/lib/time";
import { requireEstablishment } from "@/server/auth/guards";
import { createManualBookingAction } from "@/server/app/actions/bookings";
import { listPractitioners } from "@/server/app/practitioners";
import { listServices } from "@/server/app/services";

export const metadata: Metadata = { title: "Nouveau rendez-vous" };

export default async function NouveauRendezVousPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { establishment } = await requireEstablishment();
  const params = await searchParams;
  const date =
    typeof params.date === "string" && isDateKey(params.date)
      ? params.date
      : todayDateKey(establishment.timezone);
  const [practitioners, services] = await Promise.all([
    listPractitioners(establishment.id),
    listServices(establishment.id),
  ]);
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Nouveau rendez-vous"
        intro="Pour une cliente au téléphone ou sur place. Le créneau est vérifié à l’enregistrement."
      />
      <Card>
        <ActionForm
          action={createManualBookingAction}
          submitLabel="Enregistrer le rendez-vous"
          aside={
            <Button
              href={`/app/agenda?date=${date}`}
              variant="ghost"
              size="compact"
            >
              Annuler
            </Button>
          }
        >
          <>
            <Grid2>
              <SelectInput
                id="practitionerId"
                name="practitionerId"
                label="Praticien"
                options={practitioners.map((p) => ({
                  value: p.id,
                  label: p.name,
                }))}
                defaultValue={
                  typeof params.practitioner === "string"
                    ? params.practitioner
                    : practitioners[0]?.id
                }
              />
              <SelectInput
                id="serviceId"
                name="serviceId"
                label="Prestation"
                placeholder="Prestation libre"
                options={services.map((s) => ({
                  value: s.id,
                  label: `${s.name} · ${formatDuration(s.durationMin)}`,
                }))}
                help="Choisissez une prestation, ou laissez « Prestation libre » et précisez ci-dessous."
              />
            </Grid2>
            <Grid2>
              <TextInput
                id="serviceName"
                name="serviceName"
                label="Intitulé si prestation libre"
                maxLength={80}
                placeholder="Retouche"
              />
              <TextInput
                id="durationMin"
                name="durationMin"
                label="Durée si prestation libre (minutes)"
                type="number"
                min={5}
                max={720}
                step={5}
                defaultValue={60}
              />
            </Grid2>
            <Grid2>
              <TextInput
                id="date"
                name="date"
                label="Date"
                type="date"
                required
                defaultValue={date}
              />
              <TextInput
                id="time"
                name="time"
                label="Heure"
                type="time"
                required
                step={300}
                defaultValue={
                  typeof params.time === "string" ? params.time : "10:00"
                }
              />
            </Grid2>
            <h2 className="mt-2 text-[18px]">Cliente</h2>
            <Grid2>
              <TextInput
                id="firstName"
                name="firstName"
                label="Prénom"
                required
                maxLength={60}
              />
              <TextInput
                id="lastName"
                name="lastName"
                label="Nom"
                maxLength={60}
              />
            </Grid2>
            <Grid2>
              <TextInput
                id="email"
                name="email"
                label="Email (pour la confirmation et le rappel)"
                type="email"
                maxLength={254}
              />
              <TextInput
                id="phone"
                name="phone"
                label="Téléphone"
                type="tel"
                maxLength={30}
              />
            </Grid2>
            <TextArea
              id="notes"
              name="notes"
              label="Note interne (facultatif)"
              maxLength={600}
            />
          </>
        </ActionForm>
      </Card>
    </div>
  );
}
