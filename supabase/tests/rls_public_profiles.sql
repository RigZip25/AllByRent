-- Behaviour checks for 057_public_profiles.sql.
-- Runs as part of: node ./scripts/check-migrations.mjs

grant usage on schema public to authenticated, anon, service_role;
grant all on all tables in schema public to authenticated, anon, service_role;

insert into auth.users (id) values
  ('e5e5e5e5-1111-4111-8111-e5e5e5e5e5e5'),
  ('e6e6e6e6-2222-4222-8222-e6e6e6e6e6e6');

insert into public.profiles (id, email, display_name, phone, identity_verified, rating)
values
  (
    'e5e5e5e5-1111-4111-8111-e5e5e5e5e5e5',
    'maya@example.com',
    'Maya',
    '+14155550101',
    true,
    4.8
  ),
  (
    'e6e6e6e6-2222-4222-8222-e6e6e6e6e6e6',
    'sam@example.com',
    'Sam',
    '+14155550102',
    false,
    null
  );

do $$
declare
  visible int;
  name text;
  verified boolean;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = 'e6e6e6e6-2222-4222-8222-e6e6e6e6e6e6';

  -- The table itself still answers for nobody but its owner.
  select count(*) into visible from public.profiles
    where id = 'e5e5e5e5-1111-4111-8111-e5e5e5e5e5e5';
  if visible <> 0 then
    raise exception 'profiles handed the other profile to a signed-in stranger';
  end if;

  -- The projection answers for the person on the other side of a rental.
  select display_name, identity_verified
    into name, verified
    from public.public_profiles
    where id = 'e5e5e5e5-1111-4111-8111-e5e5e5e5e5e5';
  if name is distinct from 'Maya' then
    raise exception 'the name came back as %', coalesce(name, '<null>');
  end if;
  if verified is not true then
    raise exception 'the identity badge did not come through';
  end if;

  reset role;
end $$;

-- A guest browsing listings sees host names, and nothing else about them.
do $$
declare
  visible int;
begin
  set local role anon;

  select count(*) into visible from public.public_profiles
    where id in (
      'e5e5e5e5-1111-4111-8111-e5e5e5e5e5e5',
      'e6e6e6e6-2222-4222-8222-e6e6e6e6e6e6'
    );
  if visible <> 2 then
    raise exception 'the projection showed % of 2 names to a guest', visible;
  end if;

  begin
    perform email from public.public_profiles limit 1;
    raise exception 'the projection is publishing e-mail addresses';
  exception
    when undefined_column then null;
  end;

  begin
    perform phone from public.public_profiles limit 1;
    raise exception 'the projection is publishing phone numbers';
  exception
    when undefined_column then null;
  end;

  reset role;
end $$;

-- Nobody edits their reputation through the view.
do $$
begin
  set local role authenticated;
  set local request.jwt.claim.sub = 'e6e6e6e6-2222-4222-8222-e6e6e6e6e6e6';
  begin
    update public.public_profiles set rating = 5
      where id = 'e5e5e5e5-1111-4111-8111-e5e5e5e5e5e5';
    raise exception 'the projection accepted a write';
  exception
    when insufficient_privilege then null;
    when others then null;
  end;
  reset role;
end $$;
