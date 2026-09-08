-- Three tables the public key could read whole.
--
-- Every one of them has a reason to be readable without an account — a guest
-- browsing the neighborhood sees asks, shelves and opening hours. What they
-- did not need is the archive: `select *` with the anon key returned every ask
-- ever posted, the state of every lot including the ones nobody published, and
-- the weekly hours of every host who ever opened the schedule screen. Together
-- that is a map of local demand and a list of when people are out.
--
-- Each policy now returns what the screen shows and nothing behind it.

-- Asks: the live ones. The author always sees their own, closed or expired.
drop policy if exists "requests_select_all" on public.requests;
drop policy if exists "requests_select_live" on public.requests;
create policy "requests_select_live"
  on public.requests for select
  using (
    renter_id = auth.uid()
    or (
      status = 'open'
      and (expires_at is null or expires_at > now())
    )
  );

-- Lot state belongs to a listing; if the listing is not visible to you, its
-- price, its bids and its sale state are not either.
drop policy if exists garage_lot_states_select on public.garage_lot_states;
create policy garage_lot_states_select
  on public.garage_lot_states for select
  using (
    host_id = auth.uid()
    or exists (
      select 1 from public.listings l
      where l.id = garage_lot_states.listing_id
    )
  );

-- Opening hours: only for a garage that is actually open to neighbors. A host
-- who set hours and never went live is not publishing when they are home.
drop policy if exists "garage_sale_schedules_public_read" on public.garage_sale_schedules;
drop policy if exists "garage_sale_schedules_live_read" on public.garage_sale_schedules;
create policy "garage_sale_schedules_live_read"
  on public.garage_sale_schedules for select
  using (
    host_id = auth.uid()
    or exists (
      select 1 from public.garage_storefronts s
      where s.host_id = garage_sale_schedules.host_id
        and s.store_live
    )
  );
