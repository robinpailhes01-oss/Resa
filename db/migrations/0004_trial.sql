-- Essai gratuit et statut d'abonnement par établissement.
--
-- subscription_status :
--   trial     : période d'essai (accès complet jusqu'à trial_ends_at)
--   active    : abonnement actif (activé manuellement tant que le paiement
--               en ligne n'est pas branché)
--   cancelled : abonnement arrêté (espace pro accessible, réservation en
--               ligne suspendue)
-- Après trial_ends_at, un établissement encore en « trial » est considéré
-- comme « essai terminé » : réservation en ligne suspendue.

alter table establishments add column if not exists subscription_status text not null default 'trial'
  check (subscription_status in ('trial','active','cancelled'));
alter table establishments add column if not exists trial_ends_at timestamptz;

-- Établissements créés avant cette migration : essai de 7 jours à partir d'aujourd'hui.
update establishments set trial_ends_at = now() + interval '7 days' where trial_ends_at is null;
