-- Unique garage handle + optional neighborhood label (not a street address).

alter table public.garage_storefronts
  add column if not exists shop_slug text not null default '',
  add column if not exists neighborhood text not null default '';

comment on column public.garage_storefronts.shop_slug is
  'URL-safe unique garage handle (empty until host sets a shop name)';
comment on column public.garage_storefronts.neighborhood is
  'Optional public neighborhood label (e.g. Zilker) — never a street address';

create unique index if not exists garage_storefronts_shop_slug_unique
  on public.garage_storefronts (lower(shop_slug))
  where shop_slug <> '';
