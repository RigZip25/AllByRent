import { getMessages } from "../i18n";
import { isSupabaseConfigured } from "../supabaseClient";
import { isStripePaymentsEnabled } from "../stripeConfig";

export function isProductionBackendReady(): boolean {
  return isSupabaseConfigured();
}

export function isPaymentsReady(): boolean {
  return isSupabaseConfigured() && isStripePaymentsEnabled();
}

/** Booking request without card (Supabase + auth, Stripe optional). */
export function canSubmitBookingRequest(
  userId: string | null | undefined,
  hostId: string | undefined,
): boolean {
  return Boolean(userId?.trim() && hostId?.trim());
}

export function getBookingWithoutPaymentMessage(): string {
  return getMessages().paymentsUi.bookingWithoutPayment;
}

export function getSupabaseRequiredMessage(): string {
  return getMessages().paymentsUi.supabaseRequired;
}

export function getStripeRequiredMessage(): string {
  return getMessages().paymentsUi.stripeRequired;
}

/** Buy-now / garage cart — not rental booking copy. */
export function getGarageStripeRequiredMessage(): string {
  return getMessages().paymentsUi.garageStripeRequired;
}

export function getSignInRequiredMessage(): string {
  return getMessages().paymentsUi.signInRequired;
}

/** Auction winner pay — guest checkout not supported for bids. */
export function getAuctionSignInRequiredMessage(): string {
  return getMessages().paymentsUi.auctionSignInRequired;
}
