-- Weather-informed watering recommendations
-- Run this once in Supabase SQL Editor after the shared-household schema.

alter table public.households
  add column if not exists weather_location_label text,
  add column if not exists weather_latitude double precision,
  add column if not exists weather_longitude double precision,
  add column if not exists weather_timezone text,
  add column if not exists weather_summary jsonb,
  add column if not exists weather_updated_at timestamptz;

alter table public.plants
  add column if not exists growing_environment text not null default 'indoor',
  add column if not exists plant_type text not null default 'custom';

alter table public.plants
  drop constraint if exists plants_growing_environment_check;

alter table public.plants
  add constraint plants_growing_environment_check
  check (growing_environment in ('indoor', 'outdoor', 'greenhouse'));

alter table public.plants
  drop constraint if exists plants_plant_type_check;

alter table public.plants
  add constraint plants_plant_type_check
  check (plant_type in ('herb', 'fruiting_vegetable', 'foliage', 'succulent', 'custom'));

drop policy if exists "Household creators can update weather settings" on public.households;

create policy "Household creators can update weather settings"
on public.households for update to authenticated
using (created_by = auth.uid())
with check (created_by = auth.uid());

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'households'
  ) then
    alter publication supabase_realtime add table public.households;
  end if;
end $$;