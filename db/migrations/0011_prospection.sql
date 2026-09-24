-- Prospection sortante : établissements repérés via Google Places, enrichis
-- (site, outil de réservation, email public) et contactés par email B2B
-- avec désinscription en un clic. Aucune donnée d'un client final.

create table if not exists prospects (
  id uuid primary key default gen_random_uuid(),
  google_place_id text not null unique,
  name text not null,
  category text not null,
  city text not null,
  address text,
  postal_code text,
  phone text,
  website text,
  -- Outil de réservation détecté : planity, treatwell, kiute, flexybeauty, autre ; null = inconnu / aucun détecté.
  booking_provider text,
  rating numeric(2,1),
  rating_count integer,
  maps_url text,
  email citext,
  email_source text,
  status text not null default 'nouveau'
    check (status in ('nouveau','sans_email','a_contacter','contacte','relance','inscrit','desinscrit','ignore')),
  unsubscribe_token text not null unique,
  enriched_at timestamptz,
  first_email_at timestamptz,
  follow_up_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists prospects_status_idx on prospects (status, created_at);
create index if not exists prospects_email_idx on prospects (email);
alter table prospects enable row level security;

create table if not exists prospection_runs (
  id uuid primary key default gen_random_uuid(),
  ran_at timestamptz not null default now(),
  queries jsonb not null default '[]'::jsonb,
  found integer not null default 0,
  created integer not null default 0,
  enriched integer not null default 0,
  emails_found integer not null default 0,
  sent integer not null default 0,
  follow_ups integer not null default 0,
  dry_run boolean not null default false,
  errors text
);
alter table prospection_runs enable row level security;

-- Adresses qui ne veulent plus être contactées, conservées même si le prospect est supprimé.
create table if not exists prospect_optouts (
  email citext primary key,
  created_at timestamptz not null default now()
);
alter table prospect_optouts enable row level security;
