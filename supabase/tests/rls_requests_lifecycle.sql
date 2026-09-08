-- Behaviour checks for 050_requests_lifecycle.sql.
-- Runs as part of: node ./scripts/check-migrations.mjs

grant usage on schema public to authenticated, anon, service_role;
grant all on all tables in schema public to authenticated, anon, service_role;

insert into auth.users (id) values
  ('a1a1a1a1-a1a1-4a1a-8a1a-a1a1a1a1a1a1'),
  ('b2b2b2b2-b2b2-4b2b-8b2b-b2b2b2b2b2b2');

insert into public.profiles (id) values
  ('a1a1a1a1-a1a1-4a1a-8a1a-a1a1a1a1a1a1'),
  ('b2b2b2b2-b2b2-4b2b-8b2b-b2b2b2b2b2b2');

do $$
declare
  blocked boolean;
  row_expires timestamptz;
  row_created timestamptz;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = 'a1a1a1a1-a1a1-4a1a-8a1a-a1a1a1a1a1a1';

  -- A fresh ask is open, and it expires whatever the client says.
  insert into public.requests (
    id, renter_id, category, subcategory, description, location_label,
    status, intent, budget_cents, radius_miles, expires_at
  ) values (
    'c3c3c3c3-c3c3-4c3c-8c3c-c3c3c3c3c3c3',
    'a1a1a1a1-a1a1-4a1a-8a1a-a1a1a1a1a1a1',
    'Tools & DIY',
    'Ladders',
    'Need a 6ft ladder for a weekend',
    'Oak Park',
    'fulfilled',
    'rent',
    2500,
    10,
    now() + interval '400 days'
  );

  select status, expires_at, created_at
  into blocked, row_expires, row_created
  from (
    select status = 'open' as status, expires_at, created_at
    from public.requests
    where id = 'c3c3c3c3-c3c3-4c3c-8c3c-c3c3c3c3c3c3'
  ) s;

  if not blocked then
    raise exception 'a new ask could be published as already fulfilled';
  end if;
  if row_expires > row_created + interval '30 days' + interval '1 minute' then
    raise exception 'a new ask could outlive the 30-day window';
  end if;

  -- The author closes their own ask, and the timestamp is set for them.
  update public.requests
  set status = 'fulfilled'
  where id = 'c3c3c3c3-c3c3-4c3c-8c3c-c3c3c3c3c3c3';

  if not exists (
    select 1 from public.requests
    where id = 'c3c3c3c3-c3c3-4c3c-8c3c-c3c3c3c3c3c3'
      and status = 'fulfilled'
      and fulfilled_at is not null
  ) then
    raise exception 'closing an ask did not stamp fulfilled_at';
  end if;

  -- Reopening clears the fulfilment and restarts the clock.
  update public.requests
  set status = 'open'
  where id = 'c3c3c3c3-c3c3-4c3c-8c3c-c3c3c3c3c3c3';

  if exists (
    select 1 from public.requests
    where id = 'c3c3c3c3-c3c3-4c3c-8c3c-c3c3c3c3c3c3'
      and (fulfilled_at is not null or fulfilled_listing_id is not null)
  ) then
    raise exception 'reopening an ask kept its fulfilment';
  end if;
  if not exists (
    select 1 from public.requests
    where id = 'c3c3c3c3-c3c3-4c3c-8c3c-c3c3c3c3c3c3'
      and expires_at > now() + interval '29 days'
  ) then
    raise exception 'reopening an ask did not restart the expiry';
  end if;

  -- The author cannot hand the ask to somebody else.
  update public.requests
  set renter_id = 'b2b2b2b2-b2b2-4b2b-8b2b-b2b2b2b2b2b2'
  where id = 'c3c3c3c3-c3c3-4c3c-8c3c-c3c3c3c3c3c3';

  if not exists (
    select 1 from public.requests
    where id = 'c3c3c3c3-c3c3-4c3c-8c3c-c3c3c3c3c3c3'
      and renter_id = 'a1a1a1a1-a1a1-4a1a-8a1a-a1a1a1a1a1a1'
  ) then
    raise exception 'an ask could be reassigned to another user';
  end if;

  reset role;
end $$;

do $$
declare
  touched integer;
begin
  -- A neighbour can read the ask but cannot answer it on the author's behalf.
  set local role authenticated;
  set local request.jwt.claim.sub = 'b2b2b2b2-b2b2-4b2b-8b2b-b2b2b2b2b2b2';

  if (select count(*) from public.requests) <> 1 then
    raise exception 'asks should be readable by other neighbours';
  end if;

  update public.requests
  set status = 'cancelled'
  where id = 'c3c3c3c3-c3c3-4c3c-8c3c-c3c3c3c3c3c3';
  get diagnostics touched = row_count;
  if touched <> 0 then
    raise exception 'a neighbour could close someone else''s ask';
  end if;

  delete from public.requests where id = 'c3c3c3c3-c3c3-4c3c-8c3c-c3c3c3c3c3c3';
  get diagnostics touched = row_count;
  if touched <> 0 then
    raise exception 'a neighbour could delete someone else''s ask';
  end if;

  reset role;
end $$;

do $$
declare
  blocked boolean;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = 'a1a1a1a1-a1a1-4a1a-8a1a-a1a1a1a1a1a1';

  -- Nonsense budgets and radii do not reach the table.
  blocked := false;
  begin
    insert into public.requests (id, renter_id, budget_cents)
    values (
      'd4d4d4d4-d4d4-4d4d-8d4d-d4d4d4d4d4d4',
      'a1a1a1a1-a1a1-4a1a-8a1a-a1a1a1a1a1a1',
      -100
    );
  exception when others then
    blocked := true;
  end;
  if not blocked then
    raise exception 'a negative budget was accepted';
  end if;

  blocked := false;
  begin
    insert into public.requests (id, renter_id, radius_miles)
    values (
      'e5e5e5e5-e5e5-4e5e-8e5e-e5e5e5e5e5e5',
      'a1a1a1a1-a1a1-4a1a-8a1a-a1a1a1a1a1a1',
      5000
    );
  exception when others then
    blocked := true;
  end;
  if not blocked then
    raise exception 'a 5000-mile radius was accepted';
  end if;

  -- The author can withdraw their own ask.
  delete from public.requests where id = 'c3c3c3c3-c3c3-4c3c-8c3c-c3c3c3c3c3c3';
  if exists (select 1 from public.requests) then
    raise exception 'the author could not delete their own ask';
  end if;

  reset role;
end $$;

select 'rls_requests_lifecycle: all checks passed' as result;
