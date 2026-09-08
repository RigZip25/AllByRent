import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { isStripeServerConfigured } from "./keys";

const MS_MIN = 60_000;
/** Soft no-show suggest — align with client NO_SHOW_MARK_AFTER_MS (2h). */
const NO_SHOW_SUGGEST_MS = 2 * 60 * MS_MIN;
/**
 * If host never confirms after soft suggest, auto-cancel & free calendar
 * (market-like peer car-share: multi-hour window then platform cancel).
 */
const NO_SHOW_AUTO_CANCEL_MS = 24 * 60 * MS_MIN;

type RentalRow = {
  id: string;
  listing_id: string;
  owner_id: string;
  renter_id: string;
  status: string;
  pickup_at: string | null;
  due_at: string | null;
  start_date: string;
  end_date: string;
  no_show_renter_notified_at: string | null;
  no_show_automation_at: string | null;
  no_show_fee_cents: number;
  late_fee_cents: number;
  late_fee_applied_at: string | null;
  overdue_hour_notified_at: string | null;
  owner_recovery_notified_at: string | null;
  /** Set by the database when the renter says they are running late. */
  pickup_grace_until?: string | null;
  safely_escalated_at: string | null;
  rental_total_cents: number;
  safely_policy_id: string | null;
};

type ListingHandoff = {
  lateReturnFeeEnabled?: boolean;
  lateReturnGraceMinutes?: number;
  lateReturnFlatFeeUsd?: string;
  lateReturnPerHourFeeUsd?: string;
};

function parseUsdToCents(raw: string | number | undefined | null): number {
  if (raw == null) return 0;
  const n =
    typeof raw === "number"
      ? raw
      : Number.parseFloat(String(raw).replace(/^\$/, "").trim());
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.round(n * 100);
}

function assessLateFeeFromHandoff(
  handoff: ListingHandoff | null | undefined,
  dueMs: number,
  nowMs: number,
): { pastGrace: boolean; feeCents: number; summary: string | null } {
  if (!handoff?.lateReturnFeeEnabled) {
    return { pastGrace: nowMs > dueMs, feeCents: 0, summary: null };
  }
  const graceMinutes =
    typeof handoff.lateReturnGraceMinutes === "number" &&
    Number.isFinite(handoff.lateReturnGraceMinutes)
      ? Math.max(0, Math.round(handoff.lateReturnGraceMinutes))
      : 30;
  const flatCents = parseUsdToCents(handoff.lateReturnFlatFeeUsd ?? "20");
  const perHourCents = parseUsdToCents(handoff.lateReturnPerHourFeeUsd ?? "15");
  const graceEndsMs = dueMs + graceMinutes * MS_MIN;
  const pastGrace = nowMs > graceEndsMs;
  if (!pastGrace) {
    return { pastGrace: false, feeCents: 0, summary: null };
  }
  const billableMs = Math.max(0, nowMs - graceEndsMs);
  const billableHours = Math.max(1, Math.ceil(billableMs / (60 * MS_MIN)));
  const feeCents = flatCents + billableHours * perHourCents;
  const parts: string[] = [`${graceMinutes}m grace`];
  if (flatCents > 0) parts.push(`$${(flatCents / 100).toFixed(2)} flat`);
  if (perHourCents > 0) parts.push(`$${(perHourCents / 100).toFixed(2)}/hr`);
  return { pastGrace: true, feeCents, summary: parts.join(" · ") };
}

async function insertNotification(
  admin: SupabaseClient,
  input: { recipientId: string; actorId: string | null; type: string; title: string; body: string },
): Promise<void> {
  const id = randomUUID();
  await admin.from("notifications").insert({
    id,
    recipient_id: input.recipientId,
    actor_id: input.actorId,
    type: input.type,
    title: input.title,
    body: input.body,
    read_at: null,
  });
}

const RENTAL_AUTOMATION_COLUMNS =
  "id, listing_id, owner_id, renter_id, status, pickup_at, due_at, start_date, end_date, no_show_renter_notified_at, no_show_automation_at, no_show_fee_cents, late_fee_cents, late_fee_applied_at, overdue_hour_notified_at, owner_recovery_notified_at, safely_escalated_at, rental_total_cents, safely_policy_id";

