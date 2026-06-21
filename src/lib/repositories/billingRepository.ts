import {
  formatPlanUsage,
  getPlanById,
  loadSubscriptionPlanId,
  saveSubscriptionPlanId,
  SUBSCRIPTION_PLANS,
  type SubscriptionPlanId,
} from "../subscriptionPlans";
import {
  getSignInRequiredMessage,
  getStripeRequiredMessage,
  isPaymentsReady,
} from "../config/production";
import { createSubscriptionCheckoutSession, getAccessToken } from "../stripePayments";

export type PlanSelectionResult =
  | { ok: true; mode: "local"; planId: SubscriptionPlanId }
  | { ok: true; mode: "checkout"; checkoutUrl: string; planId: SubscriptionPlanId }
  | { ok: false; reason: string };

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
    return { ok: true, mode: "local", planId };
  }

  if (planId === "business") {
    return { ok: false, reason: "Business plans use sales-assisted billing — contact support." };
  }

  if (!isPaymentsReady()) {
    return { ok: false, reason: getStripeRequiredMessage() };
  }

  const token = await getAccessToken();
  if (!token) {
    return { ok: false, reason: getSignInRequiredMessage() };
  }

  const session = await createSubscriptionCheckoutSession(planId);
  if (!session.ok) {
    return { ok: false, reason: session.reason };
  }

  return { ok: true, mode: "checkout", checkoutUrl: session.checkoutUrl, planId };
}

export { SUBSCRIPTION_PLANS, type SubscriptionPlanId };
