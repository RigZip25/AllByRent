-- Stage 19: private access codes + listing geo (G1, G3–G6 foundation).

-- ---------------------------------------------------------------------------
-- G1: contactless unlock codes out of public listings.handoff
-- ---------------------------------------------------------------------------
create table if not exists public.listing_access_secrets (
  listing_id uuid primary key references public.listings (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  contactless_instructions text not null default '',
  updated_at timestamptz not null default now()
);

create index if not exists listing_access_secrets_owner_id_idx
  on public.listing_access_secrets (owner_id);

alter table public.listing_access_secrets enable row level security;

drop policy if exists "listing_access_secrets_owner_all" on public.listing_access_secrets;
create policy "listing_access_secrets_owner_all"
  on public.listing_access_secrets
  for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists "listing_access_secrets_participant_select" on public.listing_access_secrets;
create policy "listing_access_secrets_participant_select"
  on public.listing_access_secrets
  for select
  using (
    exists (
      select 1
      from public.rentals r
      where r.listing_id = listing_access_secrets.listing_id
        and (r.owner_id = auth.uid() or r.renter_id = auth.uid())
    )
  );

-- Backfill from public handoff JSON, then strip the key.
insert into public.listing_access_secrets (listing_id, owner_id, contactless_instructions)
select
  l.id,
  l.owner_id,
  coalesce(l.handoff->>'contactlessInstructions', '')
from public.listings l
where coalesce(l.handoff->>'contactlessInstructions', '') <> ''
on conflict (listing_id) do update
  set contactless_instructions = excluded.contactless_instructions,
      updated_at = now();

update public.listings
set handoff = handoff - 'contactlessInstructions'
where handoff ? 'contactlessInstructions';

-- ---------------------------------------------------------------------------
-- G3–G5: lat/lng + city_key on listings
-- ---------------------------------------------------------------------------
alter table public.listings
  add column if not exists lat double precision,
  add column if not exists lng double precision,
  add column if not exists city_key text;

create index if not exists listings_lat_lng_idx
  on public.listings (lat, lng)
  where lat is not null and lng is not null;

create index if not exists listings_city_key_idx
  on public.listings (city_key)
  where city_key is not null;

-- Seed coords from owner profile when available.
update public.listings l
set
  lat = coalesce(l.lat, p.location_lat),
  lng = coalesce(l.lng, p.location_lng)
from public.profiles p
where p.id = l.owner_id
  and (l.lat is null or l.lng is null)
  and p.location_lat is not null
  and p.location_lng is not null;

-- Best-effort city_key from free-text city (lowercase, stripped commas).
update public.listings
set city_key = lower(regexp_replace(trim(city), '\s+', ' ', 'g'))
where city is not null
  and trim(city) <> ''
  and city_key is null;

-- Radius browse: miles around a center (G3).
create or replace function public.listings_within_radius(
  p_lat double precision,
  p_lng double precision,
  p_radius_mi double precision,
  p_limit integer default 200
)
returns setof public.listings
language sql
stable
security invoker
set search_path = public
as $$
  select l.*
  from public.listings l
  where l.listing_status = 'active'
    and l.lat is not null
    and l.lng is not null
    and p_radius_mi > 0
    and (
      3958.7613 * acos(
        least(
          1.0,
          greatest(
            -1.0,
            cos(radians(p_lat)) * cos(radians(l.lat))
              * cos(radians(l.lng) - radians(p_lng))
              + sin(radians(p_lat)) * sin(radians(l.lat))
          )
        )
      )
    ) <= p_radius_mi
  order by
    l.boosted_until desc nulls last,
    (
      3958.7613 * acos(
        least(
          1.0,
          greatest(
            -1.0,
            cos(radians(p_lat)) * cos(radians(l.lat))
              * cos(radians(l.lng) - radians(p_lng))
              + sin(radians(p_lat)) * sin(radians(l.lat))
          )
        )
      )
    ) asc
  limit greatest(1, least(coalesce(p_limit, 200), 500));
$$;

revoke all on function public.listings_within_radius(double precision, double precision, double precision, integer) from public;
grant execute on function public.listings_within_radius(double precision, double precision, double precision, integer)
  to anon, authenticated, service_role;

-- G6: when a host updates profile location, push city/coords to their active listings.
create or replace function public.profiles_sync_listing_geo()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op <> 'UPDATE' then
    return new;
  end if;
  if
    new.location_lat is not distinct from old.location_lat
    and new.location_lng is not distinct from old.location_lng
    and new.location_city is not distinct from old.location_city
    and new.location_label is not distinct from old.location_label
  then
    return new;
  end if;

  update public.listings
  set
    lat = coalesce(new.location_lat, lat),
    lng = coalesce(new.location_lng, lng),
    city = case
      when coalesce(new.location_city, '') <> '' then new.location_city
      when coalesce(new.location_label, '') <> '' then new.location_label
      else city
    end,
    city_key = case
      when coalesce(new.location_city, '') <> '' then lower(regexp_replace(trim(new.location_city), '\s+', ' ', 'g'))
      when coalesce(new.location_label, '') <> '' then lower(regexp_replace(trim(new.location_label), '\s+', ' ', 'g'))
      else city_key
    end,
    updated_at = now()
  where owner_id = new.id
    and listing_status in ('active', 'draft', 'paused');

  return new;
end;
$$;

drop trigger if exists profiles_sync_listing_geo on public.profiles;
create trigger profiles_sync_listing_geo
  after update of location_lat, location_lng, location_city, location_label
  on public.profiles
  for each row execute function public.profiles_sync_listing_geo();
