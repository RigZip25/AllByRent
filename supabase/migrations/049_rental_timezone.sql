-- Rental deadlines are wall-clock promises ("back by the end of the 15th").
-- Without the zone the item lives in, the server cannot recompute the same
-- moment the renter agreed to: it fell back to UTC end-of-day, which fires
-- mid-afternoon in the Americas and after midnight in Europe.
--
-- Rows written before this column existed stay null and keep their old UTC
-- reading; every new booking stamps the zone it was made in.

alter table public.rentals
  add column if not exists timezone text;

comment on column public.rentals.timezone is
  'IANA zone the rental dates are expressed in (e.g. America/Chicago). Null on rows created before 049; those fall back to UTC.';
