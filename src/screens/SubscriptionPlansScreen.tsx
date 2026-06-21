import { useState } from "react";
import { Check } from "lucide-react";
import { PaymentModeBanner } from "../components/payments/PaymentModeBanner";
import {
  formatCurrentPlanUsage,
  getCurrentPlanId,
  getPlanSelectionMode,
  selectSubscriptionPlan,
  SUBSCRIPTION_PLANS,
  type SubscriptionPlanId,
} from "../lib/repositories/billingRepository";
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
  const currentId = getCurrentPlanId();
  const listingsUsed = profile.host.listingsCount;
  const planMode = getPlanSelectionMode();
  const [busyPlanId, setBusyPlanId] = useState<SubscriptionPlanId | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectPlan = (id: SubscriptionPlanId) => {
    setBusyPlanId(id);
    setError(null);
    void selectSubscriptionPlan(id)
      .then((result) => {
        if (!result.ok) {
          setError(result.reason);
          return;
        }
        if (result.mode === "stripe") {
          window.location.href = result.checkoutUrl;
          return;
        }
        const next = refreshProfileStats(loadUserProfile());
        next.subscriptionPlan = result.planId;
        onPlanChanged?.();
        onBack();
      })
      .finally(() => setBusyPlanId(null));
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
        <div className="mb-4">
          <PaymentModeBanner context="subscription" />
        </div>

        <p className="mb-4 text-[14px] text-gray-600">
          {formatCurrentPlanUsage(listingsUsed)}
        </p>

        {error ? (
          <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
            {error}
          </p>
        ) : null}

        <ul className="flex flex-col gap-3">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const selected = plan.id === currentId;
            const busy = busyPlanId === plan.id;
            return (
              <li key={plan.id}>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => selectPlan(plan.id)}
                  className="w-full rounded-2xl border bg-white p-4 text-left disabled:opacity-60"
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
                  ) : plan.id === "business" ? (
                    <p className="mt-3 text-[13px] font-semibold text-gray-500">
                      Contact sales
                    </p>
                  ) : plan.id === "free" ? (
                    <p className="mt-3 text-[13px] font-bold" style={{ color: CTA }}>
                      Switch to free →
                    </p>
                  ) : (
                    <p className="mt-3 text-[13px] font-bold" style={{ color: CTA }}>
                      {busy
                        ? "Opening checkout…"
                        : planMode === "stripe"
                          ? "Upgrade with Stripe →"
                          : "Upgrade (demo) →"}
                    </p>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        <p className="mt-4 text-[12px] leading-relaxed text-gray-500">
          Paid plans use Stripe Checkout when STRIPE_PRICE_STARTER and STRIPE_PRICE_PRO are set on
          Vercel. Until then, plan changes save locally for demo.
        </p>
      </div>
    </div>
  );
}
