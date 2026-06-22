import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { isStripeServerConfigured } from "./keys";
import { getOrCreateStripeCustomer } from "./stripe/customer";

const MS_MIN = 60_000;

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

function parseDailyRateCents(pricing: unknown): number {
  if (!pricing || typeof pricing !== "object") return 0;
  const daily = (pricing as { dailyRate?: string }).dailyRate;
  if (typeof daily !== "string") return 0;
  const n = Number.parseFloat(daily.replace(/^\$/, "").trim());
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.round(n * 100);
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

async function dailyRateForRental(
  admin: SupabaseClient,
  rental: RentalRow,
): Promise<number> {
  if (rental.rental_total_cents > 0) {
    const days = Math.max(
      1,
      Math.ceil(
        (new Date(rental.end_date).getTime() - new Date(rental.start_date).getTime()) /
          (24 * 60 * 60 * 1000),
      ) + 1,
    );
    return Math.max(50, Math.round(rental.rental_total_cents / days));
  }

  const { data: listing } = await admin
    .from("listings")
    .select("pricing")
    .eq("id", rental.listing_id)
    .maybeSingle();

  return Math.max(50, parseDailyRateCents(listing?.pricing));
}

export async function runNoShowAutomation(admin: SupabaseClient): Promise<{
  reminded: number;
  cancelled: number;
}> {
  const now = Date.now();
  let reminded = 0;
  let cancelled = 0;

  const { data: rows } = await admin
    .from("rentals")
    .select(
      "id, listing_id, owner_id, renter_id, status, pickup_at, due_at, start_date, end_date, no_show_renter_notified_at, no_show_automation_at, no_show_fee_cents, late_fee_cents, late_fee_applied_at, overdue_hour_notified_at, owner_recovery_notified_at, safely_escalated_at, rental_total_cents, safely_policy_id",
    )
    .eq("status", "pending_checkin")
    .not("pickup_at", "is", null);

  const rentals = (rows ?? []) as RentalRow[];

  for (const rental of rentals) {
    const pickupMs = new Date(rental.pickup_at!).getTime();
    if (Number.isNaN(pickupMs)) continue;

    const elapsed = now - pickupMs;

    if (elapsed >= 30 * MS_MIN && !rental.no_show_renter_notified_at) {
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

    if (elapsed >= 60 * MS_MIN && !rental.no_show_automation_at) {
      const feeCents = await dailyRateForRental(admin, rental);

      if (isStripeServerConfigured()) {
        try {
          const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
            apiVersion: "2025-01-27.acacia" as Stripe.LatestApiVersion,
          });
          const { data: profile } = await admin
            .from("profiles")
            .select("stripe_customer_id")
            .eq("id", rental.renter_id)
            .maybeSingle();

          let customerId = profile?.stripe_customer_id as string | undefined;
          if (!customerId) {
            const { data: userData } = await admin.auth.admin.getUserById(rental.renter_id);
            customerId = await getOrCreateStripeCustomer(
              stripe,
              admin,
              rental.renter_id,
              userData.user?.email,
            );
          }

          await stripe.paymentIntents.create({
            amount: feeCents,
            currency: "usd",
            customer: customerId,
            confirm: true,
            off_session: true,
            metadata: {
              rental_id: rental.id,
              payment_type: "no_show_fee",
            },
          });
        } catch {
          // Fee recorded on rental even if charge fails (e.g. no saved card).
        }
      }

      await admin
        .from("rentals")
        .update({
          status: "cancelled",
          no_show_marked_at: new Date().toISOString(),
          no_show_automation_at: new Date().toISOString(),
          no_show_fee_cents: feeCents,
        })
        .eq("id", rental.id);

      await insertNotification(admin, {
        recipientId: rental.owner_id,
        actorId: rental.renter_id,
        type: "general",
        title: "Booking cancelled — no-show",
        body: "The renter did not check in within 60 minutes. The booking was cancelled and a one-day fee may apply.",
      });

      cancelled += 1;
    }
  }

  return { reminded, cancelled };
}

export async function runOverdueAutomation(admin: SupabaseClient): Promise<{
  lateFees: number;
  recoveryNotices: number;
  safelyEscalations: number;
}> {
  const now = Date.now();
  let lateFees = 0;
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
    const dailyCents = await dailyRateForRental(admin, rental);

    if (overdueMs >= MS_MIN && !rental.late_fee_applied_at) {
      const lateFee = Math.round(dailyCents * 1.5);
      await admin
        .from("rentals")
        .update({
          status: "overdue",
          late_fee_cents: lateFee,
          late_fee_applied_at: new Date().toISOString(),
        })
        .eq("id", rental.id);

      if (!rental.overdue_hour_notified_at) {
        await insertNotification(admin, {
          recipientId: rental.renter_id,
          actorId: rental.owner_id,
          type: "general",
          title: "Late return fee applied",
          body: `Your return is overdue. A late fee of $${(lateFee / 100).toFixed(2)} (1.5× daily rate) has been applied.`,
        });
        await admin
          .from("rentals")
          .update({ overdue_hour_notified_at: new Date().toISOString() })
          .eq("id", rental.id);
      }

      lateFees += 1;
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

  return { lateFees, recoveryNotices, safelyEscalations };
}
