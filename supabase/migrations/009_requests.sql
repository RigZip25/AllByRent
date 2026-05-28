-- Requests table (wanted posts) + RLS policies

create table if not exists public.requests (
  id uuid primary key,
  renter_id uuid not null references auth.users (id) on delete cascade,
  category text not null default '',
  subcategory text not null default '',
  description text not null default '',
  location_label text not null default '',
  start_date date,
  end_date date,
  created_at timestamptz not null default now()
);

create index if not exists requests_renter_id_idx on public.requests (renter_id);
create index if not exists requests_category_idx on public.requests (category);
create index if not exists requests_subcategory_idx on public.requests (subcategory);
create index if not exists requests_location_idx on public.requests (location_label);
create index if not exists requests_created_at_idx on public.requests (created_at);

alter table public.requests enable row level security;

-- Everyone can read requests (they're meant to signal local demand).
drop policy if exists "requests_select_all" on public.requests;
create policy "requests_select_all"
  on public.requests for select
  using (true);

-- Renter can create/update/delete their own request.
drop policy if exists "requests_insert_own" on public.requests;
create policy "requests_insert_own"
  on public.requests for insert
  with check (renter_id = auth.uid());

drop policy if exists "requests_update_own" on public.requests;
create policy "requests_update_own"
  on public.requests for update
  using (renter_id = auth.uid())
  with check (renter_id = auth.uid());

drop policy if exists "requests_delete_own" on public.requests;
create policy "requests_delete_own"
  on public.requests for delete
  using (renter_id = auth.uid());

