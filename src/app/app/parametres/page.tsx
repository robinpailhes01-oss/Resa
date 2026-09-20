import type { Metadata } from "next";
import Link from "next/link";
import { ActionForm } from "@/components/app/ActionForm";
import {
  Grid2,
  SelectInput,
  TextArea,
  TextInput,
  Toggle,
} from "@/components/app/Fields";
import { Card, PageHeader } from "@/components/app/PageHeader";
import { CopyField } from "@/components/app/CopyField";
import { offer } from "@/config/offer";
import { requireEstablishment } from "@/server/auth/guards";
import { updateEstablishmentAction } from "@/server/app/actions/establishment";
import { changePasswordAction } from "@/server/auth/actions";
import { BUSINESS_TYPES } from "@/server/app/establishments";

export const metadata: Metadata = { title: "Paramètres" };

const STEPS = [5, 10, 15, 20, 30, 60].map((v) => ({
  value: String(v),
  label: `${v} minutes`,
}));

export default async function ParametresPage() {
  const { user, establishment: e } = await requireEstablishment();
  const bookingUrl = new URL(`/r/${e.slug}`, offer.siteUrl).toString();
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Paramètres"
        intro="Votre établissement, vos règles de réservation et votre compte."
      />
      <Card className="mb-6">
        <h2 className="text-[18px]">Votre lien de réservation</h2>
        <p className="mt-1 text-[14px] text-ink-muted">
          À placer sur votre site, votre bio Instagram ou dans vos messages.
        </p>
        <div className="mt-4">
          <CopyField value={bookingUrl} />
        </div>
        <p className="mt-3 text-[13px] text-ink-muted">
          Vos horaires d’ouverture se règlent dans{" "}
          <Link
            href="/app/parametres/horaires"
            className="font-medium text-brand underline underline-offset-4"
          >
            Horaires de l’établissement
          </Link>
          .
        </p>
      </Card>
      <Card>
        <ActionForm
          action={updateEstablishmentAction}
          submitLabel="Enregistrer"
        >
          <>
            <TextInput
              id="name"
              name="name"
              label="Nom de l’établissement"
              required
              maxLength={80}
              defaultValue={e.name}
            />
            <SelectInput
              id="businessType"
              name="businessType"
              label="Activité"
              options={BUSINESS_TYPES}
              defaultValue={e.businessType}
            />
            <TextArea
              id="description"
              name="description"
              label="Présentation (facultatif)"
              maxLength={600}
              defaultValue={e.description ?? ""}
              help="Quelques lignes affichées en haut de votre page de réservation."
            />
            <Grid2>
              <TextInput
                id="city"
                name="city"
                label="Ville"
                maxLength={80}
                defaultValue={e.city ?? ""}
              />
              <TextInput
                id="postalCode"
                name="postalCode"
                label="Code postal"
                maxLength={12}
                defaultValue={e.postalCode ?? ""}
              />
            </Grid2>
            <TextInput
              id="addressLine"
              name="addressLine"
              label="Adresse"
              maxLength={160}
              defaultValue={e.addressLine ?? ""}
            />
            <Grid2>
              <TextInput
                id="phone"
                name="phone"
                label="Téléphone"
                type="tel"
                maxLength={30}
                defaultValue={e.phone ?? ""}
              />
              <TextInput
                id="publicEmail"
                name="publicEmail"
                label="Email de contact"
                type="email"
                defaultValue={e.publicEmail ?? ""}
              />
            </Grid2>

            <h2 className="mt-4 text-[18px]">Règles de réservation en ligne</h2>
            <Toggle
              id="bookingEnabled"
              name="bookingEnabled"
              label="Réservation en ligne ouverte"
              help="Désactivez pour mettre votre page en pause."
              defaultChecked={e.bookingEnabled}
            />
            <Grid2>
              <SelectInput
                id="slotStepMin"
                name="slotStepMin"
                label="Pas des créneaux proposés"
                options={STEPS}
                defaultValue={String(e.slotStepMin)}
              />
              <TextInput
                id="minLeadHours"
                name="minLeadHours"
                label="Délai minimal avant un rendez-vous (heures)"
                type="number"
                min={0}
                max={168}
                defaultValue={Math.round(e.minLeadMin / 60)}
              />
            </Grid2>
            <TextArea
              id="bookingTerms"
              name="bookingTerms"
              label="Conditions de réservation (facultatif)"
              maxLength={1500}
              defaultValue={e.bookingTerms ?? ""}
              help="Affichées à la cliente avant qu’elle confirme, puis rappelées dans son email : retard toléré, acompte, politique d’annulation, accès…"
            />
            <Grid2>
              <TextInput
                id="maxHorizonDays"
                name="maxHorizonDays"
                label="Réservation possible jusqu’à (jours)"
                type="number"
                min={1}
                max={365}
                defaultValue={e.maxHorizonDays}
              />
              <TextInput
                id="cancellationHours"
                name="cancellationHours"
                label="Annulation en ligne possible jusqu’à (heures avant)"
                type="number"
                min={0}
                max={720}
                defaultValue={e.cancellationHours}
              />
            </Grid2>
          </>
        </ActionForm>
      </Card>
      <Card className="mt-6">
        <h2 className="text-[18px]">Votre compte</h2>
        <p className="mt-1 text-[14px] text-ink-muted">
          Connecté en tant que{" "}
          <span className="font-medium text-ink">{user.fullName}</span> (
          {user.email}).
          {user.emailVerifiedAt
            ? ""
            : " Adresse non confirmée : vérifiez votre boîte mail."}
        </p>
        <div className="mt-5">
          <ActionForm
            action={changePasswordAction}
            submitLabel="Changer le mot de passe"
            variant="secondary"
          >
            <>
              <TextInput
                id="currentPassword"
                name="currentPassword"
                label="Mot de passe actuel"
                type="password"
                autoComplete="current-password"
                required
              />
              <Grid2>
                <TextInput
                  id="newPassword"
                  name="newPassword"
                  label="Nouveau mot de passe"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  help="8 caractères minimum."
                />
                <TextInput
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Confirmer le nouveau mot de passe"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
              </Grid2>
            </>
          </ActionForm>
        </div>
        <p className="mt-4 text-[13px] text-ink-muted">
          Mot de passe oublié ? Utilisez{" "}
          <Link
            href="/mot-de-passe-oublie"
            className="font-medium text-brand underline underline-offset-4"
          >
            la réinitialisation par email
          </Link>
          .
        </p>
      </Card>
    </div>
  );
}
