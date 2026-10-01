-- Page de réservation éditable depuis l'espace pro :
-- photos envoyées depuis l'appareil (stockées en base, déjà compressées par le navigateur)
-- et avis Google importés, affichables ou masquables par l'établissement.

alter table establishment_photos add column if not exists image bytea;
alter table establishment_photos add column if not exists content_type text;
alter table establishment_photos drop constraint if exists establishment_photos_url_check;
alter table establishment_photos add constraint establishment_photos_url_check check (url ~ '^(https://|/photos/)');
alter table establishment_photos drop constraint if exists establishment_photos_image_check;
alter table establishment_photos add constraint establishment_photos_image_check
  check (image is null or (octet_length(image) <= 1500000 and content_type in ('image/jpeg','image/png','image/webp')));

create table if not exists establishment_reviews (
  id uuid primary key default gen_random_uuid(),
  establishment_id uuid not null references establishments(id) on delete cascade,
  source text not null default 'google' check (source in ('google')),
  -- Identifiant Google de l'avis (places/…/reviews/…), pour ne pas l'importer deux fois.
  external_id text not null,
  author_name text not null,
  author_url text,
  author_photo_url text,
  rating smallint not null check (rating between 1 and 5),
  text text not null default '',
  relative_time text,
  published_at timestamptz,
  hidden boolean not null default false,
  imported_at timestamptz not null default now(),
  unique (establishment_id, external_id)
);
create index if not exists establishment_reviews_establishment_idx on establishment_reviews (establishment_id, published_at desc);
alter table establishment_reviews enable row level security;
