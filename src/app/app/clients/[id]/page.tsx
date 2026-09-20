import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/app/ActionForm";
import { Grid2, TextArea, TextInput } from "@/components/app/Fields";
import { Card, PageHeader } from "@/components/app/PageHeader";
import { formatDateTimeFr, formatPriceCents } from "@/lib/time";
import { requireEstablishment } from "@/server/auth/guards";
import { updateClientAction } from "@/server/app/actions/bookings";
import { listBookingsForClient } from "@/server/app/bookings";
import { getClient } from "@/server/app/clients";

export const metadata: Metadata = { title: "Cliente" };

const labels = {
  pending: "En attente",
  confirmed: "Confirmé",
  completed: "Terminé",
  cancelled: "Annulé",
  no_show: "Absent",
} as const;

export default async function ClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { establishment } = await requireEstablishment();
  const { id } = await params;
  const client = await getClient(establishment.id, id);
  if (!client) notFound();
  const bookings = await listBookingsForClient(establishment.id, client.id);
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={`${client.firstName} ${client.lastName}`.trim()}
        intro={
          [client.email, client.phone].filter(Boolean).join(" · ") || undefined
        }
      />
      <Card className="mb-6">
        <ActionForm
          action={updateClientAction}
          submitLabel="Enregistrer"
          variant="secondary"
        >
          <>
            <input type="hidden" name="id" value={client.id} />
            <Grid2>
              <TextInput
                id="firstName"
                name="firstName"
                label="Prénom"
                required
                maxLength={60}
                defaultValue={client.firstName}
              />
              <TextInput
                id="lastName"
                name="lastName"
                label="Nom"
                maxLength={60}
                defaultValue={client.lastName}
              />
            </Grid2>
            <Grid2>
              <TextInput
                id="email"
                name="email"
                label="Email"
                type="email"
                maxLength={254}
                defaultValue={client.email ?? ""}
              />
              <TextInput
                id="phone"
                name="phone"
                label="Téléphone"
                type="tel"
                maxLength={30}
                defaultValue={client.phone ?? ""}
              />
            </Grid2>
            <TextArea
              id="notes"
              name="notes"
              label="Notes (préférences, allergies…)"
              maxLength={1000}
              defaultValue={client.notes ?? ""}
            />
          </>
        </ActionForm>
      </Card>
      <h2 className="mb-3 text-[20px]">Historique</h2>
      <Card className="!p-0">
        {bookings.length === 0 ? (
          <p className="px-5 py-6 text-[14px] text-ink-muted">
            Aucun rendez-vous.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {bookings.map((b) => (
              <li key={b.id}>
                <Link
                  href={`/app/rendez-vous/${b.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-page"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-[15px] font-semibold text-ink">
                      {b.serviceName}
                    </div>
                    <div className="text-[13px] text-ink-muted">
                      {formatDateTimeFr(b.startsAt, establishment.timezone)} ·{" "}
                      {b.practitionerName}
                    </div>
                  </div>
                  <div className="text-right text-[13px]">
                    <div className="font-medium text-ink">
                      {b.priceCents > 0 ? formatPriceCents(b.priceCents) : ""}
                    </div>
                    <div className="text-ink-muted">{labels[b.status]}</div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
