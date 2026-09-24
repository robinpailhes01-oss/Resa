import type { Metadata } from "next";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { SimplePage } from "@/components/pages/SimplePage";
import { offer } from "@/config/offer";

export const metadata: Metadata = {
  title: "Mentions légales",
  alternates: { canonical: "/mentions-legales" },
};

/**
 * Mentions légales (§16). Les informations de société, d'hébergeur et de
 * contact proviennent de la configuration ; tant qu'elles ne sont pas
 * fournies, la page l'indique explicitement et n'invente rien.
 */
export default function MentionsLegalesPage() {
  const host = offer.hostingProvider;
  const publisher = offer.legalEntity;
  const ready = Boolean(publisher && host && offer.supportEmail);

  return (
    <SimplePage title="Mentions légales">
      {!ready ? (
        <StatusMessage tone="pending" className="mb-8">
          Version de préproduction : l’identité de l’éditeur, l’hébergeur et l’adresse de contact seront renseignés avant la
          publication publique. Aucun texte définitif n’est publié tant que ces informations ne sont pas validées.
        </StatusMessage>
      ) : null}

      <h2>Éditeur du site</h2>
      <p>{publisher ?? "Identité de l’éditeur : à renseigner (RESO_LEGAL_ENTITY)."}</p>
      {offer.legalId ? <p>SIREN : {offer.legalId}</p> : null}
      {offer.vatNumber ? <p>TVA intracommunautaire : {offer.vatNumber}</p> : null}
      {offer.publicationDirector ? <p>Directeur ou directrice de la publication : {offer.publicationDirector}</p> : null}

      <h2>Contact</h2>
      <p>
        {offer.supportEmail ? (
          <a href={`mailto:${offer.supportEmail}`}>{offer.supportEmail}</a>
        ) : (
          "Adresse de contact : à renseigner (RESO_SUPPORT_EMAIL)."
        )}
      </p>

      <h2>Hébergement</h2>
      <p>{host}</p>
      <p>
        Base de données hébergée par Supabase Inc. dans l’Union européenne (région AWS eu-west-1, Irlande). Emails envoyés par
        Resend Inc. Paiements de l’abonnement traités par SumUp Payments Limited et SumUp Limited (SumUp) : {offer.brandName} ne
        stocke aucune donnée de carte bancaire.
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        Le contenu de ce site (textes, interfaces, logotype {offer.brandName}) est protégé. Les aperçus de produit et les données
        « Maison Alba » sont fictifs et servent uniquement d’illustration.
      </p>
    </SimplePage>
  );
}