/**
 * The rentals the automation walks.
 *
 * `pickup_grace_until` arrived with migration 058, and a project that has not
 * run it yet would otherwise get an error for the whole select and no no-show
 * handling at all — so a missing column costs the grace, not the cron.
 */
async function fetchAutomationRentals(
  admin: SupabaseClient,
  statuses: string[],
  presentColumn: "pickup_at" | "due_at",
): Promise<RentalRow[]> {
  const query = () =>
    admin
      .from("rentals")
      .select(`${RENTAL_AUTOMATION_COLUMNS}, pickup_grace_until`)
      .in("status", statuses)
      .not(presentColumn, "is", null);

  const { data, error } = await query();
  if (!error) return (data ?? []) as RentalRow[];

  const { data: fallback } = await admin
    .from("rentals")
    .select(RENTAL_AUTOMATION_COLUMNS)
    .in("status", statuses)
    .not(presentColumn, "is", null);
  return (fallback ?? []) as RentalRow[];
}

/**
 * The first moment a rental counts as a no-show: two hours after the pickup
 * window, or the end of the grace the renter's "running late" note bought.
 */
export function noShowDueAtMs(rental: Pick<RentalRow, "pickup_at" | "pickup_grace_until">): number {
  const pickupMs = new Date(rental.pickup_at ?? "").getTime();
  const graceMs = rental.pickup_grace_until
    ? new Date(rental.pickup_grace_until).getTime()
    : Number.NaN;
  const base = pickupMs + NO_SHOW_SUGGEST_MS;
  return Number.isNaN(graceMs) ? base : Math.max(base, graceMs);
}

export async function runNoShowAutomation(admin: SupabaseClient): Promise<{
  reminded: number;
  suggested: number;
  autoCancelled: number;
}> {
  const now = Date.now();
  let reminded = 0;
  let suggested = 0;
  let autoCancelled = 0;

  const rentals = await fetchAutomationRentals(
    admin,
    ["pending_checkin", "upcoming", "no_show"],
    "pickup_at",
  );

  for (const rental of rentals) {
    const pickupMs = new Date(rental.pickup_at!).getTime();
    if (Number.isNaN(pickupMs)) continue;

    const elapsed = now - pickupMs;

    const noShowDueMs = noShowDueAtMs(rental);
    const graceUntilMs = rental.pickup_grace_until
      ? new Date(rental.pickup_grace_until).getTime()
      : Number.NaN;
    // Someone who has just told the host they are on the way does not need to
    // be told the window opened.
    const inGrace = !Number.isNaN(graceUntilMs) && now < graceUntilMs;

    if (
      (rental.status === "pending_checkin" || rental.status === "upcoming") &&
      elapsed >= 30 * MS_MIN &&
      !rental.no_show_renter_notified_at &&
      !inGrace
    ) {
      await insertNotification(admin, {
        recipientId: rental.renter_id,
        actorId: rental.owner_id,
        type: "general",
        title: "Pickup window started",
        body: "Your pickup window began 30 minutes ago. Head to the meetup or message the host if you're running late.",
      });
      await admin
        .from("rentals")
        .update({ no_show_renter_notified_at: new Date().toISOString() })
        .eq("id", rental.id);
      reminded += 1;
    }

    // Soft suggest: status → no_show, calendar still busy until host confirms or auto-cancel.
    if (
      (rental.status === "pending_checkin" || rental.status === "upcoming") &&
      now >= noShowDueMs &&
      !rental.no_show_automation_at
    ) {
      await admin
        .from("rentals")
        .update({
          status: "no_show",
          no_show_automation_at: new Date().toISOString(),
        })
        .eq("id", rental.id);

      await insertNotification(admin, {
        recipientId: rental.owner_id,
        actorId: rental.renter_id,
        type: "general",
        title: "Mark no-show to free your calendar",
        body: "The renter has not checked in 2 hours after scheduled pickup. Mark no-show in Rentals now — trip price is typically kept. If you take no action, we auto-cancel and free the calendar after 24 hours from pickup.",
      });

      await insertNotification(admin, {
        recipientId: rental.renter_id,
        actorId: rental.owner_id,
        type: "general",
        title: "Pickup window closing",
        body: "You have not checked in 2 hours after scheduled pickup. Message the host if you still intend to pick up — they may mark no-show and keep the trip price.",
      });

      suggested += 1;
      continue;
    }

    // Auto-cancel / free calendar if host never marks after soft suggest (24h from pickup).
    if (
      rental.status === "no_show" &&
      elapsed >= NO_SHOW_AUTO_CANCEL_MS &&
      rental.no_show_automation_at
    ) {
      const { data: existing } = await admin
        .from("rentals")
        .select("no_show_marked_at, picked_up_at, host_handed_over_at, renter_received_at")
        .eq("id", rental.id)
        .maybeSingle();

      if (
        existing?.no_show_marked_at ||
        existing?.picked_up_at ||
        existing?.host_handed_over_at ||
        existing?.renter_received_at
      ) {
        continue;
      }

      const nowIso = new Date().toISOString();
      const feeCents = Math.max(0, Math.round(rental.no_show_fee_cents || 0));
      await admin
        .from("rentals")
        .update({
          status: "cancelled",
          no_show_marked_at: nowIso,
        })
        .eq("id", rental.id);

      await insertNotification(admin, {
        recipientId: rental.owner_id,
        actorId: null,
        type: "general",
        title: "No-show auto-cancelled — calendar freed",
        body: feeCents > 0
          ? "Renter never checked in. Booking cancelled 24h after pickup; calendar is free. Optional no-show fee was configured — claim from deposit if appropriate."
          : "Renter never checked in. Booking cancelled 24h after pickup; calendar is free. Trip price is typically kept.",
      });

      await insertNotification(admin, {
        recipientId: rental.renter_id,
        actorId: null,
        type: "general",
        title: "Booking cancelled — no-show",
        body: "This booking was cancelled because pickup never happened within 24 hours of the scheduled start. The trip price is typically kept per no-show policy.",
      });

      autoCancelled += 1;
    }
  }

  return { reminded, suggested, autoCancelled };
}

