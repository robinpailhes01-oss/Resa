-- Factures : numérotation continue et chronologique, attribuée à l'encaissement.
create sequence if not exists invoice_number_seq;
alter table payments add column if not exists invoice_number text unique;
alter table payments add column if not exists invoice_issued_at timestamptz;
alter table payments add column if not exists payment_method text;
