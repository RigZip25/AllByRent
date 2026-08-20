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

export async function runNoShowAutomation(admin: SupabaseClient): Promise<{
  reminded: number;
  suggested: number;
  autoCancelled: number;
}> {
  const now = Date.now();
  let reminded = 0;
  let suggested = 0;
  let autoCancelled = 0;

  const { data: rows } = await admin
    .from("rentals")
    .select(
      "id, listing_id, owner_id, renter_id, status, pickup_at, due_at, start_date, end_date, no_show_renter_notified_at, no_show_automation_at, no_show_fee_cents, late_fee_cents, late_fee_applied_at, overdue_hour_notified_at, owner_recovery_notified_at, safely_escalated_at, rental_total_cents, safely_policy_id",
    )
    .in("status", ["pending_checkin", "upcoming", "no_show"])
    .not("pickup_at", "is", null);

  const rentals = (rows ?? []) as RentalRow[];

  for (const rental of rentals) {
    const pickupMs = new Date(rental.pickup_at!).getTime();
    if (Number.isNaN(pickupMs)) continue;

    const elapsed = now - pickupMs;

    if (
      (rental.status === "pending_checkin" || rental.status === "upcoming") &&
      elapsed >= 30 * MS_MIN &&
      !rental.no_show_renter_notified_at
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
      elapsed >= NO_SHOW_SUGGEST_MS &&
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

  const { data: rows } = await admin
    .from("rentals")
    .select(
      "id, listing_id, owner_id, renter_id, status, pickup_at, due_at, start_date, end_date, no_show_renter_notified_at, no_show_automation_at, no_show_fee_cents, late_fee_cents, late_fee_applied_at, overdue_hour_notified_at, owner_recovery_notified_at, safely_escalated_at, rental_total_cents, safely_policy_id",
    )
    .in("status", ["active", "overdue"])
    .not("due_at", "is", null);

  const rentals = (rows ?? []) as RentalRow[];

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
