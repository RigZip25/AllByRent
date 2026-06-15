/**
 * Supabase Edge Function: overdue automation
 * Schedule via Supabase cron (e.g. every 15 minutes).
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const MS_MIN = 60_000;

Deno.serve(async (req) => {
  const cronSecret = Deno.env.get("CRON_SECRET");
  if (cronSecret) {
    const auth = req.headers.get("Authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
  }

  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) {
    return new Response(JSON.stringify({ ok: false, reason: "Supabase not configured" }), {
      status: 503,
    });
  }

  const admin = createClient(url, key, { auth: { persistSession: false } });
  const now = Date.now();
  let lateFees = 0;
  let recoveryNotices = 0;
  let safelyEscalations = 0;

  const { data: rows } = await admin
    .from("rentals")
    .select(
      "id, owner_id, renter_id, due_at, late_fee_applied_at, overdue_hour_notified_at, owner_recovery_notified_at, safely_escalated_at, safely_policy_id, rental_total_cents, listing_id, start_date, end_date",
    )
    .in("status", ["active", "overdue"])
    .not("due_at", "is", null);

  for (const rental of rows ?? []) {
    const dueMs = new Date(rental.due_at as string).getTime();
    if (Number.isNaN(dueMs) || now <= dueMs) continue;
    const overdueMs = now - dueMs;

    if (overdueMs >= MS_MIN && !rental.late_fee_applied_at) {
      const lateFee = Math.max(50, Math.round((rental.rental_total_cents as number) > 0 ? 1500 : 1500));
      await admin
        .from("rentals")
        .update({
          status: "overdue",
          late_fee_cents: lateFee,
          late_fee_applied_at: new Date().toISOString(),
        })
        .eq("id", rental.id);

      if (!rental.overdue_hour_notified_at) {
        await admin.from("notifications").insert({
          id: crypto.randomUUID(),
          recipient_id: rental.renter_id,
          actor_id: rental.owner_id,
          type: "general",
          title: "Late return fee applied",
          body: `Your return is overdue. A late fee of $${(lateFee / 100).toFixed(2)} has been applied.`,
        });
        await admin
          .from("rentals")
          .update({ overdue_hour_notified_at: new Date().toISOString() })
          .eq("id", rental.id);
      }
      lateFees += 1;
    }

    if (overdueMs >= 24 * 60 * MS_MIN && !rental.owner_recovery_notified_at) {
      await admin.from("notifications").insert({
        id: crypto.randomUUID(),
        recipient_id: rental.owner_id,
        actor_id: rental.renter_id,
        type: "general",
        title: "Overdue — owner recovery",
        body: "The item is 24+ hours overdue. You can start owner recovery steps.",
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
        ? ` Policy ${rental.safely_policy_id}.`
        : "";
      await admin.from("notifications").insert({
        id: crypto.randomUUID(),
        recipient_id: rental.owner_id,
        actor_id: null,
        type: "general",
        title: "Safely escalation (48h overdue)",
        body: `Rental is 48+ hours overdue.${policyNote}`,
      });
      safelyEscalations += 1;
    }
  }

  return new Response(
    JSON.stringify({ ok: true, lateFees, recoveryNotices, safelyEscalations }),
    { headers: { "Content-Type": "application/json" } },
  );
});