export async function runOverdueAutomation(admin: SupabaseClient): Promise<{
  overdueNotices: number;
  recoveryNotices: number;
  safelyEscalations: number;
}> {
  const now = Date.now();
  let overdueNotices = 0;
  let recoveryNotices = 0;
  let safelyEscalations = 0;

  const rentals = await fetchAutomationRentals(admin, ["active", "overdue"], "due_at");

  for (const rental of rentals) {
    const dueMs = new Date(rental.due_at!).getTime();
    if (Number.isNaN(dueMs) || now <= dueMs) continue;

    const overdueMs = now - dueMs;

    if (overdueMs >= MS_MIN && rental.status !== "overdue") {
      await admin.from("rentals").update({ status: "overdue" }).eq("id", rental.id);
    }

    if (overdueMs >= MS_MIN && !rental.overdue_hour_notified_at) {
      const { data: listingRow } = await admin
        .from("listings")
        .select("handoff")
        .eq("id", rental.listing_id)
        .maybeSingle();

      const handoff =
        listingRow?.handoff && typeof listingRow.handoff === "object"
          ? (listingRow.handoff as ListingHandoff)
          : null;

      const late = assessLateFeeFromHandoff(handoff, dueMs, now);
      let body =
        "Your return is overdue. Check the late-return policy for this booking — message the host if you need more time.";
      if (late.summary) {
        body += ` Policy: ${late.summary}.`;
        if (late.pastGrace && late.feeCents > 0) {
          body += ` Estimated late fee so far: $${(late.feeCents / 100).toFixed(2)} (host confirms via invoice).`;
        }
      }

      await insertNotification(admin, {
        recipientId: rental.renter_id,
        actorId: rental.owner_id,
        type: "general",
        title: "Return overdue",
        body,
      });
      await admin
        .from("rentals")
        .update({ overdue_hour_notified_at: new Date().toISOString() })
        .eq("id", rental.id);

      overdueNotices += 1;
    }

    if (overdueMs >= 24 * 60 * MS_MIN && !rental.owner_recovery_notified_at) {
      await insertNotification(admin, {
        recipientId: rental.owner_id,
        actorId: rental.renter_id,
        type: "general",
        title: "Overdue — owner recovery",
        body: "The item is 24+ hours overdue. You can start owner recovery steps and document the situation in a dispute.",
      });
      await admin
        .from("rentals")
        .update({ owner_recovery_notified_at: new Date().toISOString() })
        .eq("id", rental.id);
      recoveryNotices += 1;
    }

    if (overdueMs >= 48 * 60 * MS_MIN && !rental.safely_escalated_at) {
      await admin
        .from("rentals")
        .update({ safely_escalated_at: new Date().toISOString() })
        .eq("id", rental.id);

      const policyNote = rental.safely_policy_id
        ? ` Safely policy ${rental.safely_policy_id} flagged for escalation.`
        : " No Safely policy on file — notify support manually.";

      await insertNotification(admin, {
        recipientId: rental.owner_id,
        actorId: null,
        type: "general",
        title: "Safely escalation (48h overdue)",
        body: `Rental is 48+ hours overdue.${policyNote}`,
      });

      await insertNotification(admin, {
        recipientId: rental.renter_id,
        actorId: null,
        type: "general",
        title: "Urgent: return overdue 48h",
        body: "Your rental is severely overdue. Return the item immediately to avoid further action.",
      });

      safelyEscalations += 1;
    }
  }

  return { overdueNotices, recoveryNotices, safelyEscalations };
}

