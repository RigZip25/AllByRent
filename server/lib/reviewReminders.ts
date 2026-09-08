import type { SupabaseClient } from "@supabase/supabase-js";
import { insertNotification } from "./notifications";

const DAY_MS = 24 * 60 * 60 * 1000;

type RentalRow = {
  id: string;
  owner_id: string | null;
  renter_id: string | null;
  updated_at: string | null;
};

/**
 * Remind participants ~24h after a completed rental if they have not left a
 * review yet (Stage 18 / V7). Uses `updated_at` (no completed_at column).
 */
export async function runReviewReminders(admin: SupabaseClient): Promise<{
  scanned: number;
  reminded: number;
}> {
  const now = Date.now();
  const windowStart = new Date(now - 3 * DAY_MS).toISOString();
  const windowEnd = new Date(now - DAY_MS).toISOString();

  const { data: rentals, error } = await admin
    .from("rentals")
    .select("id, owner_id, renter_id, updated_at")
    .eq("status", "completed")
    .gte("updated_at", windowStart)
    .lte("updated_at", windowEnd)
    .limit(200);

  if (error || !rentals?.length) {
    return { scanned: 0, reminded: 0 };
  }

  let reminded = 0;
  for (const raw of rentals as RentalRow[]) {
    if (!raw.updated_at) continue;

    const { data: existingReviews } = await admin
      .from("reviews")
      .select("reviewer_id")
      .eq("rental_id", raw.id);

    const reviewed = new Set(
      (existingReviews ?? [])
        .map((row) => (row as { reviewer_id?: string }).reviewer_id)
        .filter(Boolean),
    );

    const candidates = [raw.owner_id, raw.renter_id].filter(
      (id): id is string => typeof id === "string" && id.length > 0 && !reviewed.has(id),
    );

    for (const recipientId of candidates) {
      const { data: prior } = await admin
        .from("notifications")
        .select("id")
        .eq("recipient_id", recipientId)
        .eq("type", "review_reminder")
        .ilike("body", `%${raw.id}%`)
        .limit(1);

      if (prior && prior.length > 0) continue;

      await insertNotification(admin, {
        recipientId,
        type: "review_reminder",
        title: "Leave a review",
        body: `Your rental ${raw.id} is complete — a short review helps neighbors. Blind until both sides submit, or after 14 days.`,
      });
      reminded += 1;
    }
  }

  return { scanned: rentals.length, reminded };
}
