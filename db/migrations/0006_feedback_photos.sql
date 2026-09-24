-- Retours produit envoyés depuis l'espace pro, et photos de l'établissement
-- (importées depuis la fiche Google ; URL hébergées par Google).

create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  establishment_id uuid references establishments(id) on delete set null,
  mood text not null default 'neutral' check (mood in ('happy','neutral','sad')),
  message text not null check (length(message) between 1 and 2000),
  page text,
  created_at timestamptz not null default now()
);
create index if not exists feedback_created_idx on feedback (created_at desc);
alter table feedback enable row level security;

create table if not exists establishment_photos (
  id uuid primary key default gen_random_uuid(),
  establishment_id uuid not null references establishments(id) on delete cascade,
  url text not null check (url ~ '^https://'),
  source text not null default 'google' check (source in ('google','manual')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists establishment_photos_establishment_idx on establishment_photos (establishment_id, sort_order);
alter table establishment_photos enable row level security;
