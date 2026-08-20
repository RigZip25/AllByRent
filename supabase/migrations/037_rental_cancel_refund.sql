-- Optional cancel metadata (app cancels via status=cancelled without these columns).
-- Paste in Supabase SQL editor if you want durable cancel/refund audit fields.
-- Busy calendar already frees on status cancelled (035 overlap trigger).

alter table public.rentals
  add column if not exists cancelled_at timestamptz,
  add column if not exists cancelled_by text,
  add column if not exists cancel_refund_percent integer,
  add column if not exists cancel_refund_status text;

comment on column public.rentals.cancelled_by is 'host | renter';
comment on column public.rentals.cancel_refund_status is 'none | released | refund_submitted | processing | contact_support';
