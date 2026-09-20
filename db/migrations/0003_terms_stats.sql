-- Conditions de réservation propres à chaque établissement et notification
-- du pro en cas d'annulation par une cliente.

alter table establishments add column if not exists booking_terms text;

alter table email_jobs drop constraint if exists email_jobs_kind_check;
alter table email_jobs add constraint email_jobs_kind_check
  check (kind in ('booking_confirmation','booking_cancelled','pro_new_booking','pro_booking_cancelled','booking_reminder','review_request'));

-- Index pour le tableau de bord (agrégats par établissement et période).
create index if not exists bookings_establishment_starts_idx on bookings (establishment_id, starts_at);
create index if not exists clients_establishment_created_idx on clients (establishment_id, created_at);
