-- Behaviour checks for 063_account_profile_stage14.sql (tombstones, co-host accept, public reviews, avatars).
-- Runs as part of: node ./scripts/check-migrations.mjs

grant usage on schema public to authenticated, anon, service_role;
grant all on all tables in schema public to authenticated, anon, service_role;
grant all on all sequences in schema public to authenticated, anon, service_role;

insert into auth.users (id, email) values
  ('a1a1a1a1-1111-4111-8111-a1a1a1a1a1a1', 'host@example.com'),
  ('b2b2b2b2-2222-4222-8222-b2b2b2b2b2b2', 'renter@example.com'),
  ('c3c3c3c3-3333-4333-8333-c3c3c3c3c3c3', 'guest@example.com'),
  ('d4d4d4d4-4444-4444-8444-d4d4d4d4d4d4', 'helper@example.com');

insert into public.profiles (id, email, display_name)
values
  ('a1a1a1a1-1111-4111-8111-a1a1a1a1a1a1', 'host@example.com', 'Host'),
  ('b2b2b2b2-2222-4222-8222-b2b2b2b2b2b2', 'renter@example.com', 'Renter'),
  ('c3c3c3c3-3333-4333-8333-c3c3c3c3c3c3', 'guest@example.com', 'Guest'),
  ('d4d4d4d4-4444-4444-8444-d4d4d4d4d4d4', 'helper@example.com', 'Helper');

insert into public.listings (id, owner_id, title, listing_status)
values (
  '11111111-1111-4111-8111-111111111111',
  'a1a1a1a1-1111-4111-8111-a1a1a1a1a1a1',
  'Drill',
  'active'
);

insert into public.rentals (
  id, listing_id, owner_id, renter_id, status, start_date, end_date
)
values (
  '22222222-2222-4222-8222-222222222222',
  '11111111-1111-4111-8111-111111111111',
  'a1a1a1a1-1111-4111-8111-a1a1a1a1a1a1',
  'b2b2b2b2-2222-4222-8222-b2b2b2b2b2b2',
  'completed',
  current_date - 10,
  current_date - 5
);

-- P1a: deleting the host user must leave the rental for the renter.
delete from auth.users where id = 'a1a1a1a1-1111-4111-8111-a1a1a1a1a1a1';

do $$
declare
  left_count int;
  owner uuid;
begin
  select count(*) into left_count
    from public.rentals
    where id = '22222222-2222-4222-8222-222222222222';
  if left_count <> 1 then
    raise exception 'rental was cascaded away on host delete';
  end if;
  select owner_id into owner
    from public.rentals
    where id = '22222222-2222-4222-8222-222222222222';
  if owner is not null then
    raise exception 'owner_id was %, expected null tombstone', owner;
  end if;
end $$;

-- P9a: stranger can read revealed reviews (both sides submitted).
insert into public.reviews (id, rental_id, reviewer_id, reviewee_id, role, rating, comment)
values
  (
    '33333333-3333-4333-8333-333333333331',
    '22222222-2222-4222-8222-222222222222',
    'b2b2b2b2-2222-4222-8222-b2b2b2b2b2b2',
    null,
    'renter',
    5,
    'Great host'
  ),
  (
    '33333333-3333-4333-8333-333333333332',
    '22222222-2222-4222-8222-222222222222',
    null,
    'b2b2b2b2-2222-4222-8222-b2b2b2b2b2b2',
    'host',
    5,
    'Great renter'
  );

do $$
declare
  visible int;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = 'c3c3c3c3-3333-4333-8333-c3c3c3c3c3c3';
  set local request.jwt.claims = '{"sub":"c3c3c3c3-3333-4333-8333-c3c3c3c3c3c3","role":"authenticated","email":"guest@example.com"}';

  select count(*) into visible from public.reviews
    where reviewee_id = 'b2b2b2b2-2222-4222-8222-b2b2b2b2b2b2';
  if visible < 1 then
    raise exception 'stranger could not read revealed reviews';
  end if;
  reset role;
end $$;

-- P5a / P6a: invitee can accept; host cannot Mark active alone.
insert into public.co_hosts (id, host_id, co_host_email, status, invited_at)
values (
  '44444444-4444-4444-8444-444444444444',
  'b2b2b2b2-2222-4222-8222-b2b2b2b2b2b2',
  'helper@example.com',
  'pending',
  now()
);

do $$
begin
  set local role authenticated;
  set local request.jwt.claim.sub = 'b2b2b2b2-2222-4222-8222-b2b2b2b2b2b2';
  set local request.jwt.claims = '{"sub":"b2b2b2b2-2222-4222-8222-b2b2b2b2b2b2","role":"authenticated","email":"renter@example.com"}';

  begin
    update public.co_hosts
      set status = 'active', accepted_at = now()
      where id = '44444444-4444-4444-8444-444444444444';
    raise exception 'host was allowed to Mark active without invitee';
  exception
    when others then
      if sqlerrm like '%host was allowed%' then
        raise;
      end if;
  end;
  reset role;
end $$;

do $$
declare
  st text;
  uid uuid;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = 'd4d4d4d4-4444-4444-8444-d4d4d4d4d4d4';
  set local request.jwt.claims = '{"sub":"d4d4d4d4-4444-4444-8444-d4d4d4d4d4d4","role":"authenticated","email":"helper@example.com"}';

  update public.co_hosts
    set status = 'active',
        co_host_user_id = 'd4d4d4d4-4444-4444-8444-d4d4d4d4d4d4',
        accepted_at = now()
    where id = '44444444-4444-4444-8444-444444444444';

  select status, co_host_user_id into st, uid
    from public.co_hosts
    where id = '44444444-4444-4444-8444-444444444444';
  if st is distinct from 'active' or uid is distinct from 'd4d4d4d4-4444-4444-8444-d4d4d4d4d4d4' then
    raise exception 'invitee could not accept co-host invite';
  end if;
  reset role;
end $$;

-- P11a: avatar_path is on the public projection.
update public.profiles
  set avatar_path = 'b2b2b2b2-2222-4222-8222-b2b2b2b2b2b2.jpg'
  where id = 'b2b2b2b2-2222-4222-8222-b2b2b2b2b2b2';

do $$
declare
  path text;
begin
  set local role anon;
  select avatar_path into path from public.public_profiles
    where id = 'b2b2b2b2-2222-4222-8222-b2b2b2b2b2b2';
  if path is distinct from 'b2b2b2b2-2222-4222-8222-b2b2b2b2b2b2.jpg' then
    raise exception 'public_profiles missing avatar_path';
  end if;
  reset role;
end $$;
