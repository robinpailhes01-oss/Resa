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
  const host = process.env.RESO_HOSTING_PROVIDER?.trim() || null;
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
      {process.env.RESO_PUBLICATION_DIRECTOR?.trim() ? (
        <p>Directeur ou directrice de la publication : {process.env.RESO_PUBLICATION_DIRECTOR.trim()}</p>
      ) : null}

      <h2>Contact</h2>
      <p>
        {offer.supportEmail ? (
          <a href={`mailto:${offer.supportEmail}`}>{offer.supportEmail}</a>
        ) : (
          "Adresse de contact : à renseigner (RESO_SUPPORT_EMAIL)."
        )}
      </p>

      <h2>Hébergement</h2>
      <p>{host ?? "Hébergeur : à renseigner (RESO_HOSTING_PROVIDER)."}</p>

      <h2>Propriété intellectuelle</h2>
      <p>
        Le contenu de ce site (textes, interfaces, logotype {offer.brandName}) est protégé. Les aperçus de produit et les données
        « Maison Alba » sont fictifs et servent uniquement d’illustration.
      </p>
    </SimplePage>
  );
}
