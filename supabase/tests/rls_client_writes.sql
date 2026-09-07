-- Behaviour checks for the write rules added in 046_tighten_client_writes.sql.
-- Run against a throwaway database: node ./scripts/check-migrations.mjs --tests
--
-- Each block acts as a signed-in client (role `authenticated` plus a JWT sub)
-- and asserts that the tightened rule holds. A failure raises.

grant usage on schema public to authenticated, anon, service_role;
grant all on all tables in schema public to authenticated, anon, service_role;
grant all on all sequences in schema public to authenticated, anon, service_role;

-- Two neighbours and a listing owned by the first one.
insert into auth.users (id) values
  ('11111111-1111-4111-8111-111111111111'),
  ('22222222-2222-4222-8222-222222222222');

insert into public.profiles (id) values
  ('11111111-1111-4111-8111-111111111111'),
  ('22222222-2222-4222-8222-222222222222');

insert into public.listings (id, owner_id, listing_status)
values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '11111111-1111-4111-8111-111111111111', 'active');

insert into public.rentals (id, listing_id, owner_id, renter_id, start_date, end_date)
values (
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  current_date,
  current_date + 2
);

do $$
declare
  blocked boolean;
begin
  -- R11: a booking may not name a host who does not own the listing.
  set local role authenticated;
  set local request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';

  blocked := false;
  begin
    insert into public.rentals (id, listing_id, owner_id, renter_id, start_date, end_date)
    values (
      'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      '22222222-2222-4222-8222-222222222222',
      '22222222-2222-4222-8222-222222222222',
      current_date,
      current_date + 1
    );
  exception when others then
    blocked := true;
  end;
  if not blocked then
    raise exception 'R11: a renter could name themselves host of someone else''s listing';
  end if;

  -- R8: a bid may not be filed under another account's id.
  blocked := false;
  begin
    insert into public.garage_bids (listing_id, host_id, bidder_id, amount_cents, placed_at)
    values (
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      '11111111-1111-4111-8111-111111111111',
      '11111111-1111-4111-8111-111111111111',
      5000,
      now()
    );
  exception when others then
    blocked := true;
  end;
  if not blocked then
    raise exception 'R8: a bid could be filed under another user''s id';
  end if;

  -- Own bid and a guest bid still go through.
  insert into public.garage_bids (listing_id, host_id, bidder_id, amount_cents, placed_at)
  values (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222222',
    5000,
    now()
  );
  insert into public.garage_bids (listing_id, host_id, bidder_id, amount_cents, placed_at)
  values (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    '11111111-1111-4111-8111-111111111111',
    'bidder-9f2c11a4',
    6000,
    now()
  );

  -- R10: a review needs a rental both people took part in.
  blocked := false;
  begin
    insert into public.reviews (id, rental_id, reviewer_id, reviewee_id, role, rating)
    values (
      'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
      'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      '22222222-2222-4222-8222-222222222222',
      '22222222-2222-4222-8222-222222222222',
      'renter',
      1
    );
  exception when others then
    blocked := true;
  end;
  if not blocked then
    raise exception 'R10: a renter could review themselves';
  end if;

  insert into public.reviews (id, rental_id, reviewer_id, reviewee_id, role, rating)
  values (
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    '22222222-2222-4222-8222-222222222222',
    '11111111-1111-4111-8111-111111111111',
    'renter',
    5
  );

  -- R12: trust badges and payout state ignore client writes.
  update public.profiles
  set identity_verified = true, stripe_payouts_enabled = true, rating = 5
  where id = '22222222-2222-4222-8222-222222222222';

  if exists (
    select 1 from public.profiles
    where id = '22222222-2222-4222-8222-222222222222'
      and (identity_verified or stripe_payouts_enabled or rating is not null)
  ) then
    raise exception 'R12: a user could grant themselves trust badges';
  end if;

  reset role;
end $$;

do $$
begin
  -- R5: the listing owner cannot hand themselves a boost window.
  set local role authenticated;
  set local request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

  update public.listings
  set boosted_until = now() + interval '30 days', boosted_tier = 3
  where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

  if exists (
    select 1 from public.listings
    where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
      and (boosted_until is not null or boosted_tier is not null)
  ) then
    raise exception 'R5: a host could boost a listing for free';
  end if;

  -- A freshly created row cannot arrive pre-boosted or pre-verified either.
  insert into public.listings (id, owner_id, listing_status, boosted_until, boosted_tier)
  values (
    '99999999-9999-4999-8999-999999999999',
    '11111111-1111-4111-8111-111111111111',
    'active',
    now() + interval '30 days',
    3
  );
  if exists (
    select 1 from public.listings
    where id = '99999999-9999-4999-8999-999999999999'
      and (boosted_until is not null or boosted_tier is not null)
  ) then
    raise exception 'R5: a listing could be published already boosted';
  end if;

  reset role;
end $$;

do $$
begin
  -- The server still decides these values.
  set local role service_role;
  set local request.jwt.claim.role = 'service_role';
  set local request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

  update public.profiles
  set identity_verified = true
  where id = '22222222-2222-4222-8222-222222222222';

  if not exists (
    select 1 from public.profiles
    where id = '22222222-2222-4222-8222-222222222222' and identity_verified
  ) then
    raise exception 'service role must still be able to record a verified identity';
  end if;

  reset role;
end $$;

do $$
declare
  offer_id uuid := 'ffffffff-ffff-4fff-8fff-ffffffffffff';
begin
  insert into public.garage_neighbor_offers (
    id, listing_id, host_id, buyer_id, amount_cents, status, listing_title
  ) values (
    offer_id,
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222222',
    4000,
    'pending_host',
    'Vintage lamp'
  );

  -- R9: the buyer cannot accept their own offer while it waits on the host.
  set local role authenticated;
  set local request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';

  update public.garage_neighbor_offers set status = 'accepted' where id = offer_id;
  if (select status from public.garage_neighbor_offers where id = offer_id) <> 'pending_host' then
    raise exception 'R9: a buyer could accept their own offer';
  end if;

  -- Withdrawing is theirs to do.
  update public.garage_neighbor_offers set status = 'withdrawn' where id = offer_id;
  if (select status from public.garage_neighbor_offers where id = offer_id) <> 'withdrawn' then
    raise exception 'R9: a buyer must still be able to withdraw an offer';
  end if;

  -- The host answers offers.
  set local request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
  update public.garage_neighbor_offers set status = 'declined' where id = offer_id;
  if (select status from public.garage_neighbor_offers where id = offer_id) <> 'declined' then
    raise exception 'R9: the host must still be able to decline an offer';
  end if;

  reset role;
end $$;

do $$
begin
  -- An operator working straight against the database (SQL editor, psql) must
  -- still be able to fix a row by hand.
  update public.listings
  set boosted_until = now() + interval '7 days', boosted_tier = 1
  where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

  if not exists (
    select 1 from public.listings
    where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' and boosted_until is not null
  ) then
    raise exception 'a direct database session must not be treated as an app client';
  end if;

  update public.listings
  set boosted_until = null, boosted_tier = null
  where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
end $$;

select 'rls_client_writes: all checks passed' as result;
