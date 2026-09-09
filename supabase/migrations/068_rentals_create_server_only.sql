-- Q8: bookings must be created by /api/rentals/create (service role), which
-- quotes rental_total_cents from the listing × dates. Client insert was the
-- hole that let a renter write an arbitrary total; migration 053 then froze it.
--
-- Authenticated participants lose INSERT. Service role bypasses RLS, so the
-- create route still works. SELECT/UPDATE/DELETE policies are unchanged.

drop policy if exists "rentals_insert_owner_or_renter" on public.rentals;
