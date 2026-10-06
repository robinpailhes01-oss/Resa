/** Textes du bandeau de consentement et de la page interne « Acquisition ». */

export const consentBanner = {
  label: "Cookies",
  text: "Avec votre accord, nous utilisons un cookie Meta pour savoir quelles publicités vous ont amené ici. Le site fonctionne de la même façon si vous refusez.",
  accept: "Accepter",
  refuse: "Refuser",
  more: "En savoir plus",
  manage: "Gérer les cookies",
};

export const acquisitionAdmin = {
  title: "Acquisition",
  intro: "Le parcours des pros, de la publicité à l’abonnement payé, par origine. Les chiffres viennent de la base Reso ; les dépenses et impressions restent dans Meta.",
  periods: [
    { days: 7, label: "7 jours" },
    { days: 30, label: "30 jours" },
    { days: 0, label: "Depuis le début" },
  ],
  steps: {
    visits: "Visites",
    signups: "Inscriptions",
    onboarded: "Établissement créé",
    published: "Page publiée",
    activated: "1re réservation",
    paid: "Abonnés payants",
  },
  stepHelp: {
    visits: "Arrivées sur le site (une par session), toutes origines.",
    signups: "Comptes créés.",
    onboarded: "Établissements créés : l’essai démarre.",
    published: "Réservation ouverte, au moins une prestation et un praticien avec des horaires.",
    activated: "Première réservation en ligne d’une cliente (hors réservations avec l’email de la pro).",
    paid: "Premier paiement d’abonnement Reso encaissé (Mollie).",
  },
  bySource: "Par origine",
  source: "Origine",
  direct: "Direct ou inconnu",
  total: "Total",
  empty: "Aucune donnée sur la période.",
  meta: {
    title: "Envoi à Meta",
    pixel: "Pixel (navigateur)",
    capi: "API Conversions (serveur)",
    on: "configuré",
    off: "non configuré",
    sent: "événements envoyés",
    skipped: "non envoyés (pas de consentement ou Meta non configuré)",
    errors: "erreurs",
    testMode: "mode test actif",
  },
  salonPayments: {
    title: "Paiements des clients des salons",
    help: "Acomptes et paiements des clientes aux salons (Mollie Connect). Indicateur d’usage du produit : ce ne sont pas des abonnements Reso.",
    count: "paiements encaissés",
    amount: "montant encaissé par les salons",
    fee: "commission Reso",
  },
  latest: "Dernières inscriptions",
  latestEmpty: "Aucune inscription pour l’instant.",
};
