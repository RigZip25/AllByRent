/**
 * Supabase Edge Function: no-show automation
 * Schedule via Supabase cron (e.g. every 5 minutes).
 * Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * Path: +30m renter nudge → +2h soft no_show suggest → +24h auto-cancel/free calendar.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const MS_MIN = 60_000;
const NO_SHOW_SUGGEST_MS = 2 * 60 * MS_MIN;
const NO_SHOW_AUTO_CANCEL_MS = 24 * 60 * MS_MIN;

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
  let suggested = 0;
  let autoCancelled = 0;

  const { data: rows } = await admin
    .from("rentals")
    .select(
      "id, owner_id, renter_id, status, pickup_at, no_show_renter_notified_at, no_show_automation_at, no_show_marked_at, picked_up_at, host_handed_over_at, renter_received_at",
    )
    .in("status", ["pending_checkin", "upcoming", "no_show"])
    .not("pickup_at", "is", null);

  for (const rental of rows ?? []) {
    const pickupMs = new Date(rental.pickup_at as string).getTime();
    if (Number.isNaN(pickupMs)) continue;
    const elapsed = now - pickupMs;
    const status = rental.status as string;

    if (
      (status === "pending_checkin" || status === "upcoming") &&
      elapsed >= 30 * MS_MIN &&
      !rental.no_show_renter_notified_at
    ) {
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

    if (
      (status === "pending_checkin" || status === "upcoming") &&
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
      await admin.from("notifications").insert({
        id: crypto.randomUUID(),
        recipient_id: rental.owner_id,
        actor_id: rental.renter_id,
        type: "general",
        title: "Mark no-show to free your calendar",
        body: "The renter has not checked in 2 hours after scheduled pickup. Mark no-show in Rentals now. If you take no action, we auto-cancel and free the calendar after 24 hours from pickup.",
      });
      suggested += 1;
      continue;
    }

    if (
      status === "no_show" &&
      elapsed >= NO_SHOW_AUTO_CANCEL_MS &&
      rental.no_show_automation_at &&
      !rental.no_show_marked_at &&
      !rental.picked_up_at &&
      !rental.host_handed_over_at &&
      !rental.renter_received_at
    ) {
      const nowIso = new Date().toISOString();
      await admin
        .from("rentals")
        .update({
          status: "cancelled",
          no_show_marked_at: nowIso,
        })
        .eq("id", rental.id);
      await admin.from("notifications").insert({
        id: crypto.randomUUID(),
        recipient_id: rental.owner_id,
        actor_id: null,
        type: "general",
        title: "No-show auto-cancelled — calendar freed",
        body: "Renter never checked in. Booking cancelled 24h after pickup; calendar is free.",
      });
      await admin.from("notifications").insert({
        id: crypto.randomUUID(),
        recipient_id: rental.renter_id,
        actor_id: null,
        type: "general",
        title: "Booking cancelled — no-show",
        body: "This booking was cancelled because pickup never happened within 24 hours of the scheduled start.",
      });
      autoCancelled += 1;
    }
  }

  return new Response(JSON.stringify({ ok: true, reminded, suggested, autoCancelled }), {
    headers: { "Content-Type": "application/json" },
  });
});
