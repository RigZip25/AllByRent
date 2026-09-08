-- Behaviour checks for 054_verification_dispute_notification_guards.sql.
-- Runs as part of: node ./scripts/check-migrations.mjs

grant usage on schema public to authenticated, anon, service_role;
grant all on all tables in schema public to authenticated, anon, service_role;

insert into auth.users (id) values
  ('11111111-aaaa-4aaa-8aaa-aaaaaaaaaaaa'), -- host
  ('22222222-bbbb-4bbb-8bbb-bbbbbbbbbbbb'), -- renter
  ('33333333-cccc-4ccc-8ccc-cccccccccccc'); -- stranger with nothing to do with either

insert into public.profiles (id) values
  ('11111111-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
  ('22222222-bbbb-4bbb-8bbb-bbbbbbbbbbbb'),
  ('33333333-cccc-4ccc-8ccc-cccccccccccc');

-- R6: a listing cannot call itself verified.
do $$
declare
  verified timestamptz;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '11111111-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

  insert into public.listings (id, owner_id, listing_status, qr_verified_at, qr_verification_photo_path)
  values (
    '44444444-dddd-4ddd-8ddd-dddddddddddd',
    '11111111-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'active',
    now(),
    'made/up/path.jpg'
  );

  select qr_verified_at into verified from public.listings
  where id = '44444444-dddd-4ddd-8ddd-dddddddddddd';
  if verified is not null then
    raise exception 'a new listing could publish itself as QR-verified';
  end if;

  update public.listings
  set qr_verified_at = now(), qr_verification_photo_path = 'made/up/path.jpg'
  where id = '44444444-dddd-4ddd-8ddd-dddddddddddd';

  select qr_verified_at into verified from public.listings
  where id = '44444444-dddd-4ddd-8ddd-dddddddddddd';
  if verified is not null then
    raise exception 'the owner could stamp their own listing verified';
  end if;

  reset role;
end $$;

insert into public.rentals (id, listing_id, owner_id, renter_id, start_date, end_date, status)
values (
  '55555555-eeee-4eee-8eee-eeeeeeeeeeee',
  '44444444-dddd-4ddd-8ddd-dddddddddddd',
  '11111111-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  '22222222-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  current_date,
  current_date + 3,
  'active'
);

-- R7: one side cannot close a dispute on its own.
do $$
declare
  row_after public.disputes;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '22222222-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

  insert into public.disputes (id, rental_id, opened_by, evidence_deadline, status, deposit_frozen)
  values (
    '66666666-ffff-4fff-8fff-ffffffffffff',
    '55555555-eeee-4eee-8eee-eeeeeeeeeeee',
    '22222222-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    now() + interval '3 days',
    'resolved',
    false
  );

  select * into row_after from public.disputes where id = '66666666-ffff-4fff-8fff-ffffffffffff';
  if row_after.status <> 'open' or not row_after.deposit_frozen then
    raise exception 'a dispute could open already resolved: %', row_after.status;
  end if;

  -- The renter declares victory alone.
  update public.disputes
  set status = 'resolved',
      deposit_frozen = false,
      resolution_outcome = 'favor_renter',
      proposed_by = '22222222-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      acknowledged_by = '22222222-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
  where id = '66666666-ffff-4fff-8fff-ffffffffffff';

  select * into row_after from public.disputes where id = '66666666-ffff-4fff-8fff-ffffffffffff';
  if row_after.status = 'resolved' or not row_after.deposit_frozen then
    raise exception 'one side could resolve the dispute and release the deposit';
  end if;

  -- Proposing is fine, and it is recorded in the proposer's name.
  update public.disputes
  set status = 'under_review',
      proposed_outcome = 'split',
      proposed_by = '11111111-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
  where id = '66666666-ffff-4fff-8fff-ffffffffffff';

  select * into row_after from public.disputes where id = '66666666-ffff-4fff-8fff-ffffffffffff';
  if row_after.proposed_by <> '22222222-bbbb-4bbb-8bbb-bbbbbbbbbbbb' then
    raise exception 'a proposal could be filed in the other side''s name';
  end if;

  reset role;
end $$;

-- The host accepts the renter's proposal: now it closes, and the deposit is free.
do $$
declare
  row_after public.disputes;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '11111111-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

  update public.disputes
  set status = 'resolved',
      deposit_frozen = false,
      resolution_outcome = 'split',
      acknowledged_by = '11111111-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
  where id = '66666666-ffff-4fff-8fff-ffffffffffff';

  select * into row_after from public.disputes where id = '66666666-ffff-4fff-8fff-ffffffffffff';
  if row_after.status <> 'resolved' or row_after.deposit_frozen then
    raise exception 'both sides agreeing did not close the dispute: %', row_after.status;
  end if;
  if row_after.resolved_at is null then
    raise exception 'a resolved dispute has no resolution time';
  end if;

  reset role;
end $$;

-- R13: notifications reach people you have something to do with, and nobody else.
do $$
declare
  blocked boolean;
  stored public.notifications;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '22222222-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

  -- The host of a rental this renter is on: allowed.
  insert into public.notifications (id, recipient_id, actor_id, type, title, body, read_at)
  values (
    '77777777-1111-4111-8111-777777777777',
    '11111111-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    '22222222-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    'general',
    'Running late',
    'Traffic on the bridge',
    now()
  );

  select * into stored from public.notifications where id = '77777777-1111-4111-8111-777777777777';
  if stored.read_at is not null then
    raise exception 'a notification could be inserted already read';
  end if;

  -- Under somebody else's name: refused.
  blocked := false;
  begin
    insert into public.notifications (id, recipient_id, actor_id, type, title, body)
    values (
      '88888888-2222-4222-8222-888888888888',
      '11111111-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      '33333333-cccc-4ccc-8ccc-cccccccccccc',
      'general',
      'Hello',
      'Not from me'
    );
  exception when others then
    blocked := true;
  end;
  if not blocked then
    raise exception 'a notification could be sent under another user''s name';
  end if;

  reset role;
end $$;

-- Somebody with no listing, no rental and no thread cannot be messaged at all.
do $$
declare
  blocked boolean := false;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '11111111-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

  begin
    insert into public.notifications (id, recipient_id, actor_id, type, title, body)
    values (
      '99999999-3333-4333-8333-999999999999',
      '33333333-cccc-4ccc-8ccc-cccccccccccc',
      '11111111-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'general',
      'Buy crypto',
      'Tap this link'
    );
  exception when others then
    blocked := true;
  end;

  if not blocked then
    raise exception 'a stranger with no shared context could be notified';
  end if;

  reset role;
end $$;
