-- "Ask for it" had no life after publication: no status, no way to close or
-- delete an ask, and the budget, intent and radius the renter picked were
-- glued into the description text, so nothing could search or sort by them.
--
-- Adds the lifecycle columns, promotes the buried fields, and gives asks a
-- real expiry (the detail screen already claimed they expire).

alter table public.requests
  add column if not exists status text not null default 'open',
  add column if not exists fulfilled_at timestamptz,
  add column if not exists fulfilled_listing_id uuid,
  add column if not exists intent text,
  add column if not exists budget_cents integer,
  add column if not exists radius_miles integer,
  add column if not exists expires_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'requests_status_check'
  ) then
    alter table public.requests
      add constraint requests_status_check
      check (status in ('open', 'fulfilled', 'cancelled'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'requests_intent_check'
  ) then
    alter table public.requests
      add constraint requests_intent_check
      check (intent is null or intent in ('rent', 'buy', 'either'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'requests_budget_check'
  ) then
    alter table public.requests
      add constraint requests_budget_check
      check (budget_cents is null or (budget_cents >= 0 and budget_cents <= 100000000));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'requests_radius_check'
  ) then
    alter table public.requests
      add constraint requests_radius_check
      check (radius_miles is null or (radius_miles > 0 and radius_miles <= 500));
  end if;
end $$;

create index if not exists requests_status_idx on public.requests (status);
create index if not exists requests_expires_at_idx on public.requests (expires_at);

-- Asks that predate this migration run out 30 days after they were posted,
-- same as new ones.
update public.requests
set expires_at = created_at + interval '30 days'
where expires_at is null;

-- A fresh ask is always open and always expires; the client does not get to
-- publish one that outlives the neighborhood's interest in it.
create or replace function public.requests_guard_insert()
returns trigger
language plpgsql
as $$
begin
  new.status := 'open';
  new.fulfilled_at := null;
  new.fulfilled_listing_id := null;
  new.updated_at := now();

  if new.expires_at is null or new.expires_at > coalesce(new.created_at, now()) + interval '30 days' then
    new.expires_at := coalesce(new.created_at, now()) + interval '30 days';
  end if;

  return new;
end;
$$;

drop trigger if exists requests_guard_insert_trg on public.requests;
create trigger requests_guard_insert_trg
  before insert on public.requests
  for each row
  execute function public.requests_guard_insert();

-- The renter owns the lifecycle; nobody else may retitle or reassign an ask.
-- `requests_update_own` (migration 009) already limits updates to the author,
-- so this only pins the columns the author must not rewrite.
create or replace function public.requests_guard_columns()
returns trigger
language plpgsql
as $$
begin
  new.renter_id := old.renter_id;
  new.created_at := old.created_at;

  if new.status = 'fulfilled' and new.fulfilled_at is null then
    new.fulfilled_at := now();
  end if;
  if new.status <> 'fulfilled' then
    new.fulfilled_at := null;
    new.fulfilled_listing_id := null;
  end if;

  -- Reopening restarts the clock instead of resurrecting an expired ask.
  if new.status = 'open' and old.status <> 'open' then
    new.expires_at := now() + interval '30 days';
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists requests_guard_columns_trg on public.requests;
create trigger requests_guard_columns_trg
  before update on public.requests
  for each row
  execute function public.requests_guard_columns();
