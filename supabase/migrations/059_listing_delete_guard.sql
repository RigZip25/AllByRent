-- Deleting a listing deleted the rentals on it.
--
-- `rentals.listing_id` cascades (migration 006), so "Delete listing" on a
-- listing with an item currently out on rent removed the booking itself: the
-- renter's copy of the deal, the handoff PINs, the deposit record, the invoices,
-- the dispute it was attached to. The host holding a paid rental could erase it
-- from both sides with one button, and nothing about the money it had taken.
--
-- A listing with a rental that still occupies the calendar cannot be deleted at
-- all. The same statuses `rentals_reject_overlap` treats as busy: the ones
-- where the item is booked, out, late, or being argued over. Once every rental
-- on it is finished or cancelled the listing deletes as before, taking its
-- history with it.
--
-- Pausing is untouched: a host may stop taking new bookings at any time, and
-- the rental already running is unaffected.

create or replace function public.listings_block_delete_with_live_rental()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  live_count integer;
begin
  select count(*)::integer
  into live_count
  from public.rentals r
  where r.listing_id = old.id
    and r.status in (
      'pending_approval',
      'pending_checkin',
      'active',
      'upcoming',
      'overdue',
      'disputed',
      'no_show'
    );

  if live_count > 0 then
    raise exception
      'This listing has % rental(s) that are booked, out, or in dispute. Finish or cancel them before deleting it.',
      live_count
      using errcode = 'P0001';
  end if;

  return old;
end;
$$;

drop trigger if exists listings_block_delete_with_live_rental on public.listings;
create trigger listings_block_delete_with_live_rental
  before delete on public.listings
  for each row execute function public.listings_block_delete_with_live_rental();
