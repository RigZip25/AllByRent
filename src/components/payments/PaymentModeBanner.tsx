import { getBookingWithoutPaymentMessage, getStripeRequiredMessage, isPaymentsReady } from "../../lib/config/production";

const GREEN = "#0D5C3A";
const AMBER = "#F59E0B";

export function BookingPaymentsBanner() {
  if (isPaymentsReady()) return null;

  return (
    <div
      className="rounded-xl border px-3 py-2.5 text-[12px] leading-relaxed"
      style={{ backgroundColor: `${AMBER}18`, borderColor: `${AMBER}55`, color: "#92400E" }}
    >
      {getBookingWithoutPaymentMessage()}
    </div>
  );
}

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
