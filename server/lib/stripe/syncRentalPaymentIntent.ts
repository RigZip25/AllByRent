import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";

type StoredInvoice = {
  id?: string;
  status?: string;
  stripePaymentIntentId?: string;
  paidAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
};

/**
 * Mark a host-issued invoice paid (or payment_pending) inside rentals.rental_invoices.
 * Invoices are primarily client-authored; webhook is the durable paid sync.
 */
async function syncRentalInvoiceFromIntent(
  admin: SupabaseClient,
  intent: Stripe.PaymentIntent,
  rentalId: string,
): Promise<void> {
  const invoiceId = intent.metadata?.invoice_id?.trim();
  if (!invoiceId) return;

  const { data: rental } = await admin
    .from("rentals")
    .select("rental_invoices")
    .eq("id", rentalId)
    .maybeSingle();

  const raw = rental?.rental_invoices;
  const list: StoredInvoice[] = Array.isArray(raw) ? (raw as StoredInvoice[]) : [];
  const now = new Date().toISOString();

  let found = false;
  const next = list.map((inv) => {
    if (inv?.id !== invoiceId) return inv;
    found = true;
    if (intent.status === "succeeded") {
      return {
        ...inv,
        status: "paid",
        stripePaymentIntentId: intent.id,
        paidAt: typeof inv.paidAt === "string" && inv.paidAt ? inv.paidAt : now,
        updatedAt: now,
      };
    }
    if (intent.status === "canceled") {
      return {
        ...inv,
        status: inv.status === "paid" ? inv.status : "open",
        stripePaymentIntentId: intent.id,
        updatedAt: now,
      };
    }
    return {
      ...inv,
      status: inv.status === "paid" ? inv.status : "payment_pending",
      stripePaymentIntentId: intent.id,
      updatedAt: now,
    };
  });

  if (!found && intent.status === "succeeded") {
    next.push({
      id: invoiceId,
      rentalId,
      status: "paid",
      stripePaymentIntentId: intent.id,
      paidAt: now,
      updatedAt: now,
      createdAt: now,
      lines: [],
      totalCents: intent.amount_received || intent.amount || 0,
      note: intent.metadata?.invoice_note ?? undefined,
    });
  }

  await admin.from("rentals").update({ rental_invoices: next }).eq("id", rentalId);
}

export async function syncRentalPaymentFromIntent(
  admin: SupabaseClient,
  intent: Stripe.PaymentIntent,
): Promise<void> {
  const rentalId = intent.metadata?.rental_id;
  if (!rentalId) return;

  const paymentType = intent.metadata?.payment_type;

  if (paymentType === "rental_invoice") {
    await syncRentalInvoiceFromIntent(admin, intent, rentalId);
    return;
  }

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
