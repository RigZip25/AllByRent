import type { SupabaseClient } from "@supabase/supabase-js";
import { insertNotification } from "./notifications";
import { issueRentalInvoice } from "./rentalInvoices";

/**
 * What a late return costs, and the invoice that says so.
 *
 * The overdue notice has always quoted a figure — "estimated late fee so far:
 * $35" — and nothing ever charged it. Either the number goes away or it turns
 * into a real invoice; this is the invoice. The amount is read from the host's
 * late-return policy on the listing, never from a device.
 */

const MS_MIN = 60_000;

export type ListingHandoff = {
  lateReturnFeeEnabled?: boolean;
  lateReturnGraceMinutes?: number;
  lateReturnFlatFeeUsd?: string;
  lateReturnPerHourFeeUsd?: string;
};

export type LateFeeAssessment = {
  pastGrace: boolean;
  feeCents: number;
  billableHours: number;
  /** Host-readable policy line, or null when the host charges nothing. */
  summary: string | null;
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

/** Flat fee once past grace, plus every started hour after it. */
export function assessLateFeeFromHandoff(
  handoff: ListingHandoff | null | undefined,
  dueMs: number,
  nowMs: number,
): LateFeeAssessment {
  if (!handoff?.lateReturnFeeEnabled) {
    return { pastGrace: nowMs > dueMs, feeCents: 0, billableHours: 0, summary: null };
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
    return { pastGrace: false, feeCents: 0, billableHours: 0, summary: null };
  }
  const billableMs = Math.max(0, nowMs - graceEndsMs);
  const billableHours = Math.max(1, Math.ceil(billableMs / (60 * MS_MIN)));
  const feeCents = flatCents + billableHours * perHourCents;
  const parts: string[] = [`${graceMinutes}m grace`];
  if (flatCents > 0) parts.push(`$${(flatCents / 100).toFixed(2)} flat`);
  if (perHourCents > 0) parts.push(`$${(perHourCents / 100).toFixed(2)}/hr`);
  return { pastGrace: true, feeCents, billableHours, summary: parts.join(" · ") };
}

export async function fetchListingHandoff(
  admin: SupabaseClient,
  listingId: string | null | undefined,
): Promise<ListingHandoff | null> {
  if (!listingId) return null;
  const { data } = await admin
    .from("listings")
    .select("handoff")
    .eq("id", listingId)
    .maybeSingle();
  if (!data?.handoff || typeof data.handoff !== "object") return null;
  return data.handoff as ListingHandoff;
}

export type LateFeeRental = {
  id: string;
  owner_id: string;
  renter_id: string;
  listing_id: string | null;
  due_at: string | null;
  end_date?: string | null;
  late_fee_applied_at?: string | null;
};

function resolveDueMs(rental: LateFeeRental): number | null {
  if (rental.due_at) {
    const ms = new Date(rental.due_at).getTime();
    if (!Number.isNaN(ms)) return ms;
  }
  if (rental.end_date) {
    const ms = new Date(`${rental.end_date}T23:59:59.000Z`).getTime();
    if (!Number.isNaN(ms)) return ms;
  }
  return null;
}

export type LateFeeInvoiceResult = {
  issued: boolean;
  feeCents: number;
  reason?: "no_due_date" | "within_grace" | "no_policy" | "already_invoiced";
};

/**
 * Raise the late fee the renter was warned about.
 *
 * Charged once: on the return that closes the rental, or — for an item still
 * out a day later — at the recovery mark, so a rental that never comes back
 * still carries the charge the host was promised. A host who ends up owed more
 * than the first invoice can raise a second one by hand.
 */
export async function issueLateFeeInvoice(
  admin: SupabaseClient,
  params: { rental: LateFeeRental; atMs?: number },
): Promise<LateFeeInvoiceResult> {
  const { rental } = params;
  if (rental.late_fee_applied_at) {
    return { issued: false, feeCents: 0, reason: "already_invoiced" };
  }

  const dueMs = resolveDueMs(rental);
  if (dueMs == null) return { issued: false, feeCents: 0, reason: "no_due_date" };

  const nowMs = params.atMs ?? Date.now();
  const handoff = await fetchListingHandoff(admin, rental.listing_id);
  const late = assessLateFeeFromHandoff(handoff, dueMs, nowMs);

  if (!handoff?.lateReturnFeeEnabled) {
    return { issued: false, feeCents: 0, reason: "no_policy" };
  }
  if (!late.pastGrace || late.feeCents < 50) {
    return { issued: false, feeCents: late.feeCents, reason: "within_grace" };
  }

  const hoursLabel = late.billableHours === 1 ? "1 hour" : `${late.billableHours} hours`;
  const issued = await issueRentalInvoice(admin, {
    rentalId: rental.id,
    createdByRole: "system",
    onlyIfNoOpenKind: "late_fee",
    lines: [
      {
        kind: "late_fee",
        label: `Late return — ${hoursLabel} past grace`,
        amountCents: late.feeCents,
      },
    ],
    note: late.summary ? `Late return policy: ${late.summary}` : undefined,
  });

  if (!issued.ok) {
    return { issued: false, feeCents: late.feeCents, reason: "already_invoiced" };
  }

  await admin
    .from("rentals")
    .update({
      late_fee_cents: late.feeCents,
      late_fee_applied_at: new Date(nowMs).toISOString(),
    })
    .eq("id", rental.id);

  const amount = `$${(late.feeCents / 100).toFixed(2)}`;
  await insertNotification(admin, {
    recipientId: rental.renter_id,
    actorId: rental.owner_id,
    type: "general",
    title: `Late return fee — ${amount}`,
    body: `The return was ${hoursLabel} past the grace period, so the host's late-return fee of ${amount} has been invoiced. Open the rental to pay it, or message the host if you think it is wrong.`,
  });
  await insertNotification(admin, {
    recipientId: rental.owner_id,
    actorId: rental.renter_id,
    type: "general",
    title: `Late return fee invoiced — ${amount}`,
    body: `The rental came back ${hoursLabel} past the grace period. Your late-return policy has been invoiced to the renter for ${amount}. Void it from the rental if you would rather let it go.`,
  });

  return { issued: true, feeCents: late.feeCents };
}
