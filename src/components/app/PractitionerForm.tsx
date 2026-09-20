import { ActionForm, type FormAction } from "@/components/app/ActionForm";
import {
  Checkbox,
  Grid2,
  SelectInput,
  TextInput,
} from "@/components/app/Fields";
import { Button } from "@/components/ui/Button";
import type { Practitioner } from "@/server/app/practitioners";

const COLORS = [
  { value: "soft", label: "Lilas" },
  { value: "accent", label: "Abricot" },
  { value: "success", label: "Vert" },
];

export function PractitionerForm({
  action,
  practitioner,
  submitLabel,
}: {
  action: FormAction;
  practitioner?: Practitioner;
  submitLabel: string;
}) {
  return (
    <ActionForm
      action={action}
      submitLabel={submitLabel}
      aside={
        <Button href="/app/equipe" variant="ghost" size="compact">
          Annuler
        </Button>
      }
    >
      <>
        {practitioner ? (
          <input type="hidden" name="id" value={practitioner.id} />
        ) : null}
        <Grid2>
          <TextInput
            id="name"
            name="name"
            label="Prénom"
            placeholder="Camille"
            required
            maxLength={80}
            defaultValue={practitioner?.name}
          />
          <TextInput
            id="roleTitle"
            name="roleTitle"
            label="Métier (facultatif)"
            placeholder="Esthéticienne"
            maxLength={80}
            defaultValue={practitioner?.roleTitle ?? ""}
          />
        </Grid2>
        <SelectInput
          id="color"
          name="color"
          label="Couleur dans l’agenda"
          options={COLORS}
          defaultValue={practitioner?.color ?? "soft"}
        />
        {practitioner ? (
          <Checkbox
            id="active"
            name="active"
            label="Praticien actif"
            help="Un praticien inactif n’apparaît plus à la réservation."
            defaultChecked={practitioner.active}
          />
        ) : null}
      </>
    </ActionForm>
  );
}
