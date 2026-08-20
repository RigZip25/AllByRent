-- Durable rental agreement snapshot + e-accept signatures (clickwrap).
alter table public.rentals
  add column if not exists rental_agreement jsonb;

comment on column public.rentals.rental_agreement is
  'Versioned rental terms snapshot + renter/host e-accept (name, user id, timestamp). Not a DocuSign substitute.';
