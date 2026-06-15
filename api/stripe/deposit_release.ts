import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { applyCors, handleOptions } from "../_lib/cors";
import { isStripeServerConfigured } from "../_lib/keys";
import { withApiErrorHandling } from "../_lib/safeHandler";
import { getAdminClient, getUserFromBearer } from "../passkey/_lib/supabaseAdmin";
import { fetchRentalForPayments } from "./_lib/rentalAccess";

type Body = { rentalId?: string };

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

  const isOwner = rental.owner_id === user.id;
  const isRenter = rental.renter_id === user.id;
  if (!isOwner && !isRenter) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  if (!rental.stripe_deposit_payment_intent_id) {
    res.status(400).json({ error: "No deposit hold on this rental" });
    return;
  }

  const secret = process.env.STRIPE_SECRET_KEY!;
  const stripe = new Stripe(secret, { apiVersion: "2025-01-27.acacia" as Stripe.LatestApiVersion });

  const intent = await stripe.paymentIntents.retrieve(rental.stripe_deposit_payment_intent_id);

  if (intent.status === "canceled") {
    await admin.from("rentals").update({ deposit_status: "released" }).eq("id", rentalId);
    res.status(200).json({ ok: true, status: "released" });
    return;
  }

  if (intent.status === "succeeded") {
    res.status(400).json({ error: "Deposit was already captured and cannot be released" });
    return;
  }

  const canceled = await stripe.paymentIntents.cancel(intent.id);

  await admin
    .from("rentals")
    .update({
      deposit_status: "released",
      stripe_deposit_payment_intent_id: canceled.id,
    })
    .eq("id", rentalId);

  res.status(200).json({ ok: true, status: canceled.status, depositStatus: "released" });
});
