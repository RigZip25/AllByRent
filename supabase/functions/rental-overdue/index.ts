/**
 * Supabase Edge Function: overdue automation
 * Schedule via Supabase cron (e.g. every 15 minutes).
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const MS_MIN = 60_000;

type ListingHandoff = {
  lateReturnFeeEnabled?: boolean;
  lateReturnGraceMinutes?: number;
  lateReturnFlatFeeUsd?: string;
  lateReturnPerHourFeeUsd?: string;
};

function parseUsdToCents(raw: string | undefined | null): number {
  if (!raw) return 0;
  const n = Number.parseFloat(String(raw).replace(/^\$/, "").trim());
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
    typeof handoff.lateReturnGraceMinutes === "number"
      ? Math.max(0, Math.round(handoff.lateReturnGraceMinutes))
      : 30;
  const flatCents = parseUsdToCents(handoff.lateReturnFlatFeeUsd ?? "20");
  const perHourCents = parseUsdToCents(handoff.lateReturnPerHourFeeUsd ?? "15");
  const graceEndsMs = dueMs + graceMinutes * MS_MIN;
  const pastGrace = nowMs > graceEndsMs;
  if (!pastGrace) return { pastGrace: false, feeCents: 0, summary: null };
  const billableMs = Math.max(0, nowMs - graceEndsMs);
  const billableHours = Math.max(1, Math.ceil(billableMs / (60 * MS_MIN)));
  const feeCents = flatCents + billableHours * perHourCents;
  const parts: string[] = [`${graceMinutes}m grace`];
  if (flatCents > 0) parts.push(`$${(flatCents / 100).toFixed(2)} flat`);
  if (perHourCents > 0) parts.push(`$${(perHourCents / 100).toFixed(2)}/hr`);
  return { pastGrace: true, feeCents, summary: parts.join(" · ") };
}

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
  let overdueNotices = 0;
  let recoveryNotices = 0;
  let safelyEscalations = 0;

  const { data: rows } = await admin
    .from("rentals")
    .select(
      "id, owner_id, renter_id, due_at, overdue_hour_notified_at, owner_recovery_notified_at, safely_escalated_at, safely_policy_id, listing_id, status",
    )
    .in("status", ["active", "overdue"])
    .not("due_at", "is", null);

  for (const rental of rows ?? []) {
    const dueMs = new Date(rental.due_at as string).getTime();
    if (Number.isNaN(dueMs) || now <= dueMs) continue;
    const overdueMs = now - dueMs;

    if (overdueMs >= MS_MIN && rental.status !== "overdue") {
      await admin.from("rentals").update({ status: "overdue" }).eq("id", rental.id);
    }

    if (overdueMs >= MS_MIN && !rental.overdue_hour_notified_at) {
      const { data: listingRow } = await admin
        .from("listings")
        .select("handoff")
        .eq("id", rental.listing_id as string)
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

      await admin.from("notifications").insert({
        id: crypto.randomUUID(),
        recipient_id: rental.renter_id,
        actor_id: rental.owner_id,
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
    JSON.stringify({ ok: true, overdueNotices, recoveryNotices, safelyEscalations }),
    { headers: { "Content-Type": "application/json" } },
  );
});
