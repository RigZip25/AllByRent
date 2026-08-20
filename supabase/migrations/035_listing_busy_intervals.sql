-- Public busy intervals for listings (no renter PII) + overlap guard on rentals.
-- Apply in Supabase SQL editor / CLI if the agent cannot push migrations.

-- Statuses that occupy calendar days (cancelled and completed free the days).
-- pending_approval counts as busy (safer against double-booking).

create or replace function public.get_listing_busy_intervals(p_listing_id uuid)
returns table (start_date date, end_date date)
language plpgsql
security definer
set search_path = public
as $$
declare
  blocked jsonb;
  elem jsonb;
  s text;
  e text;
begin
  -- Only for active public listings, or the listing owner.
  if not exists (
    select 1
    from public.listings l
    where l.id = p_listing_id
      and (
        l.listing_status = 'active'
        or l.owner_id = auth.uid()
      )
  ) then
    return;
  end if;

  select coalesce(l.availability -> 'blocked_dates', '[]'::jsonb)
  into blocked
  from public.listings l
  where l.id = p_listing_id;

  for elem in select value from jsonb_array_elements(blocked) as t(value)
  loop
    s := elem ->> 'start';
    e := elem ->> 'end';
    if s is not null and e is not null and s <> '' and e <> '' then
      begin
        start_date := s::date;
        end_date := e::date;
        if end_date < start_date then
          continue;
        end if;
        return next;
      exception
        when others then
          null;
      end;
    end if;
  end loop;

  return query
  select r.start_date, r.end_date
  from public.rentals r
  where r.listing_id = p_listing_id
    and r.status in (
      'pending_approval',
      'pending_checkin',
      'active',
      'upcoming',
      'overdue',
      'disputed',
      'no_show'
    );
end;
$$;

revoke all on function public.get_listing_busy_intervals(uuid) from public;
grant execute on function public.get_listing_busy_intervals(uuid) to anon, authenticated;

create or replace function public.rentals_reject_overlap()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  conflict_count integer;
  blocked jsonb;
  elem jsonb;
  b_start date;
  b_end date;
  s text;
  e text;
begin
  if new.start_date is null or new.end_date is null then
    raise exception 'Rental dates are required';
  end if;
  if new.end_date < new.start_date then
    raise exception 'Rental end date must be on or after start date';
  end if;

  -- Cancelled / completed rows do not occupy the calendar.
  if new.status in ('cancelled', 'completed') then
    return new;
  end if;

  select count(*)::integer
  into conflict_count
  from public.rentals r
  where r.listing_id = new.listing_id
    and r.id is distinct from new.id
    and r.status in (
      'pending_approval',
      'pending_checkin',
      'active',
      'upcoming',
      'overdue',
      'disputed',
      'no_show'
    )
    and r.start_date <= new.end_date
    and r.end_date >= new.start_date;

  if conflict_count > 0 then
    raise exception 'Selected dates overlap an existing booking for this listing';
  end if;

  select coalesce(l.availability -> 'blocked_dates', '[]'::jsonb)
  into blocked
  from public.listings l
  where l.id = new.listing_id;

  for elem in select value from jsonb_array_elements(coalesce(blocked, '[]'::jsonb)) as t(value)
  loop
    s := elem ->> 'start';
    e := elem ->> 'end';
    if s is null or e is null or s = '' or e = '' then
      continue;
    end if;
    begin
      b_start := s::date;
      b_end := e::date;
    exception
      when others then
        continue;
    end;
    if b_end < b_start then
      continue;
    end if;
    if new.start_date <= b_end and new.end_date >= b_start then
      raise exception 'Selected dates overlap blocked availability for this listing';
    end if;
  end loop;

  return new;
end;
$$;

drop trigger if exists rentals_reject_overlap_trg on public.rentals;
create trigger rentals_reject_overlap_trg
  before insert or update of start_date, end_date, status, listing_id
  on public.rentals
  for each row
  execute function public.rentals_reject_overlap();
