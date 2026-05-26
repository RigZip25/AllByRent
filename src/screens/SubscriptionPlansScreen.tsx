import { Check } from "lucide-react";
import {
  formatPlanUsage,
  loadSubscriptionPlanId,
  saveSubscriptionPlanId,
  SUBSCRIPTION_PLANS,
  type SubscriptionPlanId,
} from "../lib/subscriptionPlans";
import { refreshProfileStats, loadUserProfile } from "../lib/userProfileStorage";

const GREEN = "#0D5C3A";
const CTA = "#F59E0B";
const BORDER = "#E8E6E0";

export function SubscriptionPlansScreen({
  onBack,
  onPlanChanged,
}: {
  onBack: () => void;
  onPlanChanged?: () => void;
}) {
  const profile = refreshProfileStats(loadUserProfile());
  const currentId = loadSubscriptionPlanId();
  const listingsUsed = profile.host.listingsCount;

  const selectPlan = (id: SubscriptionPlanId) => {
    saveSubscriptionPlanId(id);
    const next = refreshProfileStats(loadUserProfile());
    next.subscriptionPlan = id;
    onPlanChanged?.();
    onBack();
  };

  return (
    <div className="screen flex flex-col overflow-hidden bg-[#F0F4F2]">
      <header className="shrink-0 flex items-center gap-3 px-4 pb-2 pt-3">
        <button
          type="button"
          onClick={onBack}
          className="text-[15px] font-semibold"
          style={{ color: GREEN }}
        >
          Back
        </button>
        <h1 className="text-[20px] font-bold" style={{ color: GREEN }}>
          Your plan
        </h1>
      </header>

      <div className="screen-scroll flex-1 px-4 pb-6">
        <p className="mb-4 text-[14px] text-gray-600">
          {formatPlanUsage(currentId, listingsUsed)}
        </p>

        <ul className="flex flex-col gap-3">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const selected = plan.id === currentId;
            return (
              <li key={plan.id}>
                <button
                  type="button"
                  onClick={() => selectPlan(plan.id)}
                  className="w-full rounded-2xl border bg-white p-4 text-left"
                  style={{
                    borderColor: selected ? GREEN : BORDER,
                    boxShadow: selected ? `0 0 0 1px ${GREEN}` : undefined,
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[17px] font-bold" style={{ color: GREEN }}>
                        {plan.name}
                      </p>
                      <p className="text-[14px] text-gray-500">{plan.priceLabel}</p>
                      <p className="mt-1 text-[13px] text-gray-600">
                        Up to {plan.listingLimit} active listings
                      </p>
                    </div>
                    {selected ? (
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-full"
                        style={{ backgroundColor: GREEN }}
                      >
                        <Check className="h-5 w-5 text-white" />
                      </span>
                    ) : plan.highlight ? (
                      <span
                        className="rounded-full px-2 py-1 text-[11px] font-bold text-white"
                        style={{ backgroundColor: CTA }}
                      >
                        {plan.highlight}
                      </span>
                    ) : null}
                  </div>
                  {plan.id === currentId ? (
                    <p className="mt-2 text-[12px] font-semibold" style={{ color: GREEN }}>
                      Current plan
                    </p>
                  ) : plan.id !== "business" ? (
                    <p className="mt-3 text-[13px] font-bold" style={{ color: CTA }}>
                      Upgrade →
                    </p>
                  ) : (
                    <p className="mt-3 text-[13px] font-semibold text-gray-500">
                      Contact sales (demo)
                    </p>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        <p className="mt-4 text-[12px] leading-relaxed text-gray-500">
          Plans control how many items you can list as a host. Renting is unlimited on all plans in
          this demo.
        </p>
      </div>
    </div>
  );
}
