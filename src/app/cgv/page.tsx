import type { Metadata } from "next";
import { SimplePage } from "@/components/pages/SimplePage";
import { offer } from "@/config/offer";
import { subscriptionAmounts, formatEuros } from "@/lib/billing";

export const metadata: Metadata = {
  title: "Conditions générales de vente",
  alternates: { canonical: "/cgv" },
};

/** CGV de l'abonnement Reso : essai, prix, paiement, durée, résiliation, suspension, données. */
export default function CgvPage() {
  const amounts = subscriptionAmounts(offer.monthlyPriceExVat, offer.vatRate);
  const brand = offer.brandName;
  return (
    <SimplePage title="Conditions générales de vente" intro="Version du 30 septembre 2026. Elles s’appliquent à tout établissement qui crée un compte sur Reso.">
      <h2>1. Éditeur et objet</h2>
      <p>
        {brand} est édité par {offer.legalEntity}
        {offer.legalId ? ` (SIREN ${offer.legalId})` : ""}. {brand} est un service en ligne de prise de rendez-vous, d’agenda et
        d’emails automatiques destiné aux professionnels de la beauté et du bien-être (« l’Établissement »). Les présentes
        conditions régissent l’abonnement au service.
      </p>

      <h2>2. Création de compte et essai gratuit</h2>
      <p>
        La création d’un compte est réservée aux professionnels. {offer.trialDays ? `Chaque établissement bénéficie d’un essai gratuit de ${offer.trialDays} jours à compter de la création de son espace, sans carte bancaire et sans engagement. ` : ""}
        À l’issue de l’essai, la page de réservation en ligne de l’Établissement est suspendue tant que l’abonnement n’est pas
        souscrit ; l’accès à l’espace professionnel et aux données reste ouvert.
      </p>

      <h2>3. Prix</h2>
      <p>
        L’abonnement est proposé à {formatEuros(amounts.exVatCents)} hors taxes par mois et par établissement, pour un
        établissement et jusqu’à {offer.practitionerLimit} praticiens
        {amounts.vatRate > 0 ? `, soit ${formatEuros(amounts.totalCents)} toutes taxes comprises (TVA ${amounts.vatRate.toLocaleString("fr-FR")} %)` : " (TVA non applicable, article 293 B du CGI)"}
        . {brand} ne prélève aucune commission sur les réservations. Les SMS, la caisse et le terminal de paiement ne sont pas
        inclus. Toute évolution du prix est annoncée par email au moins trente jours avant son application.
      </p>

      <h2>4. Paiement</h2>
      <p>
        L’abonnement est payable mensuellement et d’avance, par carte bancaire (ou prélèvement SEPA lorsqu’il est proposé), via
        le prestataire de paiement Mollie B.V. Le premier paiement enregistre le moyen de paiement de l’Établissement ; les
        mensualités suivantes sont ensuite prélevées automatiquement à chaque échéance, sans nouvelle démarche, jusqu’à
        résiliation. Les données de paiement sont saisies et conservées exclusivement chez le prestataire ; {brand} n’y a pas
        accès. Une facture numérotée est envoyée par email et disponible dans l’espace de l’Établissement après chaque
        paiement. En cas d’échec de prélèvement, l’Établissement dispose de trois jours pour régulariser ; au-delà, la page de
        réservation en ligne est suspendue jusqu’au règlement. Tout retard de paiement entraîne, de plein droit, des
        pénalités égales à trois fois le taux d’intérêt légal et une indemnité forfaitaire de recouvrement de 40 €.
      </p>
      <p>
        Encaissement des clients (facultatif) : l’Établissement peut relier son propre compte Mollie pour demander à ses
        clients un acompte ou le paiement de la prestation lors de la réservation en ligne. Ces sommes sont encaissées
        directement sur le compte Mollie de l’Établissement, selon le contrat qu’il a conclu avec Mollie B.V. ; {brand} ne les
        détient à aucun moment et ne prélève aucune commission. L’Établissement fixe la règle d’acompte, en informe ses clients
        dans ses conditions de réservation et reste seul responsable des remboursements, que {brand} déclenche
        automatiquement lorsqu’un rendez-vous est annulé par l’Établissement ou par le client dans le délai autorisé.
        L’Établissement peut déconnecter son compte Mollie à tout moment depuis son espace.
      </p>

      <h2>5. Durée et résiliation</h2>
      <p>
        L’abonnement est conclu pour un mois, renouvelable. L’Établissement peut résilier à tout moment depuis son espace ou
        par email à {offer.supportEmail ?? "l’adresse de contact"} ; la résiliation prend effet à la fin de la période déjà
        payée, sans remboursement au prorata. {brand} peut mettre fin au service moyennant un préavis de trente jours, avec
        restitution des données.
      </p>

      <h2>6. Obligations de l’Établissement</h2>
      <p>
        L’Établissement garantit l’exactitude des informations publiées sur sa page de réservation (prestations, prix,
        horaires, photos, mentions importées de sa fiche Google) et dispose des droits sur les contenus qu’il publie. Il
        informe ses clients des conditions applicables à leurs rendez-vous. Il utilise le service conformément à la loi et
        s’abstient de tout envoi non sollicité.
      </p>

      <h2>7. Disponibilité et responsabilité</h2>
      <p>
        {brand} met en œuvre les moyens raisonnables pour assurer un service disponible et sécurisé, sans garantie de
        fonctionnement ininterrompu. {brand} n’est pas partie aux prestations réalisées entre l’Établissement et ses clients.
        La responsabilité de {brand} est, en tout état de cause, limitée au montant des sommes versées au titre des trois
        derniers mois d’abonnement.
      </p>

      <h2>8. Données personnelles</h2>
      <p>
        {brand} traite les données de l’Établissement en tant que responsable de traitement, et les données de ses clients en
        tant que sous-traitant, pour le seul fonctionnement du service. Les modalités figurent dans la politique de
        confidentialité. À la fermeture du compte, l’Établissement peut demander l’export de ses données ; elles sont ensuite
        supprimées dans un délai de trois mois.
      </p>

      <h2>9. Droit applicable</h2>
      <p>
        Les présentes conditions sont soumises au droit français. En cas de litige, les parties recherchent une solution
        amiable avant toute action ; à défaut, les tribunaux de Marseille sont compétents.
      </p>
    </SimplePage>
  );
}
