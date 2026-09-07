-- Narrow the write surface the anon key exposes.
--
-- RLS was on everywhere, but several policies only asked "are you signed in?"
-- while the app relied on the client to make honest state transitions. The same
-- door is open to anyone holding the public key, so the rules below check who
-- the row is about, not just who is calling.
--
-- Where a value is decided by the server (Stripe webhooks), the guard silently
-- restores the old value instead of raising: clients sync whole rows, and an
-- error would break a legitimate save that merely echoes an unchanged field.

-- R4: any signed-in user could ban any bidder for 30 days.
-- No client calls this; only the service role should.
revoke all on function public.ban_open_sale_bidder(uuid, integer, text) from authenticated;
revoke all on function public.ban_open_sale_bidder(uuid, integer, text) from anon;

-- R8: a bid claimed whatever bidder it liked. Guests bid under a local
-- `bidder-*` id, so the rule is: your own id, or an id that cannot belong to a
-- registered account.
drop policy if exists garage_bids_insert on public.garage_bids;
create policy garage_bids_insert on public.garage_bids
  for insert with check (
    bidder_id = auth.uid()::text
    or bidder_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  );

-- R10: a review only needs to be about a rental the author took part in,
-- and must be addressed to the other side of that rental.
drop policy if exists "reviews_insert_own" on public.reviews;
create policy "reviews_insert_own"
  on public.reviews for insert
  with check (
    reviewer_id = auth.uid()
    and reviewee_id <> auth.uid()
    and exists (
      select 1
      from public.rentals r
      where r.id = reviews.rental_id
        and (r.owner_id = auth.uid() or r.renter_id = auth.uid())
        and (r.owner_id = reviews.reviewee_id or r.renter_id = reviews.reviewee_id)
    )
  );

-- R11: a booking named an arbitrary host, which let anyone block a stranger's
-- calendar. The host on the row must be the listing's actual owner.
drop policy if exists "rentals_insert_owner_or_renter" on public.rentals;
create policy "rentals_insert_owner_or_renter"
  on public.rentals for insert
  with check (
    (owner_id = auth.uid() or renter_id = auth.uid())
    and exists (
      select 1 from public.listings l
      where l.id = rentals.listing_id
        and l.owner_id = rentals.owner_id
    )
  );

-- R9: the buyer could accept their own offer. Each side may only make the
-- moves the flow gives it: the host answers an offer, the buyer answers a
-- counter-offer or walks away.
create or replace function public.garage_offers_guard_transition()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  caller uuid := auth.uid();
begin
  if coalesce(auth.role(), '') = 'service_role' or caller is null then
    return new;
  end if;

  if new.status is not distinct from old.status then
    return new;
  end if;

  if caller = old.host_id then
    -- Host: accept, counter or decline whatever is waiting on them.
    if new.status not in ('accepted', 'declined', 'pending_buyer') then
      new.status := old.status;
    end if;
  elsif caller = old.buyer_id then
    if new.status = 'withdrawn' then
      null;
    elsif new.status in ('accepted', 'declined') and old.status = 'pending_buyer' then
      null;
    else
      new.status := old.status;
    end if;
  else
    new.status := old.status;
  end if;

  return new;
end;
$$;

drop trigger if exists garage_offers_guard_transition on public.garage_neighbor_offers;
create trigger garage_offers_guard_transition
  before update on public.garage_neighbor_offers
  for each row execute function public.garage_offers_guard_transition();

-- R12: trust badges and payout state were self-assignable. Identity comes from
-- the Stripe Identity webhook, payouts from the Connect sync, and the rating
-- from reviews — none of them from the profile owner.
create or replace function public.profiles_protect_trust_fields()
returns trigger
language plpgsql
as $$
begin
  if coalesce(auth.role(), '') = 'service_role' then
    return new;
  end if;

  if tg_op = 'INSERT' then
    -- The client creates its own profile row, so the badges start empty.
    new.identity_verified := false;
    new.stripe_payouts_enabled := false;
    new.rating := null;
  else
    new.identity_verified := coalesce(old.identity_verified, false);
    new.stripe_payouts_enabled := coalesce(old.stripe_payouts_enabled, false);
    new.rating := old.rating;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_trust_fields on public.profiles;
create trigger profiles_protect_trust_fields
  before insert or update on public.profiles
  for each row execute function public.profiles_protect_trust_fields();

-- R5: paid promotion was one direct write away from being free. Boost windows
-- are set by the Stripe webhook after payment.
create or replace function public.listings_protect_boost()
returns trigger
language plpgsql
as $$
begin
  if coalesce(auth.role(), '') = 'service_role' then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.boosted_until := null;
    new.boosted_tier := null;
  else
    new.boosted_until := old.boosted_until;
    new.boosted_tier := old.boosted_tier;
  end if;
  return new;
end;
$$;

drop trigger if exists listings_protect_boost on public.listings;
create trigger listings_protect_boost
  before insert or update on public.listings
  for each row execute function public.listings_protect_boost();
