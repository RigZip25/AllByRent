-- Listings table (published inventory) + RLS policies

create table if not exists public.listings (
  id uuid primary key,
  owner_id uuid not null references auth.users (id) on delete cascade,
  title text not null default '',
  category text not null default '',
  subcategory text not null default '',
  grade text not null default '',
  condition text not null default '',
  description text not null default '',
  replacement_value numeric,
  photos jsonb not null default '[]'::jsonb,
  modes text[] not null default '{}'::text[],
  pricing jsonb not null default '{}'::jsonb,
  availability jsonb not null default '{}'::jsonb,
  handoff jsonb not null default '{}'::jsonb,
  qr_code text,
  listing_status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists listings_owner_id_idx on public.listings (owner_id);
create index if not exists listings_status_idx on public.listings (listing_status);
create index if not exists listings_category_idx on public.listings (category);
create index if not exists listings_subcategory_idx on public.listings (subcategory);

alter table public.listings enable row level security;

-- Everyone can read active listings; owner can always read their own.
drop policy if exists "listings_select_active_or_owner" on public.listings;
create policy "listings_select_active_or_owner"
  on public.listings for select
  using (
    listing_status = 'active'
    or owner_id = auth.uid()
  );

-- Owner can insert/update/delete their own listings.
drop policy if exists "listings_insert_own" on public.listings;
create policy "listings_insert_own"
  on public.listings for insert
  with check (owner_id = auth.uid());

drop policy if exists "listings_update_own" on public.listings;
create policy "listings_update_own"
  on public.listings for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists "listings_delete_own" on public.listings;
create policy "listings_delete_own"
  on public.listings for delete
  using (owner_id = auth.uid());

create or replace function public.set_listings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists listings_updated_at on public.listings;
create trigger listings_updated_at
  before update on public.listings
  for each row execute function public.set_listings_updated_at();

