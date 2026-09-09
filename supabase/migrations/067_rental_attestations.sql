-- Stage 21: persist renter trust attestations on rentals (L1 / L9).
-- Checkbox state previously lived only in localStorage and vanished on second device / dispute.

alter table public.rentals
  add column if not exists renter_attestations jsonb;

comment on column public.rentals.renter_attestations is
  'Snapshot of renter trust checkboxes at booking (and later updates): which gate was attested and when. Used for disputes and agreement text — not a DocuSign substitute.';