/** How long the host has to claim against the hold once the item is back. */
const DEPOSIT_CLAIM_WINDOW_MS = 48 * 60 * MS_MIN;

export type DepositRow = {
  id: string;
  owner_id: string;
  renter_id: string;
  status: string;
  deposit_status: string | null;
  deposit_amount_cents: number;
  deposit_claim_deadline_at: string | null;
  stripe_deposit_payment_intent_id: string | null;
  returned_at: string | null;
  picked_up_at: string | null;
  cancelled_at: string | null;
  end_date: string;
};

export type DisputeRow = {
  rental_id: string;
  status: string;
  resolution_outcome: string | null;
  resolved_at: string | null;
};

/**
 * When the hold on this rental should come off by itself, or null while it is
 * somebody's decision to make.
 *
 * The hold is money the renter cannot spend, so it needs an end even when
 * nobody does anything. A booking that ended before the item ever changed hands
 * has nothing to inspect, so it ends immediately; a finished rental gives the
 * host the claim window they are promised and then lifts; a dispute holds
 * everything until the two sides agree, and then follows the outcome.
 */
export function depositReleaseDueAt(
  rental: DepositRow,
  dispute: DisputeRow | undefined,
): number | null {
  if (dispute && dispute.status !== "resolved") return null;

  if (dispute?.status === "resolved") {
    const resolvedMs = dispute.resolved_at ? Date.parse(dispute.resolved_at) : Date.now();
    // The host won the argument: they get a fresh window to actually claim.
    if (dispute.resolution_outcome === "favor_host") return resolvedMs + DEPOSIT_CLAIM_WINDOW_MS;
    // A split is settled by hand; support tells us when it is done.
    if (dispute.resolution_outcome === "split") return null;
    return resolvedMs;
  }

  // Cancelled or a no-show before pickup: the item never left the host.
  if (rental.status === "cancelled" && !rental.picked_up_at) {
    return rental.cancelled_at ? Date.parse(rental.cancelled_at) : Date.now();
  }

  if (rental.status !== "completed" && rental.status !== "cancelled") return null;

  if (rental.deposit_claim_deadline_at) return Date.parse(rental.deposit_claim_deadline_at);
  if (rental.returned_at) return Date.parse(rental.returned_at) + DEPOSIT_CLAIM_WINDOW_MS;
  return Date.parse(`${rental.end_date}T23:59:59.999Z`) + DEPOSIT_CLAIM_WINDOW_MS;
}

/**
 * Lift the holds nobody is entitled to keep.
 *
 * Completing a rental never released the deposit, and neither did cancelling
 * one before pickup: the hold sat on the renter's card until the host happened
 * to press a button, which for most rentals meant until the authorization
 * expired on Stripe's side, weeks later, with no record either side could see.
 */
