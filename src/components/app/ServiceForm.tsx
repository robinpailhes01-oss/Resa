import { ActionForm, type FormAction } from "@/components/app/ActionForm";
import { Checkbox, Grid2, TextArea, TextInput } from "@/components/app/Fields";
import { Button } from "@/components/ui/Button";
import type { Practitioner } from "@/server/app/practitioners";
import type { Service } from "@/server/app/services";

export function ServiceForm({
  action,
  service,
  practitioners,
  submitLabel,
}: {
  action: FormAction;
  service?: Service;
  practitioners: Practitioner[];
  submitLabel: string;
}) {
  return (
    <ActionForm
      action={action}
      submitLabel={submitLabel}
      aside={
        <Button href="/app/prestations" variant="ghost" size="compact">
          Annuler
        </Button>
      }
    >
      <>
        {service ? <input type="hidden" name="id" value={service.id} /> : null}
        <TextInput
          id="name"
          name="name"
          label="Nom de la prestation"
          placeholder="Soin du visage"
          required
          maxLength={80}
          defaultValue={service?.name}
        />
        <Grid2>
          <TextInput
            id="durationMin"
            name="durationMin"
            label="Durée (minutes)"
            type="number"
            min={5}
            max={720}
            step={5}
            required
            defaultValue={service?.durationMin ?? 60}
          />
          <TextInput
            id="price"
            name="price"
            label="Prix (€)"
            inputMode="decimal"
            placeholder="60"
            defaultValue={
              service
                ? (service.priceCents / 100).toString().replace(".", ",")
                : ""
            }
            help="Laissez vide pour ne pas afficher de prix."
          />
        </Grid2>
        <TextInput
          id="bufferMin"
          name="bufferMin"
          label="Temps de battement après (minutes)"
          type="number"
          min={0}
          max={240}
          step={5}
          defaultValue={service?.bufferMin ?? 0}
          help="Temps bloqué après la prestation, par exemple pour préparer la cabine."
        />
        <TextArea
          id="description"
          name="description"
          label="Description (facultatif)"
          maxLength={400}
          defaultValue={service?.description ?? ""}
          help="Visible par vos clientes sur la page de réservation."
        />
        {practitioners.length > 1 ? (
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-1 text-[15px] font-semibold text-ink">
              Réalisée par
            </legend>
            <p className="-mt-2 text-small text-ink-muted">
              Aucune case cochée = tous les praticiens.
            </p>
            {practitioners.map((p) => (
              <Checkbox
                key={p.id}
                id={`p-${p.id}`}
                name="practitionerIds"
                value={p.id}
                label={p.name}
                defaultChecked={service?.practitionerIds.includes(p.id)}
              />
            ))}
          </fieldset>
        ) : null}
        {service ? (
          <Checkbox
            id="active"
            name="active"
            label="Prestation proposée à la réservation"
            defaultChecked={service.active}
          />
        ) : null}
      </>
    </ActionForm>
  );
}
