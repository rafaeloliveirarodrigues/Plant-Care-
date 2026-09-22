-- Plant Care shared household PoC
-- Run this entire file once in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 80),
  invite_code text not null unique,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.household_members (
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (household_id, user_id)
);

create table if not exists public.plants (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 80),
  location text not null check (char_length(trim(location)) between 1 and 80),
  icon text not null default '🌱' check (char_length(icon) between 1 and 12),
  watering_frequency_days integer not null check (watering_frequency_days between 1 and 30),
  created_at timestamptz not null default now()
);

create table if not exists public.watering_logs (
  id uuid primary key default gen_random_uuid(),
  plant_id uuid not null references public.plants(id) on delete cascade,
  watered_by uuid not null references auth.users(id) on delete restrict,
  watered_by_name text not null check (char_length(trim(watered_by_name)) between 1 and 80),
  watered_at timestamptz not null default now()
);

create index if not exists plants_household_id_idx on public.plants(household_id);
create index if not exists watering_logs_plant_watered_at_idx on public.watering_logs(plant_id, watered_at desc);

alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.plants enable row level security;
alter table public.watering_logs enable row level security;

create or replace function public.is_household_member(target_household_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.household_members
    where household_id = target_household_id and user_id = auth.uid()
  );
$$;

create or replace function public.create_household(household_name text)
returns table (household_id uuid, invite_code text)
language plpgsql
security definer
set search_path = public
as $$
declare
  new_household_id uuid;
  new_invite_code text;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in.';
  end if;

  if exists (select 1 from public.household_members where user_id = auth.uid()) then
    raise exception 'You already belong to a household.';
  end if;

  new_invite_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));

  insert into public.households (name, invite_code, created_by)
  values (trim(household_name), new_invite_code, auth.uid())
  returning id into new_household_id;

  insert into public.household_members (household_id, user_id)
  values (new_household_id, auth.uid());

  insert into public.plants (household_id, name, location, icon, watering_frequency_days)
  values
    (new_household_id, 'Basil', 'Window Sill', '🌿', 2),
    (new_household_id, 'Mint', 'Counter', '🍃', 2),
    (new_household_id, 'Tomato', 'Window Sill', '🍅', 1),
    (new_household_id, 'Succulent', 'Shelf', '🌵', 7),
    (new_household_id, 'Aloe Vera', 'Counter', '🪴', 10);

  return query select new_household_id, new_invite_code;
end;
$$;

create or replace function public.join_household(code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_household_id uuid;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in.';
  end if;

  if exists (select 1 from public.household_members where user_id = auth.uid()) then
    raise exception 'You already belong to a household.';
  end if;

  select id into target_household_id
  from public.households
  where invite_code = upper(trim(code));

  if target_household_id is null then
    raise exception 'That household code was not found.';
  end if;

  insert into public.household_members (household_id, user_id)
  values (target_household_id, auth.uid());

  return target_household_id;
end;
$$;

grant execute on function public.create_household(text) to authenticated;
grant execute on function public.join_household(text) to authenticated;
grant execute on function public.is_household_member(uuid) to authenticated;

create policy "Members can read their household"
on public.households for select to authenticated
using (public.is_household_member(id));

create policy "Members can read membership"
on public.household_members for select to authenticated
using (public.is_household_member(household_id));

create policy "Members can read plants"
on public.plants for select to authenticated
using (public.is_household_member(household_id));

create policy "Members can add plants"
on public.plants for insert to authenticated
with check (public.is_household_member(household_id));

create policy "Members can update plants"
on public.plants for update to authenticated
using (public.is_household_member(household_id))
with check (public.is_household_member(household_id));

create policy "Members can delete plants"
on public.plants for delete to authenticated
using (public.is_household_member(household_id));

create policy "Members can read watering logs"
on public.watering_logs for select to authenticated
using (
  exists (
    select 1 from public.plants
    where plants.id = watering_logs.plant_id
      and public.is_household_member(plants.household_id)
  )
);

create policy "Members can add watering logs"
on public.watering_logs for insert to authenticated
with check (
  watered_by = auth.uid()
  and exists (
    select 1 from public.plants
    where plants.id = watering_logs.plant_id
      and public.is_household_member(plants.household_id)
  )
);

create policy "Members can delete watering logs"
on public.watering_logs for delete to authenticated
using (
  exists (
    select 1 from public.plants
    where plants.id = watering_logs.plant_id
      and public.is_household_member(plants.household_id)
  )
);

-- Broadcast shared updates to household members without manual refresh.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'plants'
  ) then
    alter publication supabase_realtime add table public.plants;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'watering_logs'
  ) then
    alter publication supabase_realtime add table public.watering_logs;
  end if;
end $$;
