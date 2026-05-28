/**
 * Supabase Edge Function: no-show automation
 * Schedule via Supabase cron (e.g. every 5 minutes).
 * Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
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
  let reminded = 0;
  let cancelled = 0;

  const { data: rows } = await admin
    .from("rentals")
    .select("id, owner_id, renter_id, pickup_at, no_show_renter_notified_at, no_show_automation_at")
    .eq("status", "pending_checkin")
    .not("pickup_at", "is", null);

  for (const rental of rows ?? []) {
    const pickupMs = new Date(rental.pickup_at as string).getTime();
    if (Number.isNaN(pickupMs)) continue;
    const elapsed = now - pickupMs;

    if (elapsed >= 30 * MS_MIN && !rental.no_show_renter_notified_at) {
      await admin.from("notifications").insert({
        id: crypto.randomUUID(),
        recipient_id: rental.renter_id,
        actor_id: rental.owner_id,
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
      await admin
        .from("rentals")
        .update({
          status: "cancelled",
          no_show_marked_at: new Date().toISOString(),
          no_show_automation_at: new Date().toISOString(),
        })
        .eq("id", rental.id);
      await admin.from("notifications").insert({
        id: crypto.randomUUID(),
        recipient_id: rental.owner_id,
        actor_id: rental.renter_id,
        type: "general",
        title: "Booking cancelled — no-show",
        body: "The renter did not check in within 60 minutes. The booking was cancelled.",
      });
      cancelled += 1;
    }
  }

  return new Response(JSON.stringify({ ok: true, reminded, cancelled }), {
    headers: { "Content-Type": "application/json" },
  });
});
