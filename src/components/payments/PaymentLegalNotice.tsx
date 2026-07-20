import { PRIVACY_URL, REFUND_POLICY_URL, TERMS_URL } from "../../lib/brand";

/** Required disclosure before card capture (public launch). */
export function PaymentLegalNotice({ className = "" }: { className?: string }) {
  return (
    <p className={`text-[11px] leading-snug text-gray-500 ${className}`}>
      By paying you agree to the{" "}
      <a href={TERMS_URL} target="_blank" rel="noopener noreferrer" className="underline">
        Terms
      </a>
      ,{" "}
      <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer" className="underline">
        Privacy Policy
      </a>
      , and{" "}
      <a href={REFUND_POLICY_URL} target="_blank" rel="noopener noreferrer" className="underline">
        Refund Policy
      </a>
      . Card charges are processed by Stripe; hosts are paid through Stripe Connect.
    </p>
  );
}
