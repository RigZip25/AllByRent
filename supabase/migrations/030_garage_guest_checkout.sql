-- Guest cart checkout: buyer may pay without an account.
-- Platform fee is taken from the seller via Connect application_fee (buyer pays listed price).

alter table public.garage_orders
  alter column buyer_id drop not null;

alter table public.garage_orders
  add column if not exists guest_email text;

alter table public.garage_orders
  drop constraint if exists garage_orders_buyer_or_guest_chk;

alter table public.garage_orders
  add constraint garage_orders_buyer_or_guest_chk
  check (buyer_id is not null or (guest_email is not null and length(trim(guest_email)) > 3));

create index if not exists garage_orders_guest_email_idx
  on public.garage_orders (guest_email)
  where guest_email is not null;
