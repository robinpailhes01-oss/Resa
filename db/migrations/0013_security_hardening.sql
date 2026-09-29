-- Registre interne des migrations : aucun accès via les rôles de l'API.
-- Ne pas ajouter de politique permissive : seul le backend privilégié l'utilise.
alter table public.schema_migrations enable row level security;
revoke all on table public.schema_migrations from public;
do $$
declare api_role text;
begin
  foreach api_role in array array['anon', 'authenticated'] loop
    if exists (select 1 from pg_roles where rolname = api_role) then
      execute format('revoke all on table public.schema_migrations from %I', api_role);
    end if;
  end loop;
end $$;

-- Ces triggers n'utilisent que NEW et des fonctions intégrées de pg_catalog.
-- Fixer le chemin empêche une résolution dépendante de la session appelante.
alter function public.bookings_set_blocks_until() set search_path = '';
alter function public.set_updated_at() set search_path = '';

-- 0003 a recréé l'index de 0002 sous un autre nom. Conserver bookings_day_idx.
-- Si la base a divergé, ne supprimer aucun index : il faudra l'inspecter.
do $$
begin
  if pg_get_indexdef(to_regclass('public.bookings_day_idx')) =
       'CREATE INDEX bookings_day_idx ON public.bookings USING btree (establishment_id, starts_at)'
     and pg_get_indexdef(to_regclass('public.bookings_establishment_starts_idx')) =
       'CREATE INDEX bookings_establishment_starts_idx ON public.bookings USING btree (establishment_id, starts_at)'
     and exists (select 1 from pg_index where indexrelid = to_regclass('public.bookings_day_idx') and indisvalid and indisready)
  then
    drop index public.bookings_establishment_starts_idx;
  end if;
end $$;
