-- Mollie Connect : chaque établissement relie son propre compte Mollie (OAuth)
-- pour encaisser un acompte ou la totalité à la réservation. L'argent va
-- directement sur le compte Mollie de l'établissement ; Reso ne le détient jamais.

-- Connexion OAuth : jetons chiffrés (AES-256-GCM, clé MOLLIE_TOKEN_ENCRYPTION_KEY).
create table if not exists mollie_connections (
  establishment_id uuid primary key references establishments(id) on delete cascade,
  organization_id text,
  organization_name text,
  profile_id text,
  profile_name text,
  access_token_enc text not null,
  access_expires_at timestamptz not null,
  refresh_token_enc text not null,
  scope text not null default '',
  onboarding_status text,
  can_receive_payments boolean not null default false,
  dashboard_url text,
  testmode boolean not null default false,
  connected_by uuid references users(id) on delete set null,
  connected_at timestamptz not null default now(),
  checked_at timestamptz,
  updated_at timestamptz not null default now()
);

-- Jeton anti-CSRF du parcours d'autorisation (haché, valable 15 minutes).
create table if not exists mollie_oauth_states (
  state_hash text primary key,
  establishment_id uuid not null references establishments(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- Règle d'encaissement à la réservation en ligne.
alter table establishments add column if not exists payment_mode text not null default 'none';
alter table establishments add column if not exists deposit_kind text not null default 'percent';
alter table establishments add column if not exists deposit_value integer not null default 30;
alter table establishments drop constraint if exists establishments_payment_mode_check;
alter table establishments add constraint establishments_payment_mode_check check (payment_mode in ('none','deposit','full'));
alter table establishments drop constraint if exists establishments_deposit_kind_check;
alter table establishments add constraint establishments_deposit_kind_check check (deposit_kind in ('percent','fixed'));
alter table establishments drop constraint if exists establishments_deposit_value_check;
alter table establishments add constraint establishments_deposit_value_check check (deposit_value >= 0);

-- Rendez-vous en attente de paiement : créneau retenu jusqu'à cette date.
alter table bookings add column if not exists payment_hold_until timestamptz;
create index if not exists bookings_payment_hold_idx on bookings (payment_hold_until) where status = 'pending' and payment_hold_until is not null;

create table if not exists booking_payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  establishment_id uuid not null references establishments(id) on delete cascade,
  mollie_payment_id text unique,
  kind text not null check (kind in ('deposit','full')),
  amount_cents integer not null check (amount_cents > 0),
  status text not null default 'open' check (status in ('open','paid','failed','canceled','expired','refunded','refund_failed')),
  checkout_url text,
  -- Jeton de gestion brut, conservé le temps du paiement pour l'email de confirmation, puis effacé.
  manage_token text,
  testmode boolean not null default false,
  paid_at timestamptz,
  refunded_at timestamptz,
  mollie_refund_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists booking_payments_booking_idx on booking_payments (booking_id);
create index if not exists booking_payments_establishment_idx on booking_payments (establishment_id, created_at desc);
