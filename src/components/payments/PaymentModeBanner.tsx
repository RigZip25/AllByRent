import { getPlanSelectionMode } from "../../lib/repositories/billingRepository";
import { formatCheckoutModeLabel, getGarageCheckoutMode } from "../../lib/repositories/paymentsRepository";

const AMBER = "#F59E0B";
const GREEN = "#0D5C3A";

export function PaymentModeBanner({ context }: { context: "garage" | "subscription" | "payouts" }) {
  const mode =
    context === "garage"
      ? getGarageCheckoutMode()
      : context === "subscription"
        ? getPlanSelectionMode()
        : "demo";
  const label = formatCheckoutModeLabel(mode);

  if (mode === "stripe") {
    return (
      <div
        className="rounded-xl px-3 py-2 text-[12px] font-semibold"
        style={{ backgroundColor: `${GREEN}14`, color: GREEN }}
      >
        {label} · card payment below
      </div>
    );
  }

  const hint =
    context === "subscription"
      ? "Plans save locally until Stripe Price IDs are configured."
      : context === "payouts"
        ? "Connect bank after STRIPE_SECRET_KEY is set on Vercel."
        : "Add VITE_STRIPE_PUBLISHABLE_KEY + sign in to enable live garage checkout.";

  return (
    <div
      className="rounded-xl px-3 py-2 text-[12px] font-semibold"
      style={{ backgroundColor: `${AMBER}22`, color: "#92400E" }}
    >
      {label} · {hint}
    </div>
  );
}
