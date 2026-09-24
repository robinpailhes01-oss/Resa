import type { Metadata } from "next";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { SimplePage } from "@/components/pages/SimplePage";
import { offer } from "@/config/offer";

export const metadata: Metadata = {
  title: "Confidentialité",
  alternates: { canonical: "/confidentialite" },
};

const pendingDays = process.env.WAITLIST_PENDING_RETENTION_DAYS ?? "7";
const confirmedMonths = process.env.WAITLIST_CONFIRMED_RETENTION_MONTHS ?? "12";

/** Politique de confidentialité de la landing et de la liste d'attente (§15, §16). */
export default function ConfidentialitePage() {
  const controllerReady = Boolean(offer.legalEntity && offer.supportEmail);

  return (
    <SimplePage title="Confidentialité" intro={`Comment ${offer.brandName} utilise les données de ce site et de la liste d’attente.`}>
      {!controllerReady ? (
        <StatusMessage tone="pending" className="mb-8">
          Version de préproduction : l’identité du responsable de traitement et son contact seront renseignés avant l’ouverture
          publique du formulaire. Les durées ci-dessous sont des propositions à valider.
        </StatusMessage>
      ) : null}

      <p className="text-small text-ink-muted">Version {offer.privacyVersion}</p>

      <h2>Responsable du traitement</h2>
      <p>
        {offer.legalEntity ?? "Identité du responsable : à renseigner."}
        {offer.supportEmail ? (
          <>
            {" "}
            Contact : <a href={`mailto:${offer.supportEmail}`}>{offer.supportEmail}</a>.
          </>
        ) : null}
      </p>

      <h2>Données collectées par le formulaire</h2>
      <ul>
        <li>Votre adresse email (obligatoire).</li>
        <li>Votre type d’activité et la taille de votre équipe (facultatifs).</li>
        <li>La version de cette politique acceptée, la date de la demande et, le cas échéant, la campagne d’origine (paramètres UTM sans identifiant personnel).</li>
      </ul>
      <p>Aucun numéro de téléphone, nom d’établissement, adresse postale ou chiffre d’affaires n’est demandé.</p>

      <h2>Finalité et base légale</h2>
      <p>
        Ces données servent uniquement à vous informer de l’ouverture de {offer.brandName}, à votre demande. La demande est
        confirmée par un lien envoyé à votre adresse ; sans confirmation, aucune notification n’est envoyée. Cette inscription ne
        vaut pas abonnement à une newsletter : toute autre communication ferait l’objet d’une demande distincte et facultative.
      </p>

      <h2>Destinataires</h2>
      <p>
        Les données sont accessibles à l’équipe {offer.brandName} et à ses prestataires techniques d’hébergement de base de données
        et d’envoi d’emails, dans la limite nécessaire à ces services. Aucun fichier n’est vendu ni utilisé pour une autre activité.
      </p>

      <p>Sous-traitants techniques :</p>
      <ul>
        <li>Vercel Inc. (États-Unis) : hébergement du site et exécution de l’application, clauses contractuelles types.</li>
        <li>Supabase Inc. : base de données, hébergée dans l’Union européenne (Irlande).</li>
        <li>Resend Inc. : envoi des emails transactionnels (confirmations, rappels, demandes d’avis).</li>
        <li>SumUp : encaissement de l’abonnement des établissements ; les données de carte sont saisies chez SumUp uniquement.</li>
        <li>Google (Places API) : uniquement lorsqu’un établissement choisit d’importer sa fiche Google ; aucune donnée de cliente n’est transmise à Google.</li>
      </ul>

      <h2>Durées de conservation</h2>
      <ul>
        <li>Demande non confirmée : supprimée après {pendingDays} jours.</li>
        <li>Inscription confirmée : conservée {confirmedMonths} mois au plus, puis supprimée, ou dès votre retrait.</li>
      </ul>

      <h2>Vos droits</h2>
      <p>
        Vous pouvez retirer votre inscription à tout moment depuis le lien présent dans nos emails, sans créer de compte. Vous
        disposez également d’un droit d’accès, de rectification, d’effacement et d’opposition
        {offer.supportEmail ? (
          <>
            {" "}
            en écrivant à <a href={`mailto:${offer.supportEmail}`}>{offer.supportEmail}</a>
          </>
        ) : null}
        . Vous pouvez aussi saisir la CNIL.
      </p>

      <h2>Cookies et mesure d’audience</h2>
      <p>
        Cette version du site ne dépose aucun cookie publicitaire ni traceur soumis à consentement, et n’embarque aucun contenu
        tiers. Si un outil de mesure était ajouté, un mécanisme permettant d’accepter, de refuser et de modifier votre choix serait
        mis en place avant tout dépôt.
      </p>

      <h2>Sécurité</h2>
      <p>
        Le formulaire est protégé contre les abus (limitation du nombre de tentatives, validation serveur). Les liens de
        confirmation utilisent des jetons à usage unique, stockés sous forme d’empreinte, valables 48 heures.
      </p>
    </SimplePage>
  );
}
