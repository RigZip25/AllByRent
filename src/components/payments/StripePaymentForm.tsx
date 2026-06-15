import { useState } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe, type StripeElementsOptions } from "@stripe/stripe-js";
import { getStripePublishableKey } from "../../lib/stripeConfig";

const GREEN = "#0D5C3A";

function PaymentFormInner({
  totalLabel,
  onSuccess,
  onError,
}: {
  totalLabel: string;
  onSuccess: () => void;
  onError: (message: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setBusy(true);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: "if_required",
      });
      if (error) {
        onError(error.message ?? "Payment failed");
        return;
      }
      if (paymentIntent?.status === "succeeded" || paymentIntent?.status === "processing") {
        onSuccess();
        return;
      }
      onError("Payment was not completed. Try again.");
    } catch (e) {
      onError(e instanceof Error ? e.message : "Payment failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <PaymentElement options={{ layout: "tabs" }} />
      <button
        type="button"
        disabled={!stripe || !elements || busy}
        onClick={() => void handlePay()}
        className="w-full rounded-xl py-3.5 font-medium text-white transition-colors disabled:opacity-50"
        style={{ backgroundColor: GREEN }}
      >
        {busy ? "Processing…" : `Pay ${totalLabel}`}
      </button>
    </div>
  );
}

export function StripePaymentForm({
  clientSecret,
  totalLabel,
  onSuccess,
  onError,
}: {
  clientSecret: string;
  totalLabel: string;
  onSuccess: () => void;
  onError: (message: string) => void;
}) {
  const publishableKey = getStripePublishableKey();
  if (!publishableKey) return null;

  const stripePromise = loadStripe(publishableKey);
  const options: StripeElementsOptions = {
    clientSecret,
    appearance: { theme: "stripe" },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentFormInner totalLabel={totalLabel} onSuccess={onSuccess} onError={onError} />
    </Elements>
  );
}
