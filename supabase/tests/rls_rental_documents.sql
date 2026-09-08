-- Behaviour checks for 052_private_rental_documents.sql.
-- Runs as part of: node ./scripts/check-migrations.mjs

grant usage on schema public to authenticated, anon, service_role;
grant all on all tables in schema public to authenticated, anon, service_role;
grant usage on schema storage to authenticated, anon, service_role;
grant all on all tables in schema storage to authenticated, anon, service_role;

insert into auth.users (id) values
  ('a1111111-1111-4111-8111-111111111111'), -- host
  ('a2222222-2222-4222-8222-222222222222'), -- renter
  ('a3333333-3333-4333-8333-333333333333'); -- stranger

insert into public.profiles (id) values
  ('a1111111-1111-4111-8111-111111111111'),
  ('a2222222-2222-4222-8222-222222222222'),
  ('a3333333-3333-4333-8333-333333333333');

insert into public.listings (id, owner_id, listing_status)
values ('b1111111-1111-4111-8111-111111111111', 'a1111111-1111-4111-8111-111111111111', 'active');

insert into public.rentals (id, listing_id, owner_id, renter_id, start_date, end_date)
values (
  'c1111111-1111-4111-8111-111111111111',
  'b1111111-1111-4111-8111-111111111111',
  'a1111111-1111-4111-8111-111111111111',
  'a2222222-2222-4222-8222-222222222222',
  current_date,
  current_date + 2
);

-- The renter's insurance card, and the host's QR photo for the listing.
insert into storage.objects (bucket_id, name) values
  (
    'listing-verification',
    'a2222222-2222-4222-8222-222222222222/c1111111-1111-4111-8111-111111111111/insurance_1.jpg'
  ),
  (
    'listing-verification',
    'a1111111-1111-4111-8111-111111111111/b1111111-1111-4111-8111-111111111111/qr_1.jpg'
  );

do $$
declare
  bucket_public boolean;
  visible int;
begin
  select public into bucket_public from storage.buckets where id = 'listing-verification';
  if bucket_public then
    raise exception 'the document bucket is still world-readable';
  end if;

  -- The renter reads their own document.
  set local role authenticated;
  set local request.jwt.claim.sub = 'a2222222-2222-4222-8222-222222222222';
  select count(*) into visible from storage.objects where bucket_id = 'listing-verification';
  if visible <> 1 then
    raise exception 'the renter should see exactly their own document, saw %', visible;
  end if;

  -- The host reads the proof for their own rental, plus their own QR photo.
  set local request.jwt.claim.sub = 'a1111111-1111-4111-8111-111111111111';
  select count(*) into visible from storage.objects where bucket_id = 'listing-verification';
  if visible <> 2 then
    raise exception 'the host should see the rental proof and their QR photo, saw %', visible;
  end if;

  -- Somebody with no part in the rental reads nothing.
  set local request.jwt.claim.sub = 'a3333333-3333-4333-8333-333333333333';
  select count(*) into visible from storage.objects where bucket_id = 'listing-verification';
  if visible <> 0 then
    raise exception 'a stranger could read % document(s)', visible;
  end if;

  reset role;
end $$;

-- Not signed in at all: the case the public bucket used to serve.
do $$
declare
  visible int;
begin
  set local role anon;
  select count(*) into visible from storage.objects where bucket_id = 'listing-verification';
  if visible <> 0 then
    raise exception 'the anon key could read % document(s)', visible;
  end if;
  reset role;
end $$;
