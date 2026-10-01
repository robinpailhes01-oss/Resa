-- Rubriques de la page de réservation, écrites librement par l'établissement
-- (« 🎁 Bon cadeau », « 🚨 Merci de lire avant de réserver »…) : un titre, un
-- texte d'information facultatif, un ordre. Une rubrique sans prestation sert
-- de bloc d'information.
create table if not exists service_categories (
  id uuid primary key default gen_random_uuid(),
  establishment_id uuid not null references establishments(id) on delete cascade,
  title text not null check (length(title) between 1 and 120),
  description text check (description is null or length(description) <= 1500),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists service_categories_establishment_idx on service_categories (establishment_id, sort_order);

alter table services add column if not exists category_id uuid references service_categories(id) on delete set null;
