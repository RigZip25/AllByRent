import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, MapPin, Truck, Package, Shield, Upload } from "lucide-react";
import { trackManualBookingRequest } from "../../lib/bookingRequestsStorage";
import { fetchListingByIdRemote, getPublishedListingById } from "../../lib/listingStorage";
import { getListingDisplayTitle } from "../../lib/listingQr";
import { useAuth } from "../../hooks/AuthProvider";
import { parseUsdToCents } from "../../lib/insurance";
import {
  coiStructuredFieldsComplete,
  insuranceMustBeActiveByIso,
  listingCoiAdditionalInsuredRequired,
  listingInsuranceCoverageLeadDays,
  listingInsuranceOwnerProofEmail,
  listingInsuranceRequirementsSummary,
  listingRequiresCoiHostConfirm,
  listingRequiresInsuranceProof,
  listingUsesAgentToOwnerInsuranceProof,
  listingUsesStructuredCoi,
} from "../../lib/listingInsurance";
import {
  listingProRentersOnly,
  listingRequiresCdl,
  listingRequiresPhysicalDamage,
  listingIsCommercialTransport,
} from "../../lib/listingRentRules";
import {
  listingCarSeatBlocksBooking,
  listingCleaningFeeUsd,
  listingEScooterMinAge,
  listingHelmetPolicy,
  listingHouseRulesText,
  listingIsCarSeat,
  listingIsCrib,
  listingIsCommercialCoffee,
  listingIsCommercialPlay,
  listingCribBlocksBooking,
  listingIsDrone,
  listingKitInventoryText,
  listingLockPolicy,
  listingOperatorCertKind,
  listingRequiresAgeGate,
  listingRequiresBoaterLicense,
  listingRequiresDroneCert,
  listingRequiresDriverRecordAttestation,
  listingRequiresEScooterAgeGate,
  listingRequiresHelmetLockPolicy,
  listingOvernightStorageRule,
  listingRequiresKidsGuardianAttest,
  listingDroneRemoteIdBlocksBooking,
  listingDroneWeightClass,
  listingRemoteIdStatus,
  listingRequiresSnowSportsGates,
  listingDinSettingBand,
  listingRequiresPfdPolicy,
  listingPfdBlocksBooking,
  listingPfdIncluded,
  listingRequiresOhvTerrainWaiver,
  listingAtvMinAgeNote,
  listingRequiresMotorcycleEndorsement,
  listingCaptainMode,
  listingIsCaptainOptionVessel,
  listingRequiresPfdAttestation,
  listingPfdCount,
  listingRequiresCateringSanitize,
  listingCateringSanitizeBlocksBooking,
  listingSetPieceCountBand,
  listingTentSizeBand,
  listingSleepingBagTempBand,
  listingStoveFuelType,
  listingRequiresKitInventory,
  listingRequiresLiabilityWaiver,
  listingRequiresPpeAck,
  listingRequiresOperatorCredential,
  listingRequiresPaCableStandInventory,
  listingRequiresUscgSafetyKit,
  listingSetupTeardownFeeUsd,
  listingUscgSafetyBlocksBooking,
  listingIsPwc,
  listingIsPartyCategory,
  listingIsBikesScooters,
  listingIsHighValueGearCategory,
  listingIsOfficeCategory,
  listingIsMusicCategory,
  listingIsCostumeCategory,
  listingRequiresDataWipe,
  listingDataWipeBlocksBooking,
  listingHostDataWipeStatus,
  listingPaCableStandInventoryText,
  listingRequiresWeatherCancelPolicy,
  listingWeatherCancelPolicy,
  listingWeatherCancelFullRefundHours,
  listingRequiresSafetyBriefing,
  listingSafetyBriefingBlocksBooking,
  listingSafetyBriefingNotes,
  listingRequiresHygieneChecklist,
  listingHygieneBlocksBooking,
  listingHygieneChecklistNotes,
  listingRequiresCostumeReturnCondition,
  listingRequiresCostumeHygiene,
  listingCostumeHygieneBlocksBooking,
  listingDryCleanReturnFeeUsd,
  listingReturnConditionPolicy,
} from "../../lib/categoryTrustRules";
import { uploadRentalInsuranceProof } from "../../lib/rentalInsuranceStorage";
import {
  defaultLateReturnFeePolicyForCategory,
  formatLateReturnPolicySummary,
  lateReturnPolicyFromListingHandoff,
  snapshotLateReturnFeePolicy,
} from "../../lib/lateReturnFee";
import { listingNoShowFeeUsd } from "../../lib/noShowPolicy";
import { formatCancellationPolicySummary } from "../../lib/cancellationPolicy";
import {
  ageYearsFromDob,
  assessVehicleAgeGate,
  resolveRenterDateOfBirth,
} from "../../lib/vehicleAgeGate";
import { computeVehicleExtrasFeeUsd,
  enabledVehicleExtraKeys,
  type SelectedVehicleExtras,
  type VehicleExtraKey,
} from "../../lib/vehicleExtras";
import { useMediaUrl } from "../../lib/useMediaUrl";
import type { MediaRef } from "../../lib/mediaStore";
import {
  breakdownForListingBooking,
  deliverySummaryForListing,
  listingOffersDelivery,
  type RentalPriceBreakdown,
} from "../../lib/rentalPricing";
import {
  appendRentalBooking,
  createRentalRemote,
  toSupabaseRentalInsert,
  updateBooking,
  updateRentalRemote,
  type FulfillmentMethod,
  type RentalBooking,
} from "../../lib/rentalsStorage";
import { createNotificationRemote } from "../../lib/notificationsStorage";
import { fetchRemoteProfile } from "../../lib/supabaseProfile";
import { isSupabaseConfigured } from "../../lib/supabaseClient";
import { RentalPriceBreakdownView } from "../../components/rentals/RentalPriceBreakdown";
import { CategoryFactCard } from "../../components/CategoryFactCard";
import { StripePaymentForm } from "../../components/payments/StripePaymentForm";
import { PaymentLegalNotice } from "../../components/payments/PaymentLegalNotice";
import { BookingPaymentsBanner } from "../../components/payments/PaymentModeBanner";
import { SignInPrompt } from "../../components/SignInPrompt";
import {
  canSubmitBookingRequest,
  getSignInRequiredMessage,
  isPaymentsReady,
} from "../../lib/config/production";
import { removeStripeControllerIframes } from "../../lib/stripeCleanup";
import { formatMoney, formatDistanceFromMiles } from "../../lib/regionalDisplay";
import {
  createDepositPaymentIntent,
  createRentalPaymentIntent,
  syncRentalPaymentStatus,
} from "../../lib/stripePayments";
import type { ListingDraft, MinimumRentalPeriod } from "../../screens/listing/types";
import { useMessages } from "../../lib/i18n/react";
import { getLocale } from "../../lib/i18n";
import type { AppMessages } from "../../lib/i18n/types";
import {
  createRentalAgreementRecord,
  getRentalAgreementTermsText,
  makeAgreementSignature,
  buildEnrichedSummaryLines,
  RENTAL_AGREEMENT_VERSION,
} from "../../lib/rentalAgreement";
import { RentalAgreementSignBlock } from "../../components/rentals/RentalAgreementPanel";
import { RentalLifecyclePolicySheet } from "../../components/rentals/RentalLifecyclePolicySheet";
import { loadUserProfile } from "../../lib/userProfileStorage";
import {
  categorySupportsTravelOutsideRule,
  formatHomeTerritoryPhrase,
  normalizeTravelOutsideHomeArea,
  resolveHomeTerritory,
} from "../../lib/vehicleHomeTerritory";
import {
  defaultFuelPolicySnapshot,
  formatFuelPolicySummary,
  listingRequiresFuelTracking,
} from "../../lib/rentalFuelPolicy";
import { getSearchCountryCode } from "../../lib/locationCountry";
import { AvailabilityCalendar } from "../../components/availability/AvailabilityCalendar";
import {
  addDaysIso,
  daysInclusive,
  fetchListingBusyIntervals,
  isRangeBusy,
  parseIsoDateLocal,
  type BusyInterval,
} from "../../lib/availabilityBusy";

const GREEN = "#0D5C3A";

function minimumPeriodToDays(period: MinimumRentalPeriod | string | undefined): number {
  switch (period) {
    case "3 days":
      return 3;
    case "1 week":
      return 7;
    case "2 weeks":
      return 14;
    case "1 month":
      return 30;
    case "1 day":
    default:
      return 1;
  }
}

function defaultStartIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().slice(0, 10);
}

function fulfillmentOptions(
  listing: ListingDraft,
  booking: AppMessages["booking"],
): {
  id: FulfillmentMethod;
  label: string;
  description: string;
  disabled?: boolean;
}[] {
  const options: {
    id: FulfillmentMethod;
    label: string;
    description: string;
    disabled?: boolean;
  }[] = [];
  if (listing.handoff.inPerson) {
    options.push({
      id: "pickup",
      label: booking.pickupInPerson,
      description: booking.pickupInPersonDesc,
    });
  }
  if (listing.handoff.contactless) {
    options.push({
      id: "contactless",
      label: booking.pickupContactless,
      description: booking.pickupContactlessDesc,
    });
  }
  if (listingOffersDelivery(listing)) {
    options.push({
      id: "delivery",
      label: booking.deliveryRoundTrip,
      description:
        deliverySummaryForListing(listing) ?? booking.deliveryRoundTripDesc,
    });
  }
  return options;
}

