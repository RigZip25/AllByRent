-- Stage 4 / G2: Open Sale lot results (winner + pay window) live on the server.
-- Also G4 pay_by on neighbor offers, G13 first-highest tie-break in bid RPC,
-- and allow accepted → expired when the pay window lapses.

-- Paste into Supabase SQL editor if migrations are applied manually:

create table if not exists public.open_sale_lot_results (
  event_id uuid not null references public.open_sale_events (id) on delete cascade,
  listing_id uuid not null,
  status text not null
    check (status in ('awaiting_checkout', 'sold', 'returned')),
  winner_bidder_id text,
  amount_cents integer check (amount_cents is null or amount_cents > 0),
  pay_by timestamptz,
  forfeited_bidder_ids jsonb not null default '[]'::jsonb,
  reason text,
  updated_at timestamptz not null default now(),
  primary key (event_id, listing_id)
);

create index if not exists open_sale_lot_results_listing_id_idx
  on public.open_sale_lot_results (listing_id);
create index if not exists open_sale_lot_results_winner_idx
  on public.open_sale_lot_results (winner_bidder_id);
create index if not exists open_sale_lot_results_status_idx
  on public.open_sale_lot_results (status);

alter table public.open_sale_lot_results enable row level security;

-- Hosts read results for their own events.
drop policy if exists open_sale_lot_results_host_select on public.open_sale_lot_results;
create policy open_sale_lot_results_host_select on public.open_sale_lot_results
  for select using (
    exists (
      select 1 from public.open_sale_events e
      where e.id = event_id and e.host_id = auth.uid()
    )
  );

-- Buyers can read their own awaiting / sold rows (winner_bidder_id matches auth uid).
drop policy if exists open_sale_lot_results_winner_select on public.open_sale_lot_results;
create policy open_sale_lot_results_winner_select on public.open_sale_lot_results
  for select using (
    winner_bidder_id is not null
    and winner_bidder_id = auth.uid()::text
    and status in ('awaiting_checkout', 'sold')
  );

-- No client writes — cron / service role only.
-- (service_role bypasses RLS)

-- G4: payment deadline on accepted neighbor offers
alter table public.garage_neighbor_offers
  add column if not exists pay_by timestamptz;

alter table public.garage_neighbor_offers
  drop constraint if exists garage_neighbor_offers_status_check;

alter table public.garage_neighbor_offers
  add constraint garage_neighbor_offers_status_check
  check (
    status in (
      'pending_host',
      'pending_buyer',
      'accepted',
      'declined',
      'withdrawn',
      'expired'
    )
  );

-- Allow host/buyer (and service role) to mark unpaid accepted offers expired.
create or replace function public.garage_offers_guard_transition()
returns trigger
language plpgsql
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
    if new.status not in ('accepted', 'declined', 'pending_buyer', 'expired') then
      new.status := old.status;
    end if;
  elsif caller = old.buyer_id then
    if new.status = 'withdrawn' then
      null;
    elsif new.status = 'expired' and old.status = 'accepted' then
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

