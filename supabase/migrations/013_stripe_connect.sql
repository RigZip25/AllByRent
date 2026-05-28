-- Stripe Connect fields on profiles

alter table public.profiles
  add column if not exists stripe_connect_account_id text;

alter table public.profiles
  add column if not exists stripe_payouts_enabled boolean not null default false;

alter table public.profiles
  add column if not exists stripe_bank_last4 text;

