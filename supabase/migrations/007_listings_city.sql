-- Add city label for browse filtering (denormalized from host/profile at publish time)

alter table public.listings
  add column if not exists city text not null default '';

create index if not exists listings_city_idx on public.listings (city);

