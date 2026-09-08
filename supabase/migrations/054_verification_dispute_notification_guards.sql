-- Three claims the client was allowed to make about itself.
--
--   * R6. "QR verified" is a claim that the host printed the tag, put it on
--     the thing and photographed it. The client wrote `qr_verified_at` itself
--     right after the upload, so a direct write said it with no photo at all.
--     `/api/listings/verify-qr` checks the object is in the bucket and stamps
--     the column as the service role.
--
--   * R7. A dispute is meant to end when one side proposes an outcome and the
--     other accepts it — that is the flow the app draws. Nothing enforced it,
--     so a participant could write `status = 'resolved'`, unfreeze the deposit
--     and close the case against themselves in one request.
--
--   * R13. Any signed-in user could insert a notification for any user id, and
--     `listings.owner_id` is public. Free harassment and phishing channel,
--     with the sender's name on it if they felt like typing one.

-- ---------------------------------------------------------------------------
-- R6: verification is stamped by the server that saw the photo.
-- ---------------------------------------------------------------------------

create or replace function public.listings_protect_verification()
returns trigger
language plpgsql
as $$
begin
  if public.is_trusted_writer() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.qr_verified_at := null;
    new.qr_verification_photo_path := null;
  else
    new.qr_verified_at := old.qr_verified_at;
    new.qr_verification_photo_path := old.qr_verification_photo_path;
  end if;
  return new;
end;
$$;

drop trigger if exists listings_protect_verification on public.listings;
create trigger listings_protect_verification
  before insert or update on public.listings
  for each row execute function public.listings_protect_verification();

-- ---------------------------------------------------------------------------
-- R7: a dispute closes when both sides say so.
-- ---------------------------------------------------------------------------

create or replace function public.disputes_guard_resolution()
returns trigger
language plpgsql
as $$
declare
  caller uuid := auth.uid();
  withdrawn_by_opener boolean;
  accepted_by_other_side boolean;
begin
  if public.is_trusted_writer() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    -- A fresh case is open, the deposit is held, and the person opening it is
    -- the one whose name goes on it.
    new.status := 'open';
    new.deposit_frozen := true;
    new.proposed_outcome := null;
    new.proposed_by := null;
    new.resolution_outcome := null;
    new.resolved_at := null;
    new.resolved_by := null;
    new.acknowledged_by := null;
    if caller is not null then
      new.opened_by := caller;
    end if;
    return new;
  end if;

  new.rental_id := old.rental_id;
  new.opened_by := old.opened_by;
  new.created_at := old.created_at;

  -- You propose in your own name, and you accept in your own name.
  if new.proposed_by is distinct from old.proposed_by and caller is not null then
    new.proposed_by := caller;
  end if;
  if new.acknowledged_by is distinct from old.acknowledged_by and caller is not null then
    new.acknowledged_by := caller;
  end if;

  if new.status = 'resolved' and old.status <> 'resolved' then
    -- The opener can drop their own case at any time.
    withdrawn_by_opener :=
      new.resolution_outcome = 'withdrawn'
      and caller is not null
      and caller = old.opened_by;

    -- Otherwise: one side proposed, the other one accepted.
    accepted_by_other_side :=
      new.resolution_outcome is not null
      and new.proposed_by is not null
      and new.acknowledged_by is not null
      and new.proposed_by <> new.acknowledged_by
      and new.resolution_outcome = coalesce(new.proposed_outcome, new.resolution_outcome);

    if not (withdrawn_by_opener or accepted_by_other_side) then
      -- Reject the resolution, keep the rest of the update.
      new.status := old.status;
      new.resolution_outcome := old.resolution_outcome;
      new.resolved_at := old.resolved_at;
      new.resolved_by := old.resolved_by;
      new.deposit_frozen := old.deposit_frozen;
      return new;
    end if;

    new.resolved_at := now();
  elsif new.status <> 'resolved' then
    -- Only a settled case releases the deposit.
    new.deposit_frozen := old.deposit_frozen;
    new.resolution_outcome := old.resolution_outcome;
    new.resolved_at := old.resolved_at;
    new.resolved_by := old.resolved_by;
  end if;

  return new;
end;
$$;

drop trigger if exists disputes_guard_resolution on public.disputes;
create trigger disputes_guard_resolution
  before insert or update on public.disputes
  for each row execute function public.disputes_guard_resolution();

-- ---------------------------------------------------------------------------
-- R13: you may notify people you have something to do with.
-- ---------------------------------------------------------------------------

drop policy if exists "notifications_insert_any" on public.notifications;
drop policy if exists "notifications_insert_related" on public.notifications;
create policy "notifications_insert_related"
  on public.notifications for insert
  with check (
    auth.uid() is not null
    -- Nobody sends under another name.
    and (actor_id is null or actor_id = auth.uid())
    and (
      -- Reminders and expiry notices you raise for yourself.
      recipient_id = auth.uid()
      -- The other side of a rental you are on.
      or exists (
        select 1
        from public.rentals r
        where (r.owner_id = auth.uid() and r.renter_id = notifications.recipient_id)
           or (r.renter_id = auth.uid() and r.owner_id = notifications.recipient_id)
      )
      -- Somebody you are already talking to.
      or exists (
        select 1
        from public.messages m
        where (m.sender_id = auth.uid() and m.recipient_id = notifications.recipient_id)
           or (m.sender_id = notifications.recipient_id and m.recipient_id = auth.uid())
      )
      -- A host with something on the shelf: bookings, offers and bids reach them.
      or exists (
        select 1 from public.listings l where l.owner_id = notifications.recipient_id
      )
      -- Somebody who asked the neighborhood for a thing.
      or exists (
        select 1 from public.requests q where q.renter_id = notifications.recipient_id
      )
    )
  );

-- A notification arrives unread, and is not a place to paste an essay.
create or replace function public.notifications_guard_insert()
returns trigger
language plpgsql
as $$
begin
  if public.is_trusted_writer() then
    return new;
  end if;

  new.read_at := null;
  new.title := left(coalesce(new.title, ''), 200);
  new.body := left(coalesce(new.body, ''), 1000);
  return new;
end;
$$;

drop trigger if exists notifications_guard_insert on public.notifications;
create trigger notifications_guard_insert
  before insert on public.notifications
  for each row execute function public.notifications_guard_insert();
