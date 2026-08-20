-- Open Sale: server-authoritative events + atomic bid placement

create table if not exists public.open_sale_events (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles (id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  hard_ends_at timestamptz not null,
  status text not null default 'presale'
    check (status in ('presale', 'live', 'ended', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint open_sale_events_window_chk check (
    starts_at < ends_at and ends_at <= hard_ends_at
  )
);

create index if not exists open_sale_events_host_id_idx on public.open_sale_events (host_id);
create index if not exists open_sale_events_status_idx on public.open_sale_events (status);

create table if not exists public.open_sale_lots (
  event_id uuid not null references public.open_sale_events (id) on delete cascade,
  listing_id uuid not null,
  min_bid_cents integer not null check (min_bid_cents > 0),
  bid_step_cents integer not null check (bid_step_cents > 0),
  origin text not null default 'garage_mirror'
    check (origin in ('garage_mirror', 'snap_only')),
  primary key (event_id, listing_id)
);

create index if not exists open_sale_lots_listing_id_idx on public.open_sale_lots (listing_id);

create table if not exists public.open_sale_bans (
  bidder_id uuid primary key references public.profiles (id) on delete cascade,
  banned_until timestamptz not null,
  reason text not null default 'missed_payment',
  created_at timestamptz not null default now()
);

alter table public.open_sale_events enable row level security;
alter table public.open_sale_lots enable row level security;
alter table public.open_sale_bans enable row level security;

-- Events: anyone signed-in can read active sales; host writes
drop policy if exists open_sale_events_select on public.open_sale_events;
create policy open_sale_events_select on public.open_sale_events
  for select using (auth.uid() is not null);

drop policy if exists open_sale_events_host_write on public.open_sale_events;
create policy open_sale_events_host_write on public.open_sale_events
  for all using (auth.uid() = host_id)
  with check (auth.uid() = host_id);

drop policy if exists open_sale_lots_select on public.open_sale_lots;
create policy open_sale_lots_select on public.open_sale_lots
  for select using (auth.uid() is not null);

drop policy if exists open_sale_lots_host_write on public.open_sale_lots;
create policy open_sale_lots_host_write on public.open_sale_lots
  for all using (
    exists (
      select 1 from public.open_sale_events e
      where e.id = event_id and e.host_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.open_sale_events e
      where e.id = event_id and e.host_id = auth.uid()
    )
  );

-- Bans: readable by self; writes via security definer RPC only
drop policy if exists open_sale_bans_select_self on public.open_sale_bans;
create policy open_sale_bans_select_self on public.open_sale_bans
  for select using (auth.uid() = bidder_id);

-- At most one active (presale/live) Open Sale per host
create unique index if not exists open_sale_events_one_active_per_host
  on public.open_sale_events (host_id)
  where (status in ('presale', 'live'));

-- Listing uniqueness across active sales enforced in create_open_sale_event RPC.

-- Keep status in sync with clock (best-effort; RPC also checks clocks)
create or replace function public.open_sale_refresh_status(p_event public.open_sale_events)
returns text
language plpgsql
as $$
declare
  v_now timestamptz := timezone('utc', now());
begin
  if p_event.status in ('ended', 'cancelled') then
    return p_event.status;
  end if;
  if v_now >= p_event.hard_ends_at or v_now >= p_event.ends_at then
    return 'ended';
  end if;
  if v_now >= p_event.starts_at then
    return 'live';
  end if;
  return 'presale';
end;
$$;

/**
 * Atomic Open Sale bid.
 * Truth lives here: ban, window, hard cutoff, min/step, soft-close, high bid race.
 */
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

  select coalesce(max(amount_cents), 0),
         (array_agg(bidder_id order by amount_cents desc, placed_at desc))[1]
    into v_high_cents, v_prev_bidder
  from public.garage_bids
  where listing_id = p_listing_id;

  if v_high_cents <= 0 then
    null; -- floor already checked via min_bid_cents
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

  -- Soft close: bid in last 45s extends ends_at, never past hard_ends_at
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

  -- Notify previous leader (if they are a real uuid profile)
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

-- Ban after missed payment (callable by winner-resolution paths / service later)
create or replace function public.ban_open_sale_bidder(
  p_bidder_id uuid,
  p_days integer default 30,
  p_reason text default 'missed_payment'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.open_sale_bans (bidder_id, banned_until, reason)
  values (p_bidder_id, timezone('utc', now()) + make_interval(days => greatest(p_days, 1)), p_reason)
  on conflict (bidder_id) do update
    set banned_until = excluded.banned_until,
        reason = excluded.reason,
        created_at = timezone('utc', now());
end;
$$;

revoke all on function public.ban_open_sale_bidder(uuid, integer, text) from public;
grant execute on function public.ban_open_sale_bidder(uuid, integer, text) to authenticated;

/**
 * Create Open Sale + lots atomically. Enforces one active sale per host
 * and that listings are not already on another active sale.
 */
create or replace function public.create_open_sale_event(
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_hard_ends_at timestamptz,
  p_lots jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_host uuid := auth.uid();
  v_id uuid := gen_random_uuid();
  v_now timestamptz := timezone('utc', now());
  v_status text;
  v_lot jsonb;
  v_listing uuid;
begin
  if v_host is null then
    return jsonb_build_object('ok', false, 'reason', 'Sign in required');
  end if;
  if p_lots is null or jsonb_typeof(p_lots) <> 'array' or jsonb_array_length(p_lots) = 0 then
    return jsonb_build_object('ok', false, 'reason', 'Pick at least one item');
  end if;
  if p_starts_at >= p_ends_at or p_ends_at > p_hard_ends_at then
    return jsonb_build_object('ok', false, 'reason', 'Invalid sale window');
  end if;
  if exists (
    select 1 from public.open_sale_events
    where host_id = v_host and status in ('presale', 'live')
  ) then
    return jsonb_build_object('ok', false, 'reason', 'You already have an Open Sale — finish or cancel it first');
  end if;

  for v_lot in select * from jsonb_array_elements(p_lots)
  loop
    v_listing := (v_lot ->> 'listingId')::uuid;
    if exists (
      select 1
      from public.open_sale_lots l
      join public.open_sale_events e on e.id = l.event_id
      where l.listing_id = v_listing and e.status in ('presale', 'live')
    ) then
      return jsonb_build_object('ok', false, 'reason', 'An item is already on an Open Sale');
    end if;
  end loop;

  if v_now >= p_hard_ends_at or v_now >= p_ends_at then
    v_status := 'ended';
  elsif v_now >= p_starts_at then
    v_status := 'live';
  else
    v_status := 'presale';
  end if;

  insert into public.open_sale_events (id, host_id, starts_at, ends_at, hard_ends_at, status, created_at, updated_at)
  values (v_id, v_host, p_starts_at, p_ends_at, p_hard_ends_at, v_status, v_now, v_now);

  for v_lot in select * from jsonb_array_elements(p_lots)
  loop
    insert into public.open_sale_lots (event_id, listing_id, min_bid_cents, bid_step_cents, origin)
    values (
      v_id,
      (v_lot ->> 'listingId')::uuid,
      greatest(1, (v_lot ->> 'minBidCents')::integer),
      greatest(1, (v_lot ->> 'bidStepCents')::integer),
      coalesce(nullif(v_lot ->> 'origin', ''), 'garage_mirror')
    );
  end loop;

  return jsonb_build_object(
    'ok', true,
    'id', v_id,
    'status', v_status,
    'startsAt', p_starts_at,
    'endsAt', p_ends_at,
    'hardEndsAt', p_hard_ends_at
  );
end;
$$;

revoke all on function public.create_open_sale_event(timestamptz, timestamptz, timestamptz, jsonb) from public;
grant execute on function public.create_open_sale_event(timestamptz, timestamptz, timestamptz, jsonb) to authenticated;
