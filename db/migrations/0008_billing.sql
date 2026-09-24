-- Abonnement payant via SumUp : période payée, statut « paiement en retard »,
-- résiliation en fin de période et historique des paiements.

alter table establishments drop constraint if exists establishments_subscription_status_check;
alter table establishments add constraint establishments_subscription_status_check
  check (subscription_status in ('trial','active','past_due','cancelled'));
alter table establishments add column if not exists paid_until timestamptz;
alter table establishments add column if not exists cancel_at_period_end boolean not null default false;

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  establishment_id uuid not null references establishments(id) on delete cascade,
  provider text not null default 'sumup',
  checkout_id text unique,
  checkout_reference text not null unique,
  amount_cents integer not null check (amount_cents > 0),
  vat_cents integer not null default 0 check (vat_cents >= 0),
  currency text not null default 'EUR',
  status text not null default 'pending' check (status in ('pending','paid','failed','expired')),
  period_start timestamptz not null,
  period_end timestamptz not null,
  hosted_url text,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  last_checked_at timestamptz,
  check (period_end > period_start)
);
create index if not exists payments_establishment_idx on payments (establishment_id, created_at desc);
create index if not exists payments_status_idx on payments (status) where status = 'pending';
alter table payments enable row level security;
