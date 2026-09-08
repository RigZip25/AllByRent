-- Behaviour checks for 058_running_late.sql.
-- Runs as part of: node ./scripts/check-migrations.mjs

grant usage on schema public to authenticated, anon, service_role;
grant all on all tables in schema public to authenticated, anon, service_role;

insert into auth.users (id) values
  ('f1f1f1f1-1111-4111-8111-f1f1f1f1f1f1'), -- host
  ('f2f2f2f2-2222-4222-8222-f2f2f2f2f2f2'), -- renter
  ('f3f3f3f3-3333-4333-8333-f3f3f3f3f3f3'); -- stranger

insert into public.profiles (id) values
  ('f1f1f1f1-1111-4111-8111-f1f1f1f1f1f1'),
  ('f2f2f2f2-2222-4222-8222-f2f2f2f2f2f2'),
  ('f3f3f3f3-3333-4333-8333-f3f3f3f3f3f3');

insert into public.listings (id, owner_id, listing_status)
values ('f4f4f4f4-4444-4444-8444-f4f4f4f4f4f4', 'f1f1f1f1-1111-4111-8111-f1f1f1f1f1f1', 'active');

insert into public.rentals (id, listing_id, owner_id, renter_id, start_date, end_date, status, pickup_at)
values (
  'f5f5f5f5-5555-4555-8555-f5f5f5f5f5f5',
  'f4f4f4f4-4444-4444-8444-f4f4f4f4f4f4',
  'f1f1f1f1-1111-4111-8111-f1f1f1f1f1f1',
  'f2f2f2f2-2222-4222-8222-f2f2f2f2f2f2',
  current_date,
  current_date + 2,
  'pending_checkin',
  now() - interval '90 minutes'
);

-- A booking is not born late.
do $$
declare
  grace timestamptz;
begin
  select pickup_grace_until into grace
    from public.rentals where id = 'f5f5f5f5-5555-4555-8555-f5f5f5f5f5f5';
  if grace is not null then
    raise exception 'a fresh booking already had grace until %', grace;
  end if;
end $$;

-- The renter's heads-up: the note is kept, and the database sets the grace.
do $$
declare
  note text;
  grace timestamptz;
  sent timestamptz;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = 'f2f2f2f2-2222-4222-8222-f2f2f2f2f2f2';

  update public.rentals
    set running_late_message = 'Stuck in traffic, 20 minutes out',
        running_late_sent_at = now(),
        -- What a client would like the grace to be, and does not get to decide.
        pickup_grace_until = now() + interval '3 days'
    where id = 'f5f5f5f5-5555-4555-8555-f5f5f5f5f5f5';

  select running_late_message, running_late_sent_at, pickup_grace_until
    into note, sent, grace
    from public.rentals where id = 'f5f5f5f5-5555-4555-8555-f5f5f5f5f5f5';

  if note is distinct from 'Stuck in traffic, 20 minutes out' then
    raise exception 'the note came back as %', coalesce(note, '<null>');
  end if;
  if sent is null then
    raise exception 'the heads-up was not stamped';
  end if;
  if grace is null or grace > now() + interval '61 minutes' then
    raise exception 'the grace was granted as % — the client wrote it', grace;
  end if;

  reset role;
end $$;

-- Sending again does not extend it, and nobody else can send one.
do $$
declare
  grace_before timestamptz;
  grace_after timestamptz;
  note text;
begin
  select pickup_grace_until into grace_before
    from public.rentals where id = 'f5f5f5f5-5555-4555-8555-f5f5f5f5f5f5';

  set local role authenticated;
  set local request.jwt.claim.sub = 'f2f2f2f2-2222-4222-8222-f2f2f2f2f2f2';
  update public.rentals
    set running_late_sent_at = now(), running_late_message = 'still coming'
    where id = 'f5f5f5f5-5555-4555-8555-f5f5f5f5f5f5';
  select pickup_grace_until into grace_after
    from public.rentals where id = 'f5f5f5f5-5555-4555-8555-f5f5f5f5f5f5';
  if grace_after is distinct from grace_before then
    raise exception 'a second heads-up moved the grace from % to %', grace_before, grace_after;
  end if;

  -- The host is not the one who is late.
  set local request.jwt.claim.sub = 'f1f1f1f1-1111-4111-8111-f1f1f1f1f1f1';
  update public.rentals
    set running_late_message = 'host wrote this', running_late_sent_at = now()
    where id = 'f5f5f5f5-5555-4555-8555-f5f5f5f5f5f5';
  select running_late_message into note
    from public.rentals where id = 'f5f5f5f5-5555-4555-8555-f5f5f5f5f5f5';
  if note = 'host wrote this' then
    raise exception 'the host wrote the renter''s note';
  end if;

  reset role;
end $$;

-- Acknowledging belongs to the host.
do $$
declare
  acked timestamptz;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = 'f2f2f2f2-2222-4222-8222-f2f2f2f2f2f2';
  update public.rentals
    set running_late_acknowledged_at = now()
    where id = 'f5f5f5f5-5555-4555-8555-f5f5f5f5f5f5';
  select running_late_acknowledged_at into acked
    from public.rentals where id = 'f5f5f5f5-5555-4555-8555-f5f5f5f5f5f5';
  if acked is not null then
    raise exception 'the renter acknowledged their own message';
  end if;

  set local request.jwt.claim.sub = 'f1f1f1f1-1111-4111-8111-f1f1f1f1f1f1';
  update public.rentals
    set running_late_acknowledged_at = now()
    where id = 'f5f5f5f5-5555-4555-8555-f5f5f5f5f5f5';
  select running_late_acknowledged_at into acked
    from public.rentals where id = 'f5f5f5f5-5555-4555-8555-f5f5f5f5f5f5';
  if acked is null then
    raise exception 'the host could not acknowledge the message';
  end if;

  reset role;
end $$;
