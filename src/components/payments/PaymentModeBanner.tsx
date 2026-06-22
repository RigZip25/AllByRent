import { getStripeRequiredMessage, isPaymentsReady } from "../../lib/config/production";

const GREEN = "#0D5C3A";
const AMBER = "#F59E0B";

export function PaymentsRequiredBanner() {
  if (isPaymentsReady()) return null;

  return (
    <div
      className="rounded-xl px-3 py-2 text-[12px] font-semibold"
      style={{ backgroundColor: `${AMBER}22`, color: "#92400E" }}
    >
      {getStripeRequiredMessage()}
    </div>
  );
}

export function PaymentsReadyBadge() {
  if (!isPaymentsReady()) return null;

  return (
    <div
      className="rounded-xl px-3 py-2 text-[12px] font-semibold"
      style={{ backgroundColor: `${GREEN}14`, color: GREEN }}
    >
      Secure card checkout enabled
    </div>
  );
}
