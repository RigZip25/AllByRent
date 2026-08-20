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
  Mail,
} from "lucide-react";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useAuth } from "../../hooks/AuthProvider";
import {
  loadRentalBookings,
  updateBooking,
  getRenterPickupLocation,
  type RentalBooking,
} from "../../lib/rentalsStorage";
import { isBorrowedByViewer } from "../../lib/borrowedItemGuard";
import {
  confirmHandoffSide,
  handoffTimelineState,
  maybeAutoConfirmContactlessReturn,
  resolveBookingQrTarget,
} from "../../lib/rentalHandoff";
import { isValidHandoffCoords } from "../../lib/handoffPresence";
import type { MediaRef } from "../../lib/mediaStore";
import { hasLocalReview, submitReviewRemote } from "../../lib/reviewsStorage";
import { ReviewPromptModal } from "../../components/reviews/ReviewPromptModal";
import { mascotSays } from "../../lib/brand";
import {
  acknowledgeDisputeResolutionRemote,
  addEvidenceRemote,
  disputeSupportMailto,
  fetchDisputeForRentalRemote,
  isDisputeActive,
  moderateDisputeText,
  openDisputeRemote,
  proposeDisputeResolutionRemote,
  submitDisputeForReviewRemote,
  type Dispute,
  type DisputeReasonCode,
  type DisputeResolutionOutcome,
} from "../../lib/disputesStorage";
import { QrScanPanel, type QrScanPhase } from "../../components/rentals/QrScanPanel";
import { RentalAgreementStatusCard } from "../../components/rentals/RentalAgreementPanel";
import { agreementFullySigned } from "../../lib/rentalAgreement";
import { ShowListingQrOverlay } from "../../components/listings/ShowListingQrOverlay";
import { RentanoTip } from "../../components/RentanoTip";
import { RentalPriceBreakdownView } from "../../components/rentals/RentalPriceBreakdown";
import { DepositHoldActions } from "../../components/payments/DepositHoldActions";
import { useMediaUrl } from "../../lib/useMediaUrl";
import {
  computeRentalPriceBreakdown,
  formatUsd,
  type RentalPriceBreakdown,
} from "../../lib/rentalPricing";
import { PeerChatPanel } from "../../components/PeerChatPanel";
import { useMessages } from "../../lib/i18n/react";
import {
  assessCancelRefund,
  cancelAcceptedBooking,
  canCancelAcceptedBooking,
  cancelSupportMailto,
} from "../../lib/rentalCancelActions";
import { assessLateReturnFee, formatLateReturnPolicySummary } from "../../lib/lateReturnFee";
import { canMarkNoShow } from "../../lib/rentalTiming";
import { completeHostNoShow } from "../../lib/rentalNoShowActions";
import { listingNoShowFeeUsd } from "../../lib/noShowPolicy";
import { RentalLifecyclePolicySheet } from "../../components/rentals/RentalLifecyclePolicySheet";
import { formatMoney } from "../../lib/regionalDisplay";
import {
  bookingAllowsEarlyReturn,
  bookingAllowsExtension,
  canEarlyReturnBooking,
  canExtendRental,
} from "../../lib/rentalExtendReturn";
import { addDaysIso, todayIsoLocal } from "../../lib/availabilityBusy";
import { getHomeLocation, getPublishedListingById } from "../../lib/listingStorage";
import {
  listingRequiresCoiHostConfirm,
  listingRequiresInsuranceProof,
  listingUsesAgentToOwnerInsuranceProof,
  listingUsesStructuredCoi,
} from "../../lib/listingInsurance";
import {
  listingProRentersOnly,
  listingRequiresCdl,
  listingRequiresPhysicalDamage,
} from "../../lib/listingRentRules";
import {
  listingRequiresBoaterLicense,
  listingRequiresDroneCert,
  listingRequiresDriverRecordAttestation,
  listingRequiresPfdPolicy,
  listingRequiresCateringSanitize,
  listingRequiresHelmetLockPolicy,
  listingRequiresKidsGuardianAttest,
  listingIsElectricMicromobility,
  listingRequiresOhvTerrainWaiver,
  listingRequiresMotorcycleEndorsement,
  listingRequiresPfdAttestation,
  listingRequiresKitInventory,
  listingRequiresLiabilityWaiver,
  listingRequiresOperatorCredential,
  listingRequiresPaCableStandInventory,
  listingRequiresStartIdGate,
  listingRequiresUscgSafetyKit,
  listingRequiresDataWipe,
  listingRequiresSafetyBriefing,
  listingRequiresHygieneChecklist,
  listingRequiresCostumeReturnCondition,
  listingRequiresCostumeHygiene,
} from "../../lib/categoryTrustRules";
import {
  isPreTripInspectionReady,
  isReturnInspectionReady,
  listingInspectionLayout,
  listingRequiredWheelCount,
  listingRequiresPreTripInspection,
} from "../../lib/preTripInspection";
import {
  assessFuelReturn,
  clampFuelLevelEighths,
  defaultFuelPolicySnapshot,
  formatFuelLevelLabel,
  formatFuelPolicySummary,
  FUEL_LEVEL_EIGHTHS,
  listingRequiresFuelTracking,
  listingTracksDef,
  type FuelLevelEighths,
} from "../../lib/rentalFuelPolicy";
import { isVehicleStartIdComplete } from "../../lib/vehicleStartIdCheck";
import {
  buildMacropointConsentPatch,
  MACROPOINT_INTERVAL_MS,
  recordVehicleMacropoint,
  shouldRecordIntervalMacropoint,
} from "../../lib/vehicleMacropoints";
import { VehicleStartIdGate } from "../../components/rentals/VehicleStartIdGate";
import { VehicleTrailPanel } from "../../components/rentals/VehicleTrailPanel";
import { PreTripInspectionPanel } from "../../components/rentals/PreTripInspectionPanel";
import { RentalConditionPhotos } from "../../components/rentals/RentalConditionPhotos";
import { RentalInvoicePanel } from "../../components/rentals/RentalInvoicePanel";
import { resolveRentalChatWindow } from "../../lib/rentalChatWindow";

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
  const [showItemQrOpen, setShowItemQrOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [disputeReason, setDisputeReason] = useState<DisputeReasonCode>("damage");
  const [disputeNotes, setDisputeNotes] = useState("");
  const [disputeError, setDisputeError] = useState<string | null>(null);
  const [disputeBusy, setDisputeBusy] = useState(false);
  const [bookings, setBookings] = useState<RentalBooking[]>(() => loadRentalBookings());
  const [chatOpen, setChatOpen] = useState(initialChatOpen);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [weatherCancelSelected, setWeatherCancelSelected] = useState(false);
  const [cancelBusy, setCancelBusy] = useState(false);
  const [policySheetOpen, setPolicySheetOpen] = useState(false);
  const [noShowBusy, setNoShowBusy] = useState(false);
  const [extendOpen, setExtendOpen] = useState(false);
  const [extendDate, setExtendDate] = useState("");
  const [extendBusy, setExtendBusy] = useState(false);
  const [extendError, setExtendError] = useState<string | null>(null);
  const [earlyReturnOpen, setEarlyReturnOpen] = useState(false);
  const [earlyReturnBusy, setEarlyReturnBusy] = useState(false);
  const [earlyReturnError, setEarlyReturnError] = useState<string | null>(null);
  const [odometerOpen, setOdometerOpen] = useState(false);
  const [odometerValue, setOdometerValue] = useState("");
  const [odometerError, setOdometerError] = useState<string | null>(null);
  const [fuelOpen, setFuelOpen] = useState(false);
  const [fuelLevel, setFuelLevel] = useState<FuelLevelEighths | "">("");
  const [defLevel, setDefLevel] = useState<FuelLevelEighths | "">("");
  const [prepaidFullTank, setPrepaidFullTank] = useState(false);
  const [pumpPrice, setPumpPrice] = useState("");
  const [fuelError, setFuelError] = useState<string | null>(null);
  const [pendingOdometerMiles, setPendingOdometerMiles] = useState<number | null>(null);
  const [pendingConfirmPin, setPendingConfirmPin] = useState<string | null>(null);
  const [pendingConditionPhoto, setPendingConditionPhoto] = useState<MediaRef | null>(null);
  const [batteryChargeBand, setBatteryChargeBand] = useState("");
  const [startIdOpen, setStartIdOpen] = useState(false);

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

  const publishedListing = useMemo(
    () => (booking?.listingId ? getPublishedListingById(booking.listingId) : null),
    [booking?.listingId],
  );
  const isVehicleRental = publishedListing?.category?.trim() === "Vehicles";
  const needsStartIdGate =
    publishedListing != null && listingRequiresStartIdGate(publishedListing);
  const needsPreTrip =
    publishedListing != null && listingRequiresPreTripInspection(publishedListing);
  const preTripWheelCount = useMemo(
    () =>
      publishedListing != null
        ? listingRequiredWheelCount(publishedListing)
        : 4,
    [publishedListing],
  );
  const preTripLayout = useMemo(
    () => listingInspectionLayout(publishedListing),
    [publishedListing],
  );
  const chatWindow = useMemo(
    () =>
      booking
        ? resolveRentalChatWindow({ booking, listing: publishedListing })
        : null,
    [booking, publishedListing],
  );
  const needsFuelTracking =
    publishedListing != null && listingRequiresFuelTracking(publishedListing);
  const tracksDef = publishedListing != null && listingTracksDef(publishedListing);
  const fuelPolicy =
    booking?.fuelPolicy ??
    (publishedListing ? defaultFuelPolicySnapshot(publishedListing) : null);
  const fuelPolicyLabel = formatFuelPolicySummary(fuelPolicy);
  const usesAgentInsurance =
    publishedListing != null && listingUsesAgentToOwnerInsuranceProof(publishedListing);
  const usesStructuredCoi =
    publishedListing != null && listingUsesStructuredCoi(publishedListing);
  const needsCoiHostConfirm =
    publishedListing != null && listingRequiresCoiHostConfirm(publishedListing);
  const needsDriverRecordAttestation =
    publishedListing != null && listingRequiresDriverRecordAttestation(publishedListing);
  const needsCdl = publishedListing != null && listingRequiresCdl(publishedListing);
  const needsOperatorCert =
    publishedListing != null && listingRequiresOperatorCredential(publishedListing);
  const needsBoaterLicense =
    publishedListing != null && listingRequiresBoaterLicense(publishedListing);
  const needsDroneCert =
    publishedListing != null && listingRequiresDroneCert(publishedListing);
  const needsSportsPfd =
    publishedListing != null && listingRequiresPfdPolicy(publishedListing);
  const needsCateringSanitize =
    publishedListing != null && listingRequiresCateringSanitize(publishedListing);
  const needsUscgSafety =
    publishedListing != null && listingRequiresUscgSafetyKit(publishedListing);
  const needsKitInventory =
    publishedListing != null && listingRequiresKitInventory(publishedListing);
  const needsLiabilityWaiver =
    publishedListing != null && listingRequiresLiabilityWaiver(publishedListing);
  const needsHelmetLock =
    publishedListing != null && listingRequiresHelmetLockPolicy(publishedListing);
  const needsKidsGuardian =
    publishedListing != null && listingRequiresKidsGuardianAttest(publishedListing);
  const needsMicromobilityCharge =
    publishedListing != null && listingIsElectricMicromobility(publishedListing);
  const needsOhvTerrainWaiver =
    publishedListing != null && listingRequiresOhvTerrainWaiver(publishedListing);
  const needsMotorcycleEndorsement =
    publishedListing != null && listingRequiresMotorcycleEndorsement(publishedListing);
  const needsPaddlePfd =
    publishedListing != null && listingRequiresPfdAttestation(publishedListing);
  const needsSafetyBriefing =
    publishedListing != null && listingRequiresSafetyBriefing(publishedListing);
  const needsHygiene =
    publishedListing != null && listingRequiresHygieneChecklist(publishedListing);
  const needsCostumeReturn =
    publishedListing != null && listingRequiresCostumeReturnCondition(publishedListing);
  const needsCostumeHygiene =
    publishedListing != null && listingRequiresCostumeHygiene(publishedListing);
  const needsDataWipe =
    publishedListing != null && listingRequiresDataWipe(publishedListing);
  const needsPaCableStand =
    publishedListing != null && listingRequiresPaCableStandInventory(publishedListing);
  const contactlessMode = booking?.fulfillmentMethod === "contactless";
  const qrTarget = useMemo(
    () => (booking ? resolveBookingQrTarget(booking) : { listingId: undefined, qrToken: undefined }),
    [booking],
  );
  const handoffCoords = useMemo(() => {
    if (!booking) return null;
    const stamped = { lat: booking.handoffLat ?? NaN, lng: booking.handoffLng ?? NaN };
    if (isValidHandoffCoords(stamped)) return stamped;
    if (booking.role === "host") {
      const home = getHomeLocation();
      if (home && isValidHandoffCoords(home)) return { lat: home.lat, lng: home.lng };
    }
    return null;
  }, [booking]);
  const resolvedContactlessInstructions = contactlessMode
    ? booking?.contactlessInstructions?.trim() ||
      publishedListing?.handoff?.contactlessInstructions?.trim() ||
      undefined
    : undefined;

  const insuranceMedia = useMediaUrl(booking?.insuranceProofMedia ?? null);
  const insuranceImageUrl = booking?.insuranceProofUrl || insuranceMedia.url;

  useEffect(() => {
    setChatOpen(initialChatOpen);
  }, [bookingId, initialChatOpen]);

  const canOpenNewDispute = Boolean(
    booking &&
      (booking.status === "active" ||
        booking.status === "overdue" ||
        booking.status === "completed") &&
      !isDisputeActive(dispute),
  );
  const showDisputeCard = Boolean(
    booking &&
      (canOpenNewDispute ||
        booking.status === "disputed" ||
        isDisputeActive(dispute) ||
        dispute?.status === "resolved"),
  );

  const refreshDispute = useCallback(() => {
    if (!booking) return;
    void fetchDisputeForRentalRemote(booking.id).then(setDispute);
  }, [booking]);

  useEffect(() => {
    refreshDispute();
  }, [refreshDispute]);

  const mode: "pickup" | "return" =
    booking?.status === "pending_checkin" ? "pickup" : "return";

  const overdueWarning =
    booking?.status === "overdue"
      ? (() => {
          const base = t.rentalDetail.overdueWarning;
          if (!booking.lateReturnFee?.enabled) return base;
          const assessment = assessLateReturnFee({
            policy: booking.lateReturnFee,
            returnDueAt: booking.returnDueAt,
            endDate: booking.endDate,
          });
          if (!assessment.pastGrace || assessment.feeCents <= 0) return base;
          return `${base} ${t.rentalDetail.lateFeeDueBanner(formatMoney(assessment.feeCents / 100))}`;
        })()
      : null;

  const latePolicySummary = useMemo(
    () =>
      booking?.lateReturnFee
        ? formatLateReturnPolicySummary(booking.lateReturnFee, formatMoney)
        : publishedListing
          ? formatLateReturnPolicySummary(
              {
                enabled: Boolean(publishedListing.handoff.lateReturnFeeEnabled),
                graceMinutes: publishedListing.handoff.lateReturnGraceMinutes ?? 30,
                flatFeeUsd: publishedListing.handoff.lateReturnFlatFeeUsd ?? "20",
                perHourFeeUsd: publishedListing.handoff.lateReturnPerHourFeeUsd ?? "15",
              },
              formatMoney,
            )
          : null,
    [booking?.lateReturnFee, publishedListing],
  );

  const noShowFeeLabel = useMemo(() => {
    const fee = listingNoShowFeeUsd(publishedListing);
    return fee != null ? t.rentalCard.markNoShowFeeNote(formatMoney(fee)) : null;
  }, [publishedListing, t.rentalCard]);

  const hostCanMarkNoShow = Boolean(
    booking &&
      booking.role === "host" &&
      !booking.noShowMarkedAt &&
      booking.pickupScheduledAt &&
      canMarkNoShow(booking.pickupScheduledAt) &&
      (booking.status === "no_show" ||
        booking.status === "pending_checkin" ||
        booking.status === "upcoming"),
  );

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

  useEffect(() => {
    if (!booking) return;
    void maybeAutoConfirmContactlessReturn(booking).then((next) => {
      if (next) setBookings(loadRentalBookings());
    });
  }, [
    booking?.id,
    booking?.renterReturnedAt,
    booking?.hostAcceptedReturnAt,
    booking?.fulfillmentMethod,
  ]);

  // Coarse macropoints while an active vehicle rental is open on the renter device.
  useEffect(() => {
    if (!booking || !isVehicleRental) return;
    if (booking.role !== "renter") return;
    if (booking.status !== "active" && booking.status !== "overdue") return;
    if (!booking.macropointConsentAt) return;

    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      const current = loadRentalBookings().find((b) => b.id === booking.id);
      if (!current || !shouldRecordIntervalMacropoint(current)) return;
      void recordVehicleMacropoint({ bookingId: booking.id, source: "interval" }).then((result) => {
        if (!cancelled && result.ok) setBookings(loadRentalBookings());
      });
    };

    tick();
    const id = window.setInterval(tick, Math.min(MACROPOINT_INTERVAL_MS, 60_000));
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [
    booking?.id,
    booking?.role,
    booking?.status,
    booking?.macropointConsentAt,
    isVehicleRental,
  ]);

  const openScanner = () => {
    setNotice(null);
    if (mode === "pickup" && !agreementFullySigned(booking?.rentalAgreement)) {
      setNotice(t.rentalAgreement.blockHandoff);
      return;
    }
    const needsInsurance =
      mode === "pickup" &&
      publishedListing != null &&
      listingRequiresInsuranceProof(publishedListing) &&
      !usesAgentInsurance &&
      !booking?.insuranceProofMedia &&
      !booking?.insuranceProofUrl;
    if (needsInsurance && booking?.role === "renter") {
      setNotice(t.rentalDetail.insuranceUnlockBlocked);
      return;
    }
    if (
      mode === "pickup" &&
      usesAgentInsurance &&
      !booking?.insuranceProofReceivedByHost
    ) {
      setNotice(
        booking?.role === "host"
          ? t.rentalDetail.agentProofPending
          : t.rentalDetail.agentProofPending,
      );
      return;
    }
    if (
      mode === "pickup" &&
      needsCoiHostConfirm &&
      !usesAgentInsurance &&
      !booking?.insuranceProofReceivedByHost
    ) {
      setNotice(
        booking?.role === "host"
          ? t.rentalDetail.coiProofPendingHost
          : t.rentalDetail.coiProofPending,
      );
      return;
    }
    if (
      mode === "pickup" &&
      needsDriverRecordAttestation &&
      (!booking?.driverLicenseValidAttested || !booking?.driverRecordSoftAttested) &&
      booking?.role === "renter"
    ) {
      setNotice(t.rentalDetail.driverRecordUnlockBlocked);
      return;
    }
    if (
      mode === "pickup" &&
      publishedListing != null &&
      listingRequiresPhysicalDamage(publishedListing) &&
      !usesAgentInsurance &&
      !booking?.physicalDamageAttested &&
      booking?.role === "renter"
    ) {
      setNotice(t.rentalDetail.insuranceUnlockBlocked);
      return;
    }
    if (
      mode === "pickup" &&
      publishedListing != null &&
      listingProRentersOnly(publishedListing) &&
      !booking?.proRenterAttested &&
      booking?.role === "renter"
    ) {
      setNotice(t.rentalDetail.insuranceUnlockBlocked);
      return;
    }
    if (
      mode === "pickup" &&
      needsCdl &&
      (!booking?.cdlAttested || !booking?.cdlMedia) &&
      booking?.role === "renter"
    ) {
      setNotice(t.rentalDetail.cdlUnlockBlocked);
      return;
    }
    if (
      mode === "pickup" &&
      needsOperatorCert &&
      (!booking?.operatorCertAttested || !booking?.operatorCertMedia) &&
      booking?.role === "renter"
    ) {
      setNotice(t.rentalDetail.operatorCertUnlockBlocked);
      return;
    }
    if (
      mode === "pickup" &&
      needsBoaterLicense &&
      (!booking?.boaterLicenseAttested || !booking?.boaterLicenseMedia) &&
      booking?.role === "renter"
    ) {
      setNotice(t.rentalDetail.boaterLicenseUnlockBlocked);
      return;
    }
    if (
      mode === "pickup" &&
      needsDroneCert &&
      (!booking?.droneCertAttested || !booking?.droneRemoteIdAck) &&
      booking?.role === "renter"
    ) {
      setNotice(
        !booking?.droneCertAttested
          ? t.rentalDetail.droneCertUnlockBlocked
          : t.rentalDetail.droneRemoteIdUnlockBlocked,
      );
      return;
    }
    if (
      mode === "pickup" &&
      needsSportsPfd &&
      !booking?.sportsPfdAck &&
      booking?.role === "renter"
    ) {
      setNotice(t.rentalDetail.pfdUnlockBlocked);
      return;
    }
    if (
      mode === "pickup" &&
      needsCateringSanitize &&
      !booking?.cateringSanitizeAck &&
      booking?.role === "renter"
    ) {
      setNotice(t.rentalDetail.cateringSanitizeUnlockBlocked);
      return;
    }
    if (
      mode === "pickup" &&
      needsUscgSafety &&
      !booking?.uscgSafetyAck &&
      booking?.role === "renter"
    ) {
      setNotice(t.rentalDetail.uscgUnlockBlocked);
      return;
    }
    if (
      mode === "pickup" &&
      needsKitInventory &&
      !booking?.kitInventoryAck &&
      booking?.role === "renter"
    ) {
      setNotice(t.rentalDetail.kitInventoryUnlockBlocked);
      return;
    }
    if (
      mode === "pickup" &&
      needsLiabilityWaiver &&
      !booking?.liabilityWaiverAttested &&
      booking?.role === "renter"
    ) {
      setNotice(t.rentalDetail.liabilityWaiverUnlockBlocked);
      return;
    }
    if (
      mode === "pickup" &&
      needsHelmetLock &&
      !booking?.helmetLockAck &&
      booking?.role === "renter"
    ) {
      setNotice(t.rentalDetail.helmetLockUnlockBlocked);
      return;
    }
    if (
      mode === "pickup" &&
      needsKidsGuardian &&
      !booking?.kidsGuardianAttested &&
      booking?.role === "renter"
    ) {
      setNotice(t.rentalDetail.kidsGuardianUnlockBlocked);
      return;
    }
    if (
      mode === "pickup" &&
      needsOhvTerrainWaiver &&
      !booking?.ohvTerrainWaiverAttested &&
      booking?.role === "renter"
    ) {
      setNotice(t.rentalDetail.ohvTerrainUnlockBlocked);
      return;
    }
    if (
      mode === "pickup" &&
      needsMotorcycleEndorsement &&
      !booking?.motorcycleEndorsementAttested &&
      booking?.role === "renter"
    ) {
      setNotice(t.rentalDetail.motorcycleEndorsementUnlockBlocked);
      return;
    }
    if (
      mode === "pickup" &&
      needsPaddlePfd &&
      !booking?.paddlePfdAck &&
      booking?.role === "renter"
    ) {
      setNotice(t.rentalDetail.paddlePfdUnlockBlocked);
      return;
    }
    if (
      mode === "pickup" &&
      needsSafetyBriefing &&
      !booking?.safetyBriefingAck &&
      booking?.role === "renter"
    ) {
      setNotice(t.rentalDetail.safetyBriefingUnlockBlocked);
      return;
    }
    if (
      mode === "pickup" &&
      needsHygiene &&
      !booking?.hygieneAck &&
      booking?.role === "renter"
    ) {
      setNotice(t.rentalDetail.hygieneUnlockBlocked);
      return;
    }
    if (
      mode === "pickup" &&
      needsCostumeReturn &&
      !booking?.costumeReturnConditionAck &&
      booking?.role === "renter"
    ) {
      setNotice(t.rentalDetail.costumeReturnUnlockBlocked);
      return;
    }
    if (
      mode === "pickup" &&
      needsCostumeHygiene &&
      !booking?.costumeHygieneAttested &&
      booking?.role === "renter"
    ) {
      setNotice(t.rentalDetail.costumeHygieneUnlockBlocked);
      return;
    }
    if (
      mode === "pickup" &&
      needsDataWipe &&
      !booking?.dataWipeAttested &&
      booking?.role === "renter"
    ) {
      setNotice(t.rentalDetail.dataWipeUnlockBlocked);
      return;
    }
    if (
      mode === "pickup" &&
      needsPaCableStand &&
      !booking?.paCableStandAck &&
      booking?.role === "renter"
    ) {
      setNotice(t.rentalDetail.paCableStandUnlockBlocked);
      return;
    }
    if (
      mode === "pickup" &&
      needsPreTrip &&
      !isPreTripInspectionReady(booking?.preTripInspection, preTripWheelCount, preTripLayout)
    ) {
      setNotice(t.rentalDetail.preTripUnlockBlocked);
      return;
    }
    if (
      mode === "return" &&
      needsPreTrip &&
      !isReturnInspectionReady(booking?.returnInspection, preTripWheelCount, preTripLayout)
    ) {
      setNotice(t.rentalDetail.preTripUnlockBlocked);
      return;
    }
    if (
      needsStartIdGate &&
      mode === "pickup" &&
      booking?.role === "renter" &&
      !isVehicleStartIdComplete(booking)
    ) {
      setStartIdOpen(true);
      return;
    }
    setScanPhase("camera");
    setScanOpen(true);
  };

  const closeScanner = () => {
    setScanOpen(false);
    setScanPhase("camera");
  };

  const runConfirm = useCallback(
    (
      pin: string,
      extras?: {
        odometerMiles?: number;
        conditionPhoto?: MediaRef | null;
        fuelLevelEighths?: number;
        defLevelEighths?: number;
        prepaidFullTank?: boolean;
        pumpPricePerGallonUsd?: number;
      },
    ) => {
      if (!booking) return;
      const odometerMiles = extras?.odometerMiles;
      const conditionPhoto = extras?.conditionPhoto;
      const fuelLevelEighths = extras?.fuelLevelEighths;
      const defLevelEighths = extras?.defLevelEighths;
      const needsOdometer =
        isVehicleRental &&
        (mode === "pickup"
          ? booking.startOdometerMiles == null && odometerMiles == null
          : booking.returnOdometerMiles == null && odometerMiles == null);
      if (needsOdometer) {
        setPendingConfirmPin(pin);
        setPendingConditionPhoto(conditionPhoto ?? null);
        setPendingOdometerMiles(null);
        setOdometerValue("");
        setOdometerError(null);
        setOdometerOpen(true);
        return;
      }

      const needsFuel =
        needsFuelTracking &&
        (mode === "pickup"
          ? booking.startFuelLevelEighths == null && fuelLevelEighths == null
          : booking.returnFuelLevelEighths == null && fuelLevelEighths == null);
      if (needsFuel) {
        setPendingConfirmPin(pin);
        setPendingConditionPhoto(conditionPhoto ?? null);
        setPendingOdometerMiles(odometerMiles ?? null);
        setFuelLevel("");
        setDefLevel("");
        setPrepaidFullTank(Boolean(booking.prepaidFullTank));
        setPumpPrice("");
        setFuelError(null);
        setFuelOpen(true);
        return;
      }

      void (async () => {
        let fuelTopUpEstimateCents: number | undefined;
        let fuelShortfallFeeCents: number | undefined;
        let fuelClaimStatus: RentalBooking["fuelClaimStatus"] | undefined;
        let fuelClaimNote: string | undefined;
        const resolvedFuel =
          fuelLevelEighths ??
          (mode === "pickup" ? booking.startFuelLevelEighths : booking.returnFuelLevelEighths);
        const resolvedDef =
          defLevelEighths ??
          (mode === "pickup" ? booking.startDefLevelEighths : booking.returnDefLevelEighths);

        if (needsFuelTracking && mode === "return" && resolvedFuel != null) {
          const assessment = assessFuelReturn({
            policy: fuelPolicy,
            startFuelLevelEighths: booking.startFuelLevelEighths,
            returnFuelLevelEighths: resolvedFuel,
            startDefLevelEighths: booking.startDefLevelEighths,
            returnDefLevelEighths: resolvedDef,
            prepaidFullTank: extras?.prepaidFullTank ?? booking.prepaidFullTank,
            pumpPricePerGallonUsd: extras?.pumpPricePerGallonUsd,
          });
          if (assessment.claimStatus === "flagged") {
            fuelTopUpEstimateCents = assessment.fuelCostEstimateCents ?? undefined;
            fuelShortfallFeeCents = assessment.missingFeeCents;
            fuelClaimStatus = "flagged";
            fuelClaimNote = assessment.summaryEn;
          } else {
            fuelClaimStatus = "none";
          }
        }

        const result = await confirmHandoffSide({
          bookingId: booking.id,
          role: booking.role,
          stage: mode,
          pin,
          odometerMiles,
          conditionPhoto,
          fuelLevelEighths: resolvedFuel ?? undefined,
          defLevelEighths: tracksDef ? resolvedDef ?? undefined : undefined,
          prepaidFullTank: extras?.prepaidFullTank,
          pumpPricePerGallonUsd: extras?.pumpPricePerGallonUsd,
          fuelTopUpEstimateCents,
          fuelShortfallFeeCents,
          fuelClaimStatus,
          fuelClaimNote,
        });
        setBookings(loadRentalBookings());
        if (!result.ok) {
          setNotice(result.reason);
          return;
        }
        if (
          isVehicleRental &&
          mode === "pickup" &&
          booking.role === "renter" &&
          result.ok
        ) {
          if (!booking.macropointConsentAt) {
            updateBooking(booking.id, buildMacropointConsentPatch());
          }
          void recordVehicleMacropoint({
            bookingId: booking.id,
            source: "start",
            requireConsent: false,
          }).then(() => setBookings(loadRentalBookings()));
        }
        if (isVehicleRental && mode === "return" && booking.role === "renter") {
          void recordVehicleMacropoint({
            bookingId: booking.id,
            source: "return",
            requireConsent: false,
          }).then(() => setBookings(loadRentalBookings()));
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
        if (fuelClaimNote && mode === "return") {
          setNotice(t.rentalDetail.fuelShortfallFlagged(fuelClaimNote));
        } else {
          setNotice(
            mode === "pickup" ? t.rentalDetail.pickupConfirmed : t.rentalDetail.returnConfirmed,
          );
        }
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
    [
      booking,
      mode,
      t.rentalDetail,
      auth.userId,
      isVehicleRental,
      needsFuelTracking,
      tracksDef,
      fuelPolicy,
    ],
  );

  /** QrScanPanel passes optional condition photo as the second arg. */
  const confirm = useCallback(
    (pin: string, conditionPhoto?: MediaRef | null) => {
      runConfirm(pin, { conditionPhoto });
    },
    [runConfirm],
  );

  const submitOdometerAndConfirm = useCallback(() => {
    const raw = odometerValue.trim().replace(/,/g, "");
    const n = Number.parseFloat(raw);
    if (!raw || !Number.isFinite(n) || n < 0) {
      setOdometerError(t.rentalDetail.odometerRequired);
      return;
    }
    if (mode === "return" && booking?.startOdometerMiles != null && n < booking.startOdometerMiles) {
      setOdometerError(t.rentalDetail.odometerRequired);
      return;
    }
    const pin = pendingConfirmPin;
    if (!pin) {
      setOdometerOpen(false);
      return;
    }
    const photo = pendingConditionPhoto;
    setOdometerOpen(false);
    runConfirm(pin, {
      odometerMiles: Math.round(n),
      conditionPhoto: photo,
    });
  }, [
    odometerValue,
    pendingConfirmPin,
    pendingConditionPhoto,
    runConfirm,
    t.rentalDetail.odometerRequired,
    mode,
    booking?.startOdometerMiles,
  ]);

  const submitFuelAndConfirm = useCallback(() => {
    const fuel = clampFuelLevelEighths(fuelLevel);
    if (fuel == null) {
      setFuelError(t.rentalDetail.fuelLevelRequired);
      return;
    }
    let def: number | undefined;
    if (tracksDef) {
      const d = clampFuelLevelEighths(defLevel);
      if (d == null) {
        setFuelError(t.rentalDetail.defLevelRequired);
        return;
      }
      def = d;
    }
    const pin = pendingConfirmPin;
    if (!pin) {
      setFuelOpen(false);
      return;
    }
    const pumpRaw = pumpPrice.trim().replace(/^\$/, "");
    const pumpN = pumpRaw ? Number.parseFloat(pumpRaw) : NaN;
    const photo = pendingConditionPhoto;
    setFuelOpen(false);
    setPendingConfirmPin(null);
    setPendingConditionPhoto(null);
    const od = pendingOdometerMiles;
    setPendingOdometerMiles(null);
    runConfirm(pin, {
      odometerMiles: od ?? undefined,
      conditionPhoto: photo,
      fuelLevelEighths: fuel,
      defLevelEighths: def,
      prepaidFullTank: prepaidFullTank || undefined,
      pumpPricePerGallonUsd:
        Number.isFinite(pumpN) && pumpN > 0 ? pumpN : undefined,
    });
  }, [
    fuelLevel,
    defLevel,
    tracksDef,
    pendingConfirmPin,
    pendingConditionPhoto,
    pendingOdometerMiles,
    prepaidFullTank,
    pumpPrice,
    runConfirm,
    t.rentalDetail.fuelLevelRequired,
    t.rentalDetail.defLevelRequired,
  ]);

  const timeLeftLabel = useMemo(() => {
    if (!dispute?.evidenceDeadline) return null;
    const ms = new Date(dispute.evidenceDeadline).getTime() - Date.now();
    if (Number.isNaN(ms)) return null;
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    return `${h}h ${m}m`;
  }, [dispute?.evidenceDeadline]);

  const cancelAssessment = useMemo(() => {
    if (!booking) return null;
    return assessCancelRefund({
      booking,
      role: booking.role,
      weatherCancel: weatherCancelSelected,
    });
  }, [booking, weatherCancelSelected]);

  const canCancelHere = Boolean(booking && canCancelAcceptedBooking(booking));
  const showExtend =
    Boolean(booking?.role === "renter" && booking && bookingAllowsExtension(booking.status));
  const showEarlyReturn =
    Boolean(booking?.role === "renter" && booking && bookingAllowsEarlyReturn(booking.status));

  const cancelRefundPreview = useMemo(() => {
    if (!booking || !cancelAssessment) return "";
    if (booking.role === "host") return t.rentalDetail.cancelRefundPreviewHostFull;
    if (
      weatherCancelSelected &&
      booking.weatherCancelAck &&
      cancelAssessment.tier === "full"
    ) {
      return t.rentalDetail.weatherCancelRefundPreview;
    }
    if (cancelAssessment.tier === "full") return t.rentalDetail.cancelRefundPreviewFull;
    if (cancelAssessment.tier === "partial") {
      return t.rentalDetail.cancelRefundPreviewPartial(cancelAssessment.refundPercent);
    }
    return t.rentalDetail.cancelRefundPreviewNone;
  }, [booking, cancelAssessment, t.rentalDetail, weatherCancelSelected]);

  useEffect(() => {
    if (!booking) return;
    setExtendDate(addDaysIso(booking.endDate, 1));
  }, [booking?.id, booking?.endDate]);

  const handleExtend = useCallback(async () => {
    if (!booking) return;
    setExtendBusy(true);
    setExtendError(null);
    try {
      const listing = booking.listingId
        ? getPublishedListingById(booking.listingId)
        : null;
      const result = await canExtendRental({
        booking,
        newEndDate: extendDate,
        fallbackBlocked: listing?.blockedDates ?? [],
      });
      if (!result.ok) {
        setExtendError(
          result.reason === "busy"
            ? t.rentalDetail.extendUnavailable
            : t.rentalDetail.extendInvalid,
        );
        return;
      }
      const dueAt = new Date(`${result.newEndDate}T23:59:59`).toISOString();
      setBookings(
        updateBooking(booking.id, {
          endDate: result.newEndDate,
          returnDueAt: dueAt,
          status: booking.status === "overdue" ? "active" : booking.status,
        }),
      );
      setExtendOpen(false);
      setNotice(t.rentalDetail.extendSuccess(result.newEndDate));
    } finally {
      setExtendBusy(false);
    }
  }, [booking, extendDate, t.rentalDetail]);

  const handleEarlyReturn = useCallback(() => {
    if (!booking) return;
    setEarlyReturnBusy(true);
    setEarlyReturnError(null);
    try {
      const result = canEarlyReturnBooking({
        booking,
        newEndDate: todayIsoLocal(),
      });
      if (!result.ok) {
        setEarlyReturnError(t.rentalDetail.earlyReturnInvalid);
        return;
      }
      const dueAt = new Date(`${result.newEndDate}T23:59:59`).toISOString();
      setBookings(
        updateBooking(booking.id, {
          endDate: result.newEndDate,
          returnDueAt: dueAt,
          status: booking.status === "overdue" ? "active" : booking.status,
        }),
      );
      setEarlyReturnOpen(false);
      setNotice(t.rentalDetail.earlyReturnSuccess(result.newEndDate));
    } finally {
      setEarlyReturnBusy(false);
    }
  }, [booking, t.rentalDetail]);

  const handleConfirmCancel = useCallback(async () => {
    if (!booking || !auth.userId) return;
    setCancelBusy(true);
    try {
      const result = await cancelAcceptedBooking({
        booking,
        actorUserId: auth.userId,
        role: booking.role,
        cancelReason: cancelReason.trim() || undefined,
        weatherCancel: weatherCancelSelected,
      });
      setBookings(loadRentalBookings());
      setCancelConfirmOpen(false);
      if (!result.ok) {
        setNotice(result.reason ?? t.rentalDetail.cancelNotAllowed);
        return;
      }
      const refundNote =
        result.refundStatus === "released"
          ? t.rentalDetail.cancelRefundReleased
          : result.refundStatus === "refund_submitted" || result.refundStatus === "processing"
            ? result.assessment.refundPercent >= 100
              ? t.rentalDetail.cancelRefundFullProcessing
              : t.rentalDetail.cancelRefundPartialProcessing(result.assessment.refundPercent)
            : result.refundStatus === "none"
              ? t.rentalDetail.cancelRefundNone
              : t.rentalDetail.cancelRefundContactSupport;
      setNotice(`${t.rentalDetail.cancelDoneTitle}. ${refundNote}`);
    } finally {
      setCancelBusy(false);
    }
  }, [auth.userId, booking, cancelReason, t.rentalDetail, weatherCancelSelected]);

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
        {showDisputeCard ? (
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-bold text-gray-900">
                  {dispute
                    ? dispute.status === "resolved"
                      ? t.rentalDetail.disputeStatusResolved
                      : dispute.status === "under_review"
                        ? t.rentalDetail.disputeStatusUnderReview
                        : t.rentalDetail.disputeStatusOpen
                    : t.rentalDetail.openDisputeTitle}
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-gray-600">
                  {dispute?.status === "resolved"
                    ? t.rentalDetail.resolvedCalm(
                        dispute.resolutionOutcome === "favor_renter"
                          ? t.rentalDetail.outcomeFavorRenter
                          : dispute.resolutionOutcome === "favor_host"
                            ? t.rentalDetail.outcomeFavorHost
                            : dispute.resolutionOutcome === "split"
                              ? t.rentalDetail.outcomeSplit
                              : t.rentalDetail.outcomeWithdrawn,
                      )
                    : dispute?.status === "under_review"
                      ? t.rentalDetail.underReviewCalm
                      : t.rentalDetail.openDisputeBody}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setDisputeError(null);
                    refreshDispute();
                    setDisputeOpen(true);
                  }}
                  className="mt-3 w-full rounded-xl border py-2.5 text-[14px] font-semibold"
                  style={{ borderColor: "#FDE68A", backgroundColor: "#FFFBEB", color: "#92400E" }}
                >
                  {dispute
                    ? dispute.status === "resolved"
                      ? t.rentalDetail.viewDispute
                      : t.rentalDetail.continueDispute
                    : t.rentalDetail.startDispute}
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

        {booking?.role === "renter" &&
        booking.listingId &&
        isBorrowedByViewer({
          listingId: booking.listingId,
          viewerId: auth.userId,
          bookings: booking ? [booking] : undefined,
        }) ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {t.rentalDetail.cannotRelistBorrowed}
          </div>
        ) : null}

        {showExtend || showEarlyReturn ? (
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <p className="text-[14px] font-bold text-gray-900">{t.rentalDetail.datesAdjustTitle}</p>
            <p className="text-[13px] leading-relaxed text-gray-600">
              {t.rentalDetail.datesAdjustBody}
            </p>
            {showExtend ? (
              <div>
                {!extendOpen ? (
                  <button
                    type="button"
                    onClick={() => {
                      setExtendOpen(true);
                      setExtendError(null);
                    }}
                    className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5 text-[13px] font-bold text-primary"
                  >
                    {t.rentalDetail.extendBooking}
                  </button>
                ) : (
                  <div className="mt-1 space-y-2 rounded-xl border border-border bg-muted/40 p-3">
                    <label className="block text-xs font-semibold text-gray-700">
                      {t.rentalDetail.extendNewEnd}
                      <input
                        type="date"
                        className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                        min={addDaysIso(booking!.endDate, 1)}
                        value={extendDate}
                        onChange={(e) => setExtendDate(e.target.value)}
                      />
                    </label>
                    {extendError ? (
                      <p className="text-xs font-semibold text-red-600">{extendError}</p>
                    ) : null}
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={extendBusy}
                        onClick={() => void handleExtend()}
                        className="rounded-xl bg-primary px-4 py-2.5 text-[13px] font-bold text-white disabled:opacity-60"
                      >
                        {extendBusy ? t.rentalDetail.extendChecking : t.rentalDetail.extendConfirm}
                      </button>
                      <button
                        type="button"
                        disabled={extendBusy}
                        onClick={() => setExtendOpen(false)}
                        className="rounded-xl border border-border bg-white px-4 py-2.5 text-[13px] font-bold text-gray-700"
                      >
                        {t.rentalDetail.close}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
            {showEarlyReturn ? (
              <div>
                {!earlyReturnOpen ? (
                  <button
                    type="button"
                    onClick={() => {
                      setEarlyReturnOpen(true);
                      setEarlyReturnError(null);
                    }}
                    className="rounded-xl border border-border bg-white px-4 py-2.5 text-[13px] font-bold text-gray-800"
                  >
                    {t.rentalDetail.earlyReturn}
                  </button>
                ) : (
                  <div className="mt-1 space-y-2 rounded-xl border border-amber-100 bg-amber-50/70 p-3">
                    <p className="text-[13px] text-amber-950">{t.rentalDetail.earlyReturnConfirmBody}</p>
                    {earlyReturnError ? (
                      <p className="text-xs font-semibold text-red-600">{earlyReturnError}</p>
                    ) : null}
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={earlyReturnBusy}
                        onClick={() => handleEarlyReturn()}
                        className="rounded-xl bg-amber-800 px-4 py-2.5 text-[13px] font-bold text-white disabled:opacity-60"
                      >
                        {earlyReturnBusy
                          ? t.rentalDetail.earlyReturnWorking
                          : t.rentalDetail.earlyReturnConfirm}
                      </button>
                      <button
                        type="button"
                        disabled={earlyReturnBusy}
                        onClick={() => setEarlyReturnOpen(false)}
                        className="rounded-xl border border-border bg-white px-4 py-2.5 text-[13px] font-bold text-gray-700"
                      >
                        {t.rentalDetail.close}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        ) : null}

        {canCancelHere ? (
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-[14px] font-bold text-gray-900">{t.rentalDetail.cancelBooking}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-gray-600">{cancelRefundPreview}</p>
            <button
              type="button"
              className="mt-2 text-[13px] font-semibold text-primary underline"
              onClick={() => setPolicySheetOpen(true)}
            >
              {t.booking.policyLearnMore}
            </button>
            {!cancelConfirmOpen ? (
              <button
                type="button"
                onClick={() => setCancelConfirmOpen(true)}
                className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-[13px] font-bold text-red-800"
              >
                {t.rentalDetail.cancelBooking}
              </button>
            ) : (
              <div className="mt-3 space-y-3 rounded-xl border border-red-100 bg-red-50/60 p-3">
                <p className="text-[13px] font-semibold text-red-900">
                  {t.rentalDetail.cancelBookingConfirmTitle}
                </p>
                <p className="text-[12px] leading-relaxed text-red-900/80">
                  {t.rentalDetail.cancelBookingConfirmBody(cancelRefundPreview)}
                </p>
                {booking?.weatherCancelAck &&
                booking.weatherCancelPolicySnapshot &&
                booking.weatherCancelPolicySnapshot !== "not_outdoor" ? (
                  <label className="mt-3 flex items-start gap-2 text-[12px] text-gray-800">
                    <input
                      type="checkbox"
                      className="mt-0.5"
                      checked={weatherCancelSelected}
                      onChange={(e) => setWeatherCancelSelected(e.target.checked)}
                    />
                    <span>{t.rentalDetail.weatherCancelToggle}</span>
                  </label>
                ) : null}
                <label className="block text-[12px] font-semibold text-red-900">
                  {t.rentalDetail.cancelReasonLabel}
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder={t.rentalDetail.cancelReasonPlaceholder}
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-[13px] font-normal text-gray-900"
                  />
                </label>
                {booking?.role === "host" ? (
                  <p className="text-[11px] text-red-900/70">{t.rentalDetail.hostReliabilityNote}</p>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={cancelBusy}
                    onClick={() => void handleConfirmCancel()}
                    className="rounded-xl bg-red-700 px-4 py-2.5 text-[13px] font-bold text-white disabled:opacity-60"
                  >
                    {cancelBusy ? t.rentalCard.cancelling : t.rentalDetail.cancelBookingConfirmCta}
                  </button>
                  <button
                    type="button"
                    disabled={cancelBusy}
                    onClick={() => setCancelConfirmOpen(false)}
                    className="rounded-xl border border-border bg-white px-4 py-2.5 text-[13px] font-bold text-gray-700"
                  >
                    {t.rentalDetail.close}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {hostCanMarkNoShow && booking ? (
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
            <p className="text-[14px] font-bold text-orange-950">{t.rentalCard.markNoShow}</p>
            <p className="mt-1 text-[13px] text-orange-900/90">{t.rentalCard.markNoShowConfirm}</p>
            <button
              type="button"
              disabled={noShowBusy || !auth.userId}
              onClick={() => {
                if (!auth.userId || !booking) return;
                setNoShowBusy(true);
                void completeHostNoShow({
                  booking,
                  actorUserId: auth.userId,
                })
                  .then(() => setBookings(loadRentalBookings()))
                  .finally(() => setNoShowBusy(false));
              }}
              className="mt-3 rounded-xl bg-orange-800 px-4 py-2.5 text-[13px] font-bold text-white disabled:opacity-60"
            >
              {noShowBusy ? t.rentalCard.cancelling : t.rentalCard.markNoShow}
            </button>
          </div>
        ) : null}

        <RentalLifecyclePolicySheet
          open={policySheetOpen}
          onOpenChange={setPolicySheetOpen}
          lateSummary={latePolicySummary}
          noShowFeeLabel={noShowFeeLabel}
        />

        {booking?.status === "cancelled" && booking.cancelRefundStatus === "contact_support" ? (
          <div className="rounded-xl border border-border bg-card p-4 text-[13px] text-gray-700">
            <p>{t.rentalDetail.cancelRefundContactSupport}</p>
            <a
              className="mt-2 inline-flex text-[13px] font-semibold text-primary underline"
              href={cancelSupportMailto(booking.id, booking.itemTitle)}
            >
              {t.rentalDetail.cancelContactSupport}
            </a>
          </div>
        ) : null}

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
            {isVehicleRental &&
            (booking.startOdometerMiles != null || booking.returnOdometerMiles != null) ? (
              <div className="mt-3 space-y-1 border-t border-border pt-3 text-[12px] text-gray-600">
                {booking.startOdometerMiles != null ? (
                  <p>
                    {t.rentalDetail.odometerStartRecorded(
                      String(booking.startOdometerMiles),
                    )}
                  </p>
                ) : null}
                {booking.returnOdometerMiles != null ? (
                  <p>
                    {t.rentalDetail.odometerReturnRecorded(
                      String(booking.returnOdometerMiles),
                    )}
                  </p>
                ) : null}
              </div>
            ) : null}
            {needsFuelTracking &&
            (booking.startFuelLevelEighths != null ||
              booking.returnFuelLevelEighths != null ||
              fuelPolicyLabel) ? (
              <div className="mt-3 space-y-1 border-t border-border pt-3 text-[12px] text-gray-600">
                {fuelPolicyLabel ? (
                  <p>
                    {t.rentalDetail.fuelPolicyActiveLabel}: {fuelPolicyLabel}
                  </p>
                ) : null}
                {booking.startFuelLevelEighths != null ? (
                  <p>
                    {t.rentalDetail.fuelStartRecorded(
                      formatFuelLevelLabel(
                        clampFuelLevelEighths(booking.startFuelLevelEighths) ?? 8,
                      ),
                    )}
                  </p>
                ) : null}
                {booking.startDefLevelEighths != null ? (
                  <p>
                    {t.rentalDetail.defStartRecorded(
                      formatFuelLevelLabel(
                        clampFuelLevelEighths(booking.startDefLevelEighths) ?? 8,
                      ),
                    )}
                  </p>
                ) : null}
                {booking.returnFuelLevelEighths != null ? (
                  <p>
                    {t.rentalDetail.fuelReturnRecorded(
                      formatFuelLevelLabel(
                        clampFuelLevelEighths(booking.returnFuelLevelEighths) ?? 8,
                      ),
                    )}
                  </p>
                ) : null}
                {booking.returnDefLevelEighths != null ? (
                  <p>
                    {t.rentalDetail.defReturnRecorded(
                      formatFuelLevelLabel(
                        clampFuelLevelEighths(booking.returnDefLevelEighths) ?? 8,
                      ),
                    )}
                  </p>
                ) : null}
                {booking.fuelClaimStatus === "flagged" && booking.fuelClaimNote ? (
                  <p className="text-amber-800">
                    {t.rentalDetail.fuelShortfallFlagged(booking.fuelClaimNote)}
                  </p>
                ) : null}
              </div>
            ) : null}
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

            {booking?.role === "host" && !alreadyConfirmed ? (
              <button
                type="button"
                onClick={() => setShowItemQrOpen(true)}
                className="mt-3 w-full border-2 border-primary/30 text-primary py-3.5 rounded-xl transition-colors font-medium"
              >
                {t.rentalDetail.showItemQr}
              </button>
            ) : null}
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

        {isVehicleRental && booking ? (
          <VehicleTrailPanel
            booking={booking}
            role={booking.role}
            onUpdated={() => setBookings(loadRentalBookings())}
          />
        ) : null}

        {contactlessMode ? (
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-primary" />
              <h3 className="font-semibold">{t.rentalDetail.contactlessFlowTitle}</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t.rentalDetail.contactlessFlowBody}
            </p>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {t.rentalDetail.geoPinGateHint}
            </p>
            {mode === "pickup" ? (
              booking?.role === "renter" ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  {t.rentalDetail.contactlessRenterHint}
                </p>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">
                  {t.rentalDetail.contactlessHostHint}
                </p>
              )
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                {t.rentalDetail.contactlessReturnAutoHint}
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
          <RentalAgreementStatusCard
            record={booking.rentalAgreement}
            role={booking.role === "host" ? "host" : "renter"}
          />
        ) : null}

        {booking ? (
          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="font-semibold mb-2">{t.rentalDetail.security}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t.rentalDetail.securityBody}
            </p>
            {booking.role === "renter" ? (
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {t.rentalDetail.geoPinGateHint}
              </p>
            ) : null}
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

        {booking?.insuranceProofMedia || booking?.insuranceProofUrl || booking?.insuranceActiveUntil ? (
          <div className="bg-card rounded-xl border border-amber-200 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-800" aria-hidden />
              <h3 className="font-semibold text-amber-950">{t.rentalDetail.insuranceProofTitle}</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {booking.role === "host"
                ? t.rentalDetail.insuranceProofHostBody
                : t.rentalDetail.insuranceProofRenterBody}
            </p>
            {booking.insuranceActiveUntil ? (
              <p className="mt-2 text-sm font-semibold text-gray-900">
                {t.rentalDetail.insuranceActiveUntil(
                  new Date(booking.insuranceActiveUntil).toLocaleDateString(),
                )}
              </p>
            ) : null}
            {insuranceImageUrl ? (
              <a
                href={insuranceImageUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 block overflow-hidden rounded-lg border border-amber-200 bg-white"
              >
                <img
                  src={insuranceImageUrl}
                  alt={t.rentalDetail.insuranceProofAlt}
                  className="max-h-56 w-full object-contain"
                />
                <span className="block px-3 py-2 text-center text-xs font-semibold text-amber-900 underline">
                  {t.rentalDetail.insuranceOpenFull}
                </span>
              </a>
            ) : (
              <p className="mt-2 text-sm text-amber-900/80">{t.rentalDetail.insuranceProofMissing}</p>
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
                <span className="text-sm font-medium">
                  {chatWindow?.mode === "post_rental_tolls"
                    ? t.rentalDetail.messagePostRental
                    : chatWindow?.readOnly
                      ? t.rentalDetail.messageClosed
                      : t.rentalDetail.message}
                </span>
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
              readOnly={Boolean(chatWindow?.readOnly)}
              banner={
                chatWindow?.mode === "post_rental_tolls"
                  ? t.rentalDetail.chatPostRentalBanner(
                      chatWindow.extendedDays,
                      chatWindow.openUntilIso
                        ? new Date(chatWindow.openUntilIso).toLocaleDateString()
                        : "—",
                    )
                  : chatWindow?.readOnly
                    ? t.rentalDetail.chatClosedBanner
                    : null
              }
            />
          </div>
        ) : null}

        {usesAgentInsurance && booking ? (
          <div className="bg-card rounded-xl border border-violet-200 p-4 space-y-2">
            <h3 className="font-semibold text-violet-950">{t.booking.agentInsuranceTitle}</h3>
            {(booking.insuranceOwnerProofEmail ||
              publishedListing?.handoff?.insuranceOwnerProofEmail) && (
              <p className="text-sm text-violet-900">
                <span className="font-semibold">{t.rentalDetail.agentProofEmailLabel}: </span>
                <span className="break-all font-bold">
                  {booking.insuranceOwnerProofEmail ||
                    publishedListing?.handoff?.insuranceOwnerProofEmail}
                </span>
              </p>
            )}
            {booking.insuranceProofReceivedByHost ? (
              <p className="text-sm font-semibold text-green-800">
                {t.rentalDetail.agentProofReceivedDone}
              </p>
            ) : booking.role === "host" ? (
              <button
                type="button"
                className="w-full rounded-xl border border-violet-300 bg-white py-2.5 text-sm font-semibold text-violet-950"
                onClick={() => {
                  updateBooking(booking.id, {
                    insuranceProofReceivedByHost: true,
                    insuranceProofReceivedAt: new Date().toISOString(),
                  });
                  setBookings(loadRentalBookings());
                }}
              >
                {t.rentalDetail.agentProofReceivedMark}
              </button>
            ) : (
              <p className="text-sm text-violet-900/90">{t.rentalDetail.agentProofPending}</p>
            )}
          </div>
        ) : null}

        {usesStructuredCoi && booking ? (
          <div className="bg-card rounded-xl border border-orange-200 p-4 space-y-2">
            <h3 className="font-semibold text-orange-950">{t.rentalDetail.coiProofTitle}</h3>
            <div className="space-y-1 text-sm text-orange-950/90">
              {booking.coiCarrierName ? (
                <p>
                  <span className="font-semibold">{t.booking.coiCarrierName}: </span>
                  {booking.coiCarrierName}
                </p>
              ) : null}
              {booking.coiPolicyNumber ? (
                <p>
                  <span className="font-semibold">{t.booking.coiPolicyNumber}: </span>
                  {booking.coiPolicyNumber}
                </p>
              ) : null}
              {booking.coiNamedInsured ? (
                <p>
                  <span className="font-semibold">{t.booking.coiNamedInsured}: </span>
                  {booking.coiNamedInsured}
                </p>
              ) : null}
              {booking.coiLiabilityLimitUsd ? (
                <p>
                  <span className="font-semibold">{t.booking.coiLiabilityLimitUsd}: </span>
                  ${booking.coiLiabilityLimitUsd}
                </p>
              ) : null}
              {booking.coiEffectiveDate || booking.coiExpirationDate ? (
                <p>
                  <span className="font-semibold">
                    {t.booking.coiEffectiveDate} → {t.booking.coiExpirationDate}:{" "}
                  </span>
                  {booking.coiEffectiveDate || "—"} → {booking.coiExpirationDate || "—"}
                </p>
              ) : null}
              {booking.coiAdditionalInsuredAttested ? (
                <p className="text-xs text-orange-900/80">{t.booking.coiAdditionalInsuredAttest}</p>
              ) : null}
            </div>
            {booking.insuranceProofReceivedByHost ? (
              <p className="text-sm font-semibold text-green-800">
                {t.rentalDetail.coiProofReceivedDone}
              </p>
            ) : !usesAgentInsurance && booking.role === "host" ? (
              <button
                type="button"
                className="w-full rounded-xl border border-orange-300 bg-white py-2.5 text-sm font-semibold text-orange-950"
                onClick={() => {
                  updateBooking(booking.id, {
                    insuranceProofReceivedByHost: true,
                    insuranceProofReceivedAt: new Date().toISOString(),
                  });
                  setBookings(loadRentalBookings());
                }}
              >
                {t.rentalDetail.coiProofReceivedMark}
              </button>
            ) : !usesAgentInsurance ? (
              <p className="text-sm text-orange-900/90">{t.rentalDetail.coiProofPending}</p>
            ) : null}
          </div>
        ) : null}

        {needsDriverRecordAttestation &&
        booking &&
        booking.driverLicenseValidAttested &&
        booking.driverRecordSoftAttested ? (
          <div className="bg-card rounded-xl border border-slate-200 p-4 space-y-1">
            <h3 className="font-semibold text-slate-950">
              {t.rentalDetail.driverRecordAttestedTitle}
            </h3>
            <p className="text-sm text-slate-800/90">{t.rentalDetail.driverRecordAttestedBody}</p>
            {booking.driverLicenseState || booking.driverLicenseLast4 ? (
              <p className="text-xs text-slate-700/80">
                {[
                  booking.driverLicenseState
                    ? `${t.booking.driverLicenseState}: ${booking.driverLicenseState}`
                    : null,
                  booking.driverLicenseLast4
                    ? `${t.booking.driverLicenseLast4}: ••••${booking.driverLicenseLast4}`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            ) : null}
          </div>
        ) : null}

        {needsPreTrip && booking && (mode === "pickup" || booking.status === "pending_checkin" || booking.status === "upcoming") ? (
          <PreTripInspectionPanel
            stage="pickup"
            role={booking.role}
            wheelCount={preTripWheelCount}
            layout={preTripLayout}
            value={booking.preTripInspection}
            onChange={(next) => {
              updateBooking(booking.id, { preTripInspection: next });
              setBookings(loadRentalBookings());
            }}
          />
        ) : null}

        {needsPreTrip &&
        booking &&
        (booking.status === "active" || booking.status === "overdue" || mode === "return") ? (
          <PreTripInspectionPanel
            stage="return"
            role={booking.role}
            wheelCount={preTripWheelCount}
            layout={preTripLayout}
            value={booking.returnInspection}
            onChange={(next) => {
              updateBooking(booking.id, { returnInspection: next });
              setBookings(loadRentalBookings());
            }}
          />
        ) : null}

                {needsMicromobilityCharge && booking ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-2">
            <p className="text-sm font-semibold text-emerald-950">{t.rentalDetail.batteryChargeTitle}</p>
            <p className="text-[12px] text-emerald-900/90">{t.rentalDetail.batteryChargeHint}</p>
            <select
              className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm"
              value={batteryChargeBand || booking.batteryChargeBandAtHandoff || ""}
              onChange={(e) => {
                const next = e.target.value;
                setBatteryChargeBand(next);
                if (next) {
                  updateBooking(booking.id, { batteryChargeBandAtHandoff: next });
                  setBookings(loadRentalBookings());
                }
              }}
            >
              <option value="">{t.rentalDetail.batteryChargeOptional}</option>
              {(["full_90_100","high_70_89","mid_40_69","low_under_40","unknown_charge"] as const).map((band) => (
                <option key={band} value={band}>{t.listing.specs.options[band] ?? band}</option>
              ))}
            </select>
          </div>
        ) : null}

{booking &&
        (booking.pickupConditionPhoto ||
          booking.returnConditionPhoto ||
          booking.status === "active" ||
          booking.status === "overdue" ||
          booking.status === "completed" ||
          mode === "return") ? (
          <RentalConditionPhotos
            pickupPhoto={booking.pickupConditionPhoto}
            returnPhoto={booking.returnConditionPhoto}
            showReturn={
              Boolean(booking.returnConditionPhoto) ||
              booking.status === "active" ||
              booking.status === "overdue" ||
              booking.status === "completed" ||
              mode === "return"
            }
          />
        ) : null}

        {booking ? (
          <RentalInvoicePanel
            booking={booking}
            onChange={(invoices) => {
              updateBooking(booking.id, { invoices });
              setBookings(loadRentalBookings());
            }}
          />
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
          expectedCode={qrTarget.qrToken}
          expectedListingId={qrTarget.listingId ?? booking.listingId}
          expectedPin={mode === "pickup" ? booking.pickupPin : booking.returnPin}
          contactlessInstructions={resolvedContactlessInstructions}
          alreadyConfirmed={alreadyConfirmed}
          returnByLabel={booking.returnDueAt ? new Date(booking.returnDueAt).toLocaleString() : undefined}
          onClose={closeScanner}
          onScanned={() => setScanPhase("confirm")}
          onConfirm={confirm}
          onManualCode={() => setScanPhase("confirm")}
          onOwnerManualConfirm={() => setScanPhase("confirm")}
          isHost={booking.role === "host"}
          handoffCoords={handoffCoords}
          isVehicle={isVehicleRental}
          contactlessMode={Boolean(contactlessMode)}
        />
      ) : null}

      {booking && needsStartIdGate ? (
        <VehicleStartIdGate
          open={startIdOpen}
          bookingId={booking.id}
          onClose={() => setStartIdOpen(false)}
          onComplete={(patch) => {
            updateBooking(booking.id, patch);
            setBookings(loadRentalBookings());
            setStartIdOpen(false);
            setScanPhase("camera");
            setScanOpen(true);
          }}
        />
      ) : null}

      {odometerOpen ? (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <p className="text-[15px] font-bold text-gray-900">{t.rentalDetail.odometerTitle}</p>
            <p className="mt-1 text-[13px] text-gray-600">
              {mode === "pickup"
                ? t.rentalDetail.odometerPickupHint
                : t.rentalDetail.odometerReturnHint}
            </p>
            <label className="mt-4 block text-[12px] font-semibold uppercase tracking-wide text-gray-500">
              {t.rentalDetail.odometerLabel}
            </label>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={odometerValue}
              placeholder={t.rentalDetail.odometerPlaceholder}
              className="mt-1.5 w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 outline-none focus:border-primary"
              onChange={(e) => {
                setOdometerError(null);
                setOdometerValue(e.target.value);
              }}
            />
            {odometerError ? (
              <p className="mt-2 text-[12px] text-red-600">{odometerError}</p>
            ) : null}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                className="flex-1 rounded-2xl border border-gray-200 py-3 text-[14px] font-semibold text-gray-700"
                onClick={() => {
                  setOdometerOpen(false);
                  setPendingConfirmPin(null);
                  setPendingConditionPhoto(null);
                  setPendingOdometerMiles(null);
                }}
              >
                {t.rentalDetail.close}
              </button>
              <button
                type="button"
                className="flex-1 rounded-2xl bg-primary py-3 text-[14px] font-semibold text-white"
                onClick={() => submitOdometerAndConfirm()}
              >
                {t.rentalDetail.odometerContinue}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {fuelOpen ? (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
            <p className="text-[15px] font-bold text-gray-900">{t.rentalDetail.fuelTitle}</p>
            <p className="mt-1 text-[13px] text-gray-600">
              {mode === "pickup"
                ? t.rentalDetail.fuelPickupHint
                : t.rentalDetail.fuelReturnHint}
            </p>
            {fuelPolicyLabel ? (
              <p className="mt-2 text-[12px] text-gray-500">{fuelPolicyLabel}</p>
            ) : null}

            <label className="mt-4 block text-[12px] font-semibold uppercase tracking-wide text-gray-500">
              {t.rentalDetail.fuelLevelLabel}
            </label>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {FUEL_LEVEL_EIGHTHS.map((level) => (
                <button
                  key={level}
                  type="button"
                  className={`rounded-xl border py-2.5 text-[13px] font-semibold ${
                    fuelLevel === level
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-gray-200 text-gray-800"
                  }`}
                  onClick={() => {
                    setFuelError(null);
                    setFuelLevel(level);
                  }}
                >
                  {formatFuelLevelLabel(level)}
                </button>
              ))}
            </div>

            {tracksDef ? (
              <>
                <label className="mt-4 block text-[12px] font-semibold uppercase tracking-wide text-gray-500">
                  {t.rentalDetail.defLevelLabel}
                </label>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {FUEL_LEVEL_EIGHTHS.map((level) => (
                    <button
                      key={`def-${level}`}
                      type="button"
                      className={`rounded-xl border py-2.5 text-[13px] font-semibold ${
                        defLevel === level
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-gray-200 text-gray-800"
                      }`}
                      onClick={() => {
                        setFuelError(null);
                        setDefLevel(level);
                      }}
                    >
                      {formatFuelLevelLabel(level)}
                    </button>
                  ))}
                </div>
              </>
            ) : null}

            <label className="mt-4 flex items-start gap-2 text-[13px] text-gray-800">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={prepaidFullTank}
                onChange={(e) => setPrepaidFullTank(e.target.checked)}
              />
              <span>{t.rentalDetail.prepaidFullTankToggle}</span>
            </label>

            {mode === "return" ? (
              <>
                <label className="mt-4 block text-[12px] font-semibold uppercase tracking-wide text-gray-500">
                  {t.rentalDetail.fuelPumpPriceLabel}
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.01"
                  value={pumpPrice}
                  placeholder="e.g. 3.49"
                  className="mt-1.5 w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 outline-none focus:border-primary"
                  onChange={(e) => setPumpPrice(e.target.value)}
                />
                <p className="mt-1 text-[11px] text-gray-500">
                  {t.rentalDetail.fuelPumpPriceHint}
                </p>
              </>
            ) : null}

            {fuelError ? (
              <p className="mt-2 text-[12px] text-red-600">{fuelError}</p>
            ) : null}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                className="flex-1 rounded-2xl border border-gray-200 py-3 text-[14px] font-semibold text-gray-700"
                onClick={() => {
                  setFuelOpen(false);
                  setPendingConfirmPin(null);
                  setPendingConditionPhoto(null);
                  setPendingOdometerMiles(null);
                }}
              >
                {t.rentalDetail.close}
              </button>
              <button
                type="button"
                className="flex-1 rounded-2xl bg-primary py-3 text-[14px] font-semibold text-white"
                onClick={() => submitFuelAndConfirm()}
              >
                {t.rentalDetail.fuelContinue}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {booking?.role === "host" && booking.listingId ? (
        <ShowListingQrOverlay
          open={showItemQrOpen}
          listing={{
            id: booking.listingId,
            title: booking.itemTitle,
            qrToken: qrTarget.qrToken,
          }}
          onClose={() => setShowItemQrOpen(false)}
          hint={t.rentalDetail.showItemQrHint}
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
          <div
            className="max-h-[90vh] w-full max-w-[420px] overflow-y-auto rounded-3xl border bg-white p-5 shadow-2xl"
            style={{ borderColor: "#E8E6E0" }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-[18px] font-extrabold" style={{ color: "#0D5C3A" }}>
                  {dispute ? t.rentalDetail.disputeEvidence : t.rentalDetail.openDisputeTitle}
                </h2>
                <p className="mt-0.5 text-[13px] text-gray-500">
                  {dispute?.status === "resolved"
                    ? t.rentalDetail.disputeStatusResolved
                    : dispute?.status === "under_review"
                      ? t.rentalDetail.disputeStatusUnderReview
                      : timeLeftLabel
                        ? t.rentalDetail.disputeWindowLeft(timeLeftLabel)
                        : t.rentalDetail.countdownRunning}
                </p>
              </div>
              <button type="button" onClick={() => setDisputeOpen(false)} className="text-gray-500">
                ✕
              </button>
            </div>

            <div className="mt-3">
              <RentanoTip
                message={mascotSays(
                  "Take clear photos of the item, any damage, and accessories. Include the QR sticker in one photo if possible.",
                )}
              />
            </div>

            {dispute && dispute.status !== "resolved" ? (
              <div
                className="mt-3 rounded-2xl border bg-[#FFFBEB] p-3 text-[12px] text-amber-900"
                style={{ borderColor: "#FDE68A" }}
              >
                <strong>{t.rentalDetail.depositFrozen}</strong>
                <p className="mt-1">{t.rentalDetail.depositHeldDuringDispute}</p>
              </div>
            ) : null}

            {disputeError ? (
              <p className="mt-3 text-[12px] font-medium text-red-700">{disputeError}</p>
            ) : null}

            {!dispute ? (
              <div className="mt-4 space-y-3">
                <label className="block text-[12px] font-semibold text-gray-600">
                  {t.rentalDetail.disputeReasonLabel}
                  <select
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value as DisputeReasonCode)}
                    className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-[14px] text-gray-900"
                  >
                    <option value="damage">{t.rentalDetail.disputeReasonDamage}</option>
                    <option value="missing_item">{t.rentalDetail.disputeReasonMissing}</option>
                    <option value="condition">{t.rentalDetail.disputeReasonCondition}</option>
                    <option value="deposit">{t.rentalDetail.disputeReasonDeposit}</option>
                    <option value="other">{t.rentalDetail.disputeReasonOther}</option>
                  </select>
                </label>
                <label className="block text-[12px] font-semibold text-gray-600">
                  {t.rentalDetail.disputeNotesLabel}
                  <textarea
                    value={disputeNotes}
                    onChange={(e) => setDisputeNotes(e.target.value)}
                    rows={3}
                    placeholder={t.rentalDetail.disputeNotesPlaceholder}
                    className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-[14px] text-gray-900"
                  />
                </label>
                <button
                  type="button"
                  disabled={disputeBusy}
                  onClick={() => {
                    const mod = moderateDisputeText(disputeNotes);
                    if (!mod.ok) {
                      setDisputeError(
                        mod.reason === "off_platform"
                          ? t.rentalDetail.disputeNotesOffPlatform
                          : t.rentalDetail.disputeNotesBlocked,
                      );
                      return;
                    }
                    setDisputeBusy(true);
                    setDisputeError(null);
                    void openDisputeRemote({
                      rentalId: booking.id,
                      openedBy: auth.userId!,
                      reasonCode: disputeReason,
                      notes: mod.cleaned,
                    })
                      .then((d) => {
                        setDispute(d);
                        updateBooking(booking.id, {
                          status: "disputed",
                          disputeEvidenceDeadline: d.evidenceDeadline,
                          paymentOnHold: true,
                          disputeEscalated: false,
                        });
                        setBookings(loadRentalBookings());
                      })
                      .catch((err: unknown) => {
                        const code = err instanceof Error ? err.message : "";
                        setDisputeError(
                          code === "off_platform"
                            ? t.rentalDetail.disputeNotesOffPlatform
                            : t.rentalDetail.disputeNotesBlocked,
                        );
                      })
                      .finally(() => setDisputeBusy(false));
                  }}
                  className="w-full rounded-2xl px-4 py-3 text-[13px] font-bold text-white disabled:opacity-60"
                  style={{ backgroundColor: "#0D5C3A" }}
                >
                  {t.rentalDetail.startDispute}
                </button>
              </div>
            ) : null}

            {dispute ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl border border-border bg-muted/40 p-3 text-[13px] text-gray-700">
                  <p>
                    <span className="font-semibold">{t.rentalDetail.disputeReasonLabel}: </span>
                    {dispute.reasonCode === "damage"
                      ? t.rentalDetail.disputeReasonDamage
                      : dispute.reasonCode === "missing_item"
                        ? t.rentalDetail.disputeReasonMissing
                        : dispute.reasonCode === "condition"
                          ? t.rentalDetail.disputeReasonCondition
                          : dispute.reasonCode === "deposit"
                            ? t.rentalDetail.disputeReasonDeposit
                            : t.rentalDetail.disputeReasonOther}
                  </p>
                  {dispute.notes ? <p className="mt-1 text-gray-600">{dispute.notes}</p> : null}
                </div>

                {dispute.status !== "resolved" ? (
                  <div className="flex gap-2">
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
                    {dispute.status === "open" ? (
                      <button
                        type="button"
                        disabled={disputeBusy}
                        onClick={() => {
                          setDisputeBusy(true);
                          void submitDisputeForReviewRemote({
                            dispute,
                            actorId: auth.userId!,
                          })
                            .then((d) => {
                              setDispute(d);
                              updateBooking(booking.id, { disputeEscalated: true });
                              setBookings(loadRentalBookings());
                            })
                            .finally(() => setDisputeBusy(false));
                        }}
                        className="flex-1 rounded-2xl px-4 py-3 text-[13px] font-bold text-white disabled:opacity-60"
                        style={{ backgroundColor: "#0D5C3A" }}
                      >
                        {t.rentalDetail.requestReview}
                      </button>
                    ) : null}
                  </div>
                ) : null}

                {dispute.status === "open" ? (
                  <p className="text-[11px] text-gray-500">{t.rentalDetail.requestReviewHint}</p>
                ) : null}

                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-wide text-gray-400">
                    {t.rentalDetail.evidence}
                  </p>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {[...(dispute.renterEvidence ?? []), ...(dispute.ownerEvidence ?? [])]
                      .slice(0, 6)
                      .map((src, idx) => (
                        <img
                          key={idx}
                          src={src}
                          alt=""
                          className="h-20 w-full rounded-xl object-cover"
                        />
                      ))}
                  </div>
                  <p className="mt-2 text-[11px] text-gray-400">{t.rentalDetail.visibleToBoth}</p>
                </div>

                {dispute.status !== "resolved" ? (
                  <div className="space-y-2">
                    <p className="text-[13px] font-semibold text-gray-800">
                      {t.rentalDetail.proposeResolution}
                    </p>
                    <p className="text-[12px] text-gray-500">{t.rentalDetail.proposeResolutionHint}</p>
                    {dispute.proposedOutcome && dispute.proposedBy ? (
                      <div className="rounded-xl border border-border bg-card p-3 space-y-2">
                        <p className="text-[13px] text-gray-700">
                          {dispute.proposedOutcome === "favor_renter"
                            ? t.rentalDetail.outcomeFavorRenter
                            : dispute.proposedOutcome === "favor_host"
                              ? t.rentalDetail.outcomeFavorHost
                              : dispute.proposedOutcome === "split"
                                ? t.rentalDetail.outcomeSplit
                                : t.rentalDetail.outcomeWithdrawn}
                        </p>
                        {dispute.proposedBy === auth.userId ? (
                          <p className="text-[12px] text-amber-800">
                            {t.rentalDetail.waitingCounterpartyAck}
                          </p>
                        ) : (
                          <button
                            type="button"
                            disabled={disputeBusy}
                            onClick={() => {
                              setDisputeBusy(true);
                              void acknowledgeDisputeResolutionRemote({
                                dispute,
                                actorId: auth.userId!,
                              })
                                .then((d) => {
                                  setDispute(d);
                                  updateBooking(booking.id, {
                                    status: "completed",
                                    completedAt: new Date().toISOString(),
                                    paymentOnHold: false,
                                    disputeEscalated: false,
                                  });
                                  setBookings(loadRentalBookings());
                                })
                                .finally(() => setDisputeBusy(false));
                            }}
                            className="w-full rounded-xl py-2.5 text-[13px] font-bold text-white"
                            style={{ backgroundColor: "#0D5C3A" }}
                          >
                            {t.rentalDetail.acceptResolution}
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {(
                          [
                            ["favor_renter", t.rentalDetail.outcomeFavorRenter],
                            ["favor_host", t.rentalDetail.outcomeFavorHost],
                            ["split", t.rentalDetail.outcomeSplit],
                          ] as const
                        ).map(([outcome, label]) => (
                          <button
                            key={outcome}
                            type="button"
                            disabled={disputeBusy}
                            onClick={() => {
                              setDisputeBusy(true);
                              void proposeDisputeResolutionRemote({
                                dispute,
                                actorId: auth.userId!,
                                outcome: outcome as DisputeResolutionOutcome,
                              })
                                .then((d) => {
                                  setDispute(d);
                                  updateBooking(booking.id, { disputeEscalated: true });
                                  setBookings(loadRentalBookings());
                                })
                                .finally(() => setDisputeBusy(false));
                            }}
                            className="rounded-xl border border-border px-2 py-2.5 text-[12px] font-semibold text-gray-800"
                          >
                            {label}
                          </button>
                        ))}
                        {dispute.openedBy === auth.userId ? (
                          <button
                            type="button"
                            disabled={disputeBusy}
                            onClick={() => {
                              setDisputeBusy(true);
                              void proposeDisputeResolutionRemote({
                                dispute,
                                actorId: auth.userId!,
                                outcome: "withdrawn",
                              })
                                .then((d) => {
                                  setDispute(d);
                                  updateBooking(booking.id, {
                                    status: "completed",
                                    completedAt: new Date().toISOString(),
                                    paymentOnHold: false,
                                    disputeEscalated: false,
                                  });
                                  setBookings(loadRentalBookings());
                                })
                                .finally(() => setDisputeBusy(false));
                            }}
                            className="rounded-xl border border-border px-2 py-2.5 text-[12px] font-semibold text-gray-800"
                          >
                            {t.rentalDetail.withdrawDispute}
                          </button>
                        ) : null}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-[13px] text-gray-700">
                    {t.rentalDetail.resolvedCalm(
                      dispute.resolutionOutcome === "favor_renter"
                        ? t.rentalDetail.outcomeFavorRenter
                        : dispute.resolutionOutcome === "favor_host"
                          ? t.rentalDetail.outcomeFavorHost
                          : dispute.resolutionOutcome === "split"
                            ? t.rentalDetail.outcomeSplit
                            : t.rentalDetail.outcomeWithdrawn,
                    )}
                  </p>
                )}

                <DepositHoldActions
                  rentalId={booking.id}
                  role={booking.role}
                  depositStatus={booking.depositStatus}
                  depositAmountCents={booking.depositAmountCents}
                  disputeFrozen={isDisputeActive(dispute)}
                  disputeOutcome={dispute.resolutionOutcome ?? null}
                />

                <a
                  href={disputeSupportMailto({
                    rentalId: booking.id,
                    disputeId: dispute.id,
                    itemTitle: booking.itemTitle,
                  })}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border px-4 py-3 text-[13px] font-semibold text-gray-800"
                >
                  <Mail className="h-4 w-4" />
                  {t.rentalDetail.emailSupport}
                </a>
                <p className="text-[11px] text-gray-500">{t.rentalDetail.emailSupportHint}</p>
              </div>
            ) : (
              <div className="mt-4">
                <a
                  href={disputeSupportMailto({
                    rentalId: booking.id,
                    itemTitle: booking.itemTitle,
                  })}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border px-4 py-3 text-[13px] font-semibold text-gray-800"
                >
                  <Mail className="h-4 w-4" />
                  {t.rentalDetail.emailSupport}
                </a>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
