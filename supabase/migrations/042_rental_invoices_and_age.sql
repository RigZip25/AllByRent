-- Invoice payment sync + renter date of birth for vehicle age gate.

alter table public.rentals
  add column if not exists rental_invoices jsonb;

comment on column public.rentals.rental_invoices is
  'Host-issued post-rental invoices (fuel/toll/late/damage). Webhook marks paid when Stripe rental_invoice PaymentIntent succeeds.';

alter table public.profiles
  add column if not exists date_of_birth date;

comment on column public.profiles.date_of_birth is
  'Renter date of birth (YYYY-MM-DD) for vehicle min-age / young-driver hold. Optional until Vehicles booking.';
