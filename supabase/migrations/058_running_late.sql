-- "I'm running late" told nobody.
--
-- The sheet wrote the note onto the renter's own device and raised an in-app
-- notification there — on the phone of the person who typed it. The host, whose
-- copy the sheet quotes ("we'll let them know"), learned nothing, and the
-- no-show clock kept running: two hours after the pickup window the host was
-- being asked to mark a no-show for someone who had said they were on the way.
--
-- The note now lives on the rental, so both sides read the same thing, and it
-- buys the renter an hour before the host is offered the no-show button.
-- The server decides how much of an hour that is: a client that could write
-- `pickup_grace_until` itself could hold a booking open indefinitely.

alter table public.rentals
  add column if not exists running_late_message text;

alter table public.rentals
  add column if not exists running_late_sent_at timestamptz;

alter table public.rentals
  add column if not exists running_late_acknowledged_at timestamptz;

/** How long a heads-up postpones the no-show, and how late it can be sent. */
alter table public.rentals
  add column if not exists pickup_grace_until timestamptz;

create or replace function public.rentals_guard_running_late()
returns trigger
language plpgsql
as $$
declare
  sent_now boolean;
begin
  if public.is_trusted_writer() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    -- Nobody is late for a pickup that has not been agreed yet.
    new.running_late_message := null;
    new.running_late_sent_at := null;
    new.running_late_acknowledged_at := null;
    new.pickup_grace_until := null;
    return new;
  end if;

  sent_now :=
    new.running_late_sent_at is not null
    and old.running_late_sent_at is distinct from new.running_late_sent_at;

  -- Only the renter is late, and only their own words go in the note.
  if sent_now and auth.uid() is distinct from old.renter_id then
    new.running_late_message := old.running_late_message;
    new.running_late_sent_at := old.running_late_sent_at;
    new.pickup_grace_until := old.pickup_grace_until;
  elsif sent_now then
    new.running_late_sent_at := now();
    new.running_late_message := left(coalesce(new.running_late_message, ''), 500);
    -- One hour from the heads-up, and never more than four hours past the
    -- pickup window: being told twice is not a reason to wait all day.
    new.pickup_grace_until := coalesce(
      old.pickup_grace_until,
      least(
        now() + interval '1 hour',
        coalesce(old.pickup_at, now()) + interval '4 hours'
      )
    );
  else
    new.running_late_message := old.running_late_message;
    new.running_late_sent_at := old.running_late_sent_at;
    new.pickup_grace_until := old.pickup_grace_until;
  end if;

  -- Acknowledging is the host's to do, and only once.
  if
    new.running_late_acknowledged_at is distinct from old.running_late_acknowledged_at
    and (
      old.running_late_acknowledged_at is not null
      or auth.uid() is distinct from old.owner_id
      or old.running_late_sent_at is null
    )
  then
    new.running_late_acknowledged_at := old.running_late_acknowledged_at;
  elsif new.running_late_acknowledged_at is distinct from old.running_late_acknowledged_at then
    new.running_late_acknowledged_at := now();
  end if;

  return new;
end;
$$;

drop trigger if exists rentals_guard_running_late on public.rentals;
create trigger rentals_guard_running_late
  before insert or update on public.rentals
  for each row execute function public.rentals_guard_running_late();
