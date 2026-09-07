-- Let direct database sessions through the guards added in 046.
--
-- The guards only recognised `service_role` from the JWT, which is how our
-- server routes talk to PostgREST. A session opened straight against the
-- database -- the Supabase SQL editor, the table editor, psql, a migration --
-- arrives as the `postgres` role with no JWT at all, so an operator fixing a
-- row by hand was silently ignored, with no error to explain why.
--
-- App traffic is unaffected: PostgREST connects as `anon` or `authenticated`.

create or replace function public.is_trusted_writer()
returns boolean
language sql
stable
as $$
  select coalesce(auth.role(), '') = 'service_role'
    or current_user in ('postgres', 'supabase_admin', 'service_role', 'supabase_storage_admin')
    or (select rolsuper from pg_roles where rolname = current_user);
$$;

-- Runs as the caller on purpose: inside a security definer function
-- `current_user` is the function owner, which would make every writer look
-- trusted. The body only reads NEW and OLD, so it needs no extra rights.
create or replace function public.garage_offers_guard_transition()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  caller uuid := auth.uid();
begin
  if public.is_trusted_writer() or caller is null then
    return new;
  end if;

  if new.status is not distinct from old.status then
    return new;
  end if;

  if caller = old.host_id then
    -- Host: accept, counter or decline whatever is waiting on them.
    if new.status not in ('accepted', 'declined', 'pending_buyer') then
      new.status := old.status;
    end if;
  elsif caller = old.buyer_id then
    if new.status = 'withdrawn' then
      null;
    elsif new.status in ('accepted', 'declined') and old.status = 'pending_buyer' then
      null;
    else
      new.status := old.status;
    end if;
  else
    new.status := old.status;
  end if;

  return new;
end;
$$;

create or replace function public.profiles_protect_trust_fields()
returns trigger
language plpgsql
as $$
begin
  if public.is_trusted_writer() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    -- The client creates its own profile row, so the badges start empty.
    new.identity_verified := false;
    new.stripe_payouts_enabled := false;
    new.rating := null;
  else
    new.identity_verified := coalesce(old.identity_verified, false);
    new.stripe_payouts_enabled := coalesce(old.stripe_payouts_enabled, false);
    new.rating := old.rating;
  end if;
  return new;
end;
$$;

create or replace function public.listings_protect_boost()
returns trigger
language plpgsql
as $$
begin
  if public.is_trusted_writer() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.boosted_until := null;
    new.boosted_tier := null;
  else
    new.boosted_until := old.boosted_until;
    new.boosted_tier := old.boosted_tier;
  end if;
  return new;
end;
$$;
