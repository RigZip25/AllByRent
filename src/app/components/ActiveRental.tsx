import {
  ArrowLeft,
  ScanLine,
  Shield,
  MessageCircle,
  Phone,
  CheckCircle2,
  Clock,
  Lock,
  MapPin,
  ExternalLink,
  AlertTriangle,
  Upload,
} from "lucide-react";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useAuth } from "../../hooks/AuthProvider";
import {
  loadRentalBookings,
  updateBooking,
  getRenterPickupLocation,
  type RentalBooking,
} from "../../lib/rentalsStorage";
import { confirmHandoffSide, handoffTimelineState } from "../../lib/rentalHandoff";
import { hasLocalReview, submitReviewRemote } from "../../lib/reviewsStorage";
import { ReviewPromptModal } from "../../components/reviews/ReviewPromptModal";
import { mascotSays } from "../../lib/brand";
import {
  addEvidenceRemote,
  fetchDisputeForRentalRemote,
  openDisputeRemote,
  type Dispute,
} from "../../lib/disputesStorage";
import { QrScanPanel, type QrScanPhase } from "../../components/rentals/QrScanPanel";
import { RentanoTip } from "../../components/RentanoTip";
import { RentalPriceBreakdownView } from "../../components/rentals/RentalPriceBreakdown";
import {
  computeRentalPriceBreakdown,
  formatUsd,
  type RentalPriceBreakdown,
} from "../../lib/rentalPricing";
import { PeerChatPanel } from "../../components/PeerChatPanel";
import { useMessages } from "../../lib/i18n/react";

