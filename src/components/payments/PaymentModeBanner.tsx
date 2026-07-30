import { isPaymentsReady } from "../../lib/config/production";
import { useMessages } from "../../lib/i18n/react";

const GREEN = "#0D5C3A";
const AMBER = "#F59E0B";

export function BookingPaymentsBanner() {
  const { paymentsUi } = useMessages();
  if (isPaymentsReady()) return null;

  return (
    <div
      className="rounded-xl border px-3 py-2.5 text-[14px] leading-relaxed"
      style={{ backgroundColor: `${AMBER}18`, borderColor: `${AMBER}55`, color: "#92400E" }}
    >
      {paymentsUi.bookingWithoutPayment}
    </div>
  );
}

export function PaymentsRequiredBanner({ variant = "rental" }: { variant?: "rental" | "garage" }) {
  const { paymentsUi } = useMessages();
  if (isPaymentsReady()) return null;

  return (
    <div
      className="rounded-xl px-3 py-2.5 text-[14px] font-semibold leading-snug"
      style={{ backgroundColor: `${AMBER}22`, color: "#92400E" }}
    >
      {variant === "garage" ? paymentsUi.garageStripeRequired : paymentsUi.stripeRequired}
    </div>
  );
}

export function PaymentsReadyBadge() {
  const { paymentsUi } = useMessages();
  if (!isPaymentsReady()) return null;

  return (
    <div
      className="rounded-xl px-3 py-2.5 text-[14px] font-semibold"
      style={{ backgroundColor: `${GREEN}14`, color: GREEN }}
    >
      {paymentsUi.secureCheckout}
    </div>
  );
}
