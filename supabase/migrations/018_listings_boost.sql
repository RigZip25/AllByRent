-- Listing boost fields (paid spotlight)

alter table public.listings
  add column if not exists boosted_until timestamptz,
  add column if not exists boosted_tier integer;

create index if not exists listings_boosted_until_idx on public.listings (boosted_until);

