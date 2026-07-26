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
  return "Card checkout is not configured yet. Your request will be sent to the host — payment can be arranged after approval.";
}

export function getSupabaseRequiredMessage(): string {
  return "This app needs a live connection to start. Please try again shortly or contact support.";
}

export function getStripeRequiredMessage(): string {
  return "Card payments are temporarily unavailable. You can still send a request to the host.";
}

export function getSignInRequiredMessage(): string {
  return "Sign in to continue.";
}
