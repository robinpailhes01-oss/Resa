-- Réponses des prospects (reçues via Resend) : nouveau statut et trace de la dernière réponse.
alter table prospects drop constraint if exists prospects_status_check;
alter table prospects add constraint prospects_status_check
  check (status in ('nouveau','sans_email','a_contacter','contacte','relance','repondu','inscrit','desinscrit','ignore'));
alter table prospects add column if not exists replied_at timestamptz;
alter table prospects add column if not exists last_reply text;
