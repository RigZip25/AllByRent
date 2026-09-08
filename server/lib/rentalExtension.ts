import type { SupabaseClient } from "@supabase/supabase-js";
import { insertNotification } from "./notifications";
import { readInvoices, type StoredInvoice } from "./rentalInvoices";

/**
 * Extra days on a running rental.
 *
 * The renter used to move the end date themselves — free days, taken off a
 * calendar the host was still selling. Now the extra days are priced here from
 * the host's own daily rate, invoiced, and the end date moves when that invoice
 * is paid (`applyPaidExtension`, called from the Stripe webhook).
 */

/** Days that still occupy the calendar; matches `rentals_reject_overlap`. */
const BUSY_STATUSES = [
  "pending_approval",
  "pending_checkin",
  "active",
  "upcoming",
  "overdue",
  "disputed",
  "no_show",
];

/** Statuses a renter may extend from. */
const EXTENDABLE = new Set(["pending_checkin", "upcoming", "active", "overdue"]);

/** Same rate the rest of the platform charges on a gross total. */
const PLATFORM_FEE_RATE = 0.12;

/** Beyond this an extension is a new booking, not a longer one. */
const MAX_EXTRA_DAYS = 90;

const DAY_MS = 86_400_000;

export function isExtendableStatus(status: string | null | undefined): boolean {
  return EXTENDABLE.has(String(status ?? ""));
}