export function BookingScreen({
  listingId,
  onBack,
  onConfirmed,
}: {
  listingId: string;
  onBack: () => void;
  onConfirmed: (bookingId: string) => void;
}) {
  const t = useMessages();
  const [listing, setListing] = useState<ListingDraft | null>(() => getPublishedListingById(listingId));
  const [loading, setLoading] = useState(() => !getPublishedListingById(listingId));

  useEffect(() => {
    let mounted = true;
    void fetchListingByIdRemote(listingId).then((next) => {
      if (!mounted) return;
      setListing(next);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [listingId]);

  if (loading) {
    return (
      <div className="screen flex flex-col items-center justify-center bg-background px-6 text-center">
        <p className="text-sm text-muted-foreground">{t.booking.loading}</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="screen flex flex-col items-center justify-center bg-background px-6 text-center">
        <p className="font-semibold">{t.booking.notFound}</p>
        <button type="button" onClick={onBack} className="mt-4 text-sm underline">
          {t.booking.goBack}
        </button>
      </div>
    );
  }
  return (
    <BookingScreenLoaded listing={listing} onBack={onBack} onConfirmed={onConfirmed} />
  );
}

function BookingScreenLoaded({
  listing,
  onBack,
  onConfirmed,
}: {
  listing: ListingDraft;
  onBack: () => void;
  onConfirmed: (bookingId: string) => void;
}) {
  const auth = useAuth();
  const t = useMessages();
  const title =
    getListingDisplayTitle(listing.title) || listing.title || t.booking.itemFallback;
  const options = useMemo(() => fulfillmentOptions(listing, t.booking), [listing, t.booking]);
  const defaultFulfillment =
    options.find((o) => !o.disabled)?.id ?? options[0]?.id ?? "pickup";
  const minRentalDays = minimumPeriodToDays(listing.pricing.minimumPeriod);

  const [rentalDays, setRentalDays] = useState(() => Math.max(2, minRentalDays));
  const [fulfillment, setFulfillment] = useState<FulfillmentMethod>(defaultFulfillment);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentClientSecret, setPaymentClientSecret] = useState<string | null>(null);
  const [depositClientSecret, setDepositClientSecret] = useState<string | null>(null);
  const [pendingBookingId, setPendingBookingId] = useState<string | null>(null);
  const [pendingDepositCents, setPendingDepositCents] = useState(0);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [startDate, setStartDate] = useState(defaultStartIso);
  const [hostDisplayName, setHostDisplayName] = useState(t.booking.hostFallback);
  const [insuranceProof, setInsuranceProof] = useState<MediaRef | null>(null);
  const [insuranceProofPath, setInsuranceProofPath] = useState("");
  const [insuranceProofUrl, setInsuranceProofUrl] = useState<string | null>(null);
  const [insuranceActiveUntil, setInsuranceActiveUntil] = useState("");
  const [insuranceUploadBusy, setInsuranceUploadBusy] = useState(false);
  const [insuranceUploadError, setInsuranceUploadError] = useState<string | null>(null);
  const [insuranceDraftId, setInsuranceDraftId] = useState<string | null>(null);
  const [busyIntervals, setBusyIntervals] = useState<BusyInterval[]>([]);
  const [busyLoading, setBusyLoading] = useState(true);
  const [selectedExtras, setSelectedExtras] = useState<SelectedVehicleExtras>({});
  const [macropointConsent, setMacropointConsent] = useState(false);
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [agreementExpanded, setAgreementExpanded] = useState(false);
  const [policySheetOpen, setPolicySheetOpen] = useState(false);
  const [physicalDamageAttested, setPhysicalDamageAttested] = useState(false);
  const [proRenterAttested, setProRenterAttested] = useState(false);
  const [proCredentialMedia, setProCredentialMedia] = useState<MediaRef | null>(null);
  const [proCredentialBusy, setProCredentialBusy] = useState(false);
  const [cdlAttested, setCdlAttested] = useState(false);
  const [cdlMedia, setCdlMedia] = useState<MediaRef | null>(null);
  const [cdlBusy, setCdlBusy] = useState(false);
  const [agentProofAck, setAgentProofAck] = useState(false);
  const [operatorCertAttested, setOperatorCertAttested] = useState(false);
  const [operatorCertMedia, setOperatorCertMedia] = useState<MediaRef | null>(null);
  const [operatorCertBusy, setOperatorCertBusy] = useState(false);
  const [boaterLicenseAttested, setBoaterLicenseAttested] = useState(false);
  const [boaterLicenseMedia, setBoaterLicenseMedia] = useState<MediaRef | null>(null);
  const [boaterLicenseBusy, setBoaterLicenseBusy] = useState(false);
  const [droneCertAttested, setDroneCertAttested] = useState(false);
  const [droneCertMedia, setDroneCertMedia] = useState<MediaRef | null>(null);
  const [droneCertBusy, setDroneCertBusy] = useState(false);
  const [droneRemoteIdAck, setDroneRemoteIdAck] = useState(false);
  const [sportsPfdAck, setSportsPfdAck] = useState(false);
  const [cateringSanitizeAck, setCateringSanitizeAck] = useState(false);
  const [ohvTerrainWaiverAttested, setOhvTerrainWaiverAttested] = useState(false);
  const [motorcycleEndorsementAttested, setMotorcycleEndorsementAttested] = useState(false);
  const [paddlePfdAck, setPaddlePfdAck] = useState(false);
  const [carSeatSanitizationAttested, setCarSeatSanitizationAttested] = useState(false);
  const [carSeatRecallAckAttested, setCarSeatRecallAckAttested] = useState(false);
  const [cribRecallAckAttested, setCribRecallAckAttested] = useState(false);
  const [cribDropSideAckAttested, setCribDropSideAckAttested] = useState(false);
  const [cribSanitizationAttested, setCribSanitizationAttested] = useState(false);
  const [ppeAckAttested, setPpeAckAttested] = useState(false);
  const [uscgSafetyAck, setUscgSafetyAck] = useState(false);
  const [kitInventoryAck, setKitInventoryAck] = useState(false);
  const [liabilityWaiverAttested, setLiabilityWaiverAttested] = useState(false);
  const [helmetLockAck, setHelmetLockAck] = useState(false);
  const [kidsGuardianAttested, setKidsGuardianAttested] = useState(false);
  const [dataWipeAttested, setDataWipeAttested] = useState(false);
  const [paCableStandAck, setPaCableStandAck] = useState(false);
  const [weatherCancelAck, setWeatherCancelAck] = useState(false);
  const [safetyBriefingAck, setSafetyBriefingAck] = useState(false);
  const [hygieneAck, setHygieneAck] = useState(false);
  const [costumeReturnConditionAck, setCostumeReturnConditionAck] = useState(false);
  const [costumeHygieneAttested, setCostumeHygieneAttested] = useState(false);
  const [driverLicenseValidAttested, setDriverLicenseValidAttested] = useState(false);
  const [driverRecordSoftAttested, setDriverRecordSoftAttested] = useState(false);
  const [driverLicenseState, setDriverLicenseState] = useState("");
  const [driverLicenseLast4, setDriverLicenseLast4] = useState("");
  const [coiCarrierName, setCoiCarrierName] = useState("");
  const [coiPolicyNumber, setCoiPolicyNumber] = useState("");
  const [coiLiabilityLimitUsd, setCoiLiabilityLimitUsd] = useState("");
  const [coiEffectiveDate, setCoiEffectiveDate] = useState("");
  const [coiExpirationDate, setCoiExpirationDate] = useState("");
  const [coiNamedInsured, setCoiNamedInsured] = useState("");
  const [coiAdditionalInsuredAttested, setCoiAdditionalInsuredAttested] = useState(false);

  const needsInsuranceProof = listingRequiresInsuranceProof(listing);
  const needsPhysicalDamage = listingRequiresPhysicalDamage(listing);
  const needsProRenter = listingProRentersOnly(listing);
  const needsCdl = listingRequiresCdl(listing);
  const operatorCertKind = listingOperatorCertKind(listing);
  const needsOperatorCert = listingRequiresOperatorCredential(listing);
  const needsBoaterLicense = listingRequiresBoaterLicense(listing);
  const needsDroneCert = listingRequiresDroneCert(listing);
  const droneRidBlocked = listingDroneRemoteIdBlocksBooking(listing);
  const droneWeightClass = listingDroneWeightClass(listing);
  const remoteIdStatus = listingRemoteIdStatus(listing);
  const needsSnowSports = listingRequiresSnowSportsGates(listing);
  const dinSettingBand = listingDinSettingBand(listing);
  const needsSportsPfd = listingRequiresPfdPolicy(listing);
  const sportsPfdBlocked = listingPfdBlocksBooking(listing);
  const sportsPfdIncluded = listingPfdIncluded(listing);
  const needsOhvTerrainWaiver = listingRequiresOhvTerrainWaiver(listing);
  const atvMinAgeNote = listingAtvMinAgeNote(listing);
  const needsMotorcycleEndorsement = listingRequiresMotorcycleEndorsement(listing);
  const captainMode = listingCaptainMode(listing);
  const showCaptainModeCopy = listingIsCaptainOptionVessel(listing) && listing.modes.rent;
  const needsPaddlePfd = listingRequiresPfdAttestation(listing);
  const paddlePfdIncluded = needsPaddlePfd ? listingPfdIncluded(listing) : "";
  const paddlePfdCount = needsPaddlePfd ? listingPfdCount(listing) : null;
  const needsCateringSanitize = listingRequiresCateringSanitize(listing);
  const cateringSanitizeBlocked = listingCateringSanitizeBlocksBooking(listing);
  const setPieceCountBand = listingSetPieceCountBand(listing);
  const tentSizeBand = listingTentSizeBand(listing);
  const sleepingBagTempBand = listingSleepingBagTempBand(listing);
  const stoveFuelType = listingStoveFuelType(listing);
  const needsCarSeatGates = listingIsCarSeat(listing) && listing.modes.rent;
  const carSeatListingBlocked = listingCarSeatBlocksBooking(listing);
  const needsCribGates = listingIsCrib(listing) && listing.modes.rent;
  const cribListingBlocked = listingCribBlocksBooking(listing);
  const needsCommercialPlay = listingIsCommercialPlay(listing) && listing.modes.rent;
  const needsCommercialCoffee = listingIsCommercialCoffee(listing) && listing.modes.rent;
  const needsPpeAck = listingRequiresPpeAck(listing);
  const houseRulesText = listingHouseRulesText(listing);
  const cleaningFeeUsd = listingCleaningFeeUsd(listing);
  const setupTeardownFeeUsd = listingSetupTeardownFeeUsd(listing);
  const needsAgeGate = listingRequiresAgeGate(listing);
  const needsUscgSafety = listingRequiresUscgSafetyKit(listing);
  const uscgListingBlocked = listingUscgSafetyBlocksBooking(listing);
  const needsKitInventory = listingRequiresKitInventory(listing);
  const kitInventoryText = listingKitInventoryText(listing);
  const needsLiabilityWaiver = listingRequiresLiabilityWaiver(listing);
  const needsHelmetLock = listingRequiresHelmetLockPolicy(listing);
  const helmetPolicy = listingHelmetPolicy(listing);
  const lockPolicy = listingLockPolicy(listing);
  const overnightStorageRule = listingOvernightStorageRule(listing);
  const needsKidsGuardian = listingRequiresKidsGuardianAttest(listing);
  const needsEScooterAge = listingRequiresEScooterAgeGate(listing);
  const eScooterMinAge = listingEScooterMinAge(listing);
  const isPartyListing = listingIsPartyCategory(listing) && listing.modes.rent;
  const isBikesListing = listingIsBikesScooters(listing) && listing.modes.rent;
  const isHighValueGear = listingIsHighValueGearCategory(listing) && listing.modes.rent;
  const isOfficeListing = listingIsOfficeCategory(listing) && listing.modes.rent;
  const isMusicListing = listingIsMusicCategory(listing) && listing.modes.rent;
  const needsDataWipe = listingRequiresDataWipe(listing);
  const dataWipeListingBlocked = listingDataWipeBlocksBooking(listing);
  const hostDataWipeStatus = listingHostDataWipeStatus(listing);
  const needsPaCableStand = listingRequiresPaCableStandInventory(listing);
  const paCableStandText = listingPaCableStandInventoryText(listing);
  const needsWeatherCancel = listingRequiresWeatherCancelPolicy(listing);
  const weatherCancelPolicy = listingWeatherCancelPolicy(listing);
  const weatherCancelHours = listingWeatherCancelFullRefundHours(listing);
  const needsSafetyBriefing = listingRequiresSafetyBriefing(listing);
  const safetyBriefingBlocked = listingSafetyBriefingBlocksBooking(listing);
  const safetyBriefingNotes = listingSafetyBriefingNotes(listing);
  const needsHygiene = listingRequiresHygieneChecklist(listing);
  const hygieneBlocked = listingHygieneBlocksBooking(listing);
  const hygieneNotes = listingHygieneChecklistNotes(listing);
  const needsCostumeReturn = listingRequiresCostumeReturnCondition(listing);
  const needsCostumeHygiene = listingRequiresCostumeHygiene(listing);
  const costumeHygieneBlocked = listingCostumeHygieneBlocksBooking(listing);
  const dryCleanReturnFeeUsd = listingDryCleanReturnFeeUsd(listing);
  const returnConditionPolicy = listingReturnConditionPolicy(listing);
  const isCostumeListing = listingIsCostumeCategory(listing) && listing.modes.rent;
  const isToolsListing = listing.category.trim() === "Tools & DIY" && listing.modes.rent;
  const usesAgentInsurance = listingUsesAgentToOwnerInsuranceProof(listing);
  const usesStructuredCoi = listingUsesStructuredCoi(listing);
  const needsCoiHostConfirm = listingRequiresCoiHostConfirm(listing);
  const coiAdditionalInsuredRequired = listingCoiAdditionalInsuredRequired(listing);
  const needsDriverRecordAttestation = listingRequiresDriverRecordAttestation(listing);
  const isCommercialTransport = listingIsCommercialTransport(listing);
  const ownerProofEmail = listingInsuranceOwnerProofEmail(listing);
  const insuranceReqs = listingInsuranceRequirementsSummary(listing);
  const insuranceLeadDays = listingInsuranceCoverageLeadDays(listing);
  const offeredExtraKeys = useMemo(
    () => enabledVehicleExtraKeys(listing.vehicleExtras),
    [listing.vehicleExtras],
  );
  const insurancePreview = useMediaUrl(insuranceProof);
  const liabilityLabel =
    listing.categorySpecs?.insuranceMinLiability &&
    (t.listing.specs.options[listing.categorySpecs.insuranceMinLiability] ??
      listing.categorySpecs.insuranceMinLiability);
  const deductibleLabel =
    listing.categorySpecs?.insuranceMaxDeductible &&
    (t.listing.specs.options[listing.categorySpecs.insuranceMaxDeductible] ??
      listing.categorySpecs.insuranceMaxDeductible);

  useEffect(() => {
    let mounted = true;
    setBusyLoading(true);
    void fetchListingBusyIntervals(listing.id, listing.blockedDates).then((result) => {
      if (!mounted) return;
      setBusyIntervals(result.intervals);
      setBusyLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [listing.id, listing.blockedDates]);

  useEffect(() => {
    setRentalDays((days) => Math.max(days, minRentalDays));
  }, [minRentalDays]);

  useEffect(() => {
    const hostId = listing.hostId?.trim();
    if (!hostId) return;
    let mounted = true;
    void fetchRemoteProfile(hostId).then((remote) => {
      if (!mounted || !remote?.display_name?.trim()) return;
      setHostDisplayName(remote.display_name.trim());
    });
    return () => {
      mounted = false;
    };
  }, [listing.hostId]);

  useEffect(() => {
    return () => {
      window.setTimeout(removeStripeControllerIframes, 0);
    };
  }, []);

  const endDate = addDaysIso(startDate, rentalDays - 1);
  const insuranceMustBeOnBy = insuranceMustBeActiveByIso(startDate, insuranceLeadDays);
  const datesBlocked = isRangeBusy(startDate, endDate, busyIntervals);
  const selectedRange = useMemo(() => {
    const from = parseIsoDateLocal(startDate) ?? undefined;
    const to = parseIsoDateLocal(endDate) ?? undefined;
    if (!from) return undefined;
    return { from, to: to ?? from };
  }, [startDate, endDate]);

  useEffect(() => {
    if (!needsInsuranceProof) return;
    // Default: policy must cover through the rental end date.
    setInsuranceActiveUntil((current) => current || endDate);
  }, [needsInsuranceProof, endDate]);

  const deliveryRequested = fulfillment === "delivery";
  const isVehicleListing = listing.category.trim() === "Vehicles";
  const needsFuelTracking = listingRequiresFuelTracking(listing);
  const fuelPolicySnapshot = useMemo(
    () => defaultFuelPolicySnapshot(listing),
    [listing],
  );
  const fuelPolicySummary = useMemo(
    () => formatFuelPolicySummary(fuelPolicySnapshot),
    [fuelPolicySnapshot],
  );
  const lateReturnPolicy = useMemo(() => {
    const fromHandoff = lateReturnPolicyFromListingHandoff(listing.handoff);
    if (
      fromHandoff.enabled ||
      listing.handoff.lateReturnFeeEnabled != null ||
      listing.handoff.lateReturnGraceMinutes != null
    ) {
      return fromHandoff;
    }
    return defaultLateReturnFeePolicyForCategory(listing.category);
  }, [listing.handoff, listing.category]);
  const lateReturnSnapshot = useMemo(
    () => snapshotLateReturnFeePolicy(lateReturnPolicy),
    [lateReturnPolicy],
  );
  const lateReturnSummary = useMemo(
    () => formatLateReturnPolicySummary(lateReturnSnapshot ?? lateReturnPolicy, formatMoney),
    [lateReturnSnapshot, lateReturnPolicy],
  );
  const noShowFeeUsd = listingNoShowFeeUsd(listing);
  const cancellationSummary = useMemo(() => formatCancellationPolicySummary(), []);
  const supportsTravelRule = categorySupportsTravelOutsideRule(listing.category);
  const travelOutsideHomeArea = supportsTravelRule
    ? normalizeTravelOutsideHomeArea(listing.handoff.travelOutsideHomeArea)
    : undefined;
  const homeTerritory = supportsTravelRule
    ? listing.handoff.homeTerritory ??
      resolveHomeTerritory({
        countryHint: getSearchCountryCode(),
      })
    : undefined;
  const securityDepositCents = parseUsdToCents(listing.pricing.securityDeposit ?? "");
  const tollHoldCents =
    isVehicleListing && listing.handoff.tollHoldEnabled
      ? parseUsdToCents(listing.handoff.tollHoldAmountUsd || "50")
      : 0;
  const baseDepositAmountCents = securityDepositCents + tollHoldCents;
  const ageGate = useMemo(
    () =>
      assessVehicleAgeGate({
        listing,
        securityDepositCents,
        baseDepositAmountCents,
      }),
    [listing, securityDepositCents, baseDepositAmountCents],
  );
  const depositAmountCents = ageGate.ok
    ? ageGate.adjustedDepositAmountCents
    : baseDepositAmountCents;
  const youngDriverHoldAddOnCents = ageGate.ok ? ageGate.youngDriverHoldAddOnCents : 0;

  const insuranceActiveOk =
    !needsInsuranceProof ||
    usesAgentInsurance ||
    (Boolean(insuranceActiveUntil) && insuranceActiveUntil >= endDate);
  const coiFieldsOk =
    !usesStructuredCoi ||
    (coiStructuredFieldsComplete({
      carrierName: coiCarrierName,
      policyNumber: coiPolicyNumber,
      liabilityLimitUsd: coiLiabilityLimitUsd,
      effectiveDate: coiEffectiveDate,
      expirationDate: coiExpirationDate,
      namedInsured: coiNamedInsured,
    }) &&
      (!coiAdditionalInsuredRequired || coiAdditionalInsuredAttested));
  const insuranceProofOk =
    !needsInsuranceProof ||
    (usesAgentInsurance
      ? agentProofAck && Boolean(ownerProofEmail)
      : usesStructuredCoi
        ? Boolean(insuranceProof) && coiFieldsOk
        : Boolean(insuranceProof));
  const physicalDamageOk = !needsPhysicalDamage || physicalDamageAttested || usesAgentInsurance;
  const proRenterOk = !needsProRenter || proRenterAttested;
  const cdlOk = !needsCdl || (cdlAttested && Boolean(cdlMedia));
  const operatorCertOk =
    !needsOperatorCert || (operatorCertAttested && Boolean(operatorCertMedia));
  const boaterLicenseOk =
    !needsBoaterLicense || (boaterLicenseAttested && Boolean(boaterLicenseMedia));
  const driverRecordOk =
    !needsDriverRecordAttestation ||
    (driverLicenseValidAttested && driverRecordSoftAttested);
  const droneCertOk =
    !needsDroneCert || (!droneRidBlocked && droneCertAttested && droneRemoteIdAck);
  const sportsPfdOk =
    !needsSportsPfd || (!sportsPfdBlocked && sportsPfdAck);
  const ohvTerrainOk = !needsOhvTerrainWaiver || ohvTerrainWaiverAttested;
  const motorcycleEndorsementOk =
    !needsMotorcycleEndorsement || motorcycleEndorsementAttested;
  const paddlePfdOk = !needsPaddlePfd || paddlePfdAck;
  const cateringSanitizeOk =
    !needsCateringSanitize || (!cateringSanitizeBlocked && cateringSanitizeAck);
  const carSeatOk =
    !needsCarSeatGates ||
    (!carSeatListingBlocked &&
      carSeatSanitizationAttested &&
      carSeatRecallAckAttested);
  const cribOk =
    !needsCribGates ||
    (!cribListingBlocked &&
      cribRecallAckAttested &&
      cribDropSideAckAttested &&
      cribSanitizationAttested);
  const ppeAckOk = !needsPpeAck || ppeAckAttested;
  const realEstateHouseRulesOk =
    listing.category.trim() !== "Real Estate" ||
    !listing.modes.rent ||
    Boolean(houseRulesText);
  const uscgSafetyOk =
    !needsUscgSafety || (!uscgListingBlocked && uscgSafetyAck);
  const kitInventoryOk = !needsKitInventory || kitInventoryAck;
  const liabilityWaiverOk = !needsLiabilityWaiver || liabilityWaiverAttested;
  const helmetLockOk = !needsHelmetLock || helmetLockAck;
  const kidsGuardianOk = !needsKidsGuardian || kidsGuardianAttested;
  const dataWipeOk =
    !needsDataWipe || (!dataWipeListingBlocked && dataWipeAttested);
  const paCableStandOk = !needsPaCableStand || paCableStandAck;
  const weatherCancelOk = !needsWeatherCancel || weatherCancelAck;
  const safetyBriefingOk =
    !needsSafetyBriefing || (!safetyBriefingBlocked && safetyBriefingAck);
  const hygieneOk = !needsHygiene || (!hygieneBlocked && hygieneAck);
  const costumeReturnOk = !needsCostumeReturn || costumeReturnConditionAck;
  const costumeHygieneOk =
    !needsCostumeHygiene || (!costumeHygieneBlocked && costumeHygieneAttested);

  const eScooterAgeOk = useMemo(() => {
    if (!needsEScooterAge) return true;
    const dobStr = resolveRenterDateOfBirth();
    if (!dobStr) return false;
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dobStr.trim());
    const dob = m
      ? new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])))
      : new Date(dobStr);
    if (Number.isNaN(dob.getTime())) return false;
    return ageYearsFromDob(dob) >= eScooterMinAge;
  }, [needsEScooterAge, eScooterMinAge]);

  const breakdown: RentalPriceBreakdown = useMemo(
    () =>
      breakdownForListingBooking(listing, {
        rentalDays,
        deliveryRequested,
        insuranceFeeUsd: 0,
      }),
    [listing, rentalDays, deliveryRequested],
  );

  const extrasFeeUsd = useMemo(
    () =>
      computeVehicleExtrasFeeUsd({
        extras: listing.vehicleExtras,
        selected: selectedExtras,
        rentalDays,
      }),
    [listing.vehicleExtras, selectedExtras, rentalDays],
  );

  const totalWithExtras =
    Math.round(
      (breakdown.totalUsd +
        extrasFeeUsd +
        cleaningFeeUsd +
        setupTeardownFeeUsd +
        dryCleanReturnFeeUsd) *
        100,
    ) / 100;

  const canConfirm =
    (!deliveryRequested || deliveryAddress.trim().length > 0) &&
    !datesBlocked &&
    insuranceProofOk &&
    insuranceActiveOk &&
    physicalDamageOk &&
    proRenterOk &&
    cdlOk &&
    operatorCertOk &&
    boaterLicenseOk &&
    driverRecordOk &&
    droneCertOk &&
    sportsPfdOk &&
    ohvTerrainOk &&
    motorcycleEndorsementOk &&
    paddlePfdOk &&
    cateringSanitizeOk &&
    carSeatOk &&
    cribOk &&
    ppeAckOk &&
    realEstateHouseRulesOk &&
    uscgSafetyOk &&
    kitInventoryOk &&
    liabilityWaiverOk &&
    helmetLockOk &&
    kidsGuardianOk &&
    dataWipeOk &&
    paCableStandOk &&
    weatherCancelOk &&
    safetyBriefingOk &&
    hygieneOk &&
    costumeReturnOk &&
    costumeHygieneOk &&
    eScooterAgeOk &&
    !insuranceUploadBusy &&
    !proCredentialBusy &&
    !cdlBusy &&
    !operatorCertBusy &&
    !boaterLicenseBusy &&
    !droneCertBusy &&
    (!isVehicleListing || macropointConsent) &&
    (!needsAgeGate || ageGate.ok) &&
    agreementAccepted;

  const renterDisplayName = useMemo(() => {
    const profile = loadUserProfile();
    return (
      profile.displayName.trim() ||
      [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim() ||
      auth.userEmail?.split("@")[0] ||
      t.rentalAgreement.nameFallback
    );
  }, [auth.userEmail, t.rentalAgreement.nameFallback]);

  const agreementTermsText = useMemo(
    () => getRentalAgreementTermsText(getLocale()),
    // Re-read when locale messages change.
    [t.rentalAgreement.title],
  );

  const agreementSummaryLines = useMemo(() => {
    const extrasLabels = offeredExtraKeys
      .filter((key) => selectedExtras[key])
      .map((key) => {
        if (key === "unlimitedMiles") return t.booking.extraUnlimitedMiles;
        if (key === "childSeat") return t.booking.extraChildSeat;
        if (key === "roofRack") return t.booking.extraRoofRack;
        return t.booking.extraVehicleDelivery(
          formatDistanceFromMiles(listing.vehicleExtras?.vehicleDelivery?.maxMiles ?? 10, undefined, {
            plus: false,
          }),
        );
      });
    return buildEnrichedSummaryLines({
      category: listing.category,
      insuranceRequired: needsInsuranceProof,
      insuranceActiveUntil: needsInsuranceProof ? insuranceActiveUntil : undefined,
      cancellationSummary,
      lateReturnSummary: lateReturnSummary ?? undefined,
      noShowSummary: noShowFeeUsd != null ? t.booking.noShowPolicyBody : undefined,
      trust: {
        operatorCertKind: operatorCertKind ?? undefined,
        operatorCertRequired: needsOperatorCert,
        boaterLicenseRequired: needsBoaterLicense,
        droneCertRequired: needsDroneCert,
        droneWeightClass: droneWeightClass || undefined,
        remoteIdStatus: remoteIdStatus || undefined,
        dinSettingBand: dinSettingBand || undefined,
        pfdIncluded: sportsPfdIncluded || undefined,
        setPieceCountBand: setPieceCountBand || undefined,
        tentSizeBand: tentSizeBand || undefined,
        sleepingBagTempBand: sleepingBagTempBand || undefined,
        stoveFuelType: stoveFuelType || undefined,
        cateringSanitizeRequired: needsCateringSanitize,
        carSeatSanitizationRequired: needsCarSeatGates,
        cribSafetyRequired: needsCribGates,
        ppeAckRequired: needsPpeAck,
        commercialCoffeeTrust: needsCommercialCoffee,
        commercialCoffeeVoltage: needsCommercialCoffee
          ? listing.categorySpecs?.voltageBand || undefined
          : undefined,
        commercialCoffeeNsf: needsCommercialCoffee
          ? listing.categorySpecs?.nsfCertified || undefined
          : undefined,
        commercialCoffeeInstall: needsCommercialCoffee
          ? listing.categorySpecs?.installNeeds || undefined
          : undefined,
        commercialPlayCert: needsCommercialPlay
          ? listing.categorySpecs?.playCertStandard || undefined
          : undefined,
        houseRules: houseRulesText || undefined,
        cleaningFeeUsd: cleaningFeeUsd > 0 ? cleaningFeeUsd : undefined,
        minAgeRequired: needsAgeGate
          ? ageGate.minAgeRequired
          : needsEScooterAge
            ? eScooterMinAge
            : undefined,
        uscgSafetyKitRequired: needsUscgSafety,
        kitInventoryRequired: needsKitInventory,
        kitInventoryChecklist: kitInventoryText || undefined,
        liabilityWaiverRequired: needsLiabilityWaiver,
        helmetPolicy: helmetPolicy || undefined,
        lockPolicy: lockPolicy || undefined,
        overnightStorageRule: overnightStorageRule || undefined,
        kidsGuardianRequired: needsKidsGuardian,
        eBikeClass: listing.categorySpecs?.eBikeClass || undefined,
        ohvTerrainWaiverRequired: needsOhvTerrainWaiver,
        motorcycleEndorsementRequired: needsMotorcycleEndorsement,
        captainMode: showCaptainModeCopy ? captainMode || "unset" : undefined,
        paddlePfdRequired: needsPaddlePfd,
        paddlePfdCount: paddlePfdCount ?? undefined,
        atvMinAgeNote: needsOhvTerrainWaiver ? atvMinAgeNote ?? undefined : undefined,
        setupTeardownFeeUsd: setupTeardownFeeUsd > 0 ? setupTeardownFeeUsd : undefined,
        powerRequirement: listing.categorySpecs?.powerRequirement || undefined,
        hitchClass: listing.categorySpecs?.hitchClass || undefined,
        brakeController: listing.categorySpecs?.brakeController || undefined,
        hinNumber: listing.categorySpecs?.hinNumber || undefined,
        boatRegistration: listing.categorySpecs?.boatRegistration || undefined,
        rvDumpStation: listing.categorySpecs?.dumpStationAccess || undefined,
        rvPropane: listing.categorySpecs?.propaneStatus || undefined,
        rvOccupancy: listing.categorySpecs?.rvOccupancyBand || undefined,
        driverRecordAttestationRequired: needsDriverRecordAttestation,
        structuredCoiRequired: usesStructuredCoi,
        coiAdditionalInsuredRequired: usesStructuredCoi
          ? coiAdditionalInsuredRequired
          : undefined,
        coiMinLiabilityUsd: usesStructuredCoi
          ? insuranceReqs.liabilityMinUsd || undefined
          : undefined,
        coiMinPdUsd: usesStructuredCoi ? insuranceReqs.pdMinUsd || undefined : undefined,
        dataWipeRequired: needsDataWipe,
        hostDataWipeStatus: hostDataWipeStatus || undefined,
        paCableStandInventoryRequired: needsPaCableStand,
        paCableStandInventory: paCableStandText || undefined,
        weatherCancelPolicy: needsWeatherCancel
          ? weatherCancelPolicy || undefined
          : undefined,
        weatherCancelHours: needsWeatherCancel ? weatherCancelHours : undefined,
        safetyBriefingRequired: needsSafetyBriefing,
        safetyBriefingNotes: safetyBriefingNotes || undefined,
        hygieneChecklistRequired: needsHygiene,
        hygieneChecklistNotes: hygieneNotes || undefined,
        costumeHygieneRequired: needsCostumeHygiene,
        returnConditionPolicy: needsCostumeReturn
          ? returnConditionPolicy || undefined
          : undefined,
        dryCleanReturnFeeUsd: dryCleanReturnFeeUsd > 0 ? dryCleanReturnFeeUsd : undefined,
      },
      vehicle:
        isVehicleListing ||
        listing.category.trim() === "Real Estate" ||
        needsFuelTracking ||
        needsBoaterLicense
          ? {
              maxDeductible: deductibleLabel || listing.handoff.insuranceMaxDeductible,
              minLiability: liabilityLabel || listing.handoff.insuranceMinLiability,
              includedMilesPerDay: listing.categorySpecs?.includedMilesPerDay,
              overagePerMile: listing.categorySpecs?.overagePerMile,
              tollHoldAmountCents: tollHoldCents >= 50 ? tollHoldCents : undefined,
              namedDriverNote: isVehicleListing
                ? "Named driver: the booker (or driver attested at start ID) is the only authorized driver unless the host agrees otherwise in writing in-app."
                : undefined,
              extras: extrasLabels.length ? extrasLabels : undefined,
              travelOutsideHomeArea,
              homeTerritoryKind: homeTerritory?.kind,
              homeTerritoryLabel: homeTerritory
                ? formatHomeTerritoryPhrase(homeTerritory)
                : undefined,
              homeTerritoryCountryCode: homeTerritory?.countryCode,
              homeTerritoryRegionCode: homeTerritory?.regionCode,
              fuelPolicy: fuelPolicySnapshot?.policy,
              fuelType: fuelPolicySnapshot?.fuelType,
              tracksDef: fuelPolicySnapshot?.tracksDef,
              fuelMissingFeeCents: fuelPolicySnapshot?.missingFeeCents,
            }
          : undefined,
    });
  }, [
    ageGate.minAgeRequired,
    cleaningFeeUsd,
    deductibleLabel,
    eScooterMinAge,
    fuelPolicySnapshot,
    helmetPolicy,
    homeTerritory,
    houseRulesText,
    insuranceActiveUntil,
    isVehicleListing,
    kitInventoryText,
    liabilityLabel,
    listing.category,
    listing.categorySpecs?.boatRegistration,
    listing.categorySpecs?.brakeController,
    listing.categorySpecs?.dumpStationAccess,
    listing.categorySpecs?.hinNumber,
    listing.categorySpecs?.hitchClass,
    listing.categorySpecs?.includedMilesPerDay,
    listing.categorySpecs?.overagePerMile,
    listing.categorySpecs?.powerRequirement,
    listing.categorySpecs?.propaneStatus,
    listing.categorySpecs?.rvOccupancyBand,
    listing.handoff.insuranceMaxDeductible,
    listing.handoff.insuranceMinLiability,
    listing.vehicleExtras?.vehicleDelivery?.maxMiles,
    lockPolicy,
    needsAgeGate,
    needsBoaterLicense,
    needsCarSeatGates,
    needsDroneCert,
    needsEScooterAge,
    needsFuelTracking,
    needsInsuranceProof,
    needsKitInventory,
    needsLiabilityWaiver,
    needsOperatorCert,
    needsUscgSafety,
    operatorCertKind,
    offeredExtraKeys,
    selectedExtras,
    setupTeardownFeeUsd,
    t.booking,
    tollHoldCents,
    travelOutsideHomeArea,
    cancellationSummary,
    lateReturnSummary,
    noShowFeeUsd,
  ]);

  const stripeCheckout =
    isPaymentsReady() && Boolean(auth.userId && listing.hostId);

  const buildBooking = (id: string, withStripePayment: boolean): RentalBooking => {
    const pickupLabel =
      fulfillment === "delivery"
        ? t.booking.deliveryMiles(
            formatDistanceFromMiles(listing.handoff.deliveryMaxMiles ?? 20, undefined, {
              plus: false,
            }),
          )
        : fulfillment === "contactless"
          ? t.booking.pickupContactless
          : t.booking.pickupInPerson;

    const approvalDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const extrasLabels = offeredExtraKeys
      .filter((key) => selectedExtras[key])
      .map((key) => {
        if (key === "unlimitedMiles") return t.booking.extraUnlimitedMiles;
        if (key === "childSeat") return t.booking.extraChildSeat;
        if (key === "roofRack") return t.booking.extraRoofRack;
        return t.booking.extraVehicleDelivery(
          formatDistanceFromMiles(listing.vehicleExtras?.vehicleDelivery?.maxMiles ?? 10, undefined, {
            plus: false,
          }),
        );
      });

    const bookedIso = new Date().toISOString();

    const rentalAgreement = createRentalAgreementRecord({
      locale: getLocale(),
      commercial: {
        bookingId: id,
        listingId: listing.id,
        itemTitle: title,
        category: listing.category,
        startDate,
        endDate,
        totalUsd: totalWithExtras,
        rentalSubtotalUsd: breakdown.rentalSubtotalUsd,
        depositAmountCents,
        fulfillmentMethod: fulfillment,
        insuranceRequired: needsInsuranceProof,
        insuranceActiveUntil: needsInsuranceProof ? insuranceActiveUntil : undefined,
        cancellationSummary,
        lateReturnSummary: lateReturnSummary ?? undefined,
        noShowSummary: noShowFeeUsd != null ? t.booking.noShowPolicyBody : undefined,
        trust: {
          operatorCertKind: operatorCertKind ?? undefined,
          operatorCertRequired: needsOperatorCert,
          boaterLicenseRequired: needsBoaterLicense,
          droneCertRequired: needsDroneCert,
          droneWeightClass: droneWeightClass || undefined,
          remoteIdStatus: remoteIdStatus || undefined,
          dinSettingBand: dinSettingBand || undefined,
          pfdIncluded: sportsPfdIncluded || undefined,
          setPieceCountBand: setPieceCountBand || undefined,
          tentSizeBand: tentSizeBand || undefined,
          sleepingBagTempBand: sleepingBagTempBand || undefined,
          stoveFuelType: stoveFuelType || undefined,
          cateringSanitizeRequired: needsCateringSanitize,
          carSeatSanitizationRequired: needsCarSeatGates,
        cribSafetyRequired: needsCribGates,
        ppeAckRequired: needsPpeAck,
        commercialCoffeeTrust: needsCommercialCoffee,
        commercialCoffeeVoltage: needsCommercialCoffee
          ? listing.categorySpecs?.voltageBand || undefined
          : undefined,
        commercialCoffeeNsf: needsCommercialCoffee
          ? listing.categorySpecs?.nsfCertified || undefined
          : undefined,
        commercialCoffeeInstall: needsCommercialCoffee
          ? listing.categorySpecs?.installNeeds || undefined
          : undefined,
        commercialPlayCert: needsCommercialPlay
          ? listing.categorySpecs?.playCertStandard || undefined
          : undefined,
          houseRules: houseRulesText || undefined,
          cleaningFeeUsd: cleaningFeeUsd > 0 ? cleaningFeeUsd : undefined,
          minAgeRequired: needsAgeGate
            ? ageGate.minAgeRequired
            : needsEScooterAge
              ? eScooterMinAge
              : undefined,
          uscgSafetyKitRequired: needsUscgSafety,
          kitInventoryRequired: needsKitInventory,
          kitInventoryChecklist: kitInventoryText || undefined,
          liabilityWaiverRequired: needsLiabilityWaiver,
          helmetPolicy: helmetPolicy || undefined,
          lockPolicy: lockPolicy || undefined,
          overnightStorageRule: overnightStorageRule || undefined,
          kidsGuardianRequired: needsKidsGuardian,
          eBikeClass: listing.categorySpecs?.eBikeClass || undefined,
          ohvTerrainWaiverRequired: needsOhvTerrainWaiver,
          motorcycleEndorsementRequired: needsMotorcycleEndorsement,
          captainMode: showCaptainModeCopy ? captainMode || "unset" : undefined,
          paddlePfdRequired: needsPaddlePfd,
          paddlePfdCount: paddlePfdCount ?? undefined,
          atvMinAgeNote: needsOhvTerrainWaiver ? atvMinAgeNote ?? undefined : undefined,
          setupTeardownFeeUsd: setupTeardownFeeUsd > 0 ? setupTeardownFeeUsd : undefined,
          powerRequirement: listing.categorySpecs?.powerRequirement || undefined,
          hitchClass: listing.categorySpecs?.hitchClass || undefined,
          brakeController: listing.categorySpecs?.brakeController || undefined,
          hinNumber: listing.categorySpecs?.hinNumber || undefined,
          boatRegistration: listing.categorySpecs?.boatRegistration || undefined,
          rvDumpStation: listing.categorySpecs?.dumpStationAccess || undefined,
          rvPropane: listing.categorySpecs?.propaneStatus || undefined,
          rvOccupancy: listing.categorySpecs?.rvOccupancyBand || undefined,
          driverRecordAttestationRequired: needsDriverRecordAttestation,
          structuredCoiRequired: usesStructuredCoi,
          coiAdditionalInsuredRequired: usesStructuredCoi
            ? coiAdditionalInsuredRequired
            : undefined,
          coiMinLiabilityUsd: usesStructuredCoi
            ? insuranceReqs.liabilityMinUsd || undefined
            : undefined,
          coiMinPdUsd: usesStructuredCoi ? insuranceReqs.pdMinUsd || undefined : undefined,
          dataWipeRequired: needsDataWipe,
          hostDataWipeStatus: hostDataWipeStatus || undefined,
          paCableStandInventoryRequired: needsPaCableStand,
          paCableStandInventory: paCableStandText || undefined,
          weatherCancelPolicy: needsWeatherCancel
            ? weatherCancelPolicy || undefined
            : undefined,
          weatherCancelHours: needsWeatherCancel ? weatherCancelHours : undefined,
          safetyBriefingRequired: needsSafetyBriefing,
          safetyBriefingNotes: safetyBriefingNotes || undefined,
          hygieneChecklistRequired: needsHygiene,
          hygieneChecklistNotes: hygieneNotes || undefined,
          costumeHygieneRequired: needsCostumeHygiene,
        returnConditionPolicy: needsCostumeReturn
            ? returnConditionPolicy || undefined
            : undefined,
          dryCleanReturnFeeUsd: dryCleanReturnFeeUsd > 0 ? dryCleanReturnFeeUsd : undefined,
        },
        vehicle:
          isVehicleListing ||
          listing.category.trim() === "Real Estate" ||
          needsFuelTracking ||
          needsBoaterLicense
            ? {
                maxDeductible: deductibleLabel || listing.handoff.insuranceMaxDeductible,
                minLiability: liabilityLabel || listing.handoff.insuranceMinLiability,
                includedMilesPerDay: listing.categorySpecs?.includedMilesPerDay,
                overagePerMile: listing.categorySpecs?.overagePerMile,
                tollHoldAmountCents: tollHoldCents >= 50 ? tollHoldCents : undefined,
                namedDriverNote: isVehicleListing
                  ? "Named driver: the booker (or driver attested at start ID) is the only authorized driver unless the host agrees otherwise in writing in-app."
                  : undefined,
                extras: extrasLabels.length ? extrasLabels : undefined,
                travelOutsideHomeArea,
                homeTerritoryKind: homeTerritory?.kind,
                homeTerritoryLabel: homeTerritory
                  ? formatHomeTerritoryPhrase(homeTerritory)
                  : undefined,
                homeTerritoryCountryCode: homeTerritory?.countryCode,
                homeTerritoryRegionCode: homeTerritory?.regionCode,
                fuelPolicy: fuelPolicySnapshot?.policy,
                fuelType: fuelPolicySnapshot?.fuelType,
                tracksDef: fuelPolicySnapshot?.tracksDef,
                fuelMissingFeeCents: fuelPolicySnapshot?.missingFeeCents,
              }
            : undefined,
      },
      renterSignature: auth.userId
        ? makeAgreementSignature({
            party: "renter",
            userId: auth.userId,
            displayName: renterDisplayName,
            termsVersion: RENTAL_AGREEMENT_VERSION,
          })
        : null,
    });

    return {
      id,
      role: "renter",
      status: "pending_approval",
      itemTitle: title,
      itemEmoji: "📷",
      startDate,
      endDate,
      createdAt: bookedIso,
      bookedAt: bookedIso,
      lateReturnFee: lateReturnSnapshot,
      listingId: listing.id,
      itemQrToken: listing.qrToken?.trim() || listing.id,
      counterpartyId: listing.hostId ?? "",
      counterpartyName: hostDisplayName,
      counterpartyIdentityVerified: false,
      counterpartyPhoneVerified: false,
      pickupLabel,
      rentalSubtotalUsd: breakdown.rentalSubtotalUsd,
      deliveryFee: breakdown.deliveryFeeUsd,
      deliveryRoundTripUsd: breakdown.deliveryRoundTripUsd,
      heavySurchargeUsd: breakdown.heavySurchargeUsd,
      itemWeightLbs: breakdown.itemWeightLbs ?? undefined,
      poundsOverThreshold:
        breakdown.heavySurchargeUsd > 0 ? breakdown.poundsOverThreshold : undefined,
      deliveryRequested: breakdown.deliveryRequested,
      serviceFeeUsd: breakdown.serviceFeeUsd,
      totalUsd: totalWithExtras,
      itemHeavy: listing.handoff.itemHeavy,
      insuranceIncluded: false,
      listingModes: ["rent"],
      fulfillmentMethod: fulfillment,
      deliveryAddress: deliveryRequested ? deliveryAddress.trim() : undefined,
      contactlessInstructions: listing.handoff.contactlessInstructions || undefined,
      pickupWindowStart: new Date().toISOString(),
      stripePayment: withStripePayment,
      paymentOnHold: withStripePayment,
      depositAmountCents,
      youngDriverHoldAddOnCents:
        youngDriverHoldAddOnCents > 0 ? youngDriverHoldAddOnCents : undefined,
      renterAgeYearsAtBooking: ageGate.ok ? ageGate.ageYears : undefined,
      approvalDeadline,
      manualBooking: true,
      insuranceProofMedia: insuranceProof,
      insuranceProofPath: insuranceProofPath || undefined,
      insuranceProofUrl: insuranceProofUrl || undefined,
      insuranceActiveUntil: needsInsuranceProof ? insuranceActiveUntil : undefined,
      physicalDamageAttested: needsPhysicalDamage ? physicalDamageAttested || usesAgentInsurance : undefined,
      proRenterAttested: needsProRenter ? proRenterAttested : undefined,
      proCredentialMedia: needsProRenter ? proCredentialMedia : undefined,
      cdlAttested: needsCdl ? cdlAttested : undefined,
      cdlMedia: needsCdl ? cdlMedia : undefined,
      operatorCertKind: needsOperatorCert ? operatorCertKind ?? undefined : undefined,
      operatorCertAttested: needsOperatorCert ? operatorCertAttested : undefined,
      operatorCertMedia: needsOperatorCert ? operatorCertMedia : undefined,
      boaterLicenseAttested: needsBoaterLicense ? boaterLicenseAttested : undefined,
      boaterLicenseMedia: needsBoaterLicense ? boaterLicenseMedia : undefined,
      driverLicenseValidAttested: needsDriverRecordAttestation
        ? driverLicenseValidAttested
        : undefined,
      driverRecordSoftAttested: needsDriverRecordAttestation
        ? driverRecordSoftAttested
        : undefined,
      driverLicenseState: needsDriverRecordAttestation
        ? driverLicenseState.trim().toUpperCase() || undefined
        : undefined,
      driverLicenseLast4: needsDriverRecordAttestation
        ? driverLicenseLast4.replace(/\D/g, "").slice(-4) || undefined
        : undefined,
      coiCarrierName: usesStructuredCoi ? coiCarrierName.trim() || undefined : undefined,
      coiPolicyNumber: usesStructuredCoi ? coiPolicyNumber.trim() || undefined : undefined,
      coiLiabilityLimitUsd: usesStructuredCoi
        ? coiLiabilityLimitUsd.trim() || undefined
        : undefined,
      coiEffectiveDate: usesStructuredCoi ? coiEffectiveDate.trim() || undefined : undefined,
      coiExpirationDate: usesStructuredCoi ? coiExpirationDate.trim() || undefined : undefined,
      coiNamedInsured: usesStructuredCoi ? coiNamedInsured.trim() || undefined : undefined,
      coiAdditionalInsuredAttested: usesStructuredCoi
        ? coiAdditionalInsuredRequired
          ? coiAdditionalInsuredAttested
          : undefined
        : undefined,
      droneCertAttested: needsDroneCert ? droneCertAttested : undefined,
      droneCertMedia: needsDroneCert ? droneCertMedia : undefined,
      droneRemoteIdAck: needsDroneCert ? droneRemoteIdAck : undefined,
      droneWeightClassSnapshot: needsDroneCert ? droneWeightClass || undefined : undefined,
      remoteIdStatusSnapshot: needsDroneCert ? remoteIdStatus || undefined : undefined,
      sportsPfdAck: needsSportsPfd ? sportsPfdAck : undefined,
      sportsPfdIncludedSnapshot: needsSportsPfd ? sportsPfdIncluded || undefined : undefined,
      dinSettingBandSnapshot: needsSnowSports ? dinSettingBand || undefined : undefined,
      cateringSanitizeAck: needsCateringSanitize ? cateringSanitizeAck : undefined,
      carSeatSanitizationAttested: needsCarSeatGates ? carSeatSanitizationAttested : undefined,
      carSeatRecallAckAttested: needsCarSeatGates ? carSeatRecallAckAttested : undefined,
      cribRecallAckAttested: needsCribGates ? cribRecallAckAttested : undefined,
      cribDropSideAckAttested: needsCribGates ? cribDropSideAckAttested : undefined,
      cribSanitizationAttested: needsCribGates ? cribSanitizationAttested : undefined,
      ppeAckAttested: needsPpeAck ? ppeAckAttested : undefined,
      houseRulesSnapshot: houseRulesText || undefined,
      cleaningFeeUsd: cleaningFeeUsd > 0 ? cleaningFeeUsd : undefined,
      uscgSafetyAck: needsUscgSafety ? uscgSafetyAck : undefined,
      kitInventoryAck: needsKitInventory ? kitInventoryAck : undefined,
      kitInventorySnapshot: kitInventoryText || undefined,
      liabilityWaiverAttested: needsLiabilityWaiver ? liabilityWaiverAttested : undefined,
      helmetLockAck: needsHelmetLock ? helmetLockAck : undefined,
      helmetPolicySnapshot: helmetPolicy || undefined,
      lockPolicySnapshot: lockPolicy || undefined,
      overnightStorageRuleSnapshot: overnightStorageRule || undefined,
      kidsGuardianAttested: needsKidsGuardian ? kidsGuardianAttested : undefined,
      ohvTerrainWaiverAttested: needsOhvTerrainWaiver
        ? ohvTerrainWaiverAttested
        : undefined,
      motorcycleEndorsementAttested: needsMotorcycleEndorsement
        ? motorcycleEndorsementAttested
        : undefined,
      captainModeSnapshot: showCaptainModeCopy ? captainMode || "unset" : undefined,
      paddlePfdAck: needsPaddlePfd ? paddlePfdAck : undefined,
      paddlePfdIncludedSnapshot: needsPaddlePfd ? paddlePfdIncluded || undefined : undefined,
      paddlePfdCountSnapshot: needsPaddlePfd ? paddlePfdCount ?? undefined : undefined,
      setupTeardownFeeUsd: setupTeardownFeeUsd > 0 ? setupTeardownFeeUsd : undefined,
      weatherCancelPolicySnapshot: needsWeatherCancel
        ? weatherCancelPolicy || undefined
        : undefined,
      weatherCancelHours: needsWeatherCancel ? weatherCancelHours : undefined,
      weatherCancelAck: needsWeatherCancel ? weatherCancelAck : undefined,
      safetyBriefingAck: needsSafetyBriefing ? safetyBriefingAck : undefined,
      safetyBriefingNotesSnapshot: safetyBriefingNotes || undefined,
      hygieneAck: needsHygiene ? hygieneAck : undefined,
      hygieneNotesSnapshot: hygieneNotes || undefined,
      costumeReturnConditionAck: needsCostumeReturn ? costumeReturnConditionAck : undefined,
      costumeHygieneAttested: needsCostumeHygiene ? costumeHygieneAttested : undefined,
      returnConditionPolicySnapshot: returnConditionPolicy || undefined,
      dryCleanReturnFeeUsd: dryCleanReturnFeeUsd > 0 ? dryCleanReturnFeeUsd : undefined,
      dataWipeAttested: needsDataWipe ? dataWipeAttested : undefined,
      hostDataWipeStatusSnapshot: needsDataWipe ? hostDataWipeStatus || undefined : undefined,
      paCableStandAck: needsPaCableStand ? paCableStandAck : undefined,
      paCableStandSnapshot: paCableStandText || undefined,
      insuranceAgentProofAcknowledged: usesAgentInsurance ? agentProofAck : undefined,
      insuranceOwnerProofEmail: usesAgentInsurance ? ownerProofEmail || undefined : undefined,
      selectedVehicleExtras: selectedExtras,
      extrasFeeUsd: extrasFeeUsd > 0 ? extrasFeeUsd : undefined,
      tollHoldAmountCents: tollHoldCents >= 50 ? tollHoldCents : undefined,
      travelOutsideHomeArea,
      homeTerritory,
      macropointConsentAt:
        isVehicleListing && macropointConsent
          ? new Date().toISOString()
          : undefined,
      fuelPolicy: fuelPolicySnapshot,
      rentalAgreement,
    };
  };

  const finalizeBooking = (id: string, booking: RentalBooking) => {
    if (auth.userId && listing.hostId) {
      trackManualBookingRequest(id, listing.hostId);
      void createNotificationRemote({
        recipientId: listing.hostId,
        actorId: auth.userId,
        type: "booking_request",
        title: t.booking.newRequestTitle,
        body: t.booking.newRequestBody(title),
        rentalId: id,
        listingId: listing.id,
      });
    }
    appendRentalBooking(booking);
    onConfirmed(id);
  };

  const persistRentalRow = async (id: string, booking: RentalBooking): Promise<void> => {
    if (!auth.userId || !listing.hostId) return;
    const pickupAt = new Date(`${startDate}T14:00:00`).toISOString();
    const dueAt = new Date(`${endDate}T23:59:59`).toISOString();
    const row = toSupabaseRentalInsert({
      id,
      listingId: listing.id,
      ownerId: listing.hostId,
      renterId: auth.userId,
      status: booking.status,
      startDate,
      endDate,
      bookingMode: fulfillment,
      deliveryAddress: booking.deliveryAddress,
      pickupPin: booking.pickupPin,
      returnPin: booking.returnPin,
      safelyPolicyId: null,
      insuranceFeeCents: 0,
      depositAmountCents,
      rentalTotalCents: Math.round(totalWithExtras * 100),
      pickupAt,
      dueAt,
      stripePaymentStatus: booking.stripePayment ? "requires_payment_method" : undefined,
      insuranceProofPath: booking.insuranceProofPath ?? null,
      insuranceProofUrl: booking.insuranceProofUrl ?? null,
      insuranceActiveUntil: booking.insuranceActiveUntil ?? null,
      insurancePolicyNote: booking.insurancePolicyNote ?? null,
      rentalAgreement: booking.rentalAgreement ?? null,
    });
    await createRentalRemote(row);
  };

  const cancelPendingRental = (id: string) => {
    void updateRentalRemote(id, { status: "cancelled" });
    updateBooking(id, { status: "cancelled" });
  };

  const handleConfirm = () => {
    if (!canSubmitBookingRequest(auth.userId, listing.hostId)) {
      setPaymentError(getSignInRequiredMessage());
      return;
    }

    const id =
      insuranceDraftId ||
      (typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `rent-${Date.now()}`);

    if (!stripeCheckout) {
      setConfirmBusy(true);
      setPaymentError(null);
      void (async () => {
        const booking = buildBooking(id, false);
        try {
          if (isSupabaseConfigured()) {
            await persistRentalRow(id, booking);
          }
        } catch (error) {
          setPaymentError(error instanceof Error ? error.message : t.booking.failedToSave);
          return;
        }
        finalizeBooking(id, booking);
      })().finally(() => setConfirmBusy(false));
      return;
    }

    const booking = buildBooking(id, true);

    setConfirmBusy(true);
    setPaymentError(null);
    void (async () => {
      try {
        await persistRentalRow(id, booking);
      } catch (error) {
        setPaymentError(error instanceof Error ? error.message : t.booking.failedToSave);
        return;
      }

      const amountCents = Math.max(50, Math.round(totalWithExtras * 100));
      const pi = await createRentalPaymentIntent({
        rentalId: id,
        listingId: listing.id,
        ownerId: listing.hostId!,
        amountCents,
      });

      if (!pi.ok) {
        setPaymentError(pi.reason);
        cancelPendingRental(id);
        return;
      }

      setPendingBookingId(id);
      setPaymentClientSecret(pi.clientSecret);
    })().finally(() => setConfirmBusy(false));
  };

  const handlePaymentSuccess = () => {
    if (!pendingBookingId) return;
    const bookingId = pendingBookingId;
    setPaymentClientSecret(null);

    if (stripeCheckout && depositAmountCents >= 50) {
      setPendingDepositCents(depositAmountCents);
      setConfirmBusy(true);
      void (async () => {
        await syncRentalPaymentStatus(bookingId);

        const deposit = await createDepositPaymentIntent(bookingId);
        if (deposit.ok) {
          setDepositClientSecret(deposit.clientSecret);
          return;
        }
        setPaymentError(deposit.reason);
      })().finally(() => setConfirmBusy(false));
      return;
    }

    void (async () => {
      if (stripeCheckout) {
        await syncRentalPaymentStatus(bookingId);
      }
      finalizeAfterPayment(bookingId);
    })();
  };

  const finalizeAfterPayment = (id: string) => {
    const booking = buildBooking(id, Boolean(stripeCheckout));
    finalizeBooking(id, {
      ...booking,
      paymentOnHold: Boolean(stripeCheckout),
      depositStatus:
        pendingDepositCents >= 50 ? "held" : booking.depositAmountCents ? booking.depositStatus : undefined,
      depositAmountCents: pendingDepositCents >= 50 ? pendingDepositCents : booking.depositAmountCents,
    });
    setPendingBookingId(null);
    setDepositClientSecret(null);
    setPendingDepositCents(0);
  };

  const handleDepositSuccess = () => {
    if (!pendingBookingId) return;
    finalizeAfterPayment(pendingBookingId);
  };

  return (
    <div className="screen bg-background flex flex-col">
      <div className="shrink-0 z-10 bg-card/80 backdrop-blur-sm border-b border-border px-3 sm:px-4 py-3 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-semibold flex-1">{t.booking.title}</h1>
      </div>

      <div className="screen-scroll flex-1 min-h-0 p-4 space-y-5 pb-28">
        <div>
          <h2 className="text-lg font-bold">{title}</h2>
          {listing.handoff.itemHeavy ? (
            <span className="mt-2 inline-flex items-center gap-1 rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900">
              <Package className="h-3.5 w-3.5" aria-hidden />
              {t.booking.heavyItem}
            </span>
          ) : null}
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-semibold mb-2">{t.booking.rentalLength}</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setRentalDays((d) => Math.max(minRentalDays, d - 1))}
              className="h-9 w-9 rounded-lg border border-border text-lg font-bold"
            >
              −
            </button>
            <span className="min-w-[4rem] text-center font-semibold">
              {t.booking.days(rentalDays)}
            </span>
            <button
              type="button"
              onClick={() => setRentalDays((d) => Math.min(90, d + 1))}
              className="h-9 w-9 rounded-lg border border-border text-lg font-bold"
            >
              +
            </button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {t.booking.hostMinimum(listing.pricing.minimumPeriod)}
          </p>
          {listing.pricing.longTermEnabled ? (
            <p className="mt-2 text-xs text-muted-foreground">
              {t.booking.longTermTip}
            </p>
          ) : null}
          <p className="mt-2 text-xs text-muted-foreground">
            {new Date(startDate).toLocaleDateString()} –{" "}
            {new Date(endDate).toLocaleDateString()}
          </p>
          <p className="mt-3 text-xs font-medium text-muted-foreground">
            {t.booking.selectRentalDates}
          </p>
          <div className="mt-2">
            <AvailabilityCalendar
              busyIntervals={busyIntervals}
              loading={busyLoading}
              mode="range"
              selected={selectedRange}
              onSelectRange={({ start, end }) => {
                if (!start) return;
                setStartDate(start);
                if (end && end >= start) {
                  const days = daysInclusive(start, end);
                  setRentalDays(Math.max(minRentalDays, Math.min(90, days)));
                } else {
                  setRentalDays(Math.max(minRentalDays, 1));
                }
              }}
            />
          </div>
          {datesBlocked ? (
            <p className="mt-2 text-xs font-semibold text-red-600">
              {t.booking.datesBlocked}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold">{t.booking.howWantItem}</p>
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              disabled={opt.disabled}
              onClick={() => setFulfillment(opt.id)}
              className={`w-full rounded-xl border p-4 text-left transition-colors ${
                opt.disabled
                  ? "cursor-not-allowed border-border bg-muted/40 opacity-60"
                  : fulfillment === opt.id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <div className="flex items-start gap-3">
                {opt.id === "delivery" ? (
                  <Truck className="w-5 h-5 shrink-0 text-primary mt-0.5" />
                ) : (
                  <MapPin className="w-5 h-5 shrink-0 text-primary mt-0.5" />
                )}
                <div>
                  <p className="font-medium">{opt.label}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{opt.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {deliveryRequested ? (
          <div className="rounded-xl border border-border bg-card p-4">
            <label className="text-sm font-semibold block mb-2">{t.booking.deliveryAddress}</label>
            <input
              type="text"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder={t.booking.deliveryAddressPlaceholder}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              {t.booking.deliveryFeeNote}
            </p>
          </div>
        ) : null}

        {listing.category.trim() === "Vehicles" && listing.modes.rent ? (
          <CategoryFactCard category="Vehicles" />
        ) : null}
        {(listing.category.trim() === "Heavy Equipment" ||
          listing.category.trim() === "Construction") &&
        listing.modes.rent ? (
          <CategoryFactCard category={listing.category.trim()} />
        ) : null}
        {listing.category.trim() === "Boats & Water" && listing.modes.rent ? (
          <CategoryFactCard category="Boats & Water" />
        ) : null}
        {listing.category.trim() === "Real Estate" && listing.modes.rent ? (
          <CategoryFactCard category="Real Estate" />
        ) : null}
        {listingIsDrone(listing) && listing.modes.rent ? (
          <CategoryFactCard category="Photo & Video" />
        ) : null}
        {needsCarSeatGates || needsCribGates || needsCommercialPlay ? (
          <CategoryFactCard category="Baby & Kids" subcategory={listing.subcategory} />
        ) : null}
        {listing.category.trim() === "Tools & DIY" && listing.modes.rent ? (
          <CategoryFactCard category="Tools & DIY" />
        ) : null}
        {listing.category.trim() === "Garden & Yard" && listing.modes.rent ? (
          <CategoryFactCard category="Garden & Yard" />
        ) : null}
        {listing.category.trim() === "Home & Kitchen" && listing.modes.rent ? (
          <CategoryFactCard category="Home & Kitchen" />
        ) : null}
        {isHighValueGear && !listingIsDrone(listing) ? (
          <CategoryFactCard
            category={
              listing.category.trim() === "Electronics & Tech"
                ? "Electronics & Tech"
                : "Photo & Video"
            }
          />
        ) : null}
        {listing.category.trim() === "Gym & Fitness" && listing.modes.rent ? (
          <CategoryFactCard category="Gym & Fitness" />
        ) : null}
        {listing.category.trim() === "Sports & Recreation" && listing.modes.rent ? (
          <CategoryFactCard category="Sports & Recreation" />
        ) : null}
        {listing.category.trim() === "Outdoor & Camping" && listing.modes.rent ? (
          <CategoryFactCard category="Outdoor & Camping" />
        ) : null}
        {isBikesListing ? <CategoryFactCard category="Bikes & Scooters" /> : null}
        {isPartyListing ? <CategoryFactCard category="Party & Events" /> : null}
        {isToolsListing ? <CategoryFactCard category="Tools & DIY" /> : null}
        {isCostumeListing ? <CategoryFactCard category="Costume & Cosplay" /> : null}
        {isOfficeListing ? <CategoryFactCard category="Office & Business" /> : null}
        {isMusicListing ? <CategoryFactCard category="Music & Audio" /> : null}

        {listing.category.trim() === "Real Estate" && houseRulesText ? (
          <div className="rounded-xl border border-border bg-card p-4 space-y-2">
            <p className="text-sm font-semibold text-gray-900">{t.booking.houseRulesTitle}</p>
            <p className="text-[13px] leading-snug whitespace-pre-wrap text-muted-foreground">
              {houseRulesText}
            </p>
            {cleaningFeeUsd > 0 ? (
              <p className="text-sm font-medium text-gray-900">
                {t.booking.cleaningFeeLine(formatMoney(cleaningFeeUsd))}
              </p>
            ) : null}
          </div>
        ) : null}

        {isPartyListing &&
        (setupTeardownFeeUsd > 0 ||
          listing.categorySpecs?.powerRequirement ||
          needsWeatherCancel) ? (
          <div className="rounded-xl border border-border bg-card p-4 space-y-1">
            {setupTeardownFeeUsd > 0 ? (
              <p className="text-sm font-semibold text-gray-900">
                {t.booking.setupTeardownFeeLine(formatMoney(setupTeardownFeeUsd))}
              </p>
            ) : null}
            {listing.categorySpecs?.powerRequirement ? (
              <p className="text-[13px] text-muted-foreground">
                {t.booking.powerRequirementLine(
                  t.listing.specs.options[listing.categorySpecs.powerRequirement] ??
                    listing.categorySpecs.powerRequirement,
                )}
              </p>
            ) : null}
            {needsWeatherCancel && weatherCancelPolicy ? (
              <p className="text-[13px] text-muted-foreground">
                {t.booking.weatherCancelPolicyLine(
                  t.listing.specs.options[weatherCancelPolicy] ?? weatherCancelPolicy,
                )}
              </p>
            ) : null}
          </div>
        ) : null}

        
        {needsDataWipe && dataWipeListingBlocked ? (
          <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-950">
            <p className="font-semibold">{t.booking.dataWipeBlockedTitle}</p>
            <p className="mt-1 text-[13px] leading-snug">{t.booking.dataWipeBlockedBody}</p>
          </div>
        ) : null}

        {needsDataWipe && !dataWipeListingBlocked ? (
          <div className="rounded-xl border border-slate-300 bg-slate-50/80 p-4 space-y-3">
            <p className="text-sm font-semibold text-slate-950">{t.booking.dataWipeTitle}</p>
            <p className="text-[12px] text-slate-800/90">{t.booking.dataWipeBody}</p>
            {hostDataWipeStatus ? (
              <p className="text-[12px] text-slate-800">
                {t.booking.dataWipeHostStatusLine(
                  t.listing.specs.options[hostDataWipeStatus] ?? hostDataWipeStatus,
                )}
              </p>
            ) : null}
            <label className="flex items-start gap-2 text-xs text-slate-950">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={dataWipeAttested}
                onChange={(e) => setDataWipeAttested(e.target.checked)}
              />
              <span>{t.booking.dataWipeAttest}</span>
            </label>
          </div>
        ) : null}

        {needsPaCableStand ? (
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-4 space-y-3">
            <p className="text-sm font-semibold text-indigo-950">{t.booking.paCableStandTitle}</p>
            {paCableStandText ? (
              <p className="text-[13px] whitespace-pre-wrap text-indigo-900/90">{paCableStandText}</p>
            ) : (
              <p className="text-[12px] text-indigo-900/80">{t.booking.paCableStandEmpty}</p>
            )}
            <label className="flex items-start gap-2 text-xs text-indigo-950">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={paCableStandAck}
                onChange={(e) => setPaCableStandAck(e.target.checked)}
              />
              <span>{t.booking.paCableStandAttest}</span>
            </label>
          </div>
        ) : null}

        {needsCostumeReturn ? (
          <div className="rounded-xl border border-border bg-card p-4 space-y-1">
            <p className="text-sm font-semibold text-gray-900">
              {t.booking.returnConditionPolicyLine(
                returnConditionPolicy
                  ? t.listing.specs.options[returnConditionPolicy] ?? returnConditionPolicy
                  : t.booking.returnConditionFallback,
              )}
            </p>
            {dryCleanReturnFeeUsd > 0 ? (
              <p className="text-[13px] text-muted-foreground">
                {t.booking.dryCleanReturnFeeLine(formatMoney(dryCleanReturnFeeUsd))}
              </p>
            ) : null}
          </div>
        ) : null}

        {needsCarSeatGates && carSeatListingBlocked ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-950">
            <p className="font-semibold">{t.booking.carSeatBlockedTitle}</p>
            <p className="mt-1 text-[13px] leading-snug">{t.booking.carSeatBlockedBody}</p>
          </div>
        ) : null}

        {needsCarSeatGates && !carSeatListingBlocked ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 space-y-3">
            <p className="text-sm font-semibold text-rose-950">{t.booking.carSeatSafetyTitle}</p>
            <label className="flex items-start gap-2 text-xs text-rose-950">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={carSeatRecallAckAttested}
                onChange={(e) => setCarSeatRecallAckAttested(e.target.checked)}
              />
              <span>{t.booking.carSeatRecallAttest}</span>
            </label>
            <label className="flex items-start gap-2 text-xs text-rose-950">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={carSeatSanitizationAttested}
                onChange={(e) => setCarSeatSanitizationAttested(e.target.checked)}
              />
              <span>{t.booking.carSeatSanitizationAttest}</span>
            </label>
          </div>
        ) : null}

        {needsCribGates && cribListingBlocked ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-950">
            <p className="font-semibold">{t.booking.cribBlockedTitle}</p>
            <p className="mt-1 text-[13px] leading-snug">{t.booking.cribBlockedBody}</p>
          </div>
        ) : null}
        {needsCribGates && !cribListingBlocked ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 space-y-3">
            <p className="text-sm font-semibold text-rose-950">{t.booking.cribSafetyTitle}</p>
            <label className="flex items-start gap-2 text-xs text-rose-950">
              <input type="checkbox" className="mt-0.5" checked={cribRecallAckAttested} onChange={(e) => setCribRecallAckAttested(e.target.checked)} />
              <span>{t.booking.cribRecallAttest}</span>
            </label>
            <label className="flex items-start gap-2 text-xs text-rose-950">
              <input type="checkbox" className="mt-0.5" checked={cribDropSideAckAttested} onChange={(e) => setCribDropSideAckAttested(e.target.checked)} />
              <span>{t.booking.cribDropSideAttest}</span>
            </label>
            <label className="flex items-start gap-2 text-xs text-rose-950">
              <input type="checkbox" className="mt-0.5" checked={cribSanitizationAttested} onChange={(e) => setCribSanitizationAttested(e.target.checked)} />
              <span>{t.booking.cribSanitizationAttest}</span>
            </label>
          </div>
        ) : null}
        {needsPpeAck ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 space-y-3">
            <p className="text-sm font-semibold text-amber-950">{t.booking.ppeAckTitle}</p>
            <p className="text-[12px] text-amber-900/90">{t.booking.ppeAckBody}</p>
            <label className="flex items-start gap-2 text-xs text-amber-950">
              <input type="checkbox" className="mt-0.5" checked={ppeAckAttested} onChange={(e) => setPpeAckAttested(e.target.checked)} />
              <span>{t.booking.ppeAckAttest}</span>
            </label>
          </div>
        ) : null}
        {needsCommercialCoffee ? (
          <div className="rounded-xl border border-border bg-card p-4 space-y-1">
            <p className="text-sm font-semibold text-gray-900">{t.booking.commercialCoffeeTitle}</p>
            <p className="text-[12px] text-muted-foreground">{t.booking.commercialCoffeeBody}</p>
            {[
              listing.categorySpecs?.voltageBand
                ? t.booking.commercialCoffeeVoltageLine(
                    t.listing.specs.options[listing.categorySpecs.voltageBand] ?? listing.categorySpecs.voltageBand,
                  )
                : null,
              listing.categorySpecs?.nsfCertified
                ? t.booking.commercialCoffeeNsfLine(
                    t.listing.specs.options[listing.categorySpecs.nsfCertified] ?? listing.categorySpecs.nsfCertified,
                  )
                : null,
              listing.categorySpecs?.installNeeds
                ? t.booking.commercialCoffeeInstallLine(
                    t.listing.specs.options[listing.categorySpecs.installNeeds] ?? listing.categorySpecs.installNeeds,
                  )
                : null,
            ].filter(Boolean).map((line) => (
              <p key={String(line)} className="text-[13px] text-gray-800">{line}</p>
            ))}
          </div>
        ) : null}

        {needsUscgSafety && uscgListingBlocked ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-950">
            <p className="font-semibold">{t.booking.uscgBlockedTitle}</p>
            <p className="mt-1 text-[13px] leading-snug">{t.booking.uscgBlockedBody}</p>
          </div>
        ) : null}

        {needsUscgSafety && !uscgListingBlocked ? (
          <div className="rounded-xl border border-cyan-200 bg-cyan-50/70 p-4 space-y-3">
            <p className="text-sm font-semibold text-cyan-950">{t.booking.uscgSafetyTitle}</p>
            <p className="text-[12px] text-cyan-900/90">{t.booking.uscgSafetyBody}</p>
            {(listing.categorySpecs?.hinNumber || listing.categorySpecs?.boatRegistration) && (
              <p className="text-[12px] text-cyan-950">
                {[
                  listing.categorySpecs?.hinNumber
                    ? t.booking.hinLine(listing.categorySpecs.hinNumber)
                    : null,
                  listing.categorySpecs?.boatRegistration
                    ? t.booking.registrationLine(listing.categorySpecs.boatRegistration)
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
            <label className="flex items-start gap-2 text-xs text-cyan-950">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={uscgSafetyAck}
                onChange={(e) => setUscgSafetyAck(e.target.checked)}
              />
              <span>{t.booking.uscgSafetyAttest}</span>
            </label>
          </div>
        ) : null}

        {needsKitInventory ? (
          <div className="rounded-xl border border-violet-200 bg-violet-50/70 p-4 space-y-3">
            <p className="text-sm font-semibold text-violet-950">{t.booking.kitInventoryTitle}</p>
            {kitInventoryText ? (
              <p className="text-[13px] whitespace-pre-wrap text-violet-900/90">{kitInventoryText}</p>
            ) : (
              <p className="text-[12px] text-violet-900/80">{t.booking.kitInventoryEmpty}</p>
            )}
            <label className="flex items-start gap-2 text-xs text-violet-950">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={kitInventoryAck}
                onChange={(e) => setKitInventoryAck(e.target.checked)}
              />
              <span>{t.booking.kitInventoryAttest}</span>
            </label>
          </div>
        ) : null}

        {needsLiabilityWaiver ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 space-y-3">
            <p className="text-sm font-semibold text-amber-950">{t.booking.liabilityWaiverTitle}</p>
            <p className="text-[12px] text-amber-900/90">{t.booking.liabilityWaiverBody}</p>
            <label className="flex items-start gap-2 text-xs text-amber-950">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={liabilityWaiverAttested}
                onChange={(e) => setLiabilityWaiverAttested(e.target.checked)}
              />
              <span>{t.booking.liabilityWaiverAttest}</span>
            </label>
          </div>
        ) : null}

        {needsHelmetLock ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-3">
            <p className="text-sm font-semibold text-emerald-950">{t.booking.helmetLockTitle}</p>
            <p className="text-[12px] text-emerald-900/90">
              {t.booking.helmetLockBody(
                helmetPolicy
                  ? t.listing.specs.options[helmetPolicy] ?? helmetPolicy
                  : t.booking.helmetPolicyFallback,
                lockPolicy
                  ? t.listing.specs.options[lockPolicy] ?? lockPolicy
                  : t.booking.lockPolicyFallback,
                overnightStorageRule
                  ? t.listing.specs.options[overnightStorageRule] ?? overnightStorageRule
                  : undefined,
              )}
            </p>
            <label className="flex items-start gap-2 text-xs text-emerald-950">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={helmetLockAck}
                onChange={(e) => setHelmetLockAck(e.target.checked)}
              />
              <span>{t.booking.helmetLockAttest}</span>
            </label>
          </div>
        ) : null}

        {needsKidsGuardian ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-3">
            <p className="text-sm font-semibold text-emerald-950">{t.booking.kidsGuardianTitle}</p>
            <p className="text-[12px] text-emerald-900/90">{t.booking.kidsGuardianBody}</p>
            <label className="flex items-start gap-2 text-xs text-emerald-950">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={kidsGuardianAttested}
                onChange={(e) => setKidsGuardianAttested(e.target.checked)}
              />
              <span>{t.booking.kidsGuardianAttest}</span>
            </label>
          </div>
        ) : null}

        {needsOhvTerrainWaiver ? (
          <div className="rounded-xl border border-lime-200 bg-lime-50/70 p-4 space-y-3">
            <p className="text-sm font-semibold text-lime-950">{t.booking.ohvTerrainTitle}</p>
            <p className="text-[12px] text-lime-900/90">{t.booking.ohvTerrainBody}</p>
            {atvMinAgeNote != null ? (
              <p className="text-[12px] font-medium text-lime-950/90">
                {t.booking.atvAgeNote(atvMinAgeNote)}
              </p>
            ) : null}
            <label className="flex items-start gap-2 text-xs text-lime-950">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={ohvTerrainWaiverAttested}
                onChange={(e) => setOhvTerrainWaiverAttested(e.target.checked)}
              />
              <span>{t.booking.ohvTerrainAttest}</span>
            </label>
          </div>
        ) : null}

        {needsMotorcycleEndorsement ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 space-y-3">
            <p className="text-sm font-semibold text-rose-950">
              {t.booking.motorcycleEndorsementTitle}
            </p>
            <p className="text-[12px] text-rose-900/90">{t.booking.motorcycleEndorsementBody}</p>
            <label className="flex items-start gap-2 text-xs text-rose-950">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={motorcycleEndorsementAttested}
                onChange={(e) => setMotorcycleEndorsementAttested(e.target.checked)}
              />
              <span>{t.booking.motorcycleEndorsementAttest}</span>
            </label>
          </div>
        ) : null}

        {showCaptainModeCopy ? (
          <div className="rounded-xl border border-cyan-200 bg-cyan-50/70 p-4 space-y-2">
            <p className="text-sm font-semibold text-cyan-950">{t.booking.captainModeTitle}</p>
            <p className="text-[12px] text-cyan-900/90">
              {captainMode === "captain_included"
                ? t.booking.captainIncludedBody
                : captainMode === "bareboat"
                  ? t.booking.bareboatBody
                  : t.booking.captainModeUnsetBody}
            </p>
          </div>
        ) : null}

        {needsPaddlePfd ? (
          <div className="rounded-xl border border-teal-200 bg-teal-50/70 p-4 space-y-3">
            <p className="text-sm font-semibold text-teal-950">{t.booking.paddlePfdTitle}</p>
            <p className="text-[12px] text-teal-900/90">
              {t.booking.paddlePfdBody(
                paddlePfdIncluded
                  ? t.listing.specs.options[paddlePfdIncluded] ?? paddlePfdIncluded
                  : t.booking.pfdIncludedFallback,
                paddlePfdCount,
              )}
            </p>
            <label className="flex items-start gap-2 text-xs text-teal-950">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={paddlePfdAck}
                onChange={(e) => setPaddlePfdAck(e.target.checked)}
              />
              <span>{t.booking.paddlePfdAttest}</span>
            </label>
          </div>
        ) : null}

        {needsWeatherCancel ? (
          <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-4 space-y-3">
            <p className="text-sm font-semibold text-sky-950">{t.booking.weatherCancelTitle}</p>
            <p className="text-[12px] text-sky-900/90">
              {t.booking.weatherCancelBody(
                weatherCancelPolicy
                  ? t.listing.specs.options[weatherCancelPolicy] ?? weatherCancelPolicy
                  : t.booking.weatherCancelFallback,
              )}
            </p>
            <label className="flex items-start gap-2 text-xs text-sky-950">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={weatherCancelAck}
                onChange={(e) => setWeatherCancelAck(e.target.checked)}
              />
              <span>{t.booking.weatherCancelAttest}</span>
            </label>
          </div>
        ) : null}

        {needsSafetyBriefing && safetyBriefingBlocked ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-950">
            <p className="font-semibold">{t.booking.safetyBriefingBlockedTitle}</p>
            <p className="mt-1 text-[13px] leading-snug">{t.booking.safetyBriefingBlockedBody}</p>
          </div>
        ) : null}

        {needsSafetyBriefing && !safetyBriefingBlocked ? (
          <div className="rounded-xl border border-orange-200 bg-orange-50/70 p-4 space-y-3">
            <p className="text-sm font-semibold text-orange-950">{t.booking.safetyBriefingTitle}</p>
            <p className="text-[12px] text-orange-900/90">{t.booking.safetyBriefingBody}</p>
            {safetyBriefingNotes ? (
              <p className="text-[13px] whitespace-pre-wrap text-orange-950/90">{safetyBriefingNotes}</p>
            ) : null}
            <label className="flex items-start gap-2 text-xs text-orange-950">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={safetyBriefingAck}
                onChange={(e) => setSafetyBriefingAck(e.target.checked)}
              />
              <span>{t.booking.safetyBriefingAttest}</span>
            </label>
          </div>
        ) : null}

        {needsHygiene && hygieneBlocked ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-950">
            <p className="font-semibold">{t.booking.hygieneBlockedTitle}</p>
            <p className="mt-1 text-[13px] leading-snug">{t.booking.hygieneBlockedBody}</p>
          </div>
        ) : null}

        {needsHygiene && !hygieneBlocked ? (
          <div className="rounded-xl border border-teal-200 bg-teal-50/70 p-4 space-y-3">
            <p className="text-sm font-semibold text-teal-950">{t.booking.hygieneTitle}</p>
            <p className="text-[12px] text-teal-900/90">{t.booking.hygieneBody}</p>
            {hygieneNotes ? (
              <p className="text-[13px] whitespace-pre-wrap text-teal-950/90">{hygieneNotes}</p>
            ) : null}
            <label className="flex items-start gap-2 text-xs text-teal-950">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={hygieneAck}
                onChange={(e) => setHygieneAck(e.target.checked)}
              />
              <span>{t.booking.hygieneAttest}</span>
            </label>
          </div>
        ) : null}

        {needsCostumeReturn ? (
          <div className="rounded-xl border border-fuchsia-200 bg-fuchsia-50/70 p-4 space-y-3">
            <p className="text-sm font-semibold text-fuchsia-950">{t.booking.costumeReturnTitle}</p>
            <p className="text-[12px] text-fuchsia-900/90">{t.booking.costumeReturnBody}</p>
            <label className="flex items-start gap-2 text-xs text-fuchsia-950">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={costumeReturnConditionAck}
                onChange={(e) => setCostumeReturnConditionAck(e.target.checked)}
              />
              <span>{t.booking.costumeReturnAttest}</span>
            </label>
          </div>
        ) : null}


        {needsCostumeHygiene && costumeHygieneBlocked ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-950">
            <p className="font-semibold">{t.booking.hygieneBlockedTitle}</p>
            <p className="mt-1 text-[13px] leading-snug">{t.booking.hygieneBlockedBody}</p>
          </div>
        ) : null}

        {needsCostumeHygiene && !costumeHygieneBlocked ? (
          <div className="rounded-xl border border-teal-200 bg-teal-50/70 p-4 space-y-3">
            <p className="text-sm font-semibold text-teal-950">{t.booking.hygieneTitle}</p>
            <p className="text-[12px] text-teal-900/90">{t.booking.hygieneBody}</p>
            <label className="flex items-start gap-2 text-xs text-teal-950">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={costumeHygieneAttested}
                onChange={(e) => setCostumeHygieneAttested(e.target.checked)}
              />
              <span>{t.booking.hygieneAttest}</span>
            </label>
          </div>
        ) : null}
        {needsEScooterAge && !eScooterAgeOk ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-950">
            <p className="font-semibold">{t.booking.eScooterAgeTitle}</p>
            <p className="mt-1 text-[13px] leading-snug">
              {t.booking.eScooterAgeBody(eScooterMinAge)}
            </p>
          </div>
        ) : null}

        {needsProRenter ? (
          <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-4 space-y-3">
            <p className="text-sm font-semibold text-sky-950">{t.booking.proRentersRequired}</p>
            <label className="flex items-start gap-2 text-xs text-sky-950">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={proRenterAttested}
                onChange={(e) => setProRenterAttested(e.target.checked)}
              />
              <span>{t.booking.proRentersAttest}</span>
            </label>
            <div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-sky-300 bg-white px-3 py-2.5 text-sm font-semibold text-sky-950">
                <Upload className="h-4 w-4" aria-hidden />
                {proCredentialBusy
                  ? t.booking.insuranceUploading
                  : proCredentialMedia
                    ? t.booking.proCredentialReplace
                    : t.booking.proCredentialUpload}
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  disabled={proCredentialBusy || !auth.userId}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (!file || !auth.userId) return;
                    setProCredentialBusy(true);
                    const rentalIdHint =
                      insuranceDraftId ||
                      (typeof crypto !== "undefined" && "randomUUID" in crypto
                        ? crypto.randomUUID()
                        : `rent-${Date.now()}`);
                    void uploadRentalInsuranceProof({
                      renterId: auth.userId,
                      rentalId: `${rentalIdHint}-pro`,
                      file,
                    })
                      .then((result) => {
                        setProCredentialMedia(result.media);
                        setInsuranceDraftId(rentalIdHint);
                      })
                      .finally(() => setProCredentialBusy(false));
                  }}
                />
              </label>
              <p className="mt-2 text-xs text-sky-900/80">{t.booking.proCredentialHint}</p>
            </div>
          </div>
        ) : null}

        {needsCdl ? (
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-4 space-y-3">
            <p className="text-sm font-semibold text-indigo-950">{t.booking.cdlRequired}</p>
            <label className="flex items-start gap-2 text-xs text-indigo-950">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={cdlAttested}
                onChange={(e) => setCdlAttested(e.target.checked)}
              />
              <span>{t.booking.cdlAttest}</span>
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-indigo-300 bg-white px-3 py-2.5 text-sm font-semibold text-indigo-950">
              <Upload className="h-4 w-4" aria-hidden />
              {cdlBusy
                ? t.booking.insuranceUploading
                : cdlMedia
                  ? t.booking.cdlReplace
                  : t.booking.cdlUpload}
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                disabled={cdlBusy || !auth.userId}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (!file || !auth.userId) return;
                  setCdlBusy(true);
                  const rentalIdHint =
                    insuranceDraftId ||
                    (typeof crypto !== "undefined" && "randomUUID" in crypto
                      ? crypto.randomUUID()
                      : `rent-${Date.now()}`);
                  void uploadRentalInsuranceProof({
                    renterId: auth.userId,
                    rentalId: `${rentalIdHint}-cdl`,
                    file,
                  })
                    .then((result) => {
                      setCdlMedia(result.media);
                      setInsuranceDraftId(rentalIdHint);
                    })
                    .finally(() => setCdlBusy(false));
                }}
              />
            </label>
            <p className="text-xs text-indigo-900/80">{t.booking.cdlHint}</p>
          </div>
        ) : null}

        {needsDriverRecordAttestation ? (
          <div className="rounded-xl border border-slate-300 bg-slate-50/80 p-4 space-y-3">
            <p className="text-sm font-semibold text-slate-950">{t.booking.driverRecordTitle}</p>
            <p className="text-xs leading-snug text-slate-800/90">{t.booking.driverRecordBody}</p>
            <label className="flex items-start gap-2 text-xs text-slate-950">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={driverLicenseValidAttested}
                onChange={(e) => setDriverLicenseValidAttested(e.target.checked)}
              />
              <span>{t.booking.driverLicenseValidAttest}</span>
            </label>
            <label className="flex items-start gap-2 text-xs text-slate-950">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={driverRecordSoftAttested}
                onChange={(e) => setDriverRecordSoftAttested(e.target.checked)}
              />
              <span>{t.booking.driverRecordSoftAttest}</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-800">
                {t.booking.driverLicenseState}
                <input
                  type="text"
                  maxLength={2}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm font-medium normal-case tracking-normal text-slate-950"
                  value={driverLicenseState}
                  onChange={(e) => setDriverLicenseState(e.target.value.toUpperCase())}
                  placeholder="CA"
                  autoComplete="address-level1"
                />
              </label>
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-800">
                {t.booking.driverLicenseLast4}
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm font-medium normal-case tracking-normal text-slate-950"
                  value={driverLicenseLast4}
                  onChange={(e) =>
                    setDriverLicenseLast4(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  placeholder="1234"
                  autoComplete="off"
                />
              </label>
            </div>
            <p className="text-xs text-slate-700/90">{t.booking.driverRecordHonestNote}</p>
          </div>
        ) : null}

        {needsOperatorCert ? (
          <div className="rounded-xl border border-orange-200 bg-orange-50/70 p-4 space-y-3">
            <p className="text-sm font-semibold text-orange-950">
              {t.booking.operatorCertRequired(
                operatorCertKind === "forklift"
                  ? t.booking.operatorCertKindForklift
                  : operatorCertKind === "crane"
                    ? t.booking.operatorCertKindCrane
                    : operatorCertKind === "excavator"
                      ? t.booking.operatorCertKindExcavator
                      : t.booking.operatorCertKindGeneral,
              )}
            </p>
            <label className="flex items-start gap-2 text-xs text-orange-950">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={operatorCertAttested}
                onChange={(e) => setOperatorCertAttested(e.target.checked)}
              />
              <span>{t.booking.operatorCertAttest}</span>
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-orange-300 bg-white px-3 py-2.5 text-sm font-semibold text-orange-950">
              <Upload className="h-4 w-4" aria-hidden />
              {operatorCertBusy
                ? t.booking.insuranceUploading
                : operatorCertMedia
                  ? t.booking.operatorCertReplace
                  : t.booking.operatorCertUpload}
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                disabled={operatorCertBusy || !auth.userId}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (!file || !auth.userId) return;
                  setOperatorCertBusy(true);
                  const rentalIdHint =
                    insuranceDraftId ||
                    (typeof crypto !== "undefined" && "randomUUID" in crypto
                      ? crypto.randomUUID()
                      : `rent-${Date.now()}`);
                  void uploadRentalInsuranceProof({
                    renterId: auth.userId,
                    rentalId: `${rentalIdHint}-opcert`,
                    file,
                  })
                    .then((result) => {
                      setOperatorCertMedia(result.media);
                      setInsuranceDraftId(rentalIdHint);
                    })
                    .finally(() => setOperatorCertBusy(false));
                }}
              />
            </label>
            <p className="text-xs text-orange-900/80">{t.booking.operatorCertHint}</p>
          </div>
        ) : null}

        {needsBoaterLicense ? (
          <div className="rounded-xl border border-cyan-200 bg-cyan-50/70 p-4 space-y-3">
            <p className="text-sm font-semibold text-cyan-950">
              {listingIsPwc(listing)
                ? t.booking.pwcLicenseRequired
                : t.booking.boaterLicenseRequired}
            </p>
            <label className="flex items-start gap-2 text-xs text-cyan-950">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={boaterLicenseAttested}
                onChange={(e) => setBoaterLicenseAttested(e.target.checked)}
              />
              <span>
                {listingIsPwc(listing)
                  ? t.booking.pwcLicenseAttest
                  : t.booking.boaterLicenseAttest}
              </span>
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-cyan-300 bg-white px-3 py-2.5 text-sm font-semibold text-cyan-950">
              <Upload className="h-4 w-4" aria-hidden />
              {boaterLicenseBusy
                ? t.booking.insuranceUploading
                : boaterLicenseMedia
                  ? t.booking.boaterLicenseReplace
                  : t.booking.boaterLicenseUpload}
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                disabled={boaterLicenseBusy || !auth.userId}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (!file || !auth.userId) return;
                  setBoaterLicenseBusy(true);
                  const rentalIdHint =
                    insuranceDraftId ||
                    (typeof crypto !== "undefined" && "randomUUID" in crypto
                      ? crypto.randomUUID()
                      : `rent-${Date.now()}`);
                  void uploadRentalInsuranceProof({
                    renterId: auth.userId,
                    rentalId: `${rentalIdHint}-boat`,
                    file,
                  })
                    .then((result) => {
                      setBoaterLicenseMedia(result.media);
                      setInsuranceDraftId(rentalIdHint);
                    })
                    .finally(() => setBoaterLicenseBusy(false));
                }}
              />
            </label>
            <p className="text-xs text-cyan-900/80">{t.booking.boaterLicenseHint}</p>
          </div>
        ) : null}

        {needsDroneCert ? (
          <div className="rounded-xl border border-violet-200 bg-violet-50/70 p-4 space-y-3">
            <p className="text-sm font-semibold text-violet-950">{t.booking.droneCertRequired}</p>
            <label className="flex items-start gap-2 text-xs text-violet-950">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={droneCertAttested}
                onChange={(e) => setDroneCertAttested(e.target.checked)}
              />
              <span>{t.booking.droneCertAttest}</span>
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-violet-300 bg-white px-3 py-2.5 text-sm font-semibold text-violet-950">
              <Upload className="h-4 w-4" aria-hidden />
              {droneCertBusy
                ? t.booking.insuranceUploading
                : droneCertMedia
                  ? t.booking.droneCertReplace
                  : t.booking.droneCertUpload}
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                disabled={droneCertBusy || !auth.userId}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (!file || !auth.userId) return;
                  setDroneCertBusy(true);
                  const rentalIdHint =
                    insuranceDraftId ||
                    (typeof crypto !== "undefined" && "randomUUID" in crypto
                      ? crypto.randomUUID()
                      : `rent-${Date.now()}`);
                  void uploadRentalInsuranceProof({
                    renterId: auth.userId,
                    rentalId: `${rentalIdHint}-drone`,
                    file,
                  })
                    .then((result) => {
                      setDroneCertMedia(result.media);
                      setInsuranceDraftId(rentalIdHint);
                    })
                    .finally(() => setDroneCertBusy(false));
                }}
              />
            </label>
            <p className="text-xs text-violet-900/80">{t.booking.droneCertHint}</p>
            {droneRidBlocked ? (
              <p className="text-[13px] font-semibold text-red-800">{t.booking.droneRemoteIdBlocked}</p>
            ) : (
              <>
                <p className="text-[12px] text-violet-900/90">
                  {t.booking.droneHostRidLine(
                    droneWeightClass
                      ? t.listing.specs.options[droneWeightClass] ?? droneWeightClass
                      : "—",
                    remoteIdStatus
                      ? t.listing.specs.options[remoteIdStatus] ?? remoteIdStatus
                      : "—",
                  )}
                </p>
                <label className="flex items-start gap-2 text-xs text-violet-950">
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={droneRemoteIdAck}
                    onChange={(e) => setDroneRemoteIdAck(e.target.checked)}
                  />
                  <span>{t.booking.droneRemoteIdAttest}</span>
                </label>
              </>
            )}
          </div>
        ) : null}

        {needsSnowSports ? (
          <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-4 space-y-2">
            <p className="text-sm font-semibold text-sky-950">{t.booking.dinTitle}</p>
            <p className="text-[12px] text-sky-900/90">
              {t.booking.dinBody(
                dinSettingBand
                  ? t.listing.specs.options[dinSettingBand] ?? dinSettingBand
                  : "—",
              )}
            </p>
          </div>
        ) : null}

        {needsSportsPfd && sportsPfdBlocked ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-950">
            <p className="font-semibold">{t.booking.pfdBlockedTitle}</p>
            <p className="mt-1 text-[13px] leading-snug">{t.booking.pfdBlockedBody}</p>
          </div>
        ) : null}

        {needsSportsPfd && !sportsPfdBlocked ? (
          <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-4 space-y-3">
            <p className="text-sm font-semibold text-sky-950">{t.booking.pfdTitle}</p>
            <p className="text-[12px] text-sky-900/90">
              {t.booking.pfdBody(
                sportsPfdIncluded
                  ? t.listing.specs.options[sportsPfdIncluded] ?? sportsPfdIncluded
                  : "—",
              )}
            </p>
            <label className="flex items-start gap-2 text-xs text-sky-950">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={sportsPfdAck}
                onChange={(e) => setSportsPfdAck(e.target.checked)}
              />
              <span>{t.booking.pfdAttest}</span>
            </label>
          </div>
        ) : null}

        {needsCateringSanitize && cateringSanitizeBlocked ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-950">
            <p className="font-semibold">{t.booking.cateringSanitizeBlockedTitle}</p>
            <p className="mt-1 text-[13px] leading-snug">{t.booking.cateringSanitizeBlockedBody}</p>
          </div>
        ) : null}

        {needsCateringSanitize && !cateringSanitizeBlocked ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 space-y-3">
            <p className="text-sm font-semibold text-amber-950">{t.booking.cateringSanitizeTitle}</p>
            <label className="flex items-start gap-2 text-xs text-amber-950">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={cateringSanitizeAck}
                onChange={(e) => setCateringSanitizeAck(e.target.checked)}
              />
              <span>{t.booking.cateringSanitizeAttest}</span>
            </label>
          </div>
        ) : null}

        {usesAgentInsurance ? (
          <div className="rounded-xl border border-violet-200 bg-violet-50/70 p-4 space-y-3">
            {isCommercialTransport ? (
              <span className="inline-flex rounded-lg bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-950">
                {t.booking.commercialTransportBadge}
              </span>
            ) : null}
            <p className="text-sm font-semibold text-violet-950">{t.booking.agentInsuranceTitle}</p>
            <p className="text-xs leading-snug text-violet-900/90">{t.booking.agentInsuranceBody}</p>
            <div className="rounded-xl border border-violet-300 bg-white px-3 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-800">
                {t.booking.agentInsuranceEmailLabel}
              </p>
              {ownerProofEmail ? (
                <p className="mt-1 break-all text-base font-bold text-violet-950">{ownerProofEmail}</p>
              ) : (
                <p className="mt-1 text-xs font-semibold text-red-700">
                  {t.booking.agentInsuranceEmailMissing}
                </p>
              )}
            </div>
            {(insuranceReqs.notes ||
              insuranceReqs.pdMinUsd ||
              insuranceReqs.liabilityMinUsd ||
              liabilityLabel ||
              deductibleLabel) && (
              <div className="text-xs text-violet-950 space-y-1">
                <p className="font-semibold">{t.booking.agentInsuranceRequirements}</p>
                {liabilityLabel || deductibleLabel ? (
                  <p>{[liabilityLabel, deductibleLabel].filter(Boolean).join(" · ")}</p>
                ) : null}
                {insuranceReqs.pdMinUsd ? <p>PD min: ${insuranceReqs.pdMinUsd}</p> : null}
                {insuranceReqs.liabilityMinUsd ? (
                  <p>Liability min: ${insuranceReqs.liabilityMinUsd}</p>
                ) : null}
                {insuranceReqs.notes ? <p className="whitespace-pre-wrap">{insuranceReqs.notes}</p> : null}
                {insuranceReqs.renterFeeUsd ? (
                  <p className="font-semibold">
                    {t.booking.agentInsuranceFee(formatMoney(Number(insuranceReqs.renterFeeUsd) || 0))}
                  </p>
                ) : null}
              </div>
            )}
            {needsPhysicalDamage ? (
              <p className="text-xs font-semibold text-violet-950">{t.booking.physicalDamageRequired}</p>
            ) : null}
            <label className="flex items-start gap-2 text-xs text-violet-950">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={agentProofAck}
                onChange={(e) => setAgentProofAck(e.target.checked)}
              />
              <span>{t.booking.agentInsuranceAck}</span>
            </label>
          </div>
        ) : null}

        {needsInsuranceProof && !usesAgentInsurance ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-3">
            <div className="flex items-start gap-2">
              <Shield className="h-5 w-5 shrink-0 text-amber-800" aria-hidden />
              <div>
                <p className="text-sm font-semibold text-amber-950">{t.booking.insuranceTitle}</p>
                <p className="mt-1 text-xs leading-snug text-amber-900/80">
                  {t.booking.insuranceBody}
                </p>
                {needsPhysicalDamage ? (
                  <p className="mt-2 text-xs font-semibold text-amber-950">
                    {t.booking.physicalDamageRequired}
                  </p>
                ) : null}
                {liabilityLabel || deductibleLabel ? (
                  <p className="mt-2 text-xs font-medium text-amber-950">
                    {t.booking.insuranceHostRequires(
                      [liabilityLabel, deductibleLabel].filter(Boolean).join(" · "),
                    )}
                  </p>
                ) : null}
                <p className="mt-2 text-xs text-amber-900/90">
                  {t.booking.insuranceCoverageLeadNote(
                    insuranceMustBeOnBy,
                    insuranceLeadDays,
                  )}
                </p>
                {usesStructuredCoi ? (
                  <p className="mt-2 text-xs font-semibold text-amber-950">
                    {t.booking.coiStructuredRequired}
                  </p>
                ) : null}
                {needsCoiHostConfirm ? (
                  <p className="mt-1 text-xs text-amber-900/90">{t.booking.coiHostConfirmHint}</p>
                ) : null}
              </div>
            </div>

            {usesStructuredCoi ? (
              <div className="space-y-2.5 rounded-xl border border-amber-300/80 bg-white/80 p-3">
                <p className="text-xs font-semibold text-amber-950">{t.booking.coiFieldsTitle}</p>
                <label className="block text-[11px] font-semibold uppercase tracking-wide text-amber-900">
                  {t.booking.coiCarrierName}
                  <input
                    type="text"
                    className="mt-1 w-full rounded-lg border border-amber-300 bg-white px-2.5 py-2 text-sm font-medium normal-case tracking-normal text-amber-950"
                    value={coiCarrierName}
                    onChange={(e) => setCoiCarrierName(e.target.value)}
                  />
                </label>
                <label className="block text-[11px] font-semibold uppercase tracking-wide text-amber-900">
                  {t.booking.coiPolicyNumber}
                  <input
                    type="text"
                    className="mt-1 w-full rounded-lg border border-amber-300 bg-white px-2.5 py-2 text-sm font-medium normal-case tracking-normal text-amber-950"
                    value={coiPolicyNumber}
                    onChange={(e) => setCoiPolicyNumber(e.target.value)}
                  />
                </label>
                <label className="block text-[11px] font-semibold uppercase tracking-wide text-amber-900">
                  {t.booking.coiNamedInsured}
                  <input
                    type="text"
                    className="mt-1 w-full rounded-lg border border-amber-300 bg-white px-2.5 py-2 text-sm font-medium normal-case tracking-normal text-amber-950"
                    value={coiNamedInsured}
                    onChange={(e) => setCoiNamedInsured(e.target.value)}
                  />
                </label>
                <label className="block text-[11px] font-semibold uppercase tracking-wide text-amber-900">
                  {t.booking.coiLiabilityLimitUsd}
                  <input
                    type="text"
                    inputMode="decimal"
                    className="mt-1 w-full rounded-lg border border-amber-300 bg-white px-2.5 py-2 text-sm font-medium normal-case tracking-normal text-amber-950"
                    value={coiLiabilityLimitUsd}
                    onChange={(e) => setCoiLiabilityLimitUsd(e.target.value)}
                    placeholder={insuranceReqs.liabilityMinUsd || "1000000"}
                  />
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="block text-[11px] font-semibold uppercase tracking-wide text-amber-900">
                    {t.booking.coiEffectiveDate}
                    <input
                      type="date"
                      className="mt-1 w-full rounded-lg border border-amber-300 bg-white px-2.5 py-2 text-sm font-medium normal-case tracking-normal text-amber-950"
                      value={coiEffectiveDate}
                      onChange={(e) => setCoiEffectiveDate(e.target.value)}
                    />
                  </label>
                  <label className="block text-[11px] font-semibold uppercase tracking-wide text-amber-900">
                    {t.booking.coiExpirationDate}
                    <input
                      type="date"
                      className="mt-1 w-full rounded-lg border border-amber-300 bg-white px-2.5 py-2 text-sm font-medium normal-case tracking-normal text-amber-950"
                      value={coiExpirationDate}
                      onChange={(e) => setCoiExpirationDate(e.target.value)}
                    />
                  </label>
                </div>
                {(insuranceReqs.pdMinUsd || insuranceReqs.liabilityMinUsd || insuranceReqs.notes) && (
                  <div className="text-xs text-amber-950 space-y-1">
                    <p className="font-semibold">{t.booking.coiHostRequirements}</p>
                    {insuranceReqs.liabilityMinUsd ? (
                      <p>Liability min: ${insuranceReqs.liabilityMinUsd}</p>
                    ) : null}
                    {insuranceReqs.pdMinUsd ? <p>PD min: ${insuranceReqs.pdMinUsd}</p> : null}
                    {insuranceReqs.notes ? (
                      <p className="whitespace-pre-wrap">{insuranceReqs.notes}</p>
                    ) : null}
                  </div>
                )}
                {coiAdditionalInsuredRequired ? (
                  <label className="flex items-start gap-2 text-xs text-amber-950">
                    <input
                      type="checkbox"
                      className="mt-0.5"
                      checked={coiAdditionalInsuredAttested}
                      onChange={(e) => setCoiAdditionalInsuredAttested(e.target.checked)}
                    />
                    <span>{t.booking.coiAdditionalInsuredAttest}</span>
                  </label>
                ) : null}
              </div>
            ) : null}

            <label className="block text-xs font-medium text-amber-950">
              {t.booking.insuranceActiveUntil}
              <input
                type="date"
                value={insuranceActiveUntil}
                min={endDate}
                onChange={(event) => setInsuranceActiveUntil(event.target.value)}
                className="mt-1 w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-gray-900"
              />
            </label>
            {!insuranceActiveOk && insuranceActiveUntil ? (
              <p className="text-xs font-semibold text-red-600">
                {t.booking.insuranceMustCoverRental}
              </p>
            ) : null}

            <div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-amber-300 bg-white px-3 py-2.5 text-sm font-semibold text-amber-950">
                <Upload className="h-4 w-4" aria-hidden />
                {insuranceUploadBusy
                  ? t.booking.insuranceUploading
                  : insuranceProof
                    ? t.booking.insuranceReplace
                    : t.booking.insuranceUpload}
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  disabled={insuranceUploadBusy || !auth.userId}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (!file || !auth.userId) return;
                    setInsuranceUploadBusy(true);
                    setInsuranceUploadError(null);
                    const rentalIdHint =
                      insuranceDraftId ||
                      (typeof crypto !== "undefined" && "randomUUID" in crypto
                        ? crypto.randomUUID()
                        : `rent-${Date.now()}`);
                    void uploadRentalInsuranceProof({
                      renterId: auth.userId,
                      rentalId: rentalIdHint,
                      file,
                    })
                      .then((result) => {
                        setInsuranceProof(result.media);
                        setInsuranceProofPath(result.path);
                        setInsuranceProofUrl(result.publicUrl);
                        setInsuranceDraftId(rentalIdHint);
                      })
                      .catch((error) => {
                        setInsuranceUploadError(
                          error instanceof Error ? error.message : t.booking.insuranceUploadFailed,
                        );
                      })
                      .finally(() => setInsuranceUploadBusy(false));
                  }}
                />
              </label>
              {!auth.userId ? (
                <p className="mt-2 text-xs text-amber-900/80">{t.booking.insuranceSignInFirst}</p>
              ) : null}
              {insuranceUploadError ? (
                <p className="mt-2 text-xs font-semibold text-red-600">{insuranceUploadError}</p>
              ) : null}
            </div>

            {insurancePreview.status === "ready" && insurancePreview.url ? (
              <a
                href={insuranceProofUrl || insurancePreview.url}
                target="_blank"
                rel="noreferrer"
                className="block overflow-hidden rounded-lg border border-amber-200 bg-white"
              >
                <img
                  src={insurancePreview.url}
                  alt={t.booking.insurancePreviewAlt}
                  className="max-h-48 w-full object-contain"
                />
              </a>
            ) : insuranceProofUrl ? (
              <a
                href={insuranceProofUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold text-amber-950 underline"
              >
                {t.booking.insuranceViewUploaded}
              </a>
            ) : null}

            {needsPhysicalDamage ? (
              <label className="flex items-start gap-2 text-xs text-amber-950">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={physicalDamageAttested}
                  onChange={(e) => setPhysicalDamageAttested(e.target.checked)}
                />
                <span>{t.booking.physicalDamageAttest}</span>
              </label>
            ) : null}
          </div>
        ) : null}

        {listing.category.trim() === "Vehicles" &&
        !(listing.vehicleExtras?.unlimitedMiles?.enabled && selectedExtras.unlimitedMiles) &&
        ((listing.categorySpecs?.includedMilesPerDay ?? "").trim() ||
          (listing.categorySpecs?.overagePerMile ?? "").trim()) ? (
          <div className="rounded-xl border border-border bg-card p-4 text-sm text-gray-800">
            <p className="font-semibold">{t.listing.modes.mileagePolicyTitle}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {(listing.categorySpecs?.includedMilesPerDay ?? "").trim()
                ? `${t.listing.modes.includedMilesPerDay}: ${listing.categorySpecs?.includedMilesPerDay}/day`
                : null}
              {(listing.categorySpecs?.includedMilesPerDay ?? "").trim() &&
              (listing.categorySpecs?.overagePerMile ?? "").trim()
                ? " · "
                : null}
              {(listing.categorySpecs?.overagePerMile ?? "").trim()
                ? `${t.listing.modes.overagePerMile}: ${formatMoney(Number.parseFloat(listing.categorySpecs?.overagePerMile ?? "") || 0)}`
                : null}
            </p>
          </div>
        ) : null}

        {needsFuelTracking && fuelPolicySummary ? (
          <div className="rounded-xl border border-border bg-card p-4 text-sm text-gray-800">
            <p className="font-semibold">{t.booking.fuelPolicyTitle}</p>
            <p className="mt-1 text-xs text-muted-foreground">{fuelPolicySummary}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t.booking.fuelPolicyBody}</p>
          </div>
        ) : null}

        {supportsTravelRule && travelOutsideHomeArea && homeTerritory ? (
          <div className="rounded-xl border border-border bg-card p-4 text-sm text-gray-800">
            <p className="font-semibold">{t.rentalDetail.travelOutsideListingTitle}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {travelOutsideHomeArea === "forbidden"
                ? t.rentalDetail.travelOutsideListingForbidden(
                    formatHomeTerritoryPhrase(homeTerritory),
                  )
                : t.rentalDetail.travelOutsideListingAllowed(
                    formatHomeTerritoryPhrase(homeTerritory),
                  )}
            </p>
          </div>
        ) : null}

        {offeredExtraKeys.length > 0 ? (
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">{t.booking.extrasTitle}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t.booking.extrasBody}</p>
            </div>
            {offeredExtraKeys.map((key) => {
              const offer = listing.vehicleExtras?.[key];
              if (!offer?.enabled) return null;
              const label =
                key === "unlimitedMiles"
                  ? t.booking.extraUnlimitedMiles
                  : key === "childSeat"
                    ? t.booking.extraChildSeat
                    : key === "roofRack"
                      ? t.booking.extraRoofRack
                      : t.booking.extraVehicleDelivery(
                          formatDistanceFromMiles(offer.maxMiles ?? 10, undefined, {
                            plus: false,
                          }),
                        );
              const priceNote =
                key === "unlimitedMiles"
                  ? t.booking.extraPricePerDay(formatMoney(Number.parseFloat(offer.price) || 0))
                  : t.booking.extraPriceFlat(formatMoney(Number.parseFloat(offer.price) || 0));
              return (
                <label
                  key={key}
                  className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm"
                >
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={Boolean(selectedExtras[key as VehicleExtraKey])}
                    onChange={(e) => {
                      const on = e.target.checked;
                      setSelectedExtras((current) => ({ ...current, [key]: on }));
                    }}
                  />
                  <span>
                    <span className="font-semibold text-gray-900">{label}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{priceNote}</span>
                  </span>
                </label>
              );
            })}
            {extrasFeeUsd > 0 ? (
              <p className="text-xs font-semibold text-gray-800">
                {t.booking.extrasSubtotal(formatMoney(extrasFeeUsd))}
              </p>
            ) : null}
          </div>
        ) : null}

        {isVehicleListing ? (
          <div className="rounded-xl border border-border bg-card p-4 space-y-2">
            <p className="text-sm font-semibold text-gray-900">{t.booking.macropointConsentTitle}</p>
            <p className="text-xs leading-snug text-muted-foreground">
              {t.booking.macropointConsentBody}
            </p>
            <label className="flex items-start gap-2 text-sm text-gray-900">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={macropointConsent}
                onChange={(e) => setMacropointConsent(e.target.checked)}
              />
              <span>{t.booking.macropointConsentCheck}</span>
            </label>
            {tollHoldCents >= 50 ? (
              <p className="text-xs text-muted-foreground">
                {t.booking.tollHoldBookingNote(formatMoney(tollHoldCents / 100))}
              </p>
            ) : null}
          </div>
        ) : null}

        {needsAgeGate && !ageGate.ok ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
            <p className="font-semibold">{t.booking.ageGateTitle}</p>
            <p className="mt-1 text-[13px] leading-snug">
              {ageGate.messageKey === "needDob"
                ? t.booking.ageGateNeedDob
                : ageGate.messageKey === "underage"
                  ? t.booking.ageGateUnderage(ageGate.minAgeRequired)
                  : t.booking.ageGateHostBlocksYoung(ageGate.minAgeRequired)}
            </p>
          </div>
        ) : null}

        {needsAgeGate && ageGate.ok && ageGate.youngDriver ? (
          <div className="rounded-xl border border-border bg-card p-3 text-sm text-gray-800">
            <p className="font-semibold text-gray-900">{t.booking.ageGateYoungTitle}</p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              {t.booking.ageGateYoungBody(
                ageGate.ageYears,
                formatMoney((youngDriverHoldAddOnCents || 0) / 100),
              )}
            </p>
          </div>
        ) : null}

        {depositAmountCents >= 50 ? (
          <div className="flex gap-2 rounded-xl border border-[#0D5C3A]/20 bg-[#0D5C3A]/5 p-3 text-sm text-gray-800">
            <Shield className="h-5 w-5 shrink-0" style={{ color: GREEN }} aria-hidden />
            <p>
              {t.booking.depositHoldNote(
                t.item.depositProtection,
                formatMoney(depositAmountCents / 100),
              )}
            </p>
          </div>
        ) : null}

        <div className="space-y-2">
          <div className="rounded-xl border border-border bg-card p-3 text-sm text-gray-700">
            <p className="font-semibold text-gray-900">{t.booking.cancellationPolicyTitle}</p>
            <p className="mt-1 text-[13px] leading-snug text-muted-foreground">
              {t.booking.cancellationPolicyBody}
            </p>
          </div>
          {lateReturnSummary ? (
            <div className="rounded-xl border border-border bg-card p-3 text-sm text-gray-700">
              <p className="font-semibold text-gray-900">{t.booking.lateReturnPolicyTitle}</p>
              <p className="mt-1 text-[13px] leading-snug text-muted-foreground">
                {lateReturnSummary}
              </p>
            </div>
          ) : null}
          {noShowFeeUsd != null ? (
            <div className="rounded-xl border border-border bg-card p-3 text-sm text-gray-700">
              <p className="font-semibold text-gray-900">{t.booking.noShowPolicyTitle}</p>
              <p className="mt-1 text-[13px] leading-snug text-muted-foreground">
                {t.booking.noShowPolicyBody}
              </p>
              <p className="mt-1 text-[12px] font-medium text-gray-800">
                {t.rentalCard.markNoShowFeeNote(formatMoney(noShowFeeUsd))}
              </p>
            </div>
          ) : null}
          <button
            type="button"
            className="text-[13px] font-semibold text-primary underline"
            onClick={() => setPolicySheetOpen(true)}
          >
            {t.booking.policyLearnMore}
          </button>
        </div>

        <RentalLifecyclePolicySheet
          open={policySheetOpen}
          onOpenChange={setPolicySheetOpen}
          lateSummary={lateReturnSummary}
          noShowFeeLabel={
            noShowFeeUsd != null
              ? t.rentalCard.markNoShowFeeNote(formatMoney(noShowFeeUsd))
              : null
          }
        />

        <RentalAgreementSignBlock
          party="renter"
          displayName={renterDisplayName}
          checked={agreementAccepted}
          onCheckedChange={setAgreementAccepted}
          expanded={agreementExpanded}
          onToggleExpand={() => setAgreementExpanded((v) => !v)}
          termsText={agreementTermsText}
          summaryLines={agreementSummaryLines}
          disabled={Boolean(paymentClientSecret || depositClientSecret)}
        />

        {!stripeCheckout && canSubmitBookingRequest(auth.userId, listing.hostId) ? (
          <BookingPaymentsBanner />
        ) : null}

        {paymentError && !paymentClientSecret && !depositClientSecret ? (
          /sign in/i.test(paymentError) ? (
            <SignInPrompt message={paymentError} intent="book" />
          ) : (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[15px] text-red-800">
              {paymentError}
            </p>
          )
        ) : null}

        <RentalPriceBreakdownView breakdown={breakdown} />

        {depositClientSecret ? (
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm font-semibold mb-1">
              {t.booking.depositHoldTitle(t.item.depositProtection)}
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              {t.booking.depositHoldBody(formatMoney(pendingDepositCents / 100))}
            </p>
            {paymentError ? (
              <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
                {paymentError}
              </p>
            ) : null}
            <StripePaymentForm
              clientSecret={depositClientSecret}
              totalLabel={`${formatMoney(pendingDepositCents / 100)} hold`}
              onSuccess={handleDepositSuccess}
              onError={setPaymentError}
            />
          </div>
        ) : null}

        {paymentClientSecret ? (
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm font-semibold mb-3">{t.booking.cardPayment}</p>
            {paymentError ? (
              <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
                {paymentError}
              </p>
            ) : null}
            <StripePaymentForm
              clientSecret={paymentClientSecret}
              totalLabel={formatMoney(totalWithExtras)}
              onSuccess={handlePaymentSuccess}
              onError={setPaymentError}
            />
            <PaymentLegalNotice className="mt-3" />
            <button
              type="button"
              className="mt-3 w-full text-center text-sm text-muted-foreground underline"
              onClick={() => {
                if (pendingBookingId) {
                  cancelPendingRental(pendingBookingId);
                }
                setPaymentClientSecret(null);
                setPendingBookingId(null);
                setPaymentError(null);
              }}
            >
              {t.booking.backToDetails}
            </button>
          </div>
        ) : null}
      </div>

      <div className="screen-footer bg-card/95 backdrop-blur-sm border-t border-border p-3 sm:p-4">
        {!paymentClientSecret && !depositClientSecret ? (
          <button
            type="button"
            disabled={!canConfirm || confirmBusy}
            onClick={handleConfirm}
            className="w-full rounded-xl py-3.5 font-medium text-white transition-colors disabled:opacity-50"
            style={{ backgroundColor: GREEN }}
          >
            {confirmBusy
              ? t.booking.preparing
              : stripeCheckout
                ? t.booking.continueToPay(totalWithExtras.toFixed(2))
                : t.booking.sendRequest(totalWithExtras.toFixed(2))}
          </button>
        ) : (
          <p className="text-center text-xs text-muted-foreground">
            {depositClientSecret
              ? t.booking.authorizeDepositFooter
              : t.booking.completePaymentFooter}
          </p>
        )}
      </div>
    </div>
  );
}
