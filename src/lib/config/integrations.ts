import { isStripePaymentsEnabled } from "../stripeConfig";
import { isSupabaseConfigured } from "../supabaseClient";

export type IntegrationId =
  | "supabase"
  | "stripe"
  | "anthropic"
  | "photoroom"
  | "push"
  | "garageCommerce";

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

export function isPushConfigured(): boolean {
  return hasClientEnv("VITE_VAPID_PUBLIC_KEY");
}

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
      summary: supabase ? "Auth, profiles, listings sync enabled." : "Required — app will not start without Supabase.",
      envKeys: ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"],
      nextStep: supabase
        ? "Run migration 023_garage_commerce.sql for garage orders and follows."
        : "Create a Supabase project and add URL + anon key to Vercel.",
    },
    {
      id: "stripe",
      label: "Stripe",
      status: stripe ? "partial" : "missing",
      summary: stripe
        ? "Checkout UI enabled — Connect payouts + webhooks need server secrets."
        : "Required for bookings, garage checkout, and listing boosts.",
      envKeys: [
        "VITE_STRIPE_PUBLISHABLE_KEY",
        "STRIPE_SECRET_KEY",
        "STRIPE_WEBHOOK_SECRET",
      ],
      nextStep: stripe
        ? "Add STRIPE_SECRET_KEY on Vercel and configure webhook endpoint."
        : "Add VITE_STRIPE_PUBLISHABLE_KEY to enable payments.",
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
        : "In-app notifications only until VAPID keys are set.",
      envKeys: ["VITE_VAPID_PUBLIC_KEY", "VAPID_PRIVATE_KEY"],
      nextStep: "Generate VAPID keys and wire garage_follows insert triggers.",
    },
    {
      id: "garageCommerce",
      label: "Garage checkout",
      status: garageCommerce ? "partial" : "missing",
      summary: garageCommerce
        ? "Stripe + garage_orders migration ready — run SQL on Supabase."
        : "Requires Supabase + Stripe before cart and auction checkout work.",
      envKeys: ["VITE_STRIPE_PUBLISHABLE_KEY", "STRIPE_SECRET_KEY"],
      nextStep: "Apply migration 023 and test garage cart + auction payment webhooks.",
    },
  ];
}

export function countIntegrationsByStatus(status: IntegrationStatus): number {
  return getIntegrationItems().filter((item) => item.status === status).length;
}