function parseIsoDate(iso: string | null | undefined): number | null {
  if (typeof iso !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return null;
  const ms = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(ms) ? null : ms;
}

function isoFromMs(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

function daysInclusive(startIso: string, endIso: string): number {
  const start = parseIsoDate(startIso);
  const end = parseIsoDate(endIso);
  if (start == null || end == null) return 0;
  return Math.floor((end - start) / DAY_MS) + 1;
}

function parseUsdToCents(raw: unknown): number {
  if (typeof raw === "number") {
    return Number.isFinite(raw) && raw > 0 ? Math.round(raw * 100) : 0;
  }
  if (typeof raw !== "string") return 0;
  const n = Number.parseFloat(raw.replace(/^\$/, "").trim());
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) : 0;
}

export type ExtensionRental = {
  id: string;
  listing_id: string | null;
  owner_id: string;
  renter_id: string;
  status: string;
  start_date: string;
  end_date: string;
  rental_total_cents: number | null;
  rental_invoices?: unknown;
};

export type ExtensionQuote = {
  newEndDate: string;
  extraDays: number;
  dailyRateCents: number;
  subtotalCents: number;
  serviceFeeCents: number;
  totalCents: number;
  /** True when the rate came from the rental itself, fees already inside it. */
  rateFromBooking: boolean;
};

export type QuoteFailure =
  | "invalid_date"
  | "not_later"
  | "too_far"
  | "no_rate"
  | "not_extendable"
  | "busy";

/**
 * What the extra days cost.
 *
 * The host's daily rate, plus the platform fee on top, exactly as the original
 * booking was priced. A listing with no usable rate falls back to what this
 * rental itself worked out to per day — fee included, so none is added again.
 */
export function quoteExtension(params: {
  rental: Pick<ExtensionRental, "start_date" | "end_date" | "rental_total_cents">;
  pricing: unknown;
  newEndDate: string;
}): { ok: true; quote: ExtensionQuote } | { ok: false; reason: QuoteFailure } {
  const currentEnd = parseIsoDate(params.rental.end_date);
  const newEnd = parseIsoDate(params.newEndDate);
  if (currentEnd == null || newEnd == null) return { ok: false, reason: "invalid_date" };
  if (newEnd <= currentEnd) return { ok: false, reason: "not_later" };

  const extraDays = Math.round((newEnd - currentEnd) / DAY_MS);
  if (extraDays > MAX_EXTRA_DAYS) return { ok: false, reason: "too_far" };

  const pricing =
    params.pricing && typeof params.pricing === "object"
      ? (params.pricing as Record<string, unknown>)
      : {};
  const listingRateCents = parseUsdToCents(pricing.dailyRate);

  if (listingRateCents > 0) {
    const subtotalCents = listingRateCents * extraDays;
    const serviceFeeCents = Math.round(subtotalCents * PLATFORM_FEE_RATE);
    return {
      ok: true,
      quote: {
        newEndDate: isoFromMs(newEnd),
        extraDays,
        dailyRateCents: listingRateCents,
        subtotalCents,
        serviceFeeCents,
        totalCents: subtotalCents + serviceFeeCents,
        rateFromBooking: false,
      },
    };
  }

  const bookedDays = daysInclusive(params.rental.start_date, params.rental.end_date);
  const bookedTotal = Math.max(0, Math.round(params.rental.rental_total_cents ?? 0));
  if (bookedDays <= 0 || bookedTotal <= 0) return { ok: false, reason: "no_rate" };

  const perDay = Math.round(bookedTotal / bookedDays);
  if (perDay < 50) return { ok: false, reason: "no_rate" };

  return {
    ok: true,
    quote: {
      newEndDate: isoFromMs(newEnd),
      extraDays,
      dailyRateCents: perDay,
      subtotalCents: perDay * extraDays,
      serviceFeeCents: 0,
      totalCents: perDay * extraDays,
      rateFromBooking: true,
    },
  };
}

/** Whether anything else already holds the days being added. */
export async function extensionDaysAreFree(
  admin: SupabaseClient,
  params: { rental: ExtensionRental; newEndDate: string },
): Promise<boolean> {
  const currentEnd = parseIsoDate(params.rental.end_date);
  const newEnd = parseIsoDate(params.newEndDate);
  if (currentEnd == null || newEnd == null || newEnd <= currentEnd) return false;

  const firstExtraDay = isoFromMs(currentEnd + DAY_MS);
  const lastExtraDay = isoFromMs(newEnd);

  const { data: overlapping } = await admin
    .from("rentals")
    .select("id")
    .eq("listing_id", params.rental.listing_id ?? "")
    .neq("id", params.rental.id)
    .in("status", BUSY_STATUSES)
    .lte("start_date", lastExtraDay)
    .gte("end_date", firstExtraDay)
    .limit(1);

  if (overlapping && overlapping.length > 0) return false;

  const { data: listing } = await admin
    .from("listings")
    .select("availability")
    .eq("id", params.rental.listing_id ?? "")
    .maybeSingle();

  const blockedRaw =
    listing?.availability && typeof listing.availability === "object"
      ? (listing.availability as Record<string, unknown>).blocked_dates
      : null;
  if (!Array.isArray(blockedRaw)) return true;

  for (const entry of blockedRaw) {
    if (!entry || typeof entry !== "object") continue;
    const row = entry as Record<string, unknown>;
    const start = typeof row.start === "string" ? row.start.slice(0, 10) : null;
    const end = typeof row.end === "string" ? row.end.slice(0, 10) : null;
    if (!start || !end || end < start) continue;
    if (start <= lastExtraDay && end >= firstExtraDay) return false;
  }

  return true;
}

/** The open extension invoice on a rental, if the renter left one unpaid. */
export function findOpenExtensionInvoice(raw: unknown): StoredInvoice | undefined {
  return readInvoices(raw).find(
    (invoice) =>
      Boolean(invoice.extension) &&
      (invoice.status === "open" || invoice.status === "payment_pending"),
  );
}

/**
 * Move the end date the renter has now paid for.
 *
 * Called from the webhook, after the invoice is marked paid. The overlap
 * trigger has the last word: if the days went to someone else between the
 * payment starting and landing, the move fails and both sides are told, since
 * the money has already moved and the host has to settle it.
 */
export async function applyPaidExtension(
  admin: SupabaseClient,
  params: { rentalId: string; invoice: Pick<StoredInvoice, "extension" | "totalCents"> },
): Promise<{ applied: boolean }> {
  const extension = params.invoice.extension;
  if (!extension?.newEndDate) return { applied: false };

  const { data: rental } = await admin
    .from("rentals")
    .select("id, owner_id, renter_id, status, end_date, due_at")
    .eq("id", params.rentalId)
    .maybeSingle();
  if (!rental) return { applied: false };

  if (String(rental.end_date ?? "") >= extension.newEndDate) {
    return { applied: false };
  }

  const patch: Record<string, string> = {
    end_date: extension.newEndDate,
    due_at: new Date(`${extension.newEndDate}T23:59:59.000Z`).toISOString(),
  };
  // Paying for the days that were missing puts an overdue rental back in good
  // standing.
  if (rental.status === "overdue") patch.status = "active";

  const { error } = await admin.from("rentals").update(patch).eq("id", params.rentalId);

  const amount = `$${(Math.max(0, params.invoice.totalCents) / 100).toFixed(2)}`;
  const dayWord = extension.extraDays === 1 ? "day" : "days";

  if (error) {
    await insertNotification(admin, {
      recipientId: rental.renter_id,
      actorId: rental.owner_id,
      type: "general",
      title: "Extension could not be applied",
      body: `Your ${amount} payment for ${extension.extraDays} extra ${dayWord} went through, but those days are no longer free. Message the host to arrange a refund.`,
    });
    await insertNotification(admin, {
      recipientId: rental.owner_id,
      actorId: rental.renter_id,
      type: "general",
      title: "Extension payment needs refunding",
      body: `The renter paid ${amount} for ${extension.extraDays} extra ${dayWord}, but the dates are taken and the rental was not extended. Refund the invoice from the rental.`,
    });
    return { applied: false };
  }

  await insertNotification(admin, {
    recipientId: rental.owner_id,
    actorId: rental.renter_id,
    type: "general",
    title: `Rental extended to ${extension.newEndDate}`,
    body: `The renter paid ${amount} for ${extension.extraDays} extra ${dayWord}. The return is now due ${extension.newEndDate} and your calendar is blocked to match.`,
  });
  await insertNotification(admin, {
    recipientId: rental.renter_id,
    actorId: rental.owner_id,
    type: "general",
    title: `Extension confirmed — return ${extension.newEndDate}`,
    body: `Your ${amount} payment for ${extension.extraDays} extra ${dayWord} went through. The return is now due ${extension.newEndDate}.`,
  });

  return { applied: true };
}
