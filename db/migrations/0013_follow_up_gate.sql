-- Relance autorisée seulement si les réponses au premier email sont visibles par le site
-- (adresse de réponse reçue par Resend). Sinon, un prospect qui a répondu dans la boîte
-- de contact pourrait être relancé. Les emails déjà envoyés partent bloqués.
alter table prospects add column if not exists follow_up_allowed boolean not null default false;
