import type { SupabaseClient } from "@supabase/supabase-js";

export type RentalPaymentRow = {
  id: string;
  owner_id: string;
  renter_id: string;
  listing_id: string;
  status: string;
  deposit_amount_cents: number;
  deposit_status: string | null;
  stripe_payment_status: string | null;
  stripe_payment_intent_id: string | null;
  stripe_deposit_payment_intent_id: string | null;
  rental_total_cents: number | null;
  returned_at: string | null;
  deposit_claim_deadline_at: string | null;
  end_date: string;
  timezone?: string | null;
};

const RENTAL_PAYMENT_COLUMNS =
  "id, owner_id, renter_id, listing_id, status, deposit_amount_cents, deposit_status, stripe_payment_status, stripe_payment_intent_id, stripe_deposit_payment_intent_id, rental_total_cents, returned_at, deposit_claim_deadline_at, end_date";

export async function fetchRentalForPayments(
  admin: SupabaseClient,
  rentalId: string,
): Promise<RentalPaymentRow | null> {
  const { data, error } = await admin
    .from("rentals")
    .select(`${RENTAL_PAYMENT_COLUMNS}, timezone`)
    .eq("id", rentalId)
    .maybeSingle();

  if (!error && data) return data as RentalPaymentRow;

  // Deployments that have not run migration 049 yet have no timezone column.
  const retry = await admin
    .from("rentals")
    .select(RENTAL_PAYMENT_COLUMNS)
    .eq("id", rentalId)
    .maybeSingle();
  if (retry.error || !retry.data) return null;
  return retry.data as RentalPaymentRow;
}
