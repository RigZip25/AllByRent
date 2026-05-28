-- Rentals table (bookings) + RLS policies

create table if not exists public.rentals (
  id uuid primary key,
  listing_id uuid not null references public.listings (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  renter_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending_approval',
  start_date date not null,
  end_date date not null,
  pickup_pin text,
  return_pin text,
  booking_mode text,
  delivery_address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists rentals_owner_id_idx on public.rentals (owner_id);
create index if not exists rentals_renter_id_idx on public.rentals (renter_id);
create index if not exists rentals_listing_id_idx on public.rentals (listing_id);
create index if not exists rentals_status_idx on public.rentals (status);

alter table public.rentals enable row level security;

drop policy if exists "rentals_select_owner_or_renter" on public.rentals;
create policy "rentals_select_owner_or_renter"
  on public.rentals for select
  using (
    owner_id = auth.uid()
    or renter_id = auth.uid()
  );

drop policy if exists "rentals_insert_owner_or_renter" on public.rentals;
create policy "rentals_insert_owner_or_renter"
  on public.rentals for insert
  with check (
    owner_id = auth.uid()
    or renter_id = auth.uid()
  );

drop policy if exists "rentals_update_owner_or_renter" on public.rentals;
create policy "rentals_update_owner_or_renter"
  on public.rentals for update
  using (
    owner_id = auth.uid()
    or renter_id = auth.uid()
  )
  with check (
    owner_id = auth.uid()
    or renter_id = auth.uid()
  );

drop policy if exists "rentals_delete_owner_or_renter" on public.rentals;
create policy "rentals_delete_owner_or_renter"
  on public.rentals for delete
  using (
    owner_id = auth.uid()
    or renter_id = auth.uid()
  );

create or replace function public.set_rentals_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists rentals_updated_at on public.rentals;
create trigger rentals_updated_at
  before update on public.rentals
  for each row execute function public.set_rentals_updated_at();

