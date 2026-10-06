-- Parcours détaillé des pros pendant l'onboarding (micro-étapes et erreurs rencontrées).
-- Complète acquisition_events (grandes étapes) pour voir exactement où chacun s'arrête.
create table if not exists journey_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null check (name in (
    'google_import', 'first_service', 'hours_set', 'link_copied', 'page_visited',
    'billing_viewed', 'checkout_started', 'payment_failed', 'error'
  )),
  detail text,
  created_at timestamptz not null default now()
);
create index if not exists journey_events_user_idx on journey_events (user_id, name, created_at);
create index if not exists journey_events_created_idx on journey_events (created_at);
