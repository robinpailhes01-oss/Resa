-- Sortir les extensions du schéma exposé par l'API, sans les désinstaller.
-- Le backend doit inclure extensions dans son search_path (configuration
-- du rôle postgres vérifiée sur Supabase avant application).
set local lock_timeout = '5s';
set local statement_timeout = '30s';
create schema if not exists extensions;
alter extension btree_gist set schema extensions;
alter extension citext set schema extensions;

-- Index des clés étrangères signalées par le conseiller de performances.
-- Les tables concernées sont petites ; opérations atomiques avec délai de verrou limité.
create index if not exists bookings_service_id_idx on public.bookings (service_id);
create index if not exists email_jobs_establishment_id_idx on public.email_jobs (establishment_id);
create index if not exists establishments_owner_user_id_idx on public.establishments (owner_user_id);
create index if not exists feedback_establishment_id_idx on public.feedback (establishment_id);
create index if not exists feedback_user_id_idx on public.feedback (user_id);
create index if not exists opening_hours_practitioner_id_idx on public.opening_hours (practitioner_id);
create index if not exists service_practitioners_practitioner_id_idx on public.service_practitioners (practitioner_id);
create index if not exists time_off_practitioner_id_idx on public.time_off (practitioner_id);
