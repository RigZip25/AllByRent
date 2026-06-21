-- Garage commerce + neighbor follows (production)

create table if not exists public.garage_orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  host_id uuid not null references public.profiles (id) on delete cascade,
  stripe_payment_intent_id text,
  stripe_payment_status text,
  subtotal_cents integer not null default 0 check (subtotal_cents >= 0),
  platform_fee_cents integer not null default 0 check (platform_fee_cents >= 0),
  total_cents integer not null default 0 check (total_cents >= 0),
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.garage_order_lines (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.garage_orders (id) on delete cascade,
  listing_id uuid not null,
  title text not null default '',
  price_cents integer not null default 0 check (price_cents >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.garage_auction_payments (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null,
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  host_id uuid not null references public.profiles (id) on delete cascade,
  stripe_payment_intent_id text,
  stripe_payment_status text,
  winning_bid_cents integer not null default 0 check (winning_bid_cents >= 0),
  platform_fee_cents integer not null default 0 check (platform_fee_cents >= 0),
  total_cents integer not null default 0 check (total_cents >= 0),
  runner_up_attempt integer not null default 1,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.garage_follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  host_id uuid not null references public.profiles (id) on delete cascade,
  notify_new_listings boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (follower_id, host_id)
);

alter table public.profiles
  add column if not exists subscription_plan_id text;

create index if not exists garage_orders_buyer_id_idx on public.garage_orders (buyer_id);
create index if not exists garage_orders_host_id_idx on public.garage_orders (host_id);
create index if not exists garage_auction_payments_listing_id_idx on public.garage_auction_payments (listing_id);
create index if not exists garage_follows_host_id_idx on public.garage_follows (host_id);

alter table public.garage_orders enable row level security;
alter table public.garage_order_lines enable row level security;
alter table public.garage_auction_payments enable row level security;
alter table public.garage_follows enable row level security;

create policy garage_orders_select on public.garage_orders
  for select using (auth.uid() = buyer_id or auth.uid() = host_id);

create policy garage_order_lines_select on public.garage_order_lines
  for select using (
    exists (
      select 1 from public.garage_orders o
      where o.id = order_id and (o.buyer_id = auth.uid() or o.host_id = auth.uid())
    )
  );

create policy garage_auction_payments_select on public.garage_auction_payments
  for select using (auth.uid() = buyer_id or auth.uid() = host_id);

create policy garage_follows_select on public.garage_follows
  for select using (auth.uid() = follower_id or auth.uid() = host_id);

create policy garage_follows_insert on public.garage_follows
  for insert with check (auth.uid() = follower_id);

create policy garage_follows_delete on public.garage_follows
  for delete using (auth.uid() = follower_id);
