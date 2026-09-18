-- Reso — liste d'attente pré-lancement (cahier des charges §10).
-- Compatible PostgreSQL 14+ (Supabase, Neon, Postgres managé).

create extension if not exists pgcrypto;

create table if not exists waitlist (
  id uuid primary key default gen_random_uuid(),
  email_normalized text not null,
  email_original text not null,
  business_type text check (business_type in ('institut','onglerie','regard_cils','coiffure_barbier','spa_soins','autre')),
  team_size text check (team_size in ('solo','2_3','4_plus')),
  status text not null default 'pending' check (status in ('pending','confirmed','unsubscribed')),
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  privacy_version text not null,
  source text not null default 'landing',
  attribution jsonb,
  constraint waitlist_email_normalized_unique unique (email_normalized)
);

create table if not exists waitlist_email_tasks (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references waitlist(id) on delete cascade,
  kind text not null check (kind in ('confirmation')),
  status text not null default 'pending' check (status in ('pending','processing','sent','failed')),
  attempts integer not null default 0,
  last_error text,
  next_attempt_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create index if not exists waitlist_email_tasks_due_idx
  on waitlist_email_tasks (next_attempt_at)
  where status = 'pending';

create index if not exists waitlist_email_tasks_entry_idx
  on waitlist_email_tasks (entry_id, created_at);

create table if not exists waitlist_tokens (
  token_hash text primary key,
  entry_id uuid not null references waitlist(id) on delete cascade,
  purpose text not null check (purpose in ('confirm','unsubscribe')),
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  used_at timestamptz
);

create index if not exists waitlist_tokens_entry_idx on waitlist_tokens (entry_id);

create table if not exists waitlist_idempotency (
  key text primary key,
  expires_at timestamptz not null
);

-- Sécurité Supabase : aucune exposition via l'API publique (PostgREST).
alter table waitlist enable row level security;
alter table waitlist_email_tasks enable row level security;
alter table waitlist_tokens enable row level security;
alter table waitlist_idempotency enable row level security;
