import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors, handleOptions } from "../../lib/cors";
import { withApiErrorHandling } from "../../lib/safeHandler";
import { isStripeServerConfigured } from "../../lib/keys";
import { getAdminClient, getUserFromBearer } from "../../lib/passkey/supabaseAdmin";
import {
  applyPaidExtension,
  extensionDaysAreFree,
  findOpenExtensionInvoice,
  isExtendableStatus,
  quoteExtension,
  type ExtensionRental,
} from "../../lib/rentalExtension";
import { issueRentalInvoice, voidRentalInvoice } from "../../lib/rentalInvoices";

/**
 * The renter asks for extra days, and gets a bill for them.
 *
 * `quote` prices the days without committing to anything; `request` raises the
 * invoice that has to be paid before the end date moves. The price comes from
 * the host's listing, never from the request body, and the days are checked
 * against the calendar before the renter is asked for money.
 */

type Body = {
  rentalId?: string;
  newEndDate?: string;
  action?: "quote" | "request";
};

const REASON_MESSAGE: Record<string, string> = {
  invalid_date: "That is not a usable date",
  not_later: "Pick a date after the current end date",
  too_far: "Extensions run up to 90 extra days — book again for longer",
  no_rate: "This listing has no daily rate to charge extra days at",
  not_extendable: "This rental cannot be extended right now",
  busy: "Those days are already taken on the host's calendar",
};

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
  const rentalId = typeof body.rentalId === "string" ? body.rentalId.trim() : "";
  const newEndDate = typeof body.newEndDate === "string" ? body.newEndDate.trim() : "";
  const action = body.action === "request" ? "request" : "quote";

  if (!rentalId || !newEndDate) {
    res.status(400).json({ error: "rentalId and newEndDate are required" });
    return;
  }

  const { data: rentalRow } = await admin
    .from("rentals")
    .select(
      "id, listing_id, owner_id, renter_id, status, start_date, end_date, rental_total_cents, rental_invoices",
    )
    .eq("id", rentalId)
    .maybeSingle();

  if (!rentalRow) {
    res.status(404).json({ error: "Rental not found" });
    return;
  }

  const rental = rentalRow as ExtensionRental;

  // The renter pays for the extra days, so the renter asks for them.
  if (rental.renter_id !== user.id) {
    res.status(403).json({ error: "Only the renter can extend this rental" });
    return;
  }

  if (!isExtendableStatus(rental.status)) {
    res.status(409).json({ error: REASON_MESSAGE.not_extendable });
    return;
  }

  const { data: listing } = await admin
    .from("listings")
    .select("pricing")
    .eq("id", rental.listing_id ?? "")
    .maybeSingle();

  const quoted = quoteExtension({
    rental,
    pricing: listing?.pricing,
    newEndDate,
  });

  if (!quoted.ok) {
    res.status(400).json({ error: REASON_MESSAGE[quoted.reason] ?? "Extension unavailable" });
    return;
  }

  const free = await extensionDaysAreFree(admin, { rental, newEndDate: quoted.quote.newEndDate });
  if (!free) {
    res.status(409).json({ error: REASON_MESSAGE.busy });
    return;
  }

  if (action === "quote") {
    res.status(200).json({ ok: true, quote: quoted.quote });
    return;
  }

  // Nothing to pay with: the same scaffold the rest of the app runs in when
  // Stripe is not configured, where the extension simply takes effect.
  if (!isStripeServerConfigured()) {
    const applied = await applyPaidExtension(admin, {
      rentalId,
      invoice: { extension: quoted.quote, totalCents: 0 },
    });
    if (!applied.applied) {
      res.status(409).json({ error: REASON_MESSAGE.busy });
      return;
    }
    res.status(200).json({ ok: true, applied: true, quote: quoted.quote });
    return;
  }

  // One extension is pending at a time: asking for different days replaces the
  // bill for the old ones rather than stacking a second one beside it.
  const pending = findOpenExtensionInvoice(rental.rental_invoices);
  if (pending) {
    await voidRentalInvoice(admin, { rentalId, invoiceId: pending.id });
  }

  const dayWord = quoted.quote.extraDays === 1 ? "day" : "days";
  const issued = await issueRentalInvoice(admin, {
    rentalId,
    createdByRole: "system",
    extension: {
      newEndDate: quoted.quote.newEndDate,
      extraDays: quoted.quote.extraDays,
    },
    lines: [
      {
        kind: "extension",
        label: `${quoted.quote.extraDays} extra ${dayWord} — return ${quoted.quote.newEndDate}`,
        amountCents: quoted.quote.totalCents,
      },
    ],
    note: `Extension of this rental to ${quoted.quote.newEndDate}. The end date moves when this is paid.`,
  });

  if (!issued.ok) {
    res.status(400).json({ error: issued.error });
    return;
  }

  res.status(200).json({
    ok: true,
    applied: false,
    quote: quoted.quote,
    invoice: issued.invoice,
    invoices: issued.invoices,
  });
});