export function ActiveRental({
  bookingId,
  initialChatOpen = false,
  onBack,
  onViewProfile,
}: {
  bookingId?: string | null;
  initialChatOpen?: boolean;
  onBack: () => void;
  onViewProfile?: (userId: string) => void;
}) {
  const auth = useAuth();
  const t = useMessages();
  const [scanOpen, setScanOpen] = useState(false);
  const [scanPhase, setScanPhase] = useState<QrScanPhase>("camera");
  const [notice, setNotice] = useState<string | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [bookings, setBookings] = useState<RentalBooking[]>(() => loadRentalBookings());
  const [chatOpen, setChatOpen] = useState(initialChatOpen);

  const booking = useMemo<RentalBooking | null>(() => {
    const list = bookings;
    if (bookingId) {
      return list.find((b) => b.id === bookingId) ?? null;
    }
    return (
      list.find((b) => b.status === "pending_checkin") ??
      list.find((b) => b.status === "active" || b.status === "overdue") ??
      list[0] ??
      null
    );
  }, [bookings, bookingId]);

  useEffect(() => {
    setChatOpen(initialChatOpen);
  }, [bookingId, initialChatOpen]);

  const canDispute = Boolean(booking && (booking.status === "active" || booking.status === "overdue"));

  const refreshDispute = useCallback(() => {
    if (!booking) return;
    void fetchDisputeForRentalRemote(booking.id).then(setDispute);
  }, [booking]);

  const mode: "pickup" | "return" =
    booking?.status === "pending_checkin" ? "pickup" : "return";

  const overdueWarning =
    booking?.status === "overdue"
      ? t.rentalDetail.overdueWarning
      : null;

  const renterPickupLocation = useMemo(
    () => (booking ? getRenterPickupLocation(booking) : undefined),
    [booking],
  );

  const priceBreakdown = useMemo<RentalPriceBreakdown | null>(() => {
    if (!booking) return null;
    if (
      booking.rentalSubtotalUsd !== undefined &&
      booking.serviceFeeUsd !== undefined
    ) {
      const rentalDays = Math.max(
        1,
        Math.round(
          (new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) /
            (1000 * 60 * 60 * 24),
        ) + 1,
      );
      const daily =
        rentalDays > 0 ? (booking.rentalSubtotalUsd ?? 0) / rentalDays : booking.rentalSubtotalUsd ?? 0;
      const deliveryRoundTripUsd =
        booking.deliveryRoundTripUsd ??
        (booking.heavySurchargeUsd
          ? Math.max(0, (booking.deliveryFee ?? 0) - (booking.heavySurchargeUsd ?? 0))
          : booking.deliveryFee ?? 0);
      const heavySurchargeUsd = booking.heavySurchargeUsd ?? 0;
      return {
        rentalDays,
        dailyRateUsd: daily,
        rentalSubtotalUsd: booking.rentalSubtotalUsd ?? 0,
        deliveryRequested: Boolean(booking.deliveryRequested && (booking.deliveryFee ?? 0) > 0),
        deliveryRoundTripUsd,
        heavySurchargeUsd,
        poundsOverThreshold: booking.poundsOverThreshold ?? 0,
        itemWeightLbs: booking.itemWeightLbs,
        deliveryFeeUsd: booking.deliveryFee ?? 0,
        serviceFeeUsd: booking.serviceFeeUsd ?? 0,
        insuranceFeeUsd: booking.insuranceFeeUsd ?? 0,
        totalUsd: booking.totalUsd,
      };
    }
    const deliveryRoundTripUsd = booking.deliveryRoundTripUsd ?? booking.deliveryFee ?? 0;
    return computeRentalPriceBreakdown({
      dailyRateUsd: booking.totalUsd,
      rentalDays: 1,
      deliveryRequested: Boolean(booking.deliveryRequested),
      deliveryRoundTripUsd,
      heavySurchargeUsd: booking.heavySurchargeUsd ?? 0,
      itemWeightLbs: booking.itemWeightLbs,
    });
  }, [booking]);

  const pickupMapsUrl = renterPickupLocation
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(renterPickupLocation)}`
    : undefined;

  const contactName = booking?.counterpartyName?.trim() || (booking?.role === "renter" ? t.rentalDetail.hostFallback : t.rentalDetail.renterFallback);
  const contactInitials = contactName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const contactVerified = Boolean(booking?.counterpartyIdentityVerified);
  const contactHeading = booking?.role === "renter" ? t.rentalDetail.ownerContact : t.rentalDetail.renterContact;

  const alreadyConfirmed = useMemo(() => {
    if (!booking) return false;
    const tl = handoffTimelineState(booking);
    if (mode === "pickup") {
      if (booking.role === "host") return Boolean(booking.hostHandedOverAt) || tl.pickupComplete;
      return Boolean(booking.renterReceivedAt) || tl.pickupComplete;
    }
    if (booking.role === "renter") return Boolean(booking.renterReturnedAt) || tl.returnComplete;
    return Boolean(booking.hostAcceptedReturnAt) || tl.returnComplete;
  }, [booking, mode]);

  const handoffTimeline = useMemo(
    () => (booking ? handoffTimelineState(booking) : null),
    [booking],
  );

  const openScanner = () => {
    setNotice(null);
    setScanPhase("camera");
    setScanOpen(true);
  };

  const closeScanner = () => {
    setScanOpen(false);
    setScanPhase("camera");
  };

  const confirm = useCallback(
    (pin: string) => {
      if (!booking) return;
      void (async () => {
        const result = await confirmHandoffSide({
          bookingId: booking.id,
          role: booking.role,
          stage: mode,
          pin,
        });
        setBookings(loadRentalBookings());
        if (!result.ok) {
          setNotice(result.reason);
          return;
        }
        if (result.alreadyDone && result.waitingOther) {
          setNotice(
            mode === "pickup"
              ? t.rentalDetail.handoffWaitingOtherPickup
              : t.rentalDetail.handoffWaitingOtherReturn,
          );
          closeScanner();
          return;
        }
        if (result.waitingOther) {
          setNotice(
            mode === "pickup"
              ? booking.role === "host"
                ? t.rentalDetail.handoffHostDoneWaitingRenter
                : t.rentalDetail.handoffRenterDoneWaitingHost
              : booking.role === "renter"
                ? t.rentalDetail.handoffRenterReturnedWaitingHost
                : t.rentalDetail.handoffHostAcceptedWaitingRenter,
          );
          closeScanner();
          return;
        }
        setNotice(
          mode === "pickup" ? t.rentalDetail.pickupConfirmed : t.rentalDetail.returnConfirmed,
        );
        closeScanner();
        if (
          mode === "return" &&
          result.completedStage &&
          auth.userId &&
          result.booking.counterpartyId &&
          !hasLocalReview(result.booking.id, auth.userId)
        ) {
          setReviewOpen(true);
        }
      })();
    },
    [booking, mode, t.rentalDetail, auth.userId],
  );

  const timeLeftLabel = useMemo(() => {
    if (!dispute?.evidenceDeadline) return null;
    const ms = new Date(dispute.evidenceDeadline).getTime() - Date.now();
    if (Number.isNaN(ms)) return null;
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    return `${h}h ${m}m`;
  }, [dispute?.evidenceDeadline]);

  if (!booking) {
    return (
      <div className="screen bg-background flex flex-col">
        <div className="shrink-0 z-10 bg-card/80 backdrop-blur-sm border-b border-border px-3 sm:px-4 py-3 flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold flex-1">{t.rentalDetail.title}</h1>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
          <p className="text-muted-foreground">
            {mascotSays(t.rentalDetail.emptyBody)}
          </p>
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl bg-primary px-6 py-3 font-medium text-white"
          >
            {t.rentalDetail.backToRentals}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen bg-background flex flex-col">
      <div className="shrink-0 z-10 bg-card/80 backdrop-blur-sm border-b border-border px-3 sm:px-4 py-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-semibold flex-1">{t.rentalDetail.title}</h1>
      </div>

      <div className="screen-scroll flex-1 min-h-0 p-3 sm:p-4 space-y-5 sm:space-y-6">
        {notice ? (
          <div className="bg-card rounded-xl border border-border p-3 text-sm">
            {notice}
          </div>
        ) : null}
        {overdueWarning ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            {overdueWarning}
          </div>
        ) : null}
        {canDispute ? (
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-bold text-gray-900">{t.rentalDetail.openDisputeTitle}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-gray-600">
                  {t.rentalDetail.openDisputeBody}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    refreshDispute();
                    setDisputeOpen(true);
                  }}
                  className="mt-3 w-full rounded-xl border py-2.5 text-[14px] font-semibold"
                  style={{ borderColor: "#FDE68A", backgroundColor: "#FFFBEB", color: "#92400E" }}
                >
                  {dispute ? t.rentalDetail.viewDispute : t.rentalDetail.startDispute}
                </button>
              </div>
            </div>
          </div>
        ) : null}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="relative aspect-video bg-muted flex items-center justify-center text-5xl">
            {booking?.itemEmoji ?? "📦"}
          </div>

          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h2 className="font-bold text-lg mb-1">
                  {booking?.itemTitle ?? t.rentalDetail.rentalItemFallback}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {booking
                    ? t.rentalDetail.rentalPeriod(
                        new Date(booking.startDate).toLocaleDateString(),
                        new Date(booking.endDate).toLocaleDateString(),
                      )
                    : t.rentalDetail.rentalItemFallback}
                </p>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {booking?.status === "pending_checkin"
                    ? handoffTimeline?.hostHanded && !handoffTimeline.renterReceived
                      ? t.rentalDetail.statusHandedOver
                      : handoffTimeline?.renterReceived && !handoffTimeline.hostHanded
                        ? t.rentalDetail.statusReceivedPendingHost
                        : t.rentalDetail.statusPendingCheckin
                    : booking?.status === "active"
                      ? handoffTimeline?.renterReturned && !handoffTimeline.hostAcceptedReturn
                        ? t.rentalDetail.statusReturnPendingHost
                        : handoffTimeline?.hostAcceptedReturn && !handoffTimeline.renterReturned
                          ? t.rentalDetail.statusReturnPendingRenter
                          : t.rentalDetail.statusActive
                      : booking?.status === "overdue"
                        ? t.rentalDetail.statusOverdue
                        : booking?.status === "completed"
                          ? t.rentalDetail.statusCompleted
                          : booking?.status ?? t.rentalDetail.statusBooking}
                </span>
              </div>
            </div>
          </div>
        </div>

        {handoffTimeline &&
        (booking.status === "pending_checkin" ||
          booking.status === "active" ||
          booking.status === "overdue" ||
          booking.status === "completed") ? (
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-[13px] font-bold text-gray-900">{t.rentalDetail.handoffTitle}</p>
            <p className="mt-1 text-[12px] text-gray-500">{t.rentalDetail.handoffHint}</p>
            <ol className="mt-3 space-y-2">
              <li className="flex items-start gap-2 text-[13px]">
                <CheckCircle2
                  className={`mt-0.5 h-4 w-4 shrink-0 ${
                    handoffTimeline.hostHanded ? "text-emerald-600" : "text-gray-300"
                  }`}
                />
                <span className={handoffTimeline.hostHanded ? "text-gray-900" : "text-gray-500"}>
                  {t.rentalDetail.handoffHostHanded}
                  {booking.role === "host" && !handoffTimeline.hostHanded
                    ? ` — ${t.rentalDetail.handoffYourTurn}`
                    : ""}
                </span>
              </li>
              <li className="flex items-start gap-2 text-[13px]">
                <CheckCircle2
                  className={`mt-0.5 h-4 w-4 shrink-0 ${
                    handoffTimeline.renterReceived ? "text-emerald-600" : "text-gray-300"
                  }`}
                />
                <span className={handoffTimeline.renterReceived ? "text-gray-900" : "text-gray-500"}>
                  {t.rentalDetail.handoffRenterReceived}
                  {booking.role === "renter" &&
                  !handoffTimeline.renterReceived &&
                  booking.status === "pending_checkin"
                    ? ` — ${t.rentalDetail.handoffYourTurn}`
                    : ""}
                </span>
              </li>
              {(booking.status === "active" ||
                booking.status === "overdue" ||
                booking.status === "completed" ||
                handoffTimeline.pickupComplete) && (
                <>
                  <li className="flex items-start gap-2 text-[13px]">
                    <CheckCircle2
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        handoffTimeline.renterReturned ? "text-emerald-600" : "text-gray-300"
                      }`}
                    />
                    <span
                      className={handoffTimeline.renterReturned ? "text-gray-900" : "text-gray-500"}
                    >
                      {t.rentalDetail.handoffRenterReturned}
                      {booking.role === "renter" &&
                      !handoffTimeline.renterReturned &&
                      (booking.status === "active" || booking.status === "overdue")
                        ? ` — ${t.rentalDetail.handoffYourTurn}`
                        : ""}
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-[13px]">
                    <CheckCircle2
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        handoffTimeline.hostAcceptedReturn ? "text-emerald-600" : "text-gray-300"
                      }`}
                    />
                    <span
                      className={
                        handoffTimeline.hostAcceptedReturn ? "text-gray-900" : "text-gray-500"
                      }
                    >
                      {t.rentalDetail.handoffHostAccepted}
                      {booking.role === "host" &&
                      !handoffTimeline.hostAcceptedReturn &&
                      (booking.status === "active" || booking.status === "overdue")
                        ? ` — ${t.rentalDetail.handoffYourTurn}`
                        : ""}
                    </span>
                  </li>
                </>
              )}
            </ol>
          </div>
        ) : null}

        <div className="bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20 rounded-xl p-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-32 h-32 bg-white rounded-xl flex items-center justify-center mb-4 border-2 border-primary/10">
              <ScanLine className="w-16 h-16 text-primary" />
            </div>

            <h3 className="font-bold text-lg mb-2">
              {mode === "pickup"
                ? booking.role === "host"
                  ? t.rentalDetail.scanHandOver
                  : t.rentalDetail.scanReceive
                : booking.role === "renter"
                  ? t.rentalDetail.scanReturnItem
                  : t.rentalDetail.scanAcceptReturn}
            </h3>

            <p className="text-sm text-muted-foreground mb-6 leading-relaxed max-w-xs">
              {mode === "pickup"
                ? booking.role === "host"
                  ? t.rentalDetail.scanHandOverBody
                  : t.rentalDetail.scanReceiveBody
                : booking.role === "renter"
                  ? t.rentalDetail.scanReturnItemBody
                  : t.rentalDetail.scanAcceptReturnBody}
            </p>

            <button
              type="button"
              onClick={openScanner}
              disabled={alreadyConfirmed}
              className="w-full bg-primary hover:bg-primary/90 text-white py-3.5 rounded-xl transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {alreadyConfirmed
                ? t.rentalDetail.waitingOtherSide
                : t.rentalDetail.scanQrCode}
            </button>
          </div>
        </div>

        {renterPickupLocation ? (
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-primary" />
              <h3 className="font-semibold">{t.rentalDetail.pickupLocation}</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {booking?.role === "host"
                ? t.rentalDetail.pickupLocationHostHint
                : t.rentalDetail.pickupLocationRenterHint}
            </p>
            <p className="mt-3 text-sm font-medium leading-relaxed">{renterPickupLocation}</p>
            {pickupMapsUrl ? (
              <a
                href={pickupMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                {t.rentalDetail.openInMaps}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : null}
          </div>
        ) : null}

        {booking?.fulfillmentMethod === "contactless" && mode === "pickup" ? (
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-primary" />
              <h3 className="font-semibold">{t.rentalDetail.contactlessAccess}</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t.rentalDetail.contactlessBody}
            </p>
            {booking.role === "renter" ? (
              <p className="mt-2 text-sm text-muted-foreground">
                {t.rentalDetail.contactlessRenterHint}
              </p>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                {t.rentalDetail.contactlessHostHint}
              </p>
            )}
          </div>
        ) : null}

        {priceBreakdown ? (
          <RentalPriceBreakdownView breakdown={priceBreakdown} compact />
        ) : null}

        {booking?.fulfillmentMethod === "delivery" ? (
          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="font-semibold mb-2">{t.rentalDetail.roundTripDelivery}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t.rentalDetail.roundTripDeliveryBody}
            </p>
            {booking.deliveryFee ? (
              <p className="mt-2 text-sm font-medium">
                {t.rentalDetail.roundTripDeliveryFee(formatUsd(booking.deliveryFee))}
              </p>
            ) : null}
            {booking.deliveryAddress ? (
              <p className="mt-2 text-sm">
                <span className="font-medium">{t.rentalDetail.dropOff}</span> {booking.deliveryAddress}
              </p>
            ) : null}
          </div>
        ) : null}

        {booking ? (
          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="font-semibold mb-2">{t.rentalDetail.security}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t.rentalDetail.securityBody}
            </p>
            {booking.role === "host" ? (
              <div className="mt-3 rounded-lg bg-muted p-3 text-sm">
                <div className="font-medium">
                  {mode === "pickup" ? t.rentalDetail.pickupPin : t.rentalDetail.returnPin}:{" "}
                  <span className="font-mono tracking-widest">
                    {mode === "pickup" ? booking.pickupPin ?? "—" : booking.returnPin ?? "—"}
                  </span>
                </div>
                <div className="text-muted-foreground text-xs mt-1">
                  {t.rentalDetail.pinShareHint}
                </div>
              </div>
            ) : (
              <div className="mt-3 rounded-lg bg-muted p-3 text-sm">
                {t.rentalDetail.askHostForPin(
                  mode === "pickup" ? t.rentalDetail.pinStagePickup : t.rentalDetail.pinStageReturn,
                )}
              </div>
            )}
          </div>
        ) : null}

        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold flex-1">{t.rentalDetail.depositProtection}</h3>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {t.rentalDetail.depositProtectionBody}
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-3">{contactHeading}</h3>

          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3 mb-4">
              <button
                type="button"
                disabled={!booking?.counterpartyId || !onViewProfile}
                onClick={() => {
                  if (booking?.counterpartyId && onViewProfile) {
                    onViewProfile(booking.counterpartyId);
                  }
                }}
                className="flex flex-1 items-center gap-3 text-left disabled:cursor-default"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-sm font-medium text-primary">
                  {contactInitials || "?"}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold">{contactName}</span>
                    {contactVerified ? <CheckCircle2 className="w-4 h-4 text-primary" /> : null}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {contactVerified ? t.rentalDetail.verifiedOnEvorios : t.rentalDetail.tapToViewProfile}
                  </p>
                </div>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setChatOpen(true)}
                className="flex items-center justify-center gap-2 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{t.rentalDetail.message}</span>
              </button>

              <button
                type="button"
                disabled
                title={t.rentalDetail.phoneSharedAfterCheckin}
                className="flex items-center justify-center gap-2 py-2.5 border border-border rounded-lg opacity-50 cursor-not-allowed"
              >
                <Phone className="w-4 h-4" />
                <span className="text-sm font-medium">{t.rentalDetail.call}</span>
              </button>
            </div>
          </div>
        </div>

        {chatOpen && booking ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setChatOpen(false)}
              className="absolute right-3 top-3 z-10 text-sm text-muted-foreground"
            >
              {t.rentalDetail.close}
            </button>
            <PeerChatPanel
              rentalId={booking.id}
              peerId={booking.counterpartyId}
              itemTitle={booking.itemTitle}
              embedded
            />
          </div>
        ) : null}

        <div className="bg-muted/50 rounded-xl p-4">
          <h3 className="font-semibold mb-2">{t.rentalDetail.beforeCheckIn}</h3>

          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>{t.rentalDetail.inspectItem}</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>{t.rentalDetail.takePhotos}</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>{t.rentalDetail.reviewReturnDate}</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>{t.rentalDetail.askOwner}</span>
            </li>
          </ul>
        </div>
      </div>

      {booking ? (
        <QrScanPanel
          open={scanOpen}
          phase={scanPhase}
          mode={mode}
          itemTitle={booking.itemTitle}
          itemEmoji={booking.itemEmoji}
          expectedCode={booking.itemQrToken}
          expectedListingId={booking.listingId}
          expectedPin={mode === "pickup" ? booking.pickupPin : booking.returnPin}
          contactlessInstructions={
            booking.fulfillmentMethod === "contactless"
              ? booking.contactlessInstructions
              : undefined
          }
          alreadyConfirmed={alreadyConfirmed}
          returnByLabel={booking.returnDueAt ? new Date(booking.returnDueAt).toLocaleString() : undefined}
          onClose={closeScanner}
          onScanned={() => setScanPhase("confirm")}
          onConfirm={confirm}
          onManualCode={() => setScanPhase("confirm")}
          onOwnerManualConfirm={() => setScanPhase("confirm")}
          isHost={booking.role === "host"}
        />
      ) : null}

      {booking && auth.userId ? (
        <ReviewPromptModal
          open={reviewOpen}
          title={`for ${booking.counterpartyName}`}
          onClose={() => setReviewOpen(false)}
          onSubmit={(rating, comment) => {
            const reviewerId = auth.userId;
            if (!reviewerId) return;
            void submitReviewRemote({
              rentalId: booking.id,
              reviewerId,
              revieweeId: booking.counterpartyId,
              role: booking.role === "renter" ? "renter" : "host",
              rating,
              comment,
            })
              .then(() => {
                updateBooking(booking.id, {
                  review: { rating, leftAt: new Date().toISOString() },
                });
                setBookings(loadRentalBookings());
              })
              .finally(() => setReviewOpen(false));
          }}
        />
      ) : null}

      {booking && auth.userId && disputeOpen ? (
        <div className="fixed inset-0 z-[96] flex items-end justify-center bg-black/45 p-4">
          <div className="w-full max-w-[420px] rounded-3xl border bg-white p-5 shadow-2xl" style={{ borderColor: "#E8E6E0" }}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-[18px] font-extrabold" style={{ color: "#0D5C3A" }}>
                  {t.rentalDetail.disputeEvidence}
                </h2>
                <p className="mt-0.5 text-[13px] text-gray-500">
                  {timeLeftLabel
                    ? t.rentalDetail.disputeWindowLeft(timeLeftLabel)
                    : t.rentalDetail.countdownRunning}
                </p>
              </div>
              <button type="button" onClick={() => setDisputeOpen(false)} className="text-gray-500">
                ✕
              </button>
            </div>

            <div className="mt-3">
              <RentanoTip message={mascotSays("Take clear photos of the item, any damage, and accessories. Include the QR sticker in one photo if possible.")} />
            </div>

            <div className="mt-3 rounded-2xl border bg-[#FFFBEB] p-3 text-[12px] text-amber-900" style={{ borderColor: "#FDE68A" }}>
              <strong>{t.rentalDetail.depositFrozen}</strong>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  if (dispute) return;
                  void openDisputeRemote({ rentalId: booking.id, openedBy: auth.userId! }).then((d) => {
                    setDispute(d);
                    updateBooking(booking.id, { status: "disputed", disputeEvidenceDeadline: d.evidenceDeadline, paymentOnHold: true });
                    setBookings(loadRentalBookings());
                  });
                }}
                className="flex-1 rounded-2xl px-4 py-3 text-[13px] font-bold text-white disabled:opacity-60"
                style={{ backgroundColor: "#0D5C3A" }}
                disabled={Boolean(dispute)}
              >
                {dispute ? t.rentalDetail.disputeOpened : t.rentalDetail.startDispute}
              </button>
              <label
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl border bg-white px-4 py-3 text-[13px] font-semibold text-gray-700"
                style={{ borderColor: "#E8E6E0" }}
              >
                <Upload className="h-4 w-4" />
                {t.rentalDetail.addPhoto}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (!file || !dispute) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      const dataUrl = typeof reader.result === "string" ? reader.result : null;
                      if (!dataUrl) return;
                      const side = booking.role === "renter" ? "renter" : "owner";
                      void addEvidenceRemote({ dispute, side, dataUrl }).then(setDispute);
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
            </div>

            {dispute ? (
              <div className="mt-4">
                <p className="text-[12px] font-semibold uppercase tracking-wide text-gray-400">{t.rentalDetail.evidence}</p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {[...(dispute.renterEvidence ?? []), ...(dispute.ownerEvidence ?? [])].slice(0, 6).map((src, idx) => (
                    <img key={idx} src={src} alt="" className="h-20 w-full rounded-xl object-cover" />
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-gray-400">{t.rentalDetail.visibleToBoth}</p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
