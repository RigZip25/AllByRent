-- Dual-sided QR handoff: each party confirms their side of pickup/return.
alter table public.rentals
  add column if not exists host_handed_over_at timestamptz,
  add column if not exists renter_received_at timestamptz,
  add column if not exists renter_returned_at timestamptz,
  add column if not exists host_accepted_return_at timestamptz;

create index if not exists rentals_host_handed_over_at_idx
  on public.rentals (host_handed_over_at);

create index if not exists rentals_renter_received_at_idx
  on public.rentals (renter_received_at);
