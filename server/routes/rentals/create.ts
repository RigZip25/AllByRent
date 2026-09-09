import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors, handleOptions } from "../../lib/cors";
import { withApiErrorHandling } from "../../lib/safeHandler";
import { getAdminClient, getUserFromBearer } from "../../lib/passkey/supabaseAdmin";
import {
  quoteRentalFloorCents,
  resolvePayableRentalCents,
  type ListingPricing,
} from "../../lib/rentalQuote";

/**
 * Create a booking with a server-quoted total.
 *
 * The renter's device used to insert `rental_total_cents` itself. Migration 053
 * freezes that number after insert, so a $0.50 weekend stayed $0.50 forever.
 * This route loads the listing rate, quotes the floor, and only then inserts —
 * the same floor payment_intent already enforces at pay time (Q8).
 */

type Body = {
  id?: string;
  listingId?: string;
  ownerId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  bookingMode?: string | null;
  deliveryAddress?: string | null;
  pickupPin?: string | null;
  returnPin?: string | null;
  safelyPolicyId?: string | null;
  insuranceFeeCents?: number;
  depositAmountCents?: number;
  /** Client claim; raised to the listing floor when too low. */
  claimedTotalCents?: number;
  pickupAt?: string | null;
  dueAt?: string | null;
  stripePaymentStatus?: string | null;
  insuranceProofPath?: string | null;
  insuranceProofUrl?: string | null;
  insuranceActiveUntil?: string | null;
  insurancePolicyNote?: string | null;
  rentalAgreement?: unknown;
  renterAttestations?: unknown;
};

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asOptionalString(value: unknown): string | null {
  if (value == null) return null;
  const s = asString(value);
  return s || null;
}

function asCents(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return Math.max(0, Math.round(value));
  return 0;
}

export default withApiErrorHandling(async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  applyCors(res, typeof req.headers.origin === "string" ? req.headers.origin : undefined);

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const user = await getUserFromBearer(req.headers.authorization);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const admin = getAdminClient();
  if (!admin) {
    res.status(503).json({ error: "Database not configured" });
    return;
  }

  const body = (req.body ?? {}) as Body;
  const id = asString(body.id);
  const listingId = asString(body.listingId);
  const ownerId = asString(body.ownerId);
  const status = asString(body.status) || "pending_approval";
  const startDate = asString(body.startDate);
  const endDate = asString(body.endDate);

  if (!id || !listingId || !ownerId || !startDate || !endDate) {
    res.status(400).json({ error: "id, listingId, ownerId, startDate, and endDate are required" });
    return;
  }

  const { data: listing, error: listingError } = await admin
    .from("listings")
    .select("id, owner_id, pricing")
    .eq("id", listingId)
    .maybeSingle();

  if (listingError || !listing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }

  if (listing.owner_id !== ownerId) {
    res.status(400).json({ error: "Listing owner mismatch" });
    return;
  }

  // Only the renter creates a booking for themselves.
  if (ownerId === user.id) {
    res.status(403).json({ error: "Hosts cannot book their own listing this way" });
    return;
  }

  const floor = quoteRentalFloorCents({
    pricing: (listing.pricing as ListingPricing | null) ?? null,
    startDate,
    endDate,
  });
  if (!floor.ok) {
    res.status(400).json({
      error:
        floor.reason === "no_rate"
          ? "Listing has no payable rate for these dates"
          : "Dates are not payable",
    });
    return;
  }

  const rentalTotalCents = resolvePayableRentalCents({
    bookedTotalCents: asCents(body.claimedTotalCents),
    floorCents: floor.floorCents,
  });

  const row: Record<string, unknown> = {
    id,
    listing_id: listingId,
    owner_id: ownerId,
    renter_id: user.id,
    status,
    start_date: startDate,
    end_date: endDate,
    pickup_pin: asOptionalString(body.pickupPin),
    return_pin: asOptionalString(body.returnPin),
    booking_mode: asOptionalString(body.bookingMode),
    delivery_address: asOptionalString(body.deliveryAddress),
    safely_policy_id: asOptionalString(body.safelyPolicyId),
    insurance_fee_cents: asCents(body.insuranceFeeCents),
    deposit_amount_cents: asCents(body.depositAmountCents),
    rental_total_cents: rentalTotalCents,
    pickup_at: asOptionalString(body.pickupAt),
    due_at: asOptionalString(body.dueAt),
    insurance_proof_path: asOptionalString(body.insuranceProofPath),
    // Signed URLs expire; keep the path and mint a fresh link when needed.
    insurance_proof_url: null,
    insurance_active_until: asOptionalString(body.insuranceActiveUntil),
    insurance_policy_note: asOptionalString(body.insurancePolicyNote),
  };

  if (body.rentalAgreement != null) row.rental_agreement = body.rentalAgreement;
  if (body.renterAttestations != null) row.renter_attestations = body.renterAttestations;
  // Stripe status is cleared by settlement guard on insert for non-trusted writers;
  // service role keeps an explicit "needs payment" hint when the client asked for checkout.
  if (body.stripePaymentStatus) {
    row.stripe_payment_status = asOptionalString(body.stripePaymentStatus);
  }

  const insert = await admin.from("rentals").insert(row);
  if (insert.error) {
    const msg = insert.error.message?.toLowerCase() ?? "";
    if (msg.includes("overlap") || msg.includes("blocked availability")) {
      res.status(409).json({ error: "Selected dates overlap an existing booking or blocked availability" });
      return;
    }
    // Older schemas may lack jsonb columns — retry without them.
    if (
      (row.rental_agreement != null || row.renter_attestations != null) &&
      (msg.includes("rental_agreement") ||
        msg.includes("renter_attestations") ||
        msg.includes("schema cache"))
    ) {
      const {
        rental_agreement: _omitAgreement,
        renter_attestations: _omitAttestations,
        ...withoutJsonb
      } = row;
      const retry = await admin.from("rentals").insert(withoutJsonb);
      if (retry.error) {
        const retryMsg = retry.error.message?.toLowerCase() ?? "";
        if (retryMsg.includes("overlap") || retryMsg.includes("blocked availability")) {
          res.status(409).json({ error: "Selected dates overlap an existing booking or blocked availability" });
          return;
        }
        res.status(400).json({ error: retry.error.message });
        return;
      }
    } else {
      res.status(400).json({ error: insert.error.message });
      return;
    }
  }

  res.status(200).json({
    ok: true,
    rentalId: id,
    rentalTotalCents,
    floorCents: floor.floorCents,
    days: floor.days,
  });
});
