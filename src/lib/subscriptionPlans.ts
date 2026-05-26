export type SubscriptionPlanId = "free" | "starter" | "pro" | "business";

export type SubscriptionPlan = {
  id: SubscriptionPlanId;
  name: string;
  listingLimit: number;
  priceLabel: string;
  highlight?: string;
};

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  { id: "free", name: "Free", listingLimit: 3, priceLabel: "$0/mo" },
  { id: "starter", name: "Starter", listingLimit: 10, priceLabel: "$9/mo", highlight: "Popular" },
  { id: "pro", name: "Pro", listingLimit: 25, priceLabel: "$29/mo" },
  { id: "business", name: "Business", listingLimit: 100, priceLabel: "Custom" },
];

const PLAN_KEY = "allbyrent_subscription_plan";

export function loadSubscriptionPlanId(): SubscriptionPlanId {
  try {
    const raw = localStorage.getItem(PLAN_KEY);
    if (raw && SUBSCRIPTION_PLANS.some((p) => p.id === raw)) {
      return raw as SubscriptionPlanId;
    }
  } catch {
    /* ignore */
  }
  return "free";
}

export function saveSubscriptionPlanId(planId: SubscriptionPlanId): void {
  try {
    localStorage.setItem(PLAN_KEY, planId);
  } catch {
    /* ignore */
  }
}

export function getPlanById(id: SubscriptionPlanId): SubscriptionPlan {
  return SUBSCRIPTION_PLANS.find((p) => p.id === id) ?? SUBSCRIPTION_PLANS[0];
}

export function formatPlanUsage(planId: SubscriptionPlanId, listingsUsed: number): string {
  const plan = getPlanById(planId);
  return `${plan.name} plan · ${listingsUsed}/${plan.listingLimit} listings used`;
}
