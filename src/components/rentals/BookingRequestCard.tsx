import { useMemo, useState } from "react";
import { useAuth } from "../../hooks/AuthProvider";
import { useNow } from "../../hooks/useNow";
import { approveRentalBooking, declineRentalBooking } from "../../lib/rentalApprovalActions";
import { formatCountdownShort, getCountdownParts } from "../../lib/rentalTiming";
import {
  formatRentalDateRange,
  type RentalBooking,
} from "../../lib/rentalsStorage";
import { CounterpartyName } from "../trust/CounterpartyName";
import { InsuredLabel } from "./InsuredLabel";
import { useMessages } from "../../lib/i18n/react";
import {
  createRentalAgreementRecord,
  getRentalAgreementTermsText,
  makeAgreementSignature,
  mergeRentalAgreementRecords,
  RENTAL_AGREEMENT_VERSION,
} from "../../lib/rentalAgreement";
import { getLocale } from "../../lib/i18n";
import { loadUserProfile } from "../../lib/userProfileStorage";
import { RentalAgreementSignBlock } from "./RentalAgreementPanel";

const GREEN = "#0D5C3A";
const BORDER = "#E8E6E0";
const SURFACE = "#F0F4F2";

export function BookingRequestCard({
  booking,
  onRefresh,
  onViewProfile,
}: {
  booking: RentalBooking;
  onRefresh: () => void;
  onViewProfile: (userId: string) => void;
}) {
  const { bookingRequest: copy, rentalAgreement: agreementCopy } = useMessages();
  const auth = useAuth();
  const [busy, setBusy] = useState<"approve" | "decline" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [agreementAccepted, setAgreementAccepted] = useState(
    Boolean(booking.rentalAgreement?.hostSignature?.signedAt),
  );
  const [agreementExpanded, setAgreementExpanded] = useState(false);
  const now = useNow(30_000);
  const timerLabel = useMemo(() => {
    if (!booking.approvalDeadline) return copy.autoCancelledSoon;
    const parts = getCountdownParts(booking.approvalDeadline, now);
    if (parts.totalMs <= 0) return copy.autoCancelledSoon;
    return copy.autoCancelledIn(formatCountdownShort(parts));
  }, [booking.approvalDeadline, copy, now]);

  const hostDisplayName = useMemo(() => {
    const profile = loadUserProfile();
    return (
      profile.displayName.trim() ||
      [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim() ||
      auth.userEmail?.split("@")[0] ||
      agreementCopy.nameFallback
    );
  }, [agreementCopy.nameFallback, auth.userEmail]);

  const termsText = useMemo(
    () => booking.rentalAgreement?.termsText || getRentalAgreementTermsText(getLocale()),
    [booking.rentalAgreement?.termsText],
  );

  const run = async (action: "approve" | "decline") => {
    const hostUserId = auth.userId;
    if (!hostUserId || busy) return;
    if (action === "approve" && !agreementAccepted) {
      setError(agreementCopy.hostMustSignToApprove);
      return;
    }
    setBusy(action);
    setError(null);
    try {
      if (action === "approve") {
        const hostSignature = makeAgreementSignature({
          party: "host",
          userId: hostUserId,
          displayName: hostDisplayName,
          termsVersion:
            booking.rentalAgreement?.termsVersion ?? RENTAL_AGREEMENT_VERSION,
        });
        const base =
          booking.rentalAgreement ??
          createRentalAgreementRecord({
            locale: getLocale(),
            commercial: {
              bookingId: booking.id,
              listingId: booking.listingId,
              itemTitle: booking.itemTitle,
              startDate: booking.startDate,
              endDate: booking.endDate,
              totalUsd: booking.totalUsd,
              rentalSubtotalUsd: booking.rentalSubtotalUsd,
              depositAmountCents: booking.depositAmountCents,
              fulfillmentMethod: booking.fulfillmentMethod,
              insuranceRequired: Boolean(
                booking.insuranceProofMedia ||
                  booking.insuranceProofUrl ||
                  booking.insuranceActiveUntil,
              ),
              insuranceActiveUntil: booking.insuranceActiveUntil,
            },
          });
        const rentalAgreement = mergeRentalAgreementRecords(base, {
          ...base,
          hostSignature,
        });
        await approveRentalBooking(booking, hostUserId, { rentalAgreement });
      } else {
        await declineRentalBooking(booking, hostUserId);
      }
      onRefresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : copy.somethingWrong);
    } finally {
      setBusy(null);
    }
  };

  return (
    <article className="rounded-xl border bg-white p-4" style={{ borderColor: BORDER }}>
      <div className="mb-3 flex gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl"
          style={{ backgroundColor: SURFACE }}
        >
          {booking.itemEmoji}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold" style={{ color: GREEN }}>
            {booking.itemTitle}
          </p>
          <p className="text-[13px] text-gray-500">
            {formatRentalDateRange(booking.startDate, booking.endDate)} · ${booking.totalUsd}
            {booking.deliveryRequested && booking.deliveryFee
              ? copy.inclDelivery(booking.deliveryFee)
              : ""}
          </p>
          <p className="mt-1 text-[13px]">
            <CounterpartyName
              name={booking.counterpartyName}
              identityVerified={booking.counterpartyIdentityVerified}
              phoneVerified={booking.counterpartyPhoneVerified}
              onClick={() => onViewProfile(booking.counterpartyId)}
            />
          </p>
          <InsuredLabel modes={booking.listingModes} compact />
        </div>
      </div>

      <p className="mb-3 text-[12px] font-semibold text-amber-700">{timerLabel}</p>
      {booking.paymentOnHold ? (
        <p className="mb-3 text-[12px] text-gray-500">{copy.paymentOnHold}</p>
      ) : null}

      <div className="mb-3">
        <RentalAgreementSignBlock
          party="host"
          displayName={hostDisplayName}
          checked={agreementAccepted}
          onCheckedChange={setAgreementAccepted}
          expanded={agreementExpanded}
          onToggleExpand={() => setAgreementExpanded((v) => !v)}
          termsText={termsText}
          summaryLines={booking.rentalAgreement?.enrichedSummaryLines}
          disabled={Boolean(busy)}
        />
      </div>

      {error ? (
        <p className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
          {error}
        </p>
      ) : null}

      <div className="flex gap-2">
        <button
          type="button"
          disabled={Boolean(busy) || !agreementAccepted}
          onClick={() => void run("approve")}
          className="flex-1 rounded-xl py-2.5 text-[14px] font-bold text-white disabled:opacity-60"
          style={{ backgroundColor: GREEN }}
        >
          {busy === "approve" ? copy.approving : copy.approve}
        </button>
        <button
          type="button"
          disabled={Boolean(busy)}
          onClick={() => void run("decline")}
          className="flex-1 rounded-xl border py-2.5 text-[14px] font-semibold text-gray-600 disabled:opacity-60"
          style={{ borderColor: BORDER }}
        >
          {busy === "decline" ? copy.declining : copy.decline}
        </button>
      </div>
    </article>
  );
}
