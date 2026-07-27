import { getBookingWithoutPaymentMessage, getGarageStripeRequiredMessage, getStripeRequiredMessage, isPaymentsReady } from "../../lib/config/production";

const GREEN = "#0D5C3A";
const AMBER = "#F59E0B";

export function BookingPaymentsBanner() {
  if (isPaymentsReady()) return null;

  return (
    <div
      className="rounded-xl border px-3 py-2.5 text-[14px] leading-relaxed"
      style={{ backgroundColor: `${AMBER}18`, borderColor: `${AMBER}55`, color: "#92400E" }}
    >
      {getBookingWithoutPaymentMessage()}
    </div>
  );
}

export function PaymentsRequiredBanner({ variant = "rental" }: { variant?: "rental" | "garage" }) {
  if (isPaymentsReady()) return null;

  return (
    <div
      className="rounded-xl px-3 py-2.5 text-[14px] font-semibold leading-snug"
      style={{ backgroundColor: `${AMBER}22`, color: "#92400E" }}
    >
      {variant === "garage" ? getGarageStripeRequiredMessage() : getStripeRequiredMessage()}
    </div>
  );
}

export function PaymentsReadyBadge() {
  if (!isPaymentsReady()) return null;

  return (
    <div
      className="rounded-xl px-3 py-2.5 text-[14px] font-semibold"
      style={{ backgroundColor: `${GREEN}14`, color: GREEN }}
    >
      Secure card checkout enabled
    </div>
  );
}
