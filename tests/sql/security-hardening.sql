-- À exécuter sur une base de TEST après les migrations, avec leur propriétaire.
-- Toutes les écritures de contrôle sont annulées.
begin;

do $$
declare api_role text;
begin
  if not (select relrowsecurity from pg_class where oid = 'public.schema_migrations'::regclass) then
    raise exception 'RLS absent sur schema_migrations';
  end if;
  foreach api_role in array array['anon', 'authenticated'] loop
    if exists (select 1 from pg_roles where rolname = api_role)
       and has_table_privilege(api_role, 'public.schema_migrations', 'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER') then
      raise exception 'Le rôle % conserve des privilèges sur schema_migrations', api_role;
    end if;
  end loop;
  if exists (
    select 1 from pg_proc
    where oid in ('public.bookings_set_blocks_until()'::regprocedure, 'public.set_updated_at()'::regprocedure)
      and not coalesce(proconfig @> array['search_path=""'], false)
  ) then
    raise exception 'search_path non verrouillé';
  end if;
  if to_regclass('public.bookings_day_idx') is null
     or to_regclass('public.bookings_establishment_starts_idx') is not null then
    raise exception 'Déduplication incorrecte des index de réservation';
  end if;
end $$;

-- Le compte de migration garde ses droits malgré RLS.
insert into public.schema_migrations(name) values ('__security_regression__');

-- Les deux triggers doivent continuer à fonctionner avec search_path vide.
create temporary table security_trigger_probe (
  ends_at timestamptz, buffer_min integer, blocks_until timestamptz, updated_at timestamptz
);
create trigger security_probe_blocks before insert or update of ends_at, buffer_min
  on security_trigger_probe for each row execute function public.bookings_set_blocks_until();
create trigger security_probe_updated before update
  on security_trigger_probe for each row execute function public.set_updated_at();
insert into security_trigger_probe(ends_at, buffer_min, updated_at)
  values ('2030-01-01 10:00:00+00', 15, '2000-01-01 00:00:00+00');
do $$
begin
  if not exists (select 1 from security_trigger_probe where blocks_until = '2030-01-01 10:15:00+00') then
    raise exception 'Calcul initial du tampon incorrect';
  end if;
end $$;
update security_trigger_probe set buffer_min = 30;
do $$
begin
  if not exists (
    select 1 from security_trigger_probe
    where blocks_until = '2030-01-01 10:30:00+00' and updated_at = now()
  ) then
    raise exception 'Régression des triggers après sécurisation';
  end if;
end $$;

rollback;
