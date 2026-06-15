-- Deadline for owner to capture security deposit (48h after return)

alter table public.rentals
  add column if not exists deposit_claim_deadline_at timestamptz;

create index if not exists rentals_deposit_claim_deadline_at_idx
  on public.rentals (deposit_claim_deadline_at);
