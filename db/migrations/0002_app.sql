-- Reso — application professionnelle : comptes, établissements, agenda, réservations, emails.
-- PostgreSQL 14+ ; extensions btree_gist (chevauchements), citext (emails), pgcrypto (uuid).

create extension if not exists pgcrypto;
create extension if not exists btree_gist;
create extension if not exists citext;

-- ---------------------------------------------------------------- comptes
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email citext not null unique,
  password_hash text not null,
  full_name text not null,
  email_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  user_agent text
);
create index if not exists sessions_user_idx on sessions (user_id);
create index if not exists sessions_expires_idx on sessions (expires_at);

create table if not exists auth_tokens (
  token_hash text primary key,
  user_id uuid not null references users(id) on delete cascade,
  purpose text not null check (purpose in ('reset_password','verify_email')),
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists auth_tokens_user_idx on auth_tokens (user_id);

-- ---------------------------------------------------------------- établissements
create table if not exists establishments (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references users(id) on delete restrict,
  name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and length(slug) between 3 and 60),
  business_type text not null default 'institut',
  address_line text,
  postal_code text,
  city text,
  phone text,
  public_email citext,
  description text,
  timezone text not null default 'Europe/Paris',
  booking_enabled boolean not null default true,
  slot_step_min integer not null default 15 check (slot_step_min in (5,10,15,20,30,60)),
  min_lead_min integer not null default 60 check (min_lead_min >= 0),
  max_horizon_days integer not null default 60 check (max_horizon_days between 1 and 365),
  cancellation_hours integer not null default 24 check (cancellation_hours >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists memberships (
  user_id uuid not null references users(id) on delete cascade,
  establishment_id uuid not null references establishments(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner','staff')),
  created_at timestamptz not null default now(),
  primary key (user_id, establishment_id)
);
create index if not exists memberships_establishment_idx on memberships (establishment_id);

create table if not exists practitioners (
  id uuid primary key default gen_random_uuid(),
  establishment_id uuid not null references establishments(id) on delete cascade,
  name text not null,
  role_title text,
  color text not null default 'soft' check (color in ('soft','accent','success')),
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists practitioners_establishment_idx on practitioners (establishment_id, sort_order);

-- Horaires hebdomadaires : praticien null = horaires de l'établissement (utilisés par défaut).
create table if not exists opening_hours (
  id uuid primary key default gen_random_uuid(),
  establishment_id uuid not null references establishments(id) on delete cascade,
  practitioner_id uuid references practitioners(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6), -- 0 = dimanche
  start_min smallint not null check (start_min between 0 and 1439),
  end_min smallint not null check (end_min between 1 and 1440),
  check (end_min > start_min)
);
create index if not exists opening_hours_lookup_idx on opening_hours (establishment_id, practitioner_id, weekday);

create table if not exists time_off (
  id uuid primary key default gen_random_uuid(),
  establishment_id uuid not null references establishments(id) on delete cascade,
  practitioner_id uuid references practitioners(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text,
  check (ends_at > starts_at)
);
create index if not exists time_off_lookup_idx on time_off (establishment_id, starts_at, ends_at);

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  establishment_id uuid not null references establishments(id) on delete cascade,
  name text not null,
  description text,
  duration_min integer not null check (duration_min between 5 and 720),
  buffer_min integer not null default 0 check (buffer_min between 0 and 240),
  price_cents integer not null default 0 check (price_cents >= 0),
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists services_establishment_idx on services (establishment_id, sort_order);

-- Prestations réalisables par praticien (aucune ligne = tous les praticiens).
create table if not exists service_practitioners (
  service_id uuid not null references services(id) on delete cascade,
  practitioner_id uuid not null references practitioners(id) on delete cascade,
  primary key (service_id, practitioner_id)
);

-- ---------------------------------------------------------------- clients et rendez-vous
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  establishment_id uuid not null references establishments(id) on delete cascade,
  first_name text not null,
  last_name text not null default '',
  email citext,
  phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists clients_email_unique on clients (establishment_id, email) where email is not null;
create index if not exists clients_name_idx on clients (establishment_id, last_name, first_name);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  establishment_id uuid not null references establishments(id) on delete cascade,
  practitioner_id uuid not null references practitioners(id) on delete restrict,
  service_id uuid references services(id) on delete set null,
  client_id uuid references clients(id) on delete set null,
  service_name text not null,
  duration_min integer not null check (duration_min > 0),
  buffer_min integer not null default 0,
  price_cents integer not null default 0,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'confirmed' check (status in ('pending','confirmed','completed','cancelled','no_show')),
  source text not null default 'online' check (source in ('online','manual')),
  notes text,
  client_notes text,
  manage_token_hash text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  cancelled_at timestamptz,
  cancelled_by text check (cancelled_by in ('client','pro')),
  -- Fin d'occupation réelle (fin + tampon), maintenue par trigger.
  blocks_until timestamptz not null default now(),
  check (ends_at > starts_at),
  -- Deux rendez-vous actifs d'un même praticien ne peuvent pas se chevaucher (tampon inclus).
  constraint bookings_no_overlap exclude using gist (
    practitioner_id with =,
    tstzrange(starts_at, blocks_until, '[)') with &&
  ) where (status in ('pending','confirmed'))
);

create or replace function bookings_set_blocks_until() returns trigger language plpgsql as $$
begin
  new.blocks_until = new.ends_at + make_interval(mins => new.buffer_min);
  return new;
end $$;
drop trigger if exists bookings_blocks_until on bookings;
create trigger bookings_blocks_until before insert or update of ends_at, buffer_min on bookings
  for each row execute function bookings_set_blocks_until();
create index if not exists bookings_day_idx on bookings (establishment_id, starts_at);
create index if not exists bookings_client_idx on bookings (client_id);
create index if not exists bookings_practitioner_idx on bookings (practitioner_id, starts_at);

-- ---------------------------------------------------------------- emails automatiques
create table if not exists notification_settings (
  establishment_id uuid primary key references establishments(id) on delete cascade,
  confirmation_enabled boolean not null default true,
  reminder_enabled boolean not null default true,
  reminder_hours integer not null default 24 check (reminder_hours between 1 and 168),
  review_enabled boolean not null default true,
  review_delay_hours integer not null default 24 check (review_delay_hours between 1 and 168),
  review_subject text not null default 'Comment s’est passé votre rendez-vous ?',
  review_url text,
  notify_pro_on_booking boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists email_jobs (
  id uuid primary key default gen_random_uuid(),
  establishment_id uuid not null references establishments(id) on delete cascade,
  booking_id uuid references bookings(id) on delete cascade,
  kind text not null check (kind in ('booking_confirmation','booking_cancelled','pro_new_booking','booking_reminder','review_request')),
  scheduled_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending','processing','sent','failed','skipped')),
  attempts integer not null default 0,
  last_error text,
  sent_at timestamptz,
  -- Jeton de gestion à insérer dans l'email (effacé après envoi) ; sinon le jeton est régénéré.
  manage_token text,
  created_at timestamptz not null default now()
);
create index if not exists email_jobs_due_idx on email_jobs (scheduled_at) where status = 'pending';
create index if not exists email_jobs_booking_idx on email_jobs (booking_id, kind);

-- ---------------------------------------------------------------- horodatage automatique
create or replace function set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array['users','establishments','clients','bookings','notification_settings'] loop
    execute format('drop trigger if exists %I_set_updated_at on %I', t, t);
    execute format('create trigger %I_set_updated_at before update on %I for each row execute function set_updated_at()', t, t);
  end loop;
end $$;

-- Sécurité Supabase : aucune exposition via l'API publique (PostgREST).
do $$
declare t text;
begin
  foreach t in array array['users','sessions','auth_tokens','establishments','memberships','practitioners','opening_hours','time_off','services','service_practitioners','clients','bookings','notification_settings','email_jobs'] loop
    execute format('alter table %I enable row level security', t);
  end loop;
end $$;
