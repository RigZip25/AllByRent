import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";

export type HostPayoutAccount = {
  accountId: string;
  payoutsEnabled: boolean;
};

export async function fetchHostPayoutAccount(
  admin: SupabaseClient,
  hostId: string,
): Promise<HostPayoutAccount | null> {
  const { data, error } = await admin
    .from("profiles")
    .select("stripe_connect_account_id, stripe_payouts_enabled")
    .eq("id", hostId)
    .maybeSingle();

  if (error || !data) return null;
  const accountId =
    typeof data.stripe_connect_account_id === "string"
      ? data.stripe_connect_account_id.trim()
      : "";
  if (!accountId) return null;
  return {
    accountId,
    payoutsEnabled: Boolean(data.stripe_payouts_enabled),
  };
}

export const HOST_PAYOUTS_REQUIRED_MESSAGE =
  "This garage can’t receive card payments yet. The host must finish Stripe Connect payouts in Profile.";

/** Require a Connect account that can receive destination charges. */
export async function requireHostPayoutAccount(
  admin: SupabaseClient,
  hostId: string,
): Promise<{ ok: true; account: HostPayoutAccount } | { ok: false; error: string }> {
  const account = await fetchHostPayoutAccount(admin, hostId);
  if (!account?.payoutsEnabled) {
    return { ok: false, error: HOST_PAYOUTS_REQUIRED_MESSAGE };
  }
  return { ok: true, account };
}

/** Destination charge params so the host receives funds minus platform fee. */
export function destinationChargeFields(
  connectAccountId: string,
  applicationFeeCents: number,
): Pick<Stripe.PaymentIntentCreateParams, "application_fee_amount" | "transfer_data"> {
  const fee = Math.max(0, Math.round(applicationFeeCents));
  return {
    application_fee_amount: fee,
    transfer_data: { destination: connectAccountId },
  };
}

/** When total already includes platformFeeRate (e.g. 12% added on top of taxable). */
export function platformFeeFromGrossTotal(totalCents: number, feeRate: number): number {
  if (totalCents <= 0 || feeRate <= 0) return 0;
  return Math.max(0, Math.round(totalCents * (feeRate / (1 + feeRate))));
}
