import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { applyCors, handleOptions } from "../../lib/cors";
import { isStripeServerConfigured } from "../../lib/keys";
import { withApiErrorHandling } from "../../lib/safeHandler";
import { getAdminClient, getUserFromBearer } from "../../lib/passkey/supabaseAdmin";
import { getOrCreateStripeCustomer } from "../../lib/stripe/customer";
import {
  destinationChargeFields,
  platformFeeFromGrossTotal,
  requireHostPayoutAccount,
  resolveHostStripeCurrency,
} from "../../lib/stripe/connectPayout";
import { readInvoices } from "../../lib/rentalInvoices";

/**
 * The renter pays an invoice the host raised (Connect destination charge:
 * the host receives it minus the platform fee, as with the rental itself).
 *
 * The invoice must already exist on the rental — `/api/rentals/invoice` puts it
 * there — and the amount must match what it says. Otherwise the person being
 * charged would be naming the charge.
 */

type LineBody = {
  kind?: string;
  label?: string;
  amountCents?: number;
};

type Body = {
  rentalId?: string;
  invoiceId?: string;
  amountCents?: number;
  note?: string;
  lines?: LineBody[];
};

const PLATFORM_FEE_RATE = 0.12;

export default withApiErrorHandling(async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  applyCors(res, typeof req.headers.origin === "string" ? req.headers.origin : undefined);

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!isStripeServerConfigured()) {
    res.status(200).json({ ok: false, reason: "Stripe not configured" });
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
  const invoiceId = typeof body.invoiceId === "string" ? body.invoiceId.trim() : "";
  const amountCents = typeof body.amountCents === "number" ? Math.round(body.amountCents) : 0;
  const note = typeof body.note === "string" ? body.note.trim().slice(0, 500) : "";

  if (!rentalId || !invoiceId || amountCents < 50) {
    res.status(400).json({
      error: "rentalId, invoiceId, and amountCents (≥50) are required",
    });
    return;
  }

  const { data: rental, error: rentalError } = await admin
    .from("rentals")
    .select("id, renter_id, owner_id, listing_id, status, rental_invoices")
    .eq("id", rentalId)
    .maybeSingle();

  if (rentalError || !rental) {
    res.status(404).json({ error: "Rental not found" });
    return;
  }

  // Renter pays; host (owner) must have Connect payouts.
  if (rental.renter_id !== user.id) {
    res.status(403).json({ error: "Only the renter can pay this invoice" });
    return;
  }

  // The host wrote the invoice; the renter must not be able to restate its total.
  const invoice = readInvoices(rental.rental_invoices).find((entry) => entry.id === invoiceId);
  if (!invoice) {
    res.status(404).json({ error: "Invoice not found on this rental" });
    return;
  }
  if (invoice.status !== "open" && invoice.status !== "payment_pending") {
    res.status(409).json({ error: `Invoice is ${invoice.status}` });
    return;
  }
  if (amountCents !== invoice.totalCents) {
    res.status(409).json({
      error: "Amount does not match the invoice total",
      expectedCents: invoice.totalCents,
    });
    return;
  }

  const hostPayout = await requireHostPayoutAccount(admin, rental.owner_id);
  if (hostPayout.ok === false) {
    res.status(400).json({ ok: false, error: hostPayout.error });
    return;
  }

  const secret = process.env.STRIPE_SECRET_KEY!;
  const stripe = new Stripe(secret, { apiVersion: "2025-01-27.acacia" as Stripe.LatestApiVersion });

  const customerId = await getOrCreateStripeCustomer(stripe, admin, user.id, user.email);
  const applicationFeeCents = platformFeeFromGrossTotal(amountCents, PLATFORM_FEE_RATE);
  const destination = destinationChargeFields(hostPayout.account.accountId, applicationFeeCents);
  const currency = await resolveHostStripeCurrency(admin, rental.owner_id);

  const lineSummary = Array.isArray(body.lines)
    ? body.lines
        .slice(0, 12)
        .map((l) => `${(l.kind || "item").slice(0, 24)}:${Math.round(Number(l.amountCents) || 0)}`)
        .join("|")
        .slice(0, 450)
    : "";

  const metadata: Record<string, string> = {
    rental_id: rentalId,
    listing_id: rental.listing_id ?? "",
    owner_id: rental.owner_id,
    renter_id: user.id,
    invoice_id: invoiceId,
    payment_type: "rental_invoice",
    platform_fee_cents: String(applicationFeeCents),
  };
  if (note) metadata.invoice_note = note.slice(0, 450);
  if (lineSummary) metadata.invoice_lines = lineSummary;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency,
    customer: customerId,
    capture_method: "automatic",
    automatic_payment_methods: { enabled: true },
    metadata,
    description: `Rental invoice ${invoiceId.slice(0, 12)}`,
    ...destination,
  });

  if (!paymentIntent.client_secret) {
    res.status(500).json({ error: "PaymentIntent missing client secret" });
    return;
  }

  // The invoice is the host's; paying it only moves it to awaiting-payment so
  // the webhook has something to mark paid. Its lines and total stay as issued.
  const now = new Date().toISOString();
  const nextInvoices = readInvoices(rental.rental_invoices).map((inv) =>
    inv.id === invoiceId
      ? {
          ...inv,
          status: "payment_pending" as const,
          stripePaymentIntentId: paymentIntent.id,
          updatedAt: now,
        }
      : inv,
  );
  await admin.from("rentals").update({ rental_invoices: nextInvoices }).eq("id", rentalId);

  res.status(200).json({
    ok: true,
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    status: paymentIntent.status,
    invoiceId,
    amountCents,
  });
});
