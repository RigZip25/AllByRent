import { isStripePaymentsEnabled } from "../stripeConfig";
import { isSupabaseConfigured } from "../supabaseClient";

export type IntegrationId =
  | "supabase"
  | "stripe"
  | "anthropic"
  | "photoroom"
  | "push"
  | "garageCommerce"
  | "subscriptions";

export type IntegrationStatus = "ready" | "partial" | "missing";

export type IntegrationItem = {
  id: IntegrationId;
  label: string;
  status: IntegrationStatus;
  summary: string;
  envKeys: string[];
  nextStep: string;
};

function hasClientEnv(key: string): boolean {
  const value = (import.meta.env[key] as string | undefined)?.trim();
  return Boolean(value && value.length > 0);
}

/** Client-safe: push needs public VAPID key in the bundle. */
export function isPushConfigured(): boolean {
  return hasClientEnv("VITE_VAPID_PUBLIC_KEY");
}

/** Garage commerce uses Stripe PaymentIntents today; Supabase `garage_orders` is the next backend step. */
export function isGarageCommerceBackendReady(): boolean {
  return isSupabaseConfigured() && isStripePaymentsEnabled();
}

export function getIntegrationItems(): IntegrationItem[] {
  const supabase = isSupabaseConfigured();
  const stripe = isStripePaymentsEnabled();
  const photoroom = hasClientEnv("VITE_PHOTOROOM_API_KEY");
  const push = isPushConfigured();
  const garageCommerce = isGarageCommerceBackendReady();

  return [
    {
      id: "supabase",
      label: "Supabase",
      status: supabase ? "ready" : "missing",
      summary: supabase ? "Auth, profiles, listings sync enabled." : "Running in localStorage demo mode.",
      envKeys: ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"],
      nextStep: supabase
        ? "Run migrations for garage_orders, garage_bids, garage_follows."
        : "Create a Supabase project and add URL + anon key to Vercel.",
    },
    {
      id: "stripe",
      label: "Stripe",
      status: stripe ? "partial" : "missing",
      summary: stripe
        ? "Rentals + garage checkout UI wired. Connect payouts + webhooks need server secrets."
        : "Payments stay in demo mode until publishable key is set.",
      envKeys: [
        "VITE_STRIPE_PUBLISHABLE_KEY",
        "STRIPE_SECRET_KEY",
        "STRIPE_WEBHOOK_SECRET",
      ],
      nextStep: stripe
        ? "Add STRIPE_SECRET_KEY on Vercel and finish Connect account link + webhook handlers."
        : "Add VITE_STRIPE_PUBLISHABLE_KEY to enable Stripe Elements in checkout screens.",
    },
    {
      id: "anthropic",
      label: "Anthropic (Mr.E)",
      status: "partial",
      summary: "Server-side key — FAQ works offline; AI needs ANTHROPIC_API_KEY on Vercel.",
      envKeys: ["ANTHROPIC_API_KEY"],
      nextStep: "Set ANTHROPIC_API_KEY on Vercel for AI captions and Mr.E chat.",
    },
    {
      id: "photoroom",
      label: "PhotoRoom",
      status: photoroom ? "ready" : "missing",
      summary: photoroom ? "Background removal enabled." : "Listing photos use originals only.",
      envKeys: ["PHOTOROOM_API_KEY"],
      nextStep: "Optional: PHOTOROOM_API_KEY for cut-out listing photos.",
    },
    {
      id: "push",
      label: "Web push",
      status: push ? "partial" : "missing",
      summary: push
        ? "Client subscribe works; server fan-out needs garage_follows table."
        : "In-app notifications only.",
      envKeys: ["VITE_VAPID_PUBLIC_KEY", "VAPID_PRIVATE_KEY"],
      nextStep: "Generate VAPID keys and add garage_follows + listing insert triggers.",
    },
    {
      id: "garageCommerce",
      label: "Garage checkout",
      status: garageCommerce ? "partial" : "missing",
      summary: garageCommerce
        ? "Stripe PaymentIntents ready — persist orders in Supabase next."
        : "Cart and auction checkout run as demo until Supabase + Stripe are live.",
      envKeys: ["VITE_STRIPE_PUBLISHABLE_KEY", "STRIPE_SECRET_KEY"],
      nextStep: "Add garage_orders migration and extend stripe/webhook for payment_type=garage_cart|auction.",
    },
    {
      id: "subscriptions",
      label: "Host plans",
      status: stripe ? "partial" : "missing",
      summary: stripe
        ? "Plan picker wired — map plan IDs to Stripe Price IDs."
        : "Plans saved locally in demo mode.",
      envKeys: [
        "STRIPE_SECRET_KEY",
        "STRIPE_PRICE_STARTER",
        "STRIPE_PRICE_PRO",
      ],
      nextStep: "Create Stripe Products/Prices and set STRIPE_PRICE_* env vars.",
    },
  ];
}

export function countIntegrationsByStatus(status: IntegrationStatus): number {
  return getIntegrationItems().filter((item) => item.status === status).length;
}
