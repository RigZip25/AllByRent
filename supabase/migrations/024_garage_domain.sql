-- Garage domain: bids, neighbor offers, lot states, schedules, sale prefs

create table if not exists public.garage_bids (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null,
  host_id uuid not null references public.profiles (id) on delete cascade,
  bidder_id text not null,
  amount_cents integer not null check (amount_cents > 0),
  placed_at timestamptz not null default now()
);

create index if not exists garage_bids_listing_id_idx on public.garage_bids (listing_id);
create index if not exists garage_bids_host_id_idx on public.garage_bids (host_id);

create table if not exists public.garage_neighbor_offers (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null,
  host_id uuid not null references public.profiles (id) on delete cascade,
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  amount_cents integer not null check (amount_cents > 0),
  status text not null check (
    status in ('pending_host', 'pending_buyer', 'accepted', 'declined', 'withdrawn')
  ),
  listing_title text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists garage_neighbor_offers_listing_id_idx on public.garage_neighbor_offers (listing_id);
create index if not exists garage_neighbor_offers_host_id_idx on public.garage_neighbor_offers (host_id);
create index if not exists garage_neighbor_offers_buyer_id_idx on public.garage_neighbor_offers (buyer_id);

create table if not exists public.garage_lot_states (
  listing_id uuid primary key,
  host_id uuid not null references public.profiles (id) on delete cascade,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

create index if not exists garage_lot_states_host_id_idx on public.garage_lot_states (host_id);

create table if not exists public.garage_sale_schedules (
  host_id uuid primary key references public.profiles (id) on delete cascade,
  days_of_week integer[] not null default '{6}',
  start_time text not null default '09:00',
  end_time text not null default '13:00',
  updated_at timestamptz not null default now()
);

create table if not exists public.garage_sale_offer_prefs (
  listing_id uuid primary key,
  host_id uuid not null references public.profiles (id) on delete cascade,
  prefs jsonb not null,
  updated_at timestamptz not null default now()
);

create index if not exists garage_sale_offer_prefs_host_id_idx on public.garage_sale_offer_prefs (host_id);

alter table public.garage_bids enable row level security;
alter table public.garage_neighbor_offers enable row level security;
alter table public.garage_lot_states enable row level security;
alter table public.garage_sale_schedules enable row level security;
alter table public.garage_sale_offer_prefs enable row level security;

-- Bids: anyone authenticated can read bids on active listings; insert own bid
create policy garage_bids_select on public.garage_bids
  for select using (auth.uid() is not null);

create policy garage_bids_insert on public.garage_bids
  for insert with check (auth.uid() is not null);

-- Neighbor offers: host and buyer can read/update their offers
create policy garage_neighbor_offers_select on public.garage_neighbor_offers
  for select using (auth.uid() = host_id or auth.uid() = buyer_id);

create policy garage_neighbor_offers_insert on public.garage_neighbor_offers
  for insert with check (auth.uid() = buyer_id);

create policy garage_neighbor_offers_update on public.garage_neighbor_offers
  for update using (auth.uid() = host_id or auth.uid() = buyer_id);

-- Lot states: public read for shop; host can upsert
create policy garage_lot_states_select on public.garage_lot_states
  for select using (true);

create policy garage_lot_states_upsert on public.garage_lot_states
  for all using (auth.uid() = host_id)
  with check (auth.uid() = host_id);

-- Schedules + prefs: host only
create policy garage_sale_schedules_host on public.garage_sale_schedules
  for all using (auth.uid() = host_id)
  with check (auth.uid() = host_id);

create policy garage_sale_offer_prefs_host on public.garage_sale_offer_prefs
  for all using (auth.uid() = host_id)
  with check (auth.uid() = host_id);

-- garage_orders insert for buyers (checkout API uses service role; client read-only)
create policy garage_orders_insert_buyer on public.garage_orders
  for insert with check (auth.uid() = buyer_id);

create policy garage_order_lines_insert on public.garage_order_lines
  for insert with check (
    exists (
      select 1 from public.garage_orders o
      where o.id = order_id and o.buyer_id = auth.uid()
    )
  );

create policy garage_auction_payments_insert on public.garage_auction_payments
  for insert with check (auth.uid() = buyer_id);

alter table public.garage_follows
  add column if not exists notify_open_house boolean not null default true;

create policy garage_follows_update on public.garage_follows
  for update using (auth.uid() = follower_id)
  with check (auth.uid() = follower_id);
