import type { SupabaseClient } from "@supabase/supabase-js";

export type RentalPaymentRow = {
  id: string;
  owner_id: string;
  renter_id: string;
  listing_id: string;
  deposit_amount_cents: number;
  deposit_status: string | null;
  stripe_payment_status: string | null;
  stripe_deposit_payment_intent_id: string | null;
  returned_at: string | null;
  deposit_claim_deadline_at: string | null;
  end_date: string;
};

export async function fetchRentalForPayments(
  admin: SupabaseClient,
  rentalId: string,
): Promise<RentalPaymentRow | null> {
  const { data, error } = await admin
    .from("rentals")
    .select(
      "id, owner_id, renter_id, listing_id, deposit_amount_cents, deposit_status, stripe_payment_status, stripe_deposit_payment_intent_id, returned_at, deposit_claim_deadline_at, end_date",
    )
    .eq("id", rentalId)
    .maybeSingle();

  if (error || !data) return null;
  return data as RentalPaymentRow;
}
