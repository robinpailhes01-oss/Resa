-- Bio courte affichée sous le nom de l'établissement, et photo par prestation
-- (même stockage que les photos de la page, rattachée à la prestation).
alter table establishments add column if not exists bio text;
alter table establishments drop constraint if exists establishments_bio_check;
alter table establishments add constraint establishments_bio_check check (bio is null or length(bio) <= 200);

alter table establishment_photos add column if not exists service_id uuid references services(id) on delete cascade;
create unique index if not exists establishment_photos_service_idx on establishment_photos (service_id) where service_id is not null;
