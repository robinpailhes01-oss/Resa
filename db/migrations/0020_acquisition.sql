-- Mesure de l'acquisition : origine des inscriptions, étapes du tunnel, visites.
-- Les abonnements Reso (payments) et les paiements des clients des salons (booking_payments)
-- restent séparés : seuls les premiers déclenchent l'étape « subscribe ».

-- Origine du premier contact d'un compte (UTM, identifiants Meta si consentement).
create table if not exists acquisition_attributions (
  user_id uuid primary key references users(id) on delete cascade,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  landing_path text,
  referrer_host text,
  first_seen_at timestamptz,
  consent_ads boolean not null default false,
  fbc text,
  fbp text,
  created_at timestamptz not null default now()
);
create index if not exists acquisition_attributions_campaign_idx on acquisition_attributions (utm_campaign, utm_content);

-- Étapes franchies (une seule fois par compte et par étape) et suivi de l'envoi à Meta.
create table if not exists acquisition_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  establishment_id uuid references establishments(id) on delete cascade,
  name text not null check (name in ('signup', 'start_trial', 'activation', 'subscribe')),
  event_id text not null unique,
  value_cents integer,
  meta_status text not null default 'skipped' check (meta_status in ('skipped', 'sent', 'error')),
  meta_error text,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);
create index if not exists acquisition_events_name_idx on acquisition_events (name, created_at);

-- Visites agrégées par jour et par origine : aucun identifiant de personne.
create table if not exists acquisition_visits (
  day date not null,
  utm_source text not null default '',
  utm_campaign text not null default '',
  utm_content text not null default '',
  visits integer not null default 0 check (visits >= 0),
  primary key (day, utm_source, utm_campaign, utm_content)
);
