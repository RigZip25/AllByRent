-- Behaviour checks for 053_rental_settlement_guards.sql (+ Q8 / migration 068).
-- Runs as part of: node ./scripts/check-migrations.mjs

grant usage on schema public to authenticated, anon, service_role;
grant all on all tables in schema public to authenticated, anon, service_role;

insert into auth.users (id) values
  ('d1111111-1111-4111-8111-111111111111'), -- host
  ('d2222222-2222-4222-8222-222222222222'); -- renter

insert into public.profiles (id) values
  ('d1111111-1111-4111-8111-111111111111'),
  ('d2222222-2222-4222-8222-222222222222');

insert into public.listings (id, owner_id, listing_status)
values ('e1111111-1111-4111-8111-111111111111', 'd1111111-1111-4111-8111-111111111111', 'active');

do $$
declare
  row_after public.rentals;
  blocked boolean;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = 'd2222222-2222-4222-8222-222222222222';

  -- Q8: participants no longer insert rentals — /api/rentals/create does.
  blocked := false;
  begin
    insert into public.rentals (
      id, listing_id, owner_id, renter_id, status, start_date, end_date,
      stripe_payment_status, deposit_status, rental_total_cents,
      host_handed_over_at, renter_received_at, picked_up_at
    ) values (
      'f1111111-1111-4111-8111-111111111111',
      'e1111111-1111-4111-8111-111111111111',
      'd1111111-1111-4111-8111-111111111111',
      'd2222222-2222-4222-8222-222222222222',
      'active',
      current_date,
      current_date + 2,
      'succeeded',
      'released',
      12000,
      now(),
      now(),
      now()
    );
  exception when others then
    blocked := true;
  end;
  if not blocked then
    raise exception 'Q8: a client could still insert a rental row';
  end if;

  reset role;

  -- Seed the way the create route does (service role / postgres).
  insert into public.rentals (
    id, listing_id, owner_id, renter_id, status, start_date, end_date, rental_total_cents
  ) values (
    'f1111111-1111-4111-8111-111111111111',
    'e1111111-1111-4111-8111-111111111111',
    'd1111111-1111-4111-8111-111111111111',
    'd2222222-2222-4222-8222-222222222222',
    'pending_approval',
    current_date,
    current_date + 2,
    12000
  );

  set local role authenticated;
  set local request.jwt.claim.sub = 'd2222222-2222-4222-8222-222222222222';

  -- The renter marks the payment succeeded after the fact.
  update public.rentals
  set stripe_payment_status = 'succeeded',
      stripe_payment_intent_id = 'pi_forged',
      deposit_status = 'released',
      rental_total_cents = 1,
      late_fee_cents = 0,
      rental_invoices = '[{"id":"inv-1","status":"paid","totalCents":0}]'::jsonb
  where id = 'f1111111-1111-4111-8111-111111111111';

  select * into row_after from public.rentals
  where id = 'f1111111-1111-4111-8111-111111111111';

  if row_after.stripe_payment_status is not null
    or row_after.stripe_payment_intent_id is not null
    or row_after.deposit_status is not null then
    raise exception 'payment state could be written from the client';
  end if;
  if row_after.rental_total_cents <> 12000 then
    raise exception 'the rental total could be rewritten to %', row_after.rental_total_cents;
  end if;
  if row_after.rental_invoices is not null then
    raise exception 'invoices could be written from the client';
  end if;

  -- Starting the rental without the PIN: the route that checks it is the only
  -- writer of these columns.
  update public.rentals
  set status = 'active',
      host_handed_over_at = now(),
      renter_received_at = now(),
      picked_up_at = now()
  where id = 'f1111111-1111-4111-8111-111111111111';

  select * into row_after from public.rentals
  where id = 'f1111111-1111-4111-8111-111111111111';

  if row_after.status = 'active' or row_after.host_handed_over_at is not null then
    raise exception 'a rental could be started without the handoff PIN';
  end if;

  -- Approving, cancelling and the rest of the lifecycle still work.
  update public.rentals set status = 'cancelled'
  where id = 'f1111111-1111-4111-8111-111111111111';

  select * into row_after from public.rentals
  where id = 'f1111111-1111-4111-8111-111111111111';

  if row_after.status <> 'cancelled' then
    raise exception 'cancelling a booking stopped working';
  end if;

  reset role;
end $$;

-- The payment routes and the webhook write as the service role, and must still
-- be able to settle the same booking.
do $$
declare
  row_after public.rentals;
begin
  update public.rentals
  set stripe_payment_status = 'succeeded',
      stripe_payment_intent_id = 'pi_real',
      status = 'active',
      host_handed_over_at = now()
  where id = 'f1111111-1111-4111-8111-111111111111';

  select * into row_after from public.rentals
  where id = 'f1111111-1111-4111-8111-111111111111';

  if row_after.stripe_payment_status <> 'succeeded' or row_after.status <> 'active' then
    raise exception 'the server could no longer settle a rental';
  end if;
end $$;

-- A contactless return the host never accepted closes itself after a day.
do $$
declare
  row_after public.rentals;
begin
  update public.rentals
  set booking_mode = 'contactless',
      status = 'active',
      renter_returned_at = now() - interval '30 hours',
      host_accepted_return_at = null,
      returned_at = null
  where id = 'f1111111-1111-4111-8111-111111111111';

  set local role authenticated;
  set local request.jwt.claim.sub = 'd2222222-2222-4222-8222-222222222222';

  update public.rentals
  set status = 'completed'
  where id = 'f1111111-1111-4111-8111-111111111111';

  select * into row_after from public.rentals
  where id = 'f1111111-1111-4111-8111-111111111111';

  if row_after.status <> 'completed' or row_after.host_accepted_return_at is null then
    raise exception 'a contactless return could not complete itself, status is %', row_after.status;
  end if;

  reset role;
end $$;
