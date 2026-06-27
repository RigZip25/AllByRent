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
  return "Supabase is required. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY on Vercel.";
}

export function getStripeRequiredMessage(): string {
  return "Stripe is required. Set VITE_STRIPE_PUBLISHABLE_KEY and STRIPE_SECRET_KEY on Vercel.";
}

export function getSignInRequiredMessage(): string {
  return "Sign in to continue.";
}
