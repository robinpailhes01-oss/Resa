import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ActionForm } from "@/components/app/ActionForm";
import { Grid2, SelectInput, TextInput } from "@/components/app/Fields";
import { Card, PageHeader } from "@/components/app/PageHeader";
import { getUserEstablishment, requireUser } from "@/server/auth/guards";
import { createEstablishmentAction } from "@/server/app/actions/establishment";
import { BUSINESS_TYPES } from "@/server/app/establishments";
import { GoogleImport } from "@/components/app/GoogleImport";
import { isGoogleImportEnabled } from "@/server/google/places";

export const metadata: Metadata = { title: "Bienvenue" };

export default async function BienvenuePage() {
  const user = await requireUser("/app/bienvenue");
  if (await getUserEstablishment(user.id)) redirect("/app/agenda");
  const googleEnabled = isGoogleImportEnabled();
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title={`Bienvenue, ${user.fullName.split(" ")[0]}`}
        intro="Créons votre établissement. Vous pourrez tout modifier ensuite dans les paramètres."
      />
      <Card>
        <ActionForm
          action={createEstablishmentAction}
          submitLabel="Créer mon établissement"
          pendingLabel="Création…"
        >
          <>
            {googleEnabled ? <GoogleImport /> : null}
            <TextInput
              id="name"
              name="name"
              label="Nom de l’établissement"
              placeholder="Maison Alba"
              required
              maxLength={80}
            />
            <SelectInput
              id="businessType"
              name="businessType"
              label="Activité"
              options={BUSINESS_TYPES}
              defaultValue="institut"
            />
            <Grid2>
              <TextInput
                id="city"
                name="city"
                label="Ville"
                autoComplete="address-level2"
                maxLength={80}
              />
              <TextInput
                id="postalCode"
                name="postalCode"
                label="Code postal"
                autoComplete="postal-code"
                inputMode="numeric"
                maxLength={12}
              />
            </Grid2>
            <TextInput
              id="addressLine"
              name="addressLine"
              label="Adresse (facultatif)"
              autoComplete="street-address"
              maxLength={160}
            />
            <Grid2>
              <TextInput
                id="phone"
                name="phone"
                label="Téléphone (facultatif)"
                type="tel"
                autoComplete="tel"
                maxLength={30}
              />
              <TextInput
                id="publicEmail"
                name="publicEmail"
                label="Email de contact (facultatif)"
                type="email"
                defaultValue={user.email}
                help="Adresse visible par vos clientes et utilisée pour leurs réponses."
              />
            </Grid2>
          </>
        </ActionForm>
      </Card>
    </div>
  );
}
