import {
  formatPlanUsage,
  getPlanById,
  loadSubscriptionPlanId,
  saveSubscriptionPlanId,
  SUBSCRIPTION_PLANS,
  type SubscriptionPlanId,
} from "../subscriptionPlans";
import { isStripePaymentsEnabled } from "../stripeConfig";
import { createSubscriptionCheckoutSession, getAccessToken } from "../stripePayments";

export type PlanSelectionMode = "demo" | "stripe";

export type PlanSelectionResult =
  | { ok: true; mode: "demo"; planId: SubscriptionPlanId }
  | { ok: true; mode: "stripe"; checkoutUrl: string; planId: SubscriptionPlanId }
  | { ok: false; reason: string };

export function getPlanSelectionMode(): PlanSelectionMode {
  return isStripePaymentsEnabled() ? "stripe" : "demo";
}

export function getCurrentPlanId(): SubscriptionPlanId {
  return loadSubscriptionPlanId();
}

export function formatCurrentPlanUsage(listingsUsed: number): string {
  return formatPlanUsage(getCurrentPlanId(), listingsUsed);
}

export function applyPlanLocally(planId: SubscriptionPlanId): void {
  saveSubscriptionPlanId(planId);
}

export async function selectSubscriptionPlan(
  planId: SubscriptionPlanId,
): Promise<PlanSelectionResult> {
  const plan = getPlanById(planId);

  if (planId === "free") {
    applyPlanLocally(planId);
    return { ok: true, mode: "demo", planId };
  }

  if (planId === "business") {
    return { ok: false, reason: "Business plans use sales-assisted billing — contact support." };
  }

  if (!isStripePaymentsEnabled()) {
    applyPlanLocally(planId);
    return { ok: true, mode: "demo", planId };
  }

  const token = await getAccessToken();
  if (!token) {
    return { ok: false, reason: "Sign in required to upgrade" };
  }

  const session = await createSubscriptionCheckoutSession(planId);
  if (!session.ok) {
    if (session.reason === "Stripe not configured" || session.reason.includes("Price")) {
      applyPlanLocally(planId);
      return { ok: true, mode: "demo", planId };
    }
    return { ok: false, reason: session.reason };
  }

  return { ok: true, mode: "stripe", checkoutUrl: session.checkoutUrl, planId };
}

export { SUBSCRIPTION_PLANS, type SubscriptionPlanId };
