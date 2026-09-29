# Vérification Supabase du 29 septembre 2026

Projet vérifié : `twsqotrphiwqgwdgrxwp`.

La migration `0013_security_hardening.sql` était déjà présente lors de la connexion : RLS sur le registre des migrations, aucun droit pour `anon`/`authenticated`, fonctions avec `search_path` vide et index de réservation dédupliqué.

La migration `0014_extensions_and_foreign_key_indexes.sql` a ensuite été appliquée via Supabase et enregistrée dans `public.schema_migrations`, pour que le script applicatif ne la rejoue pas au prochain déploiement.

## Changements appliqués

- Déplacement de `citext` et `btree_gist` de `public` vers `extensions`, sans désinstallation ni suppression de données.
- Huit index ajoutés sur les clés étrangères signalées. Les tables concernées étaient petites (moins de 110 Ko chacune) ; la migration limite l'attente de verrou à cinq secondes.
- Aucun changement des politiques RLS applicatives.

## Vérifications

Avant application : toutes les migrations testées sur PostgreSQL local via PGlite, avec les trois extensions requises. Comparaison et unicité des emails insensibles à la casse, insertion de réservation, calcul du tampon, refus des chevauchements et réexécution de la migration validés.

Après application : deux extensions dans le schéma attendu, huit nouveaux index, aucun index public invalide, comparaison `citext` correcte et migration enregistrée.

Résultat des conseillers : aucun ERROR/WARN de sécurité ni de performances. Il reste 25 notices INFO « RLS Enabled No Policy » et 19 notices INFO « Unused Index ». Ces notices ne sont pas masquées : l'application utilise le backend PostgreSQL privilégié et n'ouvre pas ces tables aux clients PostgREST ; des index récemment créés peuvent légitimement n'avoir encore servi à aucune requête.

Ne pas ajouter de politique permissive pour effacer ces notices et ne pas supprimer un index seulement parce qu'il n'a pas encore été utilisé.

Le rôle backend `postgres` de ce projet inclut déjà `extensions` dans son `search_path` et dispose du droit USAGE sur ce schéma. Garder cette configuration lors d'un changement d'hébergement ou de rôle de connexion.

Références : [extensions dans public](https://supabase.com/docs/guides/database/database-linter?lint=0014_extension_in_public), [RLS sans politique](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy), [index inutilisés](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index).
