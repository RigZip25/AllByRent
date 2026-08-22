-- Garage store open/closed for neighbors (Live tumbler). Default closed.

alter table public.garage_storefronts
  add column if not exists store_live boolean not null default false;

comment on column public.garage_storefronts.store_live is
  'When true, neighbors can see this host profile and on-shelf listings. Requires Stripe Connect before turning on in app.';
