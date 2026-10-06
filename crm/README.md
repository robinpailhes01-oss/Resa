# CRM de prospection (interne)

Page de suivi des appels de prospection, séparée de l'application Reso : projet Vercel à part (`reso-crm`, racine `crm/`), aucun lien depuis le site public, pages en `noindex`.

- `index.html` : l'interface (file d'appels du jour, étapes, historique, fiche lead).
- `api/session.js` : connexion par mot de passe d'équipe (cookie signé, 30 jours).
- `api/leads.js` : lecture, création (une fiche ou `{ leads: [...] }`), mise à jour et suppression des leads.
- Stockage : table `crm.leads` de la base Supabase « harmonie-yacht » (schéma `crm` non exposé par l'API). Le CRM n'y accède que par les fonctions `public.crm_list`, `crm_get`, `crm_put` et `crm_remove`, qui vérifient le mot de passe d'équipe (empreinte SHA-256 dans `crm.config`). Une suppression masque le lead (`deleted_at`) sans l'effacer.

Variables du projet Vercel :

| Variable | Rôle |
| --- | --- |
| `CRM_PASSWORD` | Mot de passe partagé par l'équipe |
| `CRM_SECRET` | Clé de signature des sessions (32 caractères minimum) |

Changer `CRM_PASSWORD` puis redéployer coupe l'accès à ceux qui ne connaissent pas le nouveau mot de passe ; il faut alors aussi mettre à jour son empreinte en base (`update crm.config set value = encode(sha256(convert_to('<nouveau mot de passe>', 'UTF8')), 'hex') where key = 'password_sha256';`), sinon le CRM ne lit plus rien. Changer `CRM_SECRET` déconnecte toutes les sessions ouvertes.

## Importer des leads

`crm/data/leads.json` contient les lots déjà repérés (Embrun – Gap, Hérault – Gard, Métropole Montpellier). Pour les charger dans le CRM déployé, sans doublon :

```bash
CRM_URL=https://<url-du-crm> CRM_PASSWORD=<mot de passe> node crm/scripts/import.mjs
```
