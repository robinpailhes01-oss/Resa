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
        <li>Mollie B.V. (Pays-Bas) : encaissement et prélèvement de l’abonnement des établissements ; les données de paiement sont saisies chez Mollie uniquement. SumUp sert de solution de secours.</li>
        <li>Mollie B.V. (Pays-Bas), pour les établissements qui ont relié leur compte : paiement de l’acompte ou de la prestation par leurs clients. La carte est saisie chez Mollie ; {offer.brandName} ne conserve que le montant, le statut du paiement et le rendez-vous concerné.</li>
        <li>Telegram : messages de service envoyés à l’équipe {offer.brandName} (nouvelle inscription, paiement, retour utilisateur), sans donnée de client final.</li>
        <li>Google (Places API) : uniquement lorsqu’un établissement choisit d’importer sa fiche Google ; aucune donnée de client final n’est transmise à Google.</li>
      </ul>

      <h2>Comptes professionnels et clients des établissements</h2>
      <p>
        Lorsqu’un professionnel crée un compte, {offer.brandName} traite son identité, son email, les informations de son
        établissement et les données de facturation, pour fournir le service et respecter ses obligations comptables (factures
        conservées dix ans). Les données des clients finaux d’un établissement (nom, email, téléphone, rendez-vous) sont
        traitées pour le compte de cet établissement, qui en est responsable ; elles servent uniquement aux réservations, aux
        rappels et aux demandes d’avis, et sont supprimées à la fermeture du compte selon les conditions de vente.
      </p>

      <h2>Prospection commerciale entre professionnels</h2>
      <p>
        {offer.brandName} peut écrire à des établissements de beauté dont l’adresse professionnelle est publiée (fiche Google,
        site internet) pour leur présenter le service. Les données utilisées sont le nom de l’établissement, son adresse, son
        téléphone, son site et son email professionnel. Base légale : intérêt légitime de {offer.brandName} à promouvoir son
        offre auprès de professionnels. Ces données sont conservées trois ans au plus après le dernier contact. Chaque
        destinataire peut s’opposer à tout moment, en répondant simplement « non merci » à l’email ou en écrivant
        {offer.supportEmail ? (
          <>
            {" "}
            à <a href={`mailto:${offer.supportEmail}`}>{offer.supportEmail}</a>
          </>
        ) : (
          " à l’adresse de contact"
        )}
        : il est alors inscrit sur une liste d’opposition et n’est plus jamais contacté.
      </p>

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

      <h2 id="cookies">Cookies et mesure d’audience</h2>
      <p>Le site dépose les cookies suivants, tous propres à Reso sauf mention contraire :</p>
      <ul>
        <li>
          <strong>Session</strong> : maintient la connexion d’un professionnel à son espace. Strictement nécessaire, sans
          consentement.
        </li>
        <li>
          <strong>Choix de cookies</strong> (<code>reso_consent</code>) : retient votre accord ou votre refus pendant 6 mois.
        </li>
        <li>
          <strong>Origine de la visite</strong> (<code>reso_src</code>) : la campagne qui vous a amené (paramètres « utm » de
          l’adresse), conservée 30 jours et rattachée à votre compte si vous vous inscrivez, pour savoir quelles campagnes
          amènent des inscriptions. Elle ne contient aucun identifiant publicitaire sans votre accord.
        </li>
        <li>
          <strong>Avec votre accord seulement</strong> : le Pixel de Meta Platforms Ireland (cookies <code>_fbp</code> et{" "}
          <code>_fbc</code>) mesure l’efficacité de nos publicités sur Facebook et Instagram. Si vous avez accepté, les étapes
          de votre parcours (inscription, démarrage de l’essai, première réservation, abonnement) sont aussi transmises à Meta
          depuis nos serveurs, avec votre adresse email chiffrée par hachage, jamais en clair.
        </li>
      </ul>
      <p>
        Les visites sont aussi comptées de façon agrégée, par jour et par campagne, sans aucun identifiant de personne. Les
        pages de réservation des établissements et leurs clients ne font l’objet d’aucune mesure publicitaire. Vous pouvez
        modifier votre choix à tout moment avec le lien « Gérer les cookies » en bas de page.
      </p>

      <h2>Sécurité</h2>
      <p>
        Le formulaire est protégé contre les abus (limitation du nombre de tentatives, validation serveur). Les liens de
        confirmation utilisent des jetons à usage unique, stockés sous forme d’empreinte, valables 48 heures.
      </p>
    </SimplePage>
  );
}
