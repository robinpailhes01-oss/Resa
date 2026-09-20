import type { Metadata } from "next";
import { ActionForm } from "@/components/app/ActionForm";
import { TextInput, Toggle } from "@/components/app/Fields";
import { Card, PageHeader } from "@/components/app/PageHeader";
import { requireEstablishment } from "@/server/auth/guards";
import { updateNotificationSettingsAction } from "@/server/app/actions/establishment";
import { getNotificationSettings } from "@/server/app/notifications";

export const metadata: Metadata = { title: "Emails automatiques" };

export default async function EmailsPage() {
  const { establishment } = await requireEstablishment();
  const s = await getNotificationSettings(establishment.id);
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Emails automatiques"
        intro="Les bons messages, au bon moment. Envoyés au nom de votre établissement."
      />
      <Card>
        <ActionForm
          action={updateNotificationSettingsAction}
          submitLabel="Enregistrer"
        >
          <>
            <Toggle
              id="confirmationEnabled"
              name="confirmationEnabled"
              label="Confirmation de réservation"
              help="Juste après la réservation, avec le lien pour annuler."
              defaultChecked={s.confirmationEnabled}
            />
            <Toggle
              id="reminderEnabled"
              name="reminderEnabled"
              label="Rappel de rendez-vous"
              help="Avant le rendez-vous."
              defaultChecked={s.reminderEnabled}
            />
            <TextInput
              id="reminderHours"
              name="reminderHours"
              label="Envoyer le rappel (heures avant)"
              type="number"
              min={1}
              max={168}
              defaultValue={s.reminderHours}
            />
            <Toggle
              id="reviewEnabled"
              name="reviewEnabled"
              label="Demande d’avis"
              help="Après un rendez-vous terminé."
              defaultChecked={s.reviewEnabled}
            />
            <TextInput
              id="reviewDelayHours"
              name="reviewDelayHours"
              label="Envoyer la demande d’avis (heures après)"
              type="number"
              min={1}
              max={168}
              defaultValue={s.reviewDelayHours}
            />
            <TextInput
              id="reviewSubject"
              name="reviewSubject"
              label="Objet de l’email d’avis"
              maxLength={120}
              defaultValue={s.reviewSubject}
            />
            <TextInput
              id="reviewUrl"
              name="reviewUrl"
              label="Lien de votre page d’avis"
              type="url"
              placeholder="https://g.page/r/…"
              defaultValue={s.reviewUrl ?? ""}
              help="Google, Planity, Facebook… Le bouton « Partager mon avis » y renverra."
            />
            <Toggle
              id="notifyProOnBooking"
              name="notifyProOnBooking"
              label="Me prévenir à chaque réservation et annulation en ligne"
              help={`Envoyé à ${establishment.publicEmail ?? "votre adresse de connexion"} (modifiable dans Paramètres, email de contact).`}
              defaultChecked={s.notifyProOnBooking}
            />
          </>
        </ActionForm>
      </Card>
    </div>
  );
}
