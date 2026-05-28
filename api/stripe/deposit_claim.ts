import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { applyCors, handleOptions } from "../_lib/cors";
import { isStripeServerConfigured } from "../_lib/keys";
import { withApiErrorHandling } from "../_lib/safeHandler";
import { getAdminClient, getUserFromBearer } from "../passkey/_lib/supabaseAdmin";
import { fetchRentalForPayments } from "./_lib/rentalAccess";

type Body = { rentalId?: string };

const CLAIM_WINDOW_MS = 48 * 60 * 60 * 1000;

function claimDeadlinePassed(rental: {
  deposit_claim_deadline_at: string | null;
  returned_at: string | null;
  end_date: string;
}): boolean {
  if (rental.deposit_claim_deadline_at) {
    return Date.now() > new Date(rental.deposit_claim_deadline_at).getTime();
  }
  if (rental.returned_at) {
    return Date.now() > new Date(rental.returned_at).getTime() + CLAIM_WINDOW_MS;
  }
  const end = new Date(`${rental.end_date}T23:59:59.999Z`);
  return Date.now() > end.getTime() + CLAIM_WINDOW_MS;
}

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

  const rentalId = typeof (req.body as Body)?.rentalId === "string" ? req.body.rentalId.trim() : "";
  if (!rentalId) {
    res.status(400).json({ error: "rentalId is required" });
    return;
  }

  const rental = await fetchRentalForPayments(admin, rentalId);
  if (!rental) {
    res.status(404).json({ error: "Rental not found" });
    return;
  }

  if (rental.owner_id !== user.id) {
    res.status(403).json({ error: "Only the owner can claim the deposit" });
    return;
  }

  if (!rental.stripe_deposit_payment_intent_id) {
    res.status(400).json({ error: "No deposit hold on this rental" });
    return;
  }

  if (claimDeadlinePassed(rental)) {
    res.status(400).json({ error: "Deposit claim window (48h) has expired" });
    return;
  }

  const secret = process.env.STRIPE_SECRET_KEY!;
  const stripe = new Stripe(secret, { apiVersion: "2025-01-27.acacia" as Stripe.LatestApiVersion });

  const intent = await stripe.paymentIntents.retrieve(rental.stripe_deposit_payment_intent_id);

  if (intent.status === "succeeded") {
    res.status(200).json({ ok: true, status: "succeeded", depositStatus: "claimed" });
    return;
  }

  if (intent.status !== "requires_capture") {
    res.status(400).json({
      error: `Deposit cannot be captured (status: ${intent.status})`,
    });
    return;
  }

  const captured = await stripe.paymentIntents.capture(intent.id);

  await admin
    .from("rentals")
    .update({
      deposit_status: "claimed",
      stripe_deposit_payment_intent_id: captured.id,
    })
    .eq("id", rentalId);

  res.status(200).json({
    ok: true,
    status: captured.status,
    depositStatus: "claimed",
    amountCaptured: captured.amount_received,
  });
});
