-- Commission Reso prélevée sur chaque paiement en ligne des clients (Mollie Connect, applicationFee).
alter table booking_payments add column if not exists application_fee_cents integer not null default 0 check (application_fee_cents >= 0);
