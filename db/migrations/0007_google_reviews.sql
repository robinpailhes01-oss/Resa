-- Note et nombre d'avis Google (affichés sur la fiche publique), lien Google Maps,
-- date de dernière synchronisation de la fiche.
alter table establishments add column if not exists google_rating numeric(2,1) check (google_rating between 0 and 5);
alter table establishments add column if not exists google_rating_count integer check (google_rating_count >= 0);
alter table establishments add column if not exists google_maps_url text;
alter table establishments add column if not exists google_synced_at timestamptz;
