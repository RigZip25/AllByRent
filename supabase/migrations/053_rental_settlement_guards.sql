-- A participant in a rental could settle it themselves.
--
-- `rentals_update_owner_or_renter` (migration 006) lets the host and the renter
-- update any column on their booking, which the app relies on: dates, PINs, the
-- signed agreement. The same door reaches the columns nobody at the table gets
-- to decide.
--
-- Two holes, one trigger:
--
--   * Money (R2). `stripe_payment_status = 'succeeded'`, a released deposit, a
--     zeroed late fee, an invoice marked paid — all one PATCH away. These are
--     written by the Stripe webhook and the payment routes, which talk to the
--     database as the service role.
--
--   * The handoff (R3). `/api/rentals/confirm-handoff` checks the six-digit PIN
--     before it stamps `host_handed_over_at` and flips the rental to `active`.
--     Writing those columns directly skipped the PIN, so a rental could be
--     started, and closed, without the code ever being said out loud.
--
-- The guard restores the old value instead of raising: the client syncs whole
-- rows, and an error would break a legitimate save that merely echoes a field
-- it never changed.
--
-- What this does not fix: the amounts a fresh booking arrives with
-- (`rental_total_cents`, `deposit_amount_cents`) are still the client's, so the
-- server has nothing but the client's word to charge against. That needs the
-- total computed server-side from the listing and the dates — checklist A1/M1.

/** The rental's own money and the paperwork that proves it was paid. */
create or replace function public.rentals_guard_settlement()
returns trigger
language plpgsql
as $$
declare
  -- Contactless returns complete themselves when the host never turns up to
  -- accept them; the client has always done this, and the rule is checkable
  -- here rather than being taken on trust.
  auto_return_due boolean;
begin
  if public.is_trusted_writer() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    -- A booking is created before it is paid for. Everything settlement-shaped
    -- starts empty, whatever the client sent.
    new.stripe_payment_intent_id := null;
    new.stripe_payment_status := null;
    new.stripe_deposit_payment_intent_id := null;
    new.deposit_status := null;
    new.deposit_claim_deadline_at := null;
    new.rental_invoices := null;
    new.late_fee_cents := 0;
    new.late_fee_applied_at := null;
    new.no_show_fee_cents := 0;
    new.no_show_marked_at := null;
    new.no_show_renter_notified_at := null;
    new.no_show_automation_at := null;
    new.overdue_hour_notified_at := null;
    new.owner_recovery_notified_at := null;
    new.safely_escalated_at := null;
    new.safely_policy_id := null;
    new.insurance_fee_cents := 0;
    new.cancelled_at := null;
    new.cancelled_by := null;
    new.cancel_refund_percent := null;
    new.cancel_refund_status := null;
    -- Nothing has been handed over yet either.
    new.host_handed_over_at := null;
    new.renter_received_at := null;
    new.renter_returned_at := null;
    new.host_accepted_return_at := null;
    new.picked_up_at := null;
    new.returned_at := null;
    if new.status in ('active', 'overdue', 'completed', 'no_show') then
      new.status := 'pending_approval';
    end if;
    return new;
  end if;

  -- Money: the webhook and the payment routes own every one of these.
  new.stripe_payment_intent_id := old.stripe_payment_intent_id;
  new.stripe_payment_status := old.stripe_payment_status;
  new.stripe_deposit_payment_intent_id := old.stripe_deposit_payment_intent_id;
  new.deposit_status := old.deposit_status;
  new.deposit_amount_cents := old.deposit_amount_cents;
  new.deposit_claim_deadline_at := old.deposit_claim_deadline_at;
  new.rental_total_cents := old.rental_total_cents;
  new.insurance_fee_cents := old.insurance_fee_cents;
  new.safely_policy_id := old.safely_policy_id;
  new.late_fee_cents := old.late_fee_cents;
  new.late_fee_applied_at := old.late_fee_applied_at;
  new.no_show_fee_cents := old.no_show_fee_cents;
  new.cancel_refund_percent := old.cancel_refund_percent;
  new.cancel_refund_status := old.cancel_refund_status;
  -- Invoices decide what the renter is charged after the rental; the host
  -- raises one through `/api/stripe/rental_invoice`, which pays and records it.
  new.rental_invoices := old.rental_invoices;

  -- Who the rental is between, and when it was made, are not editable either.
  new.listing_id := old.listing_id;
  new.owner_id := old.owner_id;
  new.renter_id := old.renter_id;
  new.created_at := old.created_at;

  -- The handoff: stamped by the route that checked the PIN.
  auto_return_due :=
    coalesce(old.booking_mode, '') = 'contactless'
    and old.renter_returned_at is not null
    and old.host_accepted_return_at is null
    and old.renter_returned_at < now() - interval '24 hours';

  new.host_handed_over_at := old.host_handed_over_at;
  new.renter_received_at := old.renter_received_at;
  new.renter_returned_at := old.renter_returned_at;
  new.picked_up_at := old.picked_up_at;

  if auto_return_due then
    -- The renter left it where they were told and the host stayed away: the
    -- rental closes itself rather than hanging on the host forever.
    new.host_accepted_return_at := coalesce(new.host_accepted_return_at, now());
    new.returned_at := coalesce(new.returned_at, old.renter_returned_at);
  else
    new.host_accepted_return_at := old.host_accepted_return_at;
    new.returned_at := old.returned_at;
  end if;

  -- `active` and `completed` are what the PIN buys. The rest of the lifecycle
  -- (approve, decline, cancel, dispute, no-show) stays with the two people
  -- involved. A rental that has already been returned, or whose dispute has
  -- been settled by both sides, may still be closed from either device.
  if new.status <> old.status and new.status in ('active', 'completed') then
    if
      new.status = 'completed'
      and (
        new.returned_at is not null
        or exists (
          select 1
          from public.disputes d
          where d.rental_id = old.id
            and d.status = 'resolved'
        )
      )
    then
      null;
    else
      new.status := old.status;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists rentals_guard_settlement on public.rentals;
create trigger rentals_guard_settlement
  before insert or update on public.rentals
  for each row execute function public.rentals_guard_settlement();
