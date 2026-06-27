-- Saved listing favorites per user

create table if not exists public.favorite_listings (
  user_id uuid not null references auth.users (id) on delete cascade,
  listing_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

create index if not exists favorite_listings_user_id_idx on public.favorite_listings (user_id);

alter table public.favorite_listings enable row level security;

drop policy if exists "favorite_listings_select_own" on public.favorite_listings;
create policy "favorite_listings_select_own"
  on public.favorite_listings for select
  using (user_id = auth.uid());

drop policy if exists "favorite_listings_insert_own" on public.favorite_listings;
create policy "favorite_listings_insert_own"
  on public.favorite_listings for insert
  with check (user_id = auth.uid());

drop policy if exists "favorite_listings_delete_own" on public.favorite_listings;
create policy "favorite_listings_delete_own"
  on public.favorite_listings for delete
  using (user_id = auth.uid());
