-- Renter-uploaded insurance proof for vehicle / equipment bookings.
-- Host must see an active policy before / at pickup.

alter table public.rentals
  add column if not exists insurance_proof_path text,
  add column if not exists insurance_proof_url text,
  add column if not exists insurance_active_until date,
  add column if not exists insurance_policy_note text;

comment on column public.rentals.insurance_proof_path is
  'Storage path for renter insurance card / declaration page';
comment on column public.rentals.insurance_active_until is
  'Policy must still be active on this date (typically through rental end / pickup day)';
