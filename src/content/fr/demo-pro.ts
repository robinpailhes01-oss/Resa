/**
 * Démo cliquable de l'espace pro (/demo) : un institut fictif, des données
 * d'exemple, rien n'est enregistré. Les heures sont des libellés fixes.
 */

export type DemoStatus = "confirmed" | "completed" | "cancelled" | "no_show" | "pending";

export interface DemoBooking {
  id: string;
  /** Décalage en jours par rapport à aujourd'hui. */
  day: number;
  start: string;
  durationMin: number;
  practitionerId: string;
  clientId: string;
  serviceId: string;
  status: DemoStatus;
  source: "online" | "manual";
  deposit?: number;
  note?: string;
}

export const demoPro = {
  banner: { title: "La démo Reso", text: "Données d’exemple : cliquez partout, rien n’est enregistré.", back: "Retour", cta: "Créer mon compte" },
  owner: "Camille",
  salon: "Maison Alba",
  nav: {
    groups: [
      { label: "Pilotage", items: [["dashboard", "Tableau de bord"], ["agenda", "Agenda"], ["clients", "Clients"]] },
      { label: "Mon établissement", items: [["page", "Ma page"], ["services", "Prestations"], ["team", "Équipe"], ["emails", "Emails automatiques"]] },
      { label: "Compte", items: [["payments", "Paiements"], ["settings", "Paramètres"]] },
    ],
  },
  practitioners: [
    { id: "pr1", name: "Camille", role: "Esthéticienne", tone: "soft" as const },
    { id: "pr2", name: "Inès", role: "Prothésiste ongulaire", tone: "accent" as const },
  ],
  services: [
    { id: "s1", name: "Soin visage éclat", durationMin: 60, price: 65, image: "/demo/soin-visage.webp", active: true },
    { id: "s2", name: "Pose semi-permanent", durationMin: 60, price: 40, image: "/demo/ongles.webp", active: true },
    { id: "s3", name: "Rehaussement de cils", durationMin: 75, price: 55, image: "/demo/cils.webp", active: true },
    { id: "s4", name: "Beauté des mains", durationMin: 45, price: 30, image: "/demo/mains.webp", active: true },
    { id: "s5", name: "Épilation sourcils", durationMin: 15, price: 15, image: null, active: false },
  ],
  clients: [
    { id: "c1", name: "Léa Martin", email: "lea.martin@exemple.fr", phone: "06 12 34 56 78", visits: 9, spent: 485, note: "Peau sensible, préfère les soins sans parfum." },
    { id: "c2", name: "Julien Marchand", email: "julien.m@exemple.fr", phone: "06 22 45 67 89", visits: 3, spent: 195, note: "" },
    { id: "c3", name: "Sofia Renaud", email: "sofia.renaud@exemple.fr", phone: "07 81 23 45 67", visits: 12, spent: 520, note: "Vernis nude, toujours le samedi matin si possible." },
    { id: "c4", name: "Nadia Toussaint", email: "nadia.t@exemple.fr", phone: "06 98 76 54 32", visits: 5, spent: 275, note: "" },
    { id: "c5", name: "Hugo Lemoine", email: "hugo.lemoine@exemple.fr", phone: "06 45 67 89 01", visits: 2, spent: 60, note: "" },
    { id: "c6", name: "Camille Berger", email: "c.berger@exemple.fr", phone: "07 66 55 44 33", visits: 7, spent: 380, note: "Allergie au latex." },
    { id: "c7", name: "Inès Robert", email: "ines.robert@exemple.fr", phone: "06 11 22 33 44", visits: 1, spent: 55, note: "" },
    { id: "c8", name: "Manon Petit", email: "manon.petit@exemple.fr", phone: "07 12 98 34 56", visits: 4, spent: 210, note: "" },
  ],
  bookings: [
    { id: "b1", day: 0, start: "09:00", durationMin: 60, practitionerId: "pr1", clientId: "c6", serviceId: "s1", status: "completed", source: "online" },
    { id: "b2", day: 0, start: "09:30", durationMin: 60, practitionerId: "pr2", clientId: "c3", serviceId: "s2", status: "completed", source: "online", deposit: 12 },
    { id: "b3", day: 0, start: "10:30", durationMin: 75, practitionerId: "pr1", clientId: "c4", serviceId: "s3", status: "completed", source: "manual" },
    { id: "b4", day: 0, start: "13:00", durationMin: 60, practitionerId: "pr1", clientId: "c2", serviceId: "s1", status: "confirmed", source: "online", deposit: 20 },
    { id: "b5", day: 0, start: "14:00", durationMin: 45, practitionerId: "pr2", clientId: "c8", serviceId: "s4", status: "confirmed", source: "online" },
    { id: "b6", day: 0, start: "15:00", durationMin: 60, practitionerId: "pr2", clientId: "c1", serviceId: "s2", status: "confirmed", source: "online", deposit: 12, note: "Souhaite un rouge foncé." },
    { id: "b7", day: 0, start: "16:30", durationMin: 45, practitionerId: "pr1", clientId: "c5", serviceId: "s4", status: "pending", source: "online" },
    { id: "b8", day: 1, start: "10:00", durationMin: 60, practitionerId: "pr1", clientId: "c1", serviceId: "s1", status: "confirmed", source: "online", deposit: 20 },
    { id: "b9", day: 1, start: "11:30", durationMin: 75, practitionerId: "pr1", clientId: "c7", serviceId: "s3", status: "confirmed", source: "online" },
    { id: "b10", day: 1, start: "14:00", durationMin: 60, practitionerId: "pr2", clientId: "c3", serviceId: "s2", status: "confirmed", source: "manual" },
    { id: "b11", day: 2, start: "09:30", durationMin: 45, practitionerId: "pr2", clientId: "c4", serviceId: "s4", status: "confirmed", source: "online" },
    { id: "b12", day: 2, start: "15:00", durationMin: 60, practitionerId: "pr1", clientId: "c8", serviceId: "s1", status: "confirmed", source: "online", deposit: 20 },
    { id: "b13", day: -1, start: "10:00", durationMin: 60, practitionerId: "pr2", clientId: "c1", serviceId: "s2", status: "completed", source: "online" },
    { id: "b14", day: -1, start: "16:00", durationMin: 60, practitionerId: "pr1", clientId: "c2", serviceId: "s1", status: "no_show", source: "online", deposit: 20 },
  ] as DemoBooking[],
  stats: {
    bookings: 86,
    bookingsDelta: "+18 %",
    revenue: "4 230 €",
    revenueDelta: "+12 %",
    fill: "78 %",
    cancellations: "3",
    perDay: [3, 5, 4, 6, 7, 2, 0, 4, 5, 6, 5, 8, 3, 0, 5, 4, 6, 7, 6, 3, 0, 5, 6, 4, 7, 8, 4, 0, 5, 6],
  },
  status: {
    pending: "À confirmer",
    confirmed: "Confirmé",
    completed: "Terminé",
    cancelled: "Annulé",
    no_show: "Absent",
  } as Record<DemoStatus, string>,
  dashboard: {
    hello: (name: string) => `Bonjour ${name}`,
    today: (n: number, revenue: number) => (n === 0 ? "Aucun rendez-vous aujourd’hui." : `${n} rendez-vous aujourd’hui, pour ${revenue} €.`),
    newBooking: "Nouveau rendez-vous",
    agenda: "Agenda du jour",
    upcoming: "À venir aujourd’hui",
    none: "Plus aucun rendez-vous aujourd’hui.",
    activity: "Activité · ce mois-ci",
    tiles: { bookings: "Rendez-vous", revenue: "Revenus", fill: "Remplissage", cancellations: "Annulations" },
    chart: "Rendez-vous par jour",
    page: { title: "Votre page de réservation", text: "4 photos · 5 prestations · 4 avis Google · acompte de 30 %", open: "Voir ma page" },
  },
  agenda: { title: "Agenda", prev: "Jour précédent", next: "Jour suivant", today: "Aujourd’hui", count: (n: number) => `${n} rendez-vous ce jour. Cliquez sur un rendez-vous pour le détail.` },
  booking: {
    with: "Avec",
    client: "Client",
    price: "Prix",
    deposit: (n: number) => `Acompte de ${n} € réglé en ligne`,
    online: "Réservé en ligne",
    manual: "Ajouté par vous",
    note: "Note interne",
    actions: { confirm: "Confirmer", done: "Marquer terminé", noShow: "Client absent", cancel: "Annuler le rendez-vous", reactivate: "Réactiver", close: "Fermer" },
    cancelled: "Rendez-vous annulé. Le client est prévenu par email et son acompte remboursé automatiquement.",
  },
  create: {
    title: "Nouveau rendez-vous",
    client: "Client",
    service: "Prestation",
    practitioner: "Praticien",
    time: "Heure",
    submit: "Enregistrer",
    added: "Rendez-vous ajouté à l’agenda. La confirmation part par email au client.",
  },
  clientsView: { title: "Clients", intro: "Votre fichier clients, avec l’historique de chaque visite.", search: "Rechercher un client", visits: (n: number) => `${n} visite${n > 1 ? "s" : ""}`, spent: "Dépensé", history: "Historique", notes: "Notes" },
  servicesView: { title: "Prestations", intro: "Ce que vos clients peuvent réserver, avec la durée, le prix et une photo.", add: "Ajouter une prestation", online: "En ligne", hidden: "Masquée" },
  teamView: { title: "Équipe", intro: "Un agenda par praticien, autant que vous voulez, au même prix.", add: "Ajouter un praticien" },
  emailsView: {
    title: "Emails automatiques",
    intro: "Envoyés tout seuls, au nom de votre établissement.",
    items: [
      { key: "confirmation", label: "Confirmation de réservation", help: "Dès que le rendez-vous est pris." },
      { key: "reminder", label: "Rappel la veille", help: "24 h avant, avec le lien pour annuler." },
      { key: "review", label: "Demande d’avis Google", help: "Le lendemain de la visite." },
      { key: "pro", label: "Vous prévenir à chaque réservation", help: "Un email à chaque nouveau rendez-vous en ligne." },
    ],
  },
  paymentsView: {
    title: "Paiements",
    intro: "Acompte ou paiement complet à la réservation, directement sur votre compte Mollie.",
    account: "Compte Mollie",
    ready: "Prêt à encaisser",
    rule: "À la réservation en ligne",
    modes: [
      { key: "none", label: "Rien en ligne" },
      { key: "deposit", label: "Un acompte de 30 %" },
      { key: "full", label: "La totalité" },
    ],
    example: (mode: string) => (mode === "none" ? "Tout se règle sur place." : mode === "deposit" ? "Pour un soin à 65 € : 19,50 € en ligne, 45,50 € sur place." : "Pour un soin à 65 € : 65 € en ligne."),
    last: "Derniers paiements",
    payments: [
      { who: "Julien Marchand · Soin visage éclat", amount: "20 €", status: "Payé" },
      { who: "Léa Martin · Pose semi-permanent", amount: "12 €", status: "Payé" },
      { who: "Sofia Renaud · Pose semi-permanent", amount: "12 €", status: "Payé" },
      { who: "Hugo Lemoine · Beauté des mains", amount: "9 €", status: "Remboursé" },
    ],
  },
  pageView: {
    title: "Ma page de réservation",
    intro: "Ce que voient vos clients : photos, bio, prestations, avis.",
    open: "Voir ma page comme un client",
    bio: "Soins visage & ongles · sur rendez-vous · Montpellier centre ✨",
    photos: ["/demo/salon.webp", "/demo/soin-visage.webp", "/demo/ongles.webp", "/demo/cils.webp"],
    link: "reso-app.fr/r/maison-alba",
  },
  settingsView: {
    title: "Paramètres",
    intro: "Vos informations, vos horaires et vos règles de réservation.",
    rows: [
      ["Adresse", "12 rue de l’Aiguillerie, 34000 Montpellier"],
      ["Horaires", "Lundi au vendredi 9 h 30 – 19 h · samedi 9 h 30 – 17 h"],
      ["Annulation en ligne", "Jusqu’à 24 h avant"],
      ["Fiche Google", "Reliée · 4,9 ★ (128 avis)"],
    ],
  },
  help: { title: "Besoin d’aide pour démarrer ?", text: "On vous installe tout en un appel.", cta: "Prendre un appel" },
};
