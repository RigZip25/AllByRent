-- Add insurance/payment/deposit + automation fields to rentals

alter table public.rentals
  add column if not exists safely_policy_id text,
  add column if not exists insurance_fee_cents integer not null default 0,
  add column if not exists stripe_payment_intent_id text,
  add column if not exists stripe_payment_status text,
  add column if not exists stripe_deposit_payment_intent_id text,
  add column if not exists deposit_amount_cents integer not null default 0,
  add column if not exists deposit_status text,
  add column if not exists pickup_at timestamptz,
  add column if not exists due_at timestamptz,
  add column if not exists picked_up_at timestamptz,
  add column if not exists returned_at timestamptz,
  add column if not exists no_show_marked_at timestamptz,
  add column if not exists no_show_fee_cents integer not null default 0,
  add column if not exists late_fee_cents integer not null default 0,
  add column if not exists late_fee_applied_at timestamptz;

create index if not exists rentals_pickup_at_idx on public.rentals (pickup_at);
create index if not exists rentals_due_at_idx on public.rentals (due_at);
create index if not exists rentals_safely_policy_id_idx on public.rentals (safely_policy_id);
create index if not exists rentals_stripe_payment_intent_id_idx on public.rentals (stripe_payment_intent_id);

