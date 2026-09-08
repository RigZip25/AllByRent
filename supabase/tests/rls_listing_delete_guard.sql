-- Behaviour checks for 059_listing_delete_guard.sql.
-- Runs as part of: node ./scripts/check-migrations.mjs

grant usage on schema public to authenticated, anon, service_role;
grant all on all tables in schema public to authenticated, anon, service_role;

insert into auth.users (id) values
  ('a9a9a9a9-1919-4919-8919-a9a9a9a9a9a9'), -- host
  ('b9b9b9b9-2929-4929-8929-b9b9b9b9b9b9'); -- renter

insert into public.profiles (id) values
  ('a9a9a9a9-1919-4919-8919-a9a9a9a9a9a9'),
  ('b9b9b9b9-2929-4929-8929-b9b9b9b9b9b9');

insert into public.listings (id, owner_id, listing_status) values
  ('c9c9c9c9-3939-4939-8939-c9c9c9c9c9c9', 'a9a9a9a9-1919-4919-8919-a9a9a9a9a9a9', 'active'),
  ('d9d9d9d9-4949-4949-8949-d9d9d9d9d9d9', 'a9a9a9a9-1919-4919-8919-a9a9a9a9a9a9', 'active');

-- An item that is out on rent right now.
insert into public.rentals (id, listing_id, owner_id, renter_id, start_date, end_date, status)
values (
  'e9e9e9e9-5959-4959-8959-e9e9e9e9e9e9',
  'c9c9c9c9-3939-4939-8939-c9c9c9c9c9c9',
  'a9a9a9a9-1919-4919-8919-a9a9a9a9a9a9',
  'b9b9b9b9-2929-4929-8929-b9b9b9b9b9b9',
  current_date - 1,
  current_date + 2,
  'active'
);

-- A rental that is over and done with.
insert into public.rentals (id, listing_id, owner_id, renter_id, start_date, end_date, status)
values (
  'f0f0f0f0-6969-4969-8969-f0f0f0f0f0f0',
  'd9d9d9d9-4949-4949-8949-d9d9d9d9d9d9',
  'a9a9a9a9-1919-4919-8919-a9a9a9a9a9a9',
  'b9b9b9b9-2929-4929-8929-b9b9b9b9b9b9',
  current_date - 10,
  current_date - 5,
  'completed'
);

-- The host cannot delete the listing the item is out on, and the rental is
-- still there afterwards.
do $$
declare
  blocked boolean := false;
  remaining integer;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = 'a9a9a9a9-1919-4919-8919-a9a9a9a9a9a9';

  begin
    delete from public.listings where id = 'c9c9c9c9-3939-4939-8939-c9c9c9c9c9c9';
  exception
    when others then
      blocked := true;
  end;

  if not blocked then
    raise exception 'a listing with an active rental was deleted';
  end if;
end $$;

do $$
declare
  remaining integer;
begin
  select count(*)::integer into remaining
    from public.rentals where id = 'e9e9e9e9-5959-4959-8959-e9e9e9e9e9e9';
  if remaining <> 1 then
    raise exception 'the active rental did not survive the refused delete';
  end if;
end $$;

-- Nothing stops the host deleting a listing whose rentals are finished, and the
-- history goes with it as before.
do $$
declare
  listings_left integer;
  rentals_left integer;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = 'a9a9a9a9-1919-4919-8919-a9a9a9a9a9a9';

  delete from public.listings where id = 'd9d9d9d9-4949-4949-8949-d9d9d9d9d9d9';

  select count(*)::integer into listings_left
    from public.listings where id = 'd9d9d9d9-4949-4949-8949-d9d9d9d9d9d9';
  select count(*)::integer into rentals_left
    from public.rentals where id = 'f0f0f0f0-6969-4969-8969-f0f0f0f0f0f0';

  if listings_left <> 0 then
    raise exception 'a listing with only finished rentals could not be deleted';
  end if;
  if rentals_left <> 0 then
    raise exception 'the finished rental outlived its listing';
  end if;
end $$;

-- A rental that is merely requested still counts as live.
do $$
declare
  blocked boolean := false;
begin
  update public.rentals
    set status = 'pending_approval'
    where id = 'e9e9e9e9-5959-4959-8959-e9e9e9e9e9e9';

  set local role authenticated;
  set local request.jwt.claim.sub = 'a9a9a9a9-1919-4919-8919-a9a9a9a9a9a9';

  begin
    delete from public.listings where id = 'c9c9c9c9-3939-4939-8939-c9c9c9c9c9c9';
  exception
    when others then
      blocked := true;
  end;

  if not blocked then
    raise exception 'a listing with a requested rental was deleted';
  end if;
end $$;
