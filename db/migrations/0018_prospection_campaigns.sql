-- Campagnes de prospection ponctuelles (ex. Hérault, salons hors Planity, shooting offert) :
-- les prospects contactés par une campagne sont marqués, et les recherches Google déjà faites
-- pour la campagne sont mémorisées pour reprendre là où l'on s'est arrêté.
alter table prospects add column if not exists campaign text;
create index if not exists prospects_campaign_idx on prospects (campaign) where campaign is not null;

create table if not exists prospection_campaign_queries (
  campaign text not null,
  query text not null,
  found integer not null default 0,
  searched_at timestamptz not null default now(),
  primary key (campaign, query)
);
alter table prospection_campaign_queries enable row level security;
