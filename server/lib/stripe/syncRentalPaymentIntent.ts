import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function syncRentalPaymentFromIntent(
  admin: SupabaseClient,
  intent: Stripe.PaymentIntent,
): Promise<void> {
  const rentalId = intent.metadata?.rental_id;
  if (!rentalId) return;

  const paymentType = intent.metadata?.payment_type;

  if (paymentType === "deposit") {
    const patch: Record<string, unknown> = {
      stripe_deposit_payment_intent_id: intent.id,
      deposit_status: intent.status,
    };

    if (intent.status === "requires_capture") {
      patch.deposit_status = "held";
      const { data: rental } = await admin
        .from("rentals")
        .select("returned_at, end_date, deposit_claim_deadline_at")
        .eq("id", rentalId)
        .maybeSingle();

      if (rental && !rental.deposit_claim_deadline_at) {
        const base = rental.returned_at
          ? new Date(rental.returned_at)
          : new Date(`${rental.end_date}T23:59:59.999Z`);
        const deadline = new Date(base.getTime() + 48 * 60 * 60 * 1000);
        patch.deposit_claim_deadline_at = deadline.toISOString();
      }
    }

    if (intent.status === "canceled") {
      patch.deposit_status = "released";
    }

    if (intent.status === "succeeded" && intent.capture_method === "manual") {
      patch.deposit_status = "claimed";
    }

    await admin.from("rentals").update(patch).eq("id", rentalId);
    return;
  }

  await admin
    .from("rentals")
    .update({
      stripe_payment_intent_id: intent.id,
      stripe_payment_status: intent.status,
    })
    .eq("id", rentalId);
}
