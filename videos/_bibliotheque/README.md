# Bibliothèque de captures de l'app

Captures vidéo et images de l'app Reso (version refondue, identité poudrée) sur les établissements **fictifs** de démonstration (Maison Alba, Atelier Lune). Réutilisables dans toutes les vidéos.

- Scénarios : `.claude/skills/reso-capture-app/scenarios/*.json`
- Médias (non versionnés) : `videos/_bibliotheque/media/app/`
- Données de démo : `node .claude/skills/reso-capture-app/scripts/seed-demo.mjs <url>` (salon Maison Alba, 8 réservations, 2 jours plus tard)

| Capture | Contenu |
| --- | --- |
| `onboarding-mobile` | inscription → création de l'établissement → prestations types cochées (vidéo seule, crée un compte : à relancer sur une base neuve) |
| `dashboard-mobile`, `dashboard-tablette` | tableau de bord « Bonjour Camille » (bandeau ciseaux), activité |
| `page-publique-mobile` | page de réservation avec galerie photos, prestations, horaires |
| `reservation-mobile` | parcours client : prestation → praticienne → créneau → coordonnées |
| `agenda-mobile` | agenda du jour rempli |
| `emails-mobile` | emails automatiques (confirmation, rappel, demande d'avis) |

Galerie photos de démo : les visuels de marque (`public/demo/` de la copie locale de l'app), insérés en base de test locale uniquement.