export async function runDepositSettlementAutomation(admin: SupabaseClient): Promise<{
  released: number;
  failed: number;
}> {
  let released = 0;
  let failed = 0;

  if (!isStripeServerConfigured()) return { released, failed };

  const { data: rows } = await admin
    .from("rentals")
    .select(
      "id, owner_id, renter_id, status, deposit_status, deposit_amount_cents, deposit_claim_deadline_at, stripe_deposit_payment_intent_id, returned_at, picked_up_at, cancelled_at, end_date",
    )
    .in("status", ["completed", "cancelled", "no_show"])
    .in("deposit_status", ["held", "requires_capture"])
    .not("stripe_deposit_payment_intent_id", "is", null);

  const rentals = (rows ?? []) as DepositRow[];
  if (rentals.length === 0) return { released, failed };

  const { data: disputeRows } = await admin
    .from("disputes")
    .select("rental_id, status, resolution_outcome, resolved_at")
    .in(
      "rental_id",
      rentals.map((rental) => rental.id),
    );

  const disputes = new Map<string, DisputeRow>();
  for (const dispute of (disputeRows ?? []) as DisputeRow[]) {
    disputes.set(dispute.rental_id, dispute);
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-01-27.acacia" as Stripe.LatestApiVersion,
  });
  const now = Date.now();

  for (const rental of rentals) {
    const dueAt = depositReleaseDueAt(rental, disputes.get(rental.id));
    if (dueAt == null || Number.isNaN(dueAt) || now < dueAt) continue;

    try {
      const intent = await stripe.paymentIntents.retrieve(
        rental.stripe_deposit_payment_intent_id!,
      );
      if (intent.status === "succeeded") {
        // Already captured; the webhook will catch up on the label.
        await admin.from("rentals").update({ deposit_status: "claimed" }).eq("id", rental.id);
        continue;
      }
      if (intent.status !== "canceled") {
        await stripe.paymentIntents.cancel(intent.id);
      }
    } catch {
      failed += 1;
      continue;
    }

    await admin.from("rentals").update({ deposit_status: "released" }).eq("id", rental.id);

    const amount = `$${(Math.max(0, rental.deposit_amount_cents) / 100).toFixed(2)}`;
    await insertNotification(admin, {
      recipientId: rental.renter_id,
      actorId: null,
      type: "general",
      title: "Deposit hold released",
      body: `The ${amount} hold on your card was released. It can take a few days for your bank to show it.`,
    });
    await insertNotification(admin, {
      recipientId: rental.owner_id,
      actorId: null,
      type: "general",
      title: "Deposit hold released",
      body: `The ${amount} hold on this rental was released — the claim window has passed.`,
    });

    released += 1;
  }

  return { released, failed };
}

type PendingApprovalRow = {
  id: string;
  owner_id: string;
  renter_id: string;
  listing_id: string;
  created_at: string;
  stripe_payment_intent_id: string | null;
};

export async function runPendingApprovalExpiry(admin: SupabaseClient): Promise<{ expired: number }> {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  let expired = 0;

  const { data: rows } = await admin
    .from("rentals")
    .select("id, owner_id, renter_id, listing_id, created_at, stripe_payment_intent_id")
    .eq("status", "pending_approval")
    .lt("created_at", cutoff);

  const rentals = (rows ?? []) as PendingApprovalRow[];

  for (const rental of rentals) {
    if (isStripeServerConfigured() && rental.stripe_payment_intent_id) {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
          apiVersion: "2025-01-27.acacia" as Stripe.LatestApiVersion,
        });
        const intent = await stripe.paymentIntents.retrieve(rental.stripe_payment_intent_id);
        if (intent.status === "requires_capture" || intent.status === "requires_payment_method") {
          const canceled = await stripe.paymentIntents.cancel(intent.id);
          await admin
            .from("rentals")
            .update({ stripe_payment_status: canceled.status })
            .eq("id", rental.id);
        }
      } catch {
        // Continue with rental cancellation even if Stripe cancel fails.
      }
    }

    await admin.from("rentals").update({ status: "cancelled" }).eq("id", rental.id);

    await insertNotification(admin, {
      recipientId: rental.renter_id,
      actorId: rental.owner_id,
      type: "booking_request",
      title: "Booking request expired",
      body: "No host response within 24h. Your request was cancelled and any authorized payment was released.",
    });

    await insertNotification(admin, {
      recipientId: rental.owner_id,
      actorId: rental.renter_id,
      type: "booking_request",
      title: "Request expired",
      body: "A booking request auto-cancelled after 24h without a response.",
    });

    expired += 1;
  }

  return { expired };
}
