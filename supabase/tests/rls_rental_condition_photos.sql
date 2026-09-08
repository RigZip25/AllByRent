-- Behaviour checks for 056_rental_condition_photos.sql.
-- Runs as part of: node ./scripts/check-migrations.mjs

grant usage on schema public to authenticated, anon, service_role;
grant all on all tables in schema public to authenticated, anon, service_role;

insert into auth.users (id) values
  ('0a111111-1111-4111-8111-111111111111'), -- host
  ('0a222222-2222-4222-8222-222222222222'); -- renter

insert into public.profiles (id) values
  ('0a111111-1111-4111-8111-111111111111'),
  ('0a222222-2222-4222-8222-222222222222');

insert into public.listings (id, owner_id, listing_status)
values ('0b111111-1111-4111-8111-111111111111', '0a111111-1111-4111-8111-111111111111', 'active');

do $$
declare
  row_after public.rentals;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '0a222222-2222-4222-8222-222222222222';

  -- A photo cannot arrive with the booking: nothing has been handed over yet.
  insert into public.rentals (
    id, listing_id, owner_id, renter_id, status, start_date, end_date,
    pickup_condition_photo_path
  ) values (
    '0c111111-1111-4111-8111-111111111111',
    '0b111111-1111-4111-8111-111111111111',
    '0a111111-1111-4111-8111-111111111111',
    '0a222222-2222-4222-8222-222222222222',
    'pending_approval',
    current_date,
    current_date + 2,
    '0a222222-2222-4222-8222-222222222222/0c111111-1111-4111-8111-111111111111/condition_pickup_1.jpg'
  );

  select * into row_after from public.rentals
  where id = '0c111111-1111-4111-8111-111111111111';

  if row_after.pickup_condition_photo_path is not null then
    raise exception 'a booking could carry a condition photo before the handoff';
  end if;

  -- The renter photographs the item at pickup.
  update public.rentals
  set pickup_condition_photo_path =
    '0a222222-2222-4222-8222-222222222222/0c111111-1111-4111-8111-111111111111/condition_pickup_1.jpg'
  where id = '0c111111-1111-4111-8111-111111111111';

  select * into row_after from public.rentals
  where id = '0c111111-1111-4111-8111-111111111111';

  if row_after.pickup_condition_photo_path is null then
    raise exception 'the renter could not attach their own pickup photo';
  end if;

  -- Once recorded, the evidence stays: no replacing it with a kinder photo.
  update public.rentals
  set pickup_condition_photo_path =
    '0a222222-2222-4222-8222-222222222222/0c111111-1111-4111-8111-111111111111/condition_pickup_2.jpg'
  where id = '0c111111-1111-4111-8111-111111111111';

  select * into row_after from public.rentals
  where id = '0c111111-1111-4111-8111-111111111111';

  if row_after.pickup_condition_photo_path like '%_2.jpg' then
    raise exception 'a condition photo could be swapped after the fact';
  end if;

  update public.rentals set pickup_condition_photo_path = null
  where id = '0c111111-1111-4111-8111-111111111111';

  select * into row_after from public.rentals
  where id = '0c111111-1111-4111-8111-111111111111';

  if row_after.pickup_condition_photo_path is null then
    raise exception 'a condition photo could be cleared from the client';
  end if;

  -- Someone else's document cannot be hung off this rental. The bucket only
  -- lets a participant read `{uploader}/{rental}/…`, so a path outside the
  -- writer's own folder is either a mistake or an attempt to plant evidence.
  update public.rentals
  set return_condition_photo_path =
    '0a111111-1111-4111-8111-111111111111/0c111111-1111-4111-8111-111111111111/condition_return_1.jpg'
  where id = '0c111111-1111-4111-8111-111111111111';

  select * into row_after from public.rentals
  where id = '0c111111-1111-4111-8111-111111111111';

  if row_after.return_condition_photo_path is not null then
    raise exception 'a path in someone else''s folder was accepted';
  end if;

  reset role;
end $$;

-- The host records the return photo from their own side.
do $$
declare
  row_after public.rentals;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '0a111111-1111-4111-8111-111111111111';

  update public.rentals
  set return_condition_photo_path =
    '0a111111-1111-4111-8111-111111111111/0c111111-1111-4111-8111-111111111111/condition_return_1.jpg'
  where id = '0c111111-1111-4111-8111-111111111111';

  select * into row_after from public.rentals
  where id = '0c111111-1111-4111-8111-111111111111';

  if row_after.return_condition_photo_path is null then
    raise exception 'the host could not attach their own return photo';
  end if;

  reset role;
end $$;

-- Support still has to be able to correct a record.
do $$
declare
  row_after public.rentals;
begin
  update public.rentals set pickup_condition_photo_path = null
  where id = '0c111111-1111-4111-8111-111111111111';

  select * into row_after from public.rentals
  where id = '0c111111-1111-4111-8111-111111111111';

  if row_after.pickup_condition_photo_path is not null then
    raise exception 'the service role could no longer clear a condition photo';
  end if;
end $$;
