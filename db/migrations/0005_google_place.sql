-- Identifiant de la fiche Google importée à l'onboarding (facultatif).
alter table establishments add column if not exists google_place_id text;
