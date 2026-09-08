import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors, handleOptions } from "../../lib/cors";
import { withApiErrorHandling } from "../../lib/safeHandler";
import { getAdminClient, getUserFromBearer } from "../../lib/passkey/supabaseAdmin";
import {
  issueRentalInvoice,
  voidRentalInvoice,
  type InvoiceLineInput,
} from "../../lib/rentalInvoices";

/**
 * The host raises or cancels a charge on a rental.
 *
 * The panel used to write `rentals.rental_invoices` straight from the device.
 * Migration 053 closed that column — a renter could otherwise mark an invoice
 * paid, and a host could raise one against a rental they had no part in — so
 * the write happens here, after checking who is asking.
 */

type Body = {
  rentalId?: string;
  action?: "issue" | "void";
  invoiceId?: string;
  lines?: InvoiceLineInput[];
  note?: string;
};

/** Statuses where there is still something to charge for. */
const CHARGEABLE = new Set(["active", "overdue", "completed", "disputed", "no_show"]);

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
  const action = body.action === "void" ? "void" : "issue";

  if (!rentalId) {
    res.status(400).json({ error: "rentalId is required" });
    return;
  }

  const { data: rental } = await admin
    .from("rentals")
    .select("id, owner_id, renter_id, status")
    .eq("id", rentalId)
    .maybeSingle();

  if (!rental) {
    res.status(404).json({ error: "Rental not found" });
    return;
  }

  // Only the host charges, and only on their own rental.
  if (rental.owner_id !== user.id) {
    res.status(403).json({ error: "Only the host can invoice this rental" });
    return;
  }

  if (action === "void") {
    const invoiceId = typeof body.invoiceId === "string" ? body.invoiceId.trim() : "";
    if (!invoiceId) {
      res.status(400).json({ error: "invoiceId is required" });
      return;
    }
    const result = await voidRentalInvoice(admin, { rentalId, invoiceId });
    if (!result.ok) {
      res.status(409).json({ error: result.error });
      return;
    }
    res.status(200).json({ ok: true, invoices: result.invoices });
    return;
  }

  if (!CHARGEABLE.has(String(rental.status))) {
    res.status(409).json({ error: `Cannot invoice a rental that is ${rental.status}` });
    return;
  }

  const result = await issueRentalInvoice(admin, {
    rentalId,
    lines: Array.isArray(body.lines) ? body.lines : [],
    note: typeof body.note === "string" ? body.note : undefined,
  });

  if (!result.ok) {
    res.status(400).json({ error: result.error });
    return;
  }

  res.status(200).json({ ok: true, invoice: result.invoice, invoices: result.invoices });
});
