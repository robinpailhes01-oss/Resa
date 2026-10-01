# CRM de prospection (interne)

Page de suivi des appels de prospection, séparée de l'application Reso : projet Vercel à part (`reso-crm`, racine `crm/`), aucun lien depuis le site public, pages en `noindex`.

- `index.html` : l'interface (file d'appels du jour, étapes, historique, fiche lead).
- `api/session.js` : connexion par mot de passe d'équipe (cookie signé, 30 jours).
- `api/leads.js` : lecture, création (une fiche ou `{ leads: [...] }`), mise à jour et suppression des leads.
- Stockage : un fichier JSON privé par lead dans un store Vercel Blob en accès privé (`leads/<id>.json`).

Variables du projet Vercel :

| Variable | Rôle |
| --- | --- |
| `CRM_PASSWORD` | Mot de passe partagé par l'équipe |
| `CRM_SECRET` | Clé de signature des sessions (32 caractères minimum) |
| `BLOB_READ_WRITE_TOKEN` | Ajoutée automatiquement par le store Blob relié au projet |

Changer `CRM_PASSWORD` puis redéployer coupe l'accès à ceux qui ne connaissent pas le nouveau mot de passe ; changer aussi `CRM_SECRET` déconnecte toutes les sessions ouvertes.

## Importer des leads

`crm/data/leads.json` contient les lots déjà repérés (Embrun – Gap, Hérault – Gard). Pour les charger dans le CRM déployé, sans doublon :

```bash
CRM_URL=https://<url-du-crm> CRM_PASSWORD=<mot de passe> node crm/scripts/import.mjs
```
