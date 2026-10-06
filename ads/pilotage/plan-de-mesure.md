# Plan de mesure du parcours RESO

Ce que l'on mesure (ou propose de mesurer) à chaque étape. Tenu par l'agent `reso-comportement`.
Statuts : **en place** · **proposé** (attend l'accord de Robin) · **validé** · **refusé**.

## Étapes principales

| Étape | Événement / donnée | Où | Statut |
|---|---|---|---|
| Pub vue, cliquée | impressions, vues 3 s, clics, conversations | Meta | en place |
| Visite | visite par session et par origine (agrégée, sans identifiant) | `acquisition_visits` | en place |
| Vue du prix | `pricing_view` | Pixel (si accord) | en place |
| Clic « Essayer » | `signup_click`, `cta_click` | Pixel (si accord) | en place |
| Inscription | `signup` + origine du premier contact | base + Meta `CompleteRegistration` | en place |
| Établissement créé | `start_trial` | base + Meta `StartTrial` | en place |
| Page publiée | calculée : réservation ouverte + ≥ 1 prestation + praticien avec horaires | base (calcul) | en place |
| 1re réservation | `activation` (hors email de la pro) | base + Meta `Activation` | en place |
| Abonnement payé | `subscribe` (1er paiement `payments`) | base + Meta `Subscribe` | en place |

## Micro-étapes proposées (pour voir exactement où l'onboarding coince)

| # | Événement | Pourquoi | Coût | Statut |
|---|---|---|---|---|
| M1 | Import de la fiche Google : réussi / échoué / ignoré | savoir si l'import aide ou bloque | code, gratuit | proposé |
| M2 | 1re prestation ajoutée (date) | l'étape la plus longue de l'onboarding | code, gratuit | proposé |
| M3 | Horaires enregistrés (date) | sans horaires, aucun créneau | code, gratuit | proposé |
| M4 | Lien de réservation copié (bouton « Copier ») | la pro a l'intention de partager | code, gratuit | proposé |
| M5 | 1re visite de sa page par quelqu'un d'autre | le lien a vraiment été partagé | code, gratuit, agrégé | proposé |
| M6 | Page abonnement vue / paiement commencé / paiement échoué | comprendre la fin d'essai | code, gratuit | proposé |
| M7 | Erreurs vues par les pros (formulaires refusés, erreurs serveur) | repérer les bugs qui font fuir | code, gratuit | proposé |

## Vues proposées

| Vue | Contenu | Statut |
|---|---|---|
| Parcours individuel | pour chaque inscrit : origine, étapes franchies avec date et heure, étape où il s'est arrêté, depuis combien de temps | proposé |
| Délais entre étapes | délai médian et nombre de pros bloqués depuis plus de 48 h, par étape | proposé |

## Outils optionnels (plus tard, seulement si le volume le justifie)

| Outil | Apport | Coût | Données personnelles | Statut |
|---|---|---|---|---|
| Microsoft Clarity | cartes de clics et relectures de sessions sur le site public et l'inscription | gratuit | soumis au consentement cookies, saisies masquées, jamais sur `/r`, `/rdv` ni l'espace pro, politique de confidentialité à mettre à jour | non proposé pour l'instant |
