import { PRIVACY_URL, REFUND_POLICY_URL, TERMS_URL } from "../../lib/brand";
import { useMessages } from "../../lib/i18n/react";

/** Required disclosure before card capture (public launch). */
export function PaymentLegalNotice({ className = "" }: { className?: string }) {
  const { paymentsUi: p } = useMessages();
  return (
    <p className={`text-[11px] leading-snug text-gray-500 ${className}`}>
      {p.agreePrefix}{" "}
      <a href={TERMS_URL} target="_blank" rel="noopener noreferrer" className="underline">
        {p.terms}
      </a>
      ,{" "}
      <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer" className="underline">
        {p.privacy}
      </a>
      , {p.and}{" "}
      <a href={REFUND_POLICY_URL} target="_blank" rel="noopener noreferrer" className="underline">
        {p.refund}
      </a>
      . {p.agreeSuffix}
    </p>
  );
}
