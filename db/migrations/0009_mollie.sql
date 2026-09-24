-- Prélèvement automatique via Mollie : client, mandat et abonnement Mollie
-- rattachés à l'établissement ; identifiant de paiement générique côté payments.
alter table establishments add column if not exists mollie_customer_id text;
alter table establishments add column if not exists mollie_mandate_id text;
alter table establishments add column if not exists mollie_subscription_id text;
alter table payments drop constraint if exists payments_provider_check;
alter table payments add constraint payments_provider_check check (provider in ('sumup','mollie'));
create index if not exists payments_checkout_id_idx on payments (checkout_id);
