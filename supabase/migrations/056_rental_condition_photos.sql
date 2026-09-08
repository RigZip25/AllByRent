-- Condition photos never left the phone that took them.
--
-- At pickup and at return either side can attach a photo of the state the item
-- is in. It went into IndexedDB and stayed there: `pickup_condition_photo` and
-- `return_condition_photo` were local-only fields on the booking, so the other
-- side of the rental opened the rental and read "No photo yet" — and in a
-- dispute over a scratch, the evidence existed on exactly one device, held by
-- one of the two people arguing.
--
-- The photo itself goes to `listing-verification`, the private bucket the
-- insurance documents already use, under `{uploader}/{rental}/condition_*`.
-- Migration 052 made that bucket readable by the uploader and by the other
-- participant of the rental in the path, which is exactly the audience here.
-- The rental row carries the path.

alter table public.rentals
  add column if not exists pickup_condition_photo_path text,
  add column if not exists return_condition_photo_path text;

/**
 * Evidence is written once.
 *
 * A photo of how the item looked at handoff is worth nothing if the other side
 * can replace it afterwards, so once a path is recorded it stays: only the
 * service role can change or clear one. A new path must also point inside the
 * writer's own folder for this rental, or it would be possible to hang someone
 * else's document off your booking.
 */
create or replace function public.rentals_guard_condition_photos()
returns trigger
language plpgsql
as $$
declare
  caller text := coalesce(auth.uid()::text, '');
  path_is_own boolean;
begin
  if public.is_trusted_writer() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    -- Nothing has been handed over at booking time.
    new.pickup_condition_photo_path := null;
    new.return_condition_photo_path := null;
    return new;
  end if;

  if old.pickup_condition_photo_path is not null then
    new.pickup_condition_photo_path := old.pickup_condition_photo_path;
  elsif new.pickup_condition_photo_path is not null then
    path_is_own :=
      split_part(new.pickup_condition_photo_path, '/', 1) = caller
      and split_part(new.pickup_condition_photo_path, '/', 2) = old.id::text;
    if not path_is_own then
      new.pickup_condition_photo_path := null;
    end if;
  end if;

  if old.return_condition_photo_path is not null then
    new.return_condition_photo_path := old.return_condition_photo_path;
  elsif new.return_condition_photo_path is not null then
    path_is_own :=
      split_part(new.return_condition_photo_path, '/', 1) = caller
      and split_part(new.return_condition_photo_path, '/', 2) = old.id::text;
    if not path_is_own then
      new.return_condition_photo_path := null;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists rentals_guard_condition_photos on public.rentals;
create trigger rentals_guard_condition_photos
  before insert or update on public.rentals
  for each row execute function public.rentals_guard_condition_photos();
