-- Public garage storefront look (accent / personal-pro / shop name) for neighbor chrome.

create table if not exists public.garage_storefronts (
  host_id uuid primary key references public.profiles (id) on delete cascade,
  shop_kind text not null default 'personal'
    check (shop_kind in ('personal', 'pro')),
  accent_id text not null default 'forest',
  shop_name text not null default '',
  updated_at timestamptz not null default now()
);

comment on table public.garage_storefronts is
  'Host-chosen garage look: personal/pro + accent color + optional shop name';

alter table public.garage_storefronts enable row level security;

drop policy if exists garage_storefronts_public_read on public.garage_storefronts;
create policy garage_storefronts_public_read
  on public.garage_storefronts for select
  using (true);

drop policy if exists garage_storefronts_host_write on public.garage_storefronts;
create policy garage_storefronts_host_write
  on public.garage_storefronts for all
  using (auth.uid() = host_id)
  with check (auth.uid() = host_id);