-- G13: first highest bid wins on ties (amount desc, placed_at asc)
create or replace function public.place_open_sale_bid(
  p_event_id uuid,
  p_listing_id uuid,
  p_amount_cents integer,
  p_listing_title text default 'Sale item'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_bidder uuid := auth.uid();
  v_event public.open_sale_events%rowtype;
  v_lot public.open_sale_lots%rowtype;
  v_status text;
  v_now timestamptz := timezone('utc', now());
  v_high_cents integer := 0;
  v_prev_bidder text;
  v_need_cents integer;
  v_new_ends timestamptz;
  v_soft_ms interval := interval '45 seconds';
begin
  if v_bidder is null then
    return jsonb_build_object('ok', false, 'reason', 'Sign in to bid');
  end if;
  if p_amount_cents is null or p_amount_cents <= 0 then
    return jsonb_build_object('ok', false, 'reason', 'Invalid bid amount');
  end if;

  if exists (
    select 1 from public.open_sale_bans b
    where b.bidder_id = v_bidder and b.banned_until > v_now
  ) then
    return jsonb_build_object('ok', false, 'reason', 'Paused from Open Sales for 30 days after a missed payment');
  end if;

  select * into v_event
  from public.open_sale_events
  where id = p_event_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'reason', 'Open Sale not found');
  end if;

  v_status := public.open_sale_refresh_status(v_event);
  if v_status <> v_event.status then
    update public.open_sale_events
    set status = v_status, updated_at = v_now
    where id = v_event.id;
    v_event.status := v_status;
  end if;

  if v_event.status in ('ended', 'cancelled') then
    return jsonb_build_object('ok', false, 'reason', 'Open Sale ended');
  end if;
  if v_now >= v_event.hard_ends_at then
    update public.open_sale_events
    set status = 'ended', updated_at = v_now
    where id = v_event.id;
    return jsonb_build_object('ok', false, 'reason', 'Hard cutoff — no more bids');
  end if;
  if v_event.status = 'live' and v_now >= v_event.ends_at then
    update public.open_sale_events
    set status = 'ended', updated_at = v_now
    where id = v_event.id;
    return jsonb_build_object('ok', false, 'reason', 'Open Sale ended');
  end if;

  select * into v_lot
  from public.open_sale_lots
  where event_id = p_event_id and listing_id = p_listing_id;

  if not found then
    return jsonb_build_object('ok', false, 'reason', 'Item is not on this Open Sale');
  end if;

  if p_amount_cents < v_lot.min_bid_cents then
    return jsonb_build_object(
      'ok', false,
      'reason', format('Bid must be at least $%s', (v_lot.min_bid_cents::numeric / 100))
    );
  end if;

  -- First highest wins: amount desc, then earliest placed_at.
  select coalesce(max(amount_cents), 0),
         (array_agg(bidder_id order by amount_cents desc, placed_at asc))[1]
    into v_high_cents, v_prev_bidder
  from public.garage_bids
  where listing_id = p_listing_id;

  if v_high_cents <= 0 then
    null;
  elsif v_prev_bidder = v_bidder::text then
    if p_amount_cents < v_high_cents + v_lot.bid_step_cents then
      return jsonb_build_object(
        'ok', false,
        'reason', format('Raise to at least $%s', ((v_high_cents + v_lot.bid_step_cents)::numeric / 100))
      );
    end if;
  else
    v_need_cents := v_high_cents + v_lot.bid_step_cents;
    if p_amount_cents < v_need_cents then
      return jsonb_build_object(
        'ok', false,
        'reason', format('Raise to at least $%s', (v_need_cents::numeric / 100))
      );
    end if;
  end if;

  if v_event.status = 'live' and v_event.ends_at - v_now <= v_soft_ms then
    v_new_ends := least(v_now + v_soft_ms, v_event.hard_ends_at);
    if v_new_ends > v_event.ends_at then
      update public.open_sale_events
      set ends_at = v_new_ends, updated_at = v_now
      where id = v_event.id;
      v_event.ends_at := v_new_ends;
    end if;
  end if;

  insert into public.garage_bids (listing_id, host_id, bidder_id, amount_cents, placed_at)
  values (p_listing_id, v_event.host_id, v_bidder::text, p_amount_cents, v_now);

  if v_prev_bidder is not null
     and v_prev_bidder <> v_bidder::text
     and v_prev_bidder ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  then
    insert into public.notifications (id, recipient_id, actor_id, type, title, body)
    values (
      gen_random_uuid(),
      v_prev_bidder::uuid,
      v_bidder,
      'general',
      'You''ve been outbid',
      format('%s — high bid is now $%s. Open your cart to raise.', coalesce(nullif(p_listing_title, ''), 'Sale item'), (p_amount_cents::numeric / 100))
    );
  end if;

  return jsonb_build_object(
    'ok', true,
    'amountCents', p_amount_cents,
    'endsAt', v_event.ends_at,
    'hardEndsAt', v_event.hard_ends_at,
    'status', v_event.status,
    'bidderId', v_bidder
  );
end;
$$;

revoke all on function public.place_open_sale_bid(uuid, uuid, integer, text) from public;
grant execute on function public.place_open_sale_bid(uuid, uuid, integer, text) to authenticated;
