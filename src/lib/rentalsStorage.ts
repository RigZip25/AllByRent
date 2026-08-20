import { getMessages } from "./i18n";
import { listingHasOverlappingRental } from "./availabilityBusy";
import { fetchListingByIdRemote, getPublishedListingById } from "./listingStorage";
import { getSupabaseClient, isSupabaseConfigured } from "./supabaseClient";
import type { MediaRef } from "./mediaStore";
import {
  mergeRentalAgreementRecords,
  type RentalAgreementRecord,
} from "./rentalAgreement";
import type { PreTripInspectionRecord } from "./preTripInspection";
import { normalizeInspectionRecord } from "./preTripInspection";
import type { FuelPolicySnapshot } from "./rentalFuelPolicy";
import { normalizeFuelPolicySnapshot, clampFuelLevelEighths } from "./rentalFuelPolicy";
import type { LateReturnFeeSnapshot } from "./lateReturnFee";
import { normalizeLateReturnFeeSnapshot } from "./lateReturnFee";
import type { RentalInvoice } from "./rentalInvoice";
import { mergeRentalInvoices, normalizeRentalInvoices } from "./rentalInvoice";

export type { RentalInvoice, RentalInvoiceLine, RentalInvoiceLineKind } from "./rentalInvoice";

export type RentalStatus =
  | "pending_approval"
  | "pending_checkin"
  | "active"
  | "upcoming"
  | "overdue"
  | "no_show"
  | "disputed"
  | "completed"
  | "cancelled";

export type RentalRole = "renter" | "host";

export type ListingMode = "rent" | "rto";

export type FulfillmentMethod = "pickup" | "delivery" | "contactless";

export type DeliveryStatus = "scheduled" | "en_route" | "delivered";

export type RentalReview = {
  rating: number;
  leftAt: string;
};

/** Coarse location breadcrumb during an active vehicle rental (macropoint). */
export type VehicleMacropoint = {
  lat: number;
  lng: number;
  at: string;
  /** Horizontal accuracy in meters when the browser provides it. */
  accuracyM?: number;
  /** Estimated mph between this point and the previous (soft speeding signal). */
  speedMph?: number;
  /** Why this point was recorded. */
  source: "start" | "interval" | "return" | "manual";
};

export type RentalBooking = {
  id: string;
  role: RentalRole;
  status: RentalStatus;
  itemTitle: string;
  itemEmoji: string;
  /**
   * Stable per-physical-item QR token (demo/localStorage).
   * This replaces the older per-rental `qrCheckInCode` concept.
   */
  itemQrToken?: string;
  startDate: string;
  endDate: string;
  counterpartyId: string;
  counterpartyName: string;
  counterpartyIdentityVerified: boolean;
  counterpartyPhoneVerified: boolean;
  /** @deprecated migrated to counterpartyIdentityVerified */
  counterpartyVerified?: boolean;
  pickupLabel: string;
  totalUsd: number;
  /** Rental period subtotal before delivery and platform fee. */
  rentalSubtotalUsd?: number;
  /** Total delivery (round trip + heavy surcharge) when renter chose delivery. */
  deliveryFee?: number;
  /** Round-trip miles fee portion (excludes heavy surcharge). */
  deliveryRoundTripUsd?: number;
  /** Weight surcharge when heavy item + delivery. */
  heavySurchargeUsd?: number;
  /** Weight in lbs used for surcharge at booking time. */
  itemWeightLbs?: number;
  /** Pounds over threshold used for surcharge label. */
  poundsOverThreshold?: number;
  deliveryRequested?: boolean;
  /** Demo platform service fee portion of total. */
  serviceFeeUsd?: number;
  /** Optional insurance fee portion of total. */
  insuranceFeeUsd?: number;
  /** Copied from listing at booking time. */
  itemHeavy?: boolean;
  insuranceIncluded: boolean;
  listingModes: ListingMode[];
  fulfillmentMethod?: FulfillmentMethod;
  deliveryAddress?: string;
  hostAddress?: string;
  /** Exact pickup location — shared with confirmed renter before travel; not on public listing. */
  pickupAddress?: string;
  deliveryStatus?: DeliveryStatus;
  pickupWindowStart?: string;
  pickupWindowEnd?: string;
  pickupScheduledAt?: string;
  returnDueAt?: string;
  overdueSince?: string;
  disputeEvidenceDeadline?: string;
  disputeEscalated?: boolean;
  noShowMarkedAt?: string;
  /** Optional no-show fee flagged / claimed from deposit (cents). */
  noShowFeeCents?: number;
  noShowFeeStatus?: "none" | "flagged" | "claimed" | "disputed";
  noShowNote?: string;
  completedAt?: string;
  review?: RentalReview | null;
  approvalDeadline?: string;
  paymentOnHold?: boolean;
  manualBooking?: boolean;
  /** Lockbox / gate codes and step-by-step access — revealed at check-in with pickup PIN only. */
  contactlessInstructions?: string;
  /** Handoff point for geo-gated PIN unlock (stamped from host home / pickup at approval). */
  handoffLat?: number;
  handoffLng?: number;
  /** Optional condition photo at pickup (local media) — active rental, not listing gallery. */
  pickupConditionPhoto?: MediaRef | null;
  /** Optional condition photo at return (local media) — active rental, not listing gallery. */
  returnConditionPhoto?: MediaRef | null;
  /**
   * Host → renter invoices / fines (fuel, late, toll, damage, custom).
   * Local + booking-scoped until a dedicated Stripe invoice table exists.
   */
  invoices?: RentalInvoice[];
  /** 6-digit PIN required for pickup confirmation (generated at pending_checkin). */
  pickupPin?: string;
  /** 6-digit PIN required for return confirmation (generated when active). */
  returnPin?: string;
  pickupConfirmedAt?: string;
  returnConfirmedAt?: string;
  /** Host confirmed they handed the item over at pickup. */
  hostHandedOverAt?: string;
  /** Renter confirmed they received the item at pickup. */
  renterReceivedAt?: string;
  /** Renter confirmed they returned the item. */
  renterReturnedAt?: string;
  /** Host confirmed they accepted the return. */
  hostAcceptedReturnAt?: string;
  /** Vehicle odometer at rental start (miles). */
  startOdometerMiles?: number;
  /** Vehicle odometer at return (miles). */
  returnOdometerMiles?: number;
  /**
   * Frozen fuel (+ DEF) policy at booking — default full-to-full + $20 fee.
   * Levels are captured at handoff start/finish only (not on the listing).
   */
  fuelPolicy?: FuelPolicySnapshot | null;
  /** Fuel gauge eighths (1–8) at rental start. */
  startFuelLevelEighths?: number;
  /** Fuel gauge eighths (1–8) at return. */
  returnFuelLevelEighths?: number;
  /** DEF gauge eighths (1–8) at start — diesel only. */
  startDefLevelEighths?: number;
  /** DEF gauge eighths (1–8) at return — diesel only. */
  returnDefLevelEighths?: number;
  /** Renter prepaid a full tank (alternate to full-to-full return). */
  prepaidFullTank?: boolean;
  /** Optional $/gal entered at return for top-up estimate. */
  returnFuelPumpPriceUsd?: number;
  /** Computed missing-fuel cost estimate (cents) at return. */
  fuelTopUpEstimateCents?: number;
  /** Flat missing-fuel fee (cents) when returned short of policy. */
  fuelShortfallFeeCents?: number;
  fuelClaimStatus?: "none" | "flagged" | "agreed" | "waived";
  fuelClaimNote?: string;
  qrCheckInCode?: string;
  runningLateMessage?: string;
  runningLateSentAt?: string;
  runningLateAcknowledged?: boolean;
  stripePayment?: boolean;
  /** Security deposit hold (Stripe manual-capture PI). */
  depositAmountCents?: number;
  depositStatus?: string;
  /** Source listing id for re-book flows. */
  listingId?: string;
  /**
   * Renter insurance card / declaration photo (local media + optional remote path).
   * Host opens this to verify coverage is active through the rental.
   */
  insuranceProofMedia?: MediaRef | null;
  insuranceProofPath?: string;
  insuranceProofUrl?: string;
  /** ISO date — policy must be active through this day (usually endDate). */
  insuranceActiveUntil?: string;
  insurancePolicyNote?: string;
  /**
   * Renter attested that uploaded proof includes physical damage
   * (collision / comprehensive / equipment PD), not liability alone.
   */
  physicalDamageAttested?: boolean;
  /**
   * Pro-renter gate (commercial equipment): attestation + optional credential photo.
   * v1 is self-attestation + document upload — not a license-board KYC check.
   */
  proRenterAttested?: boolean;
  proCredentialMedia?: MediaRef | null;
  proCredentialNote?: string;
  /**
   * Commercial transport CDL gate: attestation + license photo/document.
   * Required before booking submit and handoff start when listingRequiresCdl.
   */
  cdlAttested?: boolean;
  cdlMedia?: MediaRef | null;
  cdlNote?: string;
  /**
   * Heavy / Construction operator credential (forklift / crane / excavator / general).
   * Attestation + document upload — not a vague pro checkbox alone.
   */
  operatorCertKind?: "forklift" | "crane" | "excavator" | "general_heavy";
  operatorCertAttested?: boolean;
  operatorCertMedia?: MediaRef | null;
  /** Boater / PWC / captain license for motorboats & jet skis. */
  boaterLicenseAttested?: boolean;
  boaterLicenseMedia?: MediaRef | null;
  /** FAA Part 107 and/or Remote ID attestation (drones). Optional cert upload. */
  droneCertAttested?: boolean;
  droneCertMedia?: MediaRef | null;
  /** Car seat: renter sanitization / safety acknowledgment at booking. */
  carSeatSanitizationAttested?: boolean;
  carSeatRecallAckAttested?: boolean;
  /** Frozen house rules / cleaning fee at booking (Real Estate). */
  houseRulesSnapshot?: string;
  cleaningFeeUsd?: number;
  /** P1: USCG safety kit / kit inventory / waiver / helmet-lock attestations. */
  uscgSafetyAck?: boolean;
  kitInventoryAck?: boolean;
  kitInventorySnapshot?: string;
  liabilityWaiverAttested?: boolean;
  helmetLockAck?: boolean;
  helmetPolicySnapshot?: string;
  lockPolicySnapshot?: string;
  setupTeardownFeeUsd?: number;
  /**
   * Renter acknowledged agent→owner insurance proof path and saw owner email.
   */
  insuranceAgentProofAcknowledged?: boolean;
  /** Snapshot of owner email shown at booking (where agent must send proof). */
  insuranceOwnerProofEmail?: string;
  /** Host confirms agent emailed insurance proof (commercial transport path). */
  insuranceProofReceivedByHost?: boolean;
  insuranceProofReceivedAt?: string;
  /** Mandatory pre-trip photo checklist (vehicles / heavy / boats). */
  preTripInspection?: PreTripInspectionRecord | null;
  /** Return photo checklist (same tire set for swap disputes). */
  returnInspection?: PreTripInspectionRecord | null;
  /** Vehicle add-ons chosen at booking (keys match listing.vehicleExtras). */
  selectedVehicleExtras?: Partial<
    Record<"unlimitedMiles" | "childSeat" | "roofRack" | "vehicleDelivery", boolean>
  >;
  /** Fee for selected vehicle extras (USD). */
  extrasFeeUsd?: number;
  /**
   * Vehicle start-of-rental ID gate (renter selfie + driver-match attestation).
   * Face-match infra is scaffolded: selfie is stored; automated match is not required in v1.
   */
  startIdSelfie?: MediaRef | null;
  startIdCheckedAt?: string;
  /** Renter attested that the driver matches the booker / license on account. */
  startIdDriverMatchAttested?: boolean;
  /** True when a profile/avatar photo was available to link at check time. */
  startIdProfilePhotoLinked?: boolean;
  /** Driver license photo required before PIN (Vehicles). */
  startIdLicensePhoto?: MediaRef | null;
  /** DOB confirmed at start ID (also written to profile). */
  startIdDateOfBirth?: string;
  /** Young-driver uplift applied at booking (cents added to deposit). */
  youngDriverHoldAddOnCents?: number;
  renterAgeYearsAtBooking?: number;
  /**
   * Coarse phone-location checkpoints during an active vehicle rental (“macropoints”).
   * Not continuous tracking — periodic breadcrumbs for handoff safety.
   */
  macropoints?: VehicleMacropoint[];
  /** ISO time when renter consented to macropoint location during the active rental. */
  macropointConsentAt?: string;
  /** Best-effort: macropoints fell in a known toll corridor. */
  tollSuspect?: boolean;
  tollCorridorIds?: string[];
  tollSuspectAt?: string;
  /** Host toll-hold authorization (cents) rolled into deposit at booking. */
  tollHoldAmountCents?: number;
  /** Host confirmed / requested toll capture from the deposit hold. */
  tollHoldClaimedAt?: string;
  tollHoldClaimStatus?: "none" | "flagged" | "claimed" | "released";
  /**
   * Rent vehicles/boats: whether leaving the listing’s home territory is allowed.
   * Snapshotted from the listing at booking (contractual term).
   */
  travelOutsideHomeArea?: "allowed" | "forbidden";
  /** Frozen home admin boundary (US state or country) for the travel rule. */
  homeTerritory?: {
    kind: "state" | "country";
    countryCode: string;
    regionCode?: string;
    label: string;
  };
  /** Soft macropoint signal: a checkpoint fell outside home territory while forbidden. */
  homeTerritoryBreachSuspect?: boolean;
  homeTerritoryBreachAt?: string;
  /** Set when a confirmed booking is cancelled before pickup. */
  cancelledAt?: string;
  cancelledBy?: "host" | "renter";
  /** Optional free-text reason supplied at cancel time. */
  cancelReason?: string;
  /** Soft reliability note when host cancels before pickup. */
  hostCancelReliabilityNote?: string;
  /** ISO when booking record was first created. */
  createdAt?: string;
  /** ISO when renter submitted / payment authorized — used for last-minute cancel grace. */
  bookedAt?: string;
  /** Frozen late-return fee policy at booking time. */
  lateReturnFee?: LateReturnFeeSnapshot | null;
  cancelRefundPercent?: number;
  cancelRefundStatus?:
    | "none"
    | "released"
    | "refund_submitted"
    | "processing"
    | "contact_support";
  /**
   * Versioned rental terms snapshot + renter/host e-accept (clickwrap).
   * Prefer local + remote jsonb sync when column exists.
   */
  rentalAgreement?: RentalAgreementRecord | null;
};

type SupabaseRentalRow = {
  id: string;
  listing_id: string;
  owner_id: string;
  renter_id: string;
  status: string;
  start_date: string;
  end_date: string;
  pickup_pin: string | null;
  return_pin: string | null;
  booking_mode: string | null;
  delivery_address: string | null;
  safely_policy_id?: string | null;
  insurance_fee_cents?: number;
  deposit_amount_cents?: number;
  stripe_payment_intent_id?: string | null;
  stripe_payment_status?: string | null;
  rental_total_cents?: number;
  pickup_at?: string | null;
  due_at?: string | null;
  picked_up_at?: string | null;
  returned_at?: string | null;
  host_handed_over_at?: string | null;
  renter_received_at?: string | null;
  renter_returned_at?: string | null;
  host_accepted_return_at?: string | null;
  insurance_proof_path?: string | null;
  insurance_proof_url?: string | null;
  insurance_active_until?: string | null;
  insurance_policy_note?: string | null;
  rental_agreement?: RentalAgreementRecord | null;
  rental_invoices?: unknown;
  created_at: string;
  updated_at: string;
};

const RENTALS_KEY = "allbyrent_rental_bookings";
const RENTALS_VERSION_KEY = "allbyrent_rental_bookings_version";
const RENTALS_VERSION = "13-rental-lifecycle-policies";

export function generatePin(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function slugifyTitle(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function seedItemQrToken(itemTitle: string): string {
  return `abr-item-${slugifyTitle(itemTitle)}`;
}

function ensurePinsAndQr(next: RentalBooking, prev?: RentalBooking | null): RentalBooking {
  const withQr: RentalBooking = {
    ...next,
    // Prefer listing id so sticker/screen QR matches; title seed is last-resort only.
    itemQrToken:
      next.itemQrToken ??
      next.listingId?.trim() ??
      seedItemQrToken(next.itemTitle),
  };

  if (withQr.status === "pending_checkin") {
    return {
      ...withQr,
      pickupPin: withQr.pickupPin ?? generatePin(),
    };
  }

  if (withQr.status === "active" || withQr.status === "overdue") {
    return {
      ...withQr,
      returnPin: withQr.returnPin ?? generatePin(),
    };
  }

  return {
    ...withQr,
    pickupPin: withQr.pickupPin ?? prev?.pickupPin,
    returnPin: withQr.returnPin ?? prev?.returnPin,
  };
}

const RENTAL_STATUSES: RentalStatus[] = [
  "pending_approval",
  "pending_checkin",
  "active",
  "upcoming",
  "overdue",
  "no_show",
  "disputed",
  "completed",
  "cancelled",
];

function rowStatusToRentalStatus(status: string): RentalStatus {
  if (RENTAL_STATUSES.includes(status as RentalStatus)) {
    return status as RentalStatus;
  }
  return "pending_approval";
}

export function rentalBookingFromRemoteRow(
  row: SupabaseRentalRow,
  userId: string,
  listingTitle?: string,
): RentalBooking {
  const role: RentalRole = row.owner_id === userId ? "host" : "renter";
  const counterpartyId = role === "host" ? row.renter_id : row.owner_id;
  const fulfillmentMethod: FulfillmentMethod =
    row.booking_mode === "delivery"
      ? "delivery"
      : row.booking_mode === "contactless"
        ? "contactless"
        : "pickup";

  return normalizeBooking({
    id: row.id,
    role,
    status: rowStatusToRentalStatus(row.status),
    itemTitle: listingTitle?.trim() || "Rental item",
    itemEmoji: "📦",
    startDate: row.start_date,
    endDate: row.end_date,
    counterpartyId,
    counterpartyName: role === "host" ? "Renter" : "Host",
    counterpartyIdentityVerified: false,
    counterpartyPhoneVerified: false,
    listingId: row.listing_id,
    pickupLabel:
      fulfillmentMethod === "delivery"
        ? "Delivery"
        : fulfillmentMethod === "contactless"
          ? "Contactless"
          : "Pickup",
    totalUsd: Math.max(0, (row.rental_total_cents ?? 0) / 100),
    insuranceIncluded: Boolean(row.insurance_fee_cents && row.insurance_fee_cents > 0),
    listingModes: ["rent"],
    fulfillmentMethod,
    deliveryAddress: row.delivery_address ?? undefined,
    pickupPin: row.pickup_pin ?? undefined,
    returnPin: row.return_pin ?? undefined,
    pickupConfirmedAt: row.picked_up_at ?? undefined,
    returnConfirmedAt: row.returned_at ?? undefined,
    returnDueAt: row.due_at ?? undefined,
    pickupScheduledAt: row.pickup_at ?? undefined,
    hostHandedOverAt: row.host_handed_over_at ?? undefined,
    renterReceivedAt: row.renter_received_at ?? undefined,
    renterReturnedAt: row.renter_returned_at ?? undefined,
    hostAcceptedReturnAt: row.host_accepted_return_at ?? undefined,
    depositAmountCents: row.deposit_amount_cents ?? undefined,
    stripePayment: Boolean(row.stripe_payment_intent_id),
    paymentOnHold:
      Boolean(row.stripe_payment_intent_id) &&
      row.stripe_payment_status !== "succeeded" &&
      row.status === "pending_approval",
    approvalDeadline:
      row.status === "pending_approval"
        ? new Date(new Date(row.created_at).getTime() + 24 * 60 * 60 * 1000).toISOString()
        : undefined,
    manualBooking: row.status === "pending_approval",
    insuranceProofPath: row.insurance_proof_path ?? undefined,
    insuranceProofUrl: row.insurance_proof_url ?? undefined,
    insuranceActiveUntil: row.insurance_active_until ?? undefined,
    insurancePolicyNote: row.insurance_policy_note ?? undefined,
    insuranceProofMedia: row.insurance_proof_path
      ? {
          id: row.insurance_proof_path,
          kind: "image" as const,
          mimeType: "image/jpeg",
          createdAt: Date.now(),
          sizeBytes: 0,
          storagePath: row.insurance_proof_path,
        }
      : undefined,
    rentalAgreement: row.rental_agreement ?? null,
    invoices: normalizeRentalInvoices(row.rental_invoices),
  });
}

function normalizeBooking(raw: RentalBooking): RentalBooking {
  const counterpartyName =
    typeof raw.counterpartyName === "string" && raw.counterpartyName.trim()
      ? raw.counterpartyName
      : "Unknown";
  const identity =
    raw.counterpartyIdentityVerified ??
    raw.counterpartyVerified ??
    false;
  const phone = raw.counterpartyPhoneVerified ?? false;
  return {
    ...ensurePinsAndQr(raw),
    counterpartyName,
    counterpartyId: raw.counterpartyId ?? "",
    counterpartyIdentityVerified: identity,
    counterpartyPhoneVerified: phone,
    listingModes: raw.listingModes ?? ["rent"],
    insuranceIncluded: raw.insuranceIncluded ?? false,
    stripePayment: raw.stripePayment ?? false,
    fulfillmentMethod:
      raw.fulfillmentMethod ??
      (raw.pickupLabel.toLowerCase().includes("delivery") ? "delivery" : "pickup"),
    deliveryRequested:
      raw.deliveryRequested ??
      (raw.fulfillmentMethod === "delivery" ||
        raw.pickupLabel.toLowerCase().includes("delivery")),
    deliveryFee: raw.deliveryFee,
    deliveryRoundTripUsd: raw.deliveryRoundTripUsd,
    heavySurchargeUsd: raw.heavySurchargeUsd,
    itemWeightLbs: raw.itemWeightLbs,
    poundsOverThreshold: raw.poundsOverThreshold,
    rentalSubtotalUsd: raw.rentalSubtotalUsd,
    serviceFeeUsd: raw.serviceFeeUsd,
    itemHeavy: raw.itemHeavy ?? false,
    insuranceProofMedia: raw.insuranceProofMedia ?? null,
    insuranceProofPath: raw.insuranceProofPath,
    insuranceProofUrl: raw.insuranceProofUrl,
    insuranceActiveUntil: raw.insuranceActiveUntil,
    physicalDamageAttested: Boolean(raw.physicalDamageAttested),
    proRenterAttested: Boolean(raw.proRenterAttested),
    proCredentialMedia: raw.proCredentialMedia ?? null,
    proCredentialNote: raw.proCredentialNote,
    cdlAttested: Boolean(raw.cdlAttested),
    cdlMedia: raw.cdlMedia ?? null,
    cdlNote: raw.cdlNote,
    operatorCertKind:
      raw.operatorCertKind === "forklift" ||
      raw.operatorCertKind === "crane" ||
      raw.operatorCertKind === "excavator" ||
      raw.operatorCertKind === "general_heavy"
        ? raw.operatorCertKind
        : undefined,
    operatorCertAttested: Boolean(raw.operatorCertAttested),
    operatorCertMedia: raw.operatorCertMedia ?? null,
    boaterLicenseAttested: Boolean(raw.boaterLicenseAttested),
    boaterLicenseMedia: raw.boaterLicenseMedia ?? null,
    droneCertAttested: Boolean(raw.droneCertAttested),
    droneCertMedia: raw.droneCertMedia ?? null,
    carSeatSanitizationAttested: Boolean(raw.carSeatSanitizationAttested),
    carSeatRecallAckAttested: Boolean(raw.carSeatRecallAckAttested),
    houseRulesSnapshot:
      typeof raw.houseRulesSnapshot === "string" ? raw.houseRulesSnapshot : undefined,
    cleaningFeeUsd:
      typeof raw.cleaningFeeUsd === "number" && Number.isFinite(raw.cleaningFeeUsd)
        ? raw.cleaningFeeUsd
        : undefined,
    uscgSafetyAck: Boolean(raw.uscgSafetyAck),
    kitInventoryAck: Boolean(raw.kitInventoryAck),
    kitInventorySnapshot:
      typeof raw.kitInventorySnapshot === "string" ? raw.kitInventorySnapshot : undefined,
    liabilityWaiverAttested: Boolean(raw.liabilityWaiverAttested),
    helmetLockAck: Boolean(raw.helmetLockAck),
    helmetPolicySnapshot:
      typeof raw.helmetPolicySnapshot === "string" ? raw.helmetPolicySnapshot : undefined,
    lockPolicySnapshot:
      typeof raw.lockPolicySnapshot === "string" ? raw.lockPolicySnapshot : undefined,
    setupTeardownFeeUsd:
      typeof raw.setupTeardownFeeUsd === "number" && Number.isFinite(raw.setupTeardownFeeUsd)
        ? raw.setupTeardownFeeUsd
        : undefined,
    insuranceAgentProofAcknowledged: Boolean(raw.insuranceAgentProofAcknowledged),
    insuranceOwnerProofEmail:
      typeof raw.insuranceOwnerProofEmail === "string"
        ? raw.insuranceOwnerProofEmail
        : undefined,
    insuranceProofReceivedByHost: Boolean(raw.insuranceProofReceivedByHost),
    insuranceProofReceivedAt:
      typeof raw.insuranceProofReceivedAt === "string"
        ? raw.insuranceProofReceivedAt
        : undefined,
    preTripInspection: normalizeInspectionRecord(raw.preTripInspection, "pickup"),
    returnInspection: normalizeInspectionRecord(raw.returnInspection, "return"),
    fuelPolicy: normalizeFuelPolicySnapshot(raw.fuelPolicy),
    startFuelLevelEighths: clampFuelLevelEighths(raw.startFuelLevelEighths) ?? undefined,
    returnFuelLevelEighths: clampFuelLevelEighths(raw.returnFuelLevelEighths) ?? undefined,
    startDefLevelEighths: clampFuelLevelEighths(raw.startDefLevelEighths) ?? undefined,
    returnDefLevelEighths: clampFuelLevelEighths(raw.returnDefLevelEighths) ?? undefined,
    prepaidFullTank: Boolean(raw.prepaidFullTank),
    returnFuelPumpPriceUsd:
      typeof raw.returnFuelPumpPriceUsd === "number" &&
      Number.isFinite(raw.returnFuelPumpPriceUsd) &&
      raw.returnFuelPumpPriceUsd > 0
        ? raw.returnFuelPumpPriceUsd
        : undefined,
    fuelTopUpEstimateCents:
      typeof raw.fuelTopUpEstimateCents === "number" &&
      Number.isFinite(raw.fuelTopUpEstimateCents)
        ? Math.max(0, Math.round(raw.fuelTopUpEstimateCents))
        : undefined,
    fuelShortfallFeeCents:
      typeof raw.fuelShortfallFeeCents === "number" &&
      Number.isFinite(raw.fuelShortfallFeeCents)
        ? Math.max(0, Math.round(raw.fuelShortfallFeeCents))
        : undefined,
    fuelClaimStatus: raw.fuelClaimStatus ?? "none",
    fuelClaimNote: typeof raw.fuelClaimNote === "string" ? raw.fuelClaimNote : undefined,
    noShowFeeCents:
      typeof raw.noShowFeeCents === "number" && Number.isFinite(raw.noShowFeeCents)
        ? raw.noShowFeeCents
        : undefined,
    noShowFeeStatus: raw.noShowFeeStatus,
    noShowNote: typeof raw.noShowNote === "string" ? raw.noShowNote : undefined,
    insurancePolicyNote: raw.insurancePolicyNote,
    startIdLicensePhoto: raw.startIdLicensePhoto ?? null,
    startIdSelfie: raw.startIdSelfie ?? null,
    startIdCheckedAt: raw.startIdCheckedAt,
    startIdDriverMatchAttested: raw.startIdDriverMatchAttested ?? false,
    startIdProfilePhotoLinked: raw.startIdProfilePhotoLinked ?? false,
    startIdDateOfBirth:
      typeof raw.startIdDateOfBirth === "string" ? raw.startIdDateOfBirth : undefined,
    youngDriverHoldAddOnCents:
      typeof raw.youngDriverHoldAddOnCents === "number"
        ? Math.max(0, Math.round(raw.youngDriverHoldAddOnCents))
        : undefined,
    renterAgeYearsAtBooking:
      typeof raw.renterAgeYearsAtBooking === "number"
        ? Math.round(raw.renterAgeYearsAtBooking)
        : undefined,
    macropoints: Array.isArray(raw.macropoints) ? raw.macropoints : [],
    macropointConsentAt: raw.macropointConsentAt,
    tollSuspect: Boolean(raw.tollSuspect),
    tollCorridorIds: Array.isArray(raw.tollCorridorIds) ? raw.tollCorridorIds : [],
    tollSuspectAt: raw.tollSuspectAt,
    tollHoldAmountCents: raw.tollHoldAmountCents,
    tollHoldClaimedAt: raw.tollHoldClaimedAt,
    tollHoldClaimStatus: raw.tollHoldClaimStatus ?? "none",
    travelOutsideHomeArea:
      raw.travelOutsideHomeArea === "allowed" || raw.travelOutsideHomeArea === "forbidden"
        ? raw.travelOutsideHomeArea
        : undefined,
    homeTerritory:
      raw.homeTerritory &&
      typeof raw.homeTerritory === "object" &&
      (raw.homeTerritory.kind === "state" || raw.homeTerritory.kind === "country") &&
      typeof raw.homeTerritory.countryCode === "string" &&
      typeof raw.homeTerritory.label === "string"
        ? {
            kind: raw.homeTerritory.kind,
            countryCode: raw.homeTerritory.countryCode,
            regionCode:
              typeof raw.homeTerritory.regionCode === "string"
                ? raw.homeTerritory.regionCode
                : undefined,
            label: raw.homeTerritory.label,
          }
        : undefined,
    homeTerritoryBreachSuspect: Boolean(raw.homeTerritoryBreachSuspect),
    homeTerritoryBreachAt: raw.homeTerritoryBreachAt,
    cancelReason: typeof raw.cancelReason === "string" ? raw.cancelReason : undefined,
    hostCancelReliabilityNote:
      typeof raw.hostCancelReliabilityNote === "string"
        ? raw.hostCancelReliabilityNote
        : undefined,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : undefined,
    bookedAt: typeof raw.bookedAt === "string" ? raw.bookedAt : undefined,
    lateReturnFee: normalizeLateReturnFeeSnapshot(raw.lateReturnFee),
    rentalAgreement: raw.rentalAgreement ?? null,
    pickupConditionPhoto: raw.pickupConditionPhoto ?? null,
    returnConditionPhoto: raw.returnConditionPhoto ?? null,
    invoices: normalizeRentalInvoices(raw.invoices),
  };
}

export function appendRentalBooking(booking: RentalBooking): RentalBooking[] {
  const bookings = loadRentalBookings();
  const next = [normalizeBooking(booking), ...bookings];
  saveRentalBookings(next);
  return next;
}

const STATUS_PROGRESS_RANK: Record<RentalStatus, number> = {
  cancelled: 0,
  pending_approval: 1,
  upcoming: 2,
  pending_checkin: 3,
  active: 4,
  no_show: 5,
  overdue: 6,
  disputed: 7,
  completed: 10,
};

function mergeRentalBooking(local: RentalBooking, remote: RentalBooking): RentalBooking {
  const localRank = STATUS_PROGRESS_RANK[local.status] ?? 0;
  const remoteRank = STATUS_PROGRESS_RANK[remote.status] ?? 0;
  const status = localRank >= remoteRank ? local.status : remote.status;
  return normalizeBooking({
    ...remote,
    ...local,
    status,
    pickupPin: remote.pickupPin ?? local.pickupPin,
    returnPin: remote.returnPin ?? local.returnPin,
    hostHandedOverAt: remote.hostHandedOverAt ?? local.hostHandedOverAt,
    renterReceivedAt: remote.renterReceivedAt ?? local.renterReceivedAt,
    renterReturnedAt: remote.renterReturnedAt ?? local.renterReturnedAt,
    hostAcceptedReturnAt: remote.hostAcceptedReturnAt ?? local.hostAcceptedReturnAt,
    pickupConfirmedAt: remote.pickupConfirmedAt ?? local.pickupConfirmedAt,
    returnConfirmedAt: remote.returnConfirmedAt ?? local.returnConfirmedAt,
    review: local.review ?? remote.review,
    runningLateMessage: local.runningLateMessage ?? remote.runningLateMessage,
    runningLateSentAt: local.runningLateSentAt ?? remote.runningLateSentAt,
    runningLateAcknowledged: local.runningLateAcknowledged ?? remote.runningLateAcknowledged,
    disputeEscalated: local.disputeEscalated ?? remote.disputeEscalated,
    rentalAgreement: mergeRentalAgreementRecords(
      local.rentalAgreement,
      remote.rentalAgreement,
    ),
    invoices: mergeRentalInvoices(local.invoices, remote.invoices),
  });
}

export async function updateRentalRemote(
  rentalId: string,
  patch: {
    status?: RentalStatus;
    startDate?: string;
    endDate?: string;
    pickupPin?: string | null;
    returnPin?: string | null;
    pickupAt?: string | null;
    dueAt?: string | null;
    pickedUpAt?: string | null;
    returnedAt?: string | null;
    noShowMarkedAt?: string | null;
    hostHandedOverAt?: string | null;
    renterReceivedAt?: string | null;
    renterReturnedAt?: string | null;
    hostAcceptedReturnAt?: string | null;
    rentalAgreement?: RentalAgreementRecord | null;
    invoices?: RentalInvoice[] | null;
  },
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const row: Record<string, string | null | RentalAgreementRecord | RentalInvoice[]> = {};
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.startDate !== undefined) row.start_date = patch.startDate;
  if (patch.endDate !== undefined) row.end_date = patch.endDate;
  if (patch.pickupPin !== undefined) row.pickup_pin = patch.pickupPin;
  if (patch.returnPin !== undefined) row.return_pin = patch.returnPin;
  if (patch.pickupAt !== undefined) row.pickup_at = patch.pickupAt;
  if (patch.dueAt !== undefined) row.due_at = patch.dueAt;
  if (patch.pickedUpAt !== undefined) row.picked_up_at = patch.pickedUpAt;
  if (patch.returnedAt !== undefined) row.returned_at = patch.returnedAt;
  if (patch.noShowMarkedAt !== undefined) row.no_show_marked_at = patch.noShowMarkedAt;
  if (patch.hostHandedOverAt !== undefined) row.host_handed_over_at = patch.hostHandedOverAt;
  if (patch.renterReceivedAt !== undefined) row.renter_received_at = patch.renterReceivedAt;
  if (patch.renterReturnedAt !== undefined) row.renter_returned_at = patch.renterReturnedAt;
  if (patch.hostAcceptedReturnAt !== undefined) {
    row.host_accepted_return_at = patch.hostAcceptedReturnAt;
  }
  if (patch.rentalAgreement !== undefined) {
    row.rental_agreement = patch.rentalAgreement;
  }
  if (patch.invoices !== undefined) {
    row.rental_invoices = patch.invoices ?? [];
  }
  if (Object.keys(row).length === 0) return;

  const { error } = await supabase.from("rentals").update(row).eq("id", rentalId);
  if (error) {
    // Local state remains; host/renter can retry. Column may be missing until migration.
    if (patch.invoices !== undefined && (error.message ?? "").toLowerCase().includes("rental_invoices")) {
      const { rental_invoices: _omit, ...without } = row;
      if (Object.keys(without).length > 0) {
        await supabase.from("rentals").update(without).eq("id", rentalId);
      }
    }
  }
}

function remotePatchFromBooking(patch: Partial<RentalBooking>): Parameters<typeof updateRentalRemote>[1] {
  const remote: Parameters<typeof updateRentalRemote>[1] = {};
  if (patch.status !== undefined) remote.status = patch.status;
  if (patch.startDate !== undefined) remote.startDate = patch.startDate;
  if (patch.endDate !== undefined) remote.endDate = patch.endDate;
  if (patch.pickupPin !== undefined) remote.pickupPin = patch.pickupPin ?? null;
  if (patch.returnPin !== undefined) remote.returnPin = patch.returnPin ?? null;
  if (patch.pickupScheduledAt !== undefined) remote.pickupAt = patch.pickupScheduledAt ?? null;
  if (patch.returnDueAt !== undefined) remote.dueAt = patch.returnDueAt ?? null;
  if (patch.pickupConfirmedAt !== undefined) remote.pickedUpAt = patch.pickupConfirmedAt ?? null;
  if (patch.returnConfirmedAt !== undefined) remote.returnedAt = patch.returnConfirmedAt ?? null;
  if (patch.noShowMarkedAt !== undefined) remote.noShowMarkedAt = patch.noShowMarkedAt ?? null;
  if (patch.hostHandedOverAt !== undefined) remote.hostHandedOverAt = patch.hostHandedOverAt ?? null;
  if (patch.renterReceivedAt !== undefined) remote.renterReceivedAt = patch.renterReceivedAt ?? null;
  if (patch.renterReturnedAt !== undefined) remote.renterReturnedAt = patch.renterReturnedAt ?? null;
  if (patch.hostAcceptedReturnAt !== undefined) {
    remote.hostAcceptedReturnAt = patch.hostAcceptedReturnAt ?? null;
  }
  if (patch.rentalAgreement !== undefined) {
    remote.rentalAgreement = patch.rentalAgreement ?? null;
  }
  if (patch.invoices !== undefined) {
    remote.invoices = patch.invoices ?? [];
  }
  return remote;
}

function shouldSyncBookingPatch(patch: Partial<RentalBooking>): boolean {
  return Object.keys(remotePatchFromBooking(patch)).length > 0;
}

export function toSupabaseRentalInsert(params: {
  id: string;
  listingId: string;
  ownerId: string;
  renterId: string;
  status: string;
  startDate: string;
  endDate: string;
  bookingMode?: string;
  deliveryAddress?: string;
  pickupPin?: string;
  returnPin?: string;
  safelyPolicyId?: string | null;
  insuranceFeeCents?: number;
  depositAmountCents?: number;
  stripePaymentIntentId?: string | null;
  stripePaymentStatus?: string | null;
  rentalTotalCents?: number;
  pickupAt?: string | null;
  dueAt?: string | null;
  insuranceProofPath?: string | null;
  insuranceProofUrl?: string | null;
  insuranceActiveUntil?: string | null;
  insurancePolicyNote?: string | null;
  rentalAgreement?: RentalAgreementRecord | null;
}): Omit<SupabaseRentalRow, "created_at" | "updated_at"> {
  return {
    id: params.id,
    listing_id: params.listingId,
    owner_id: params.ownerId,
    renter_id: params.renterId,
    status: params.status,
    start_date: params.startDate,
    end_date: params.endDate,
    pickup_pin: params.pickupPin ?? null,
    return_pin: params.returnPin ?? null,
    booking_mode: params.bookingMode ?? null,
    delivery_address: params.deliveryAddress ?? null,
    safely_policy_id: params.safelyPolicyId ?? null,
    insurance_fee_cents: Math.max(0, Math.round(params.insuranceFeeCents ?? 0)),
    deposit_amount_cents: Math.max(0, Math.round(params.depositAmountCents ?? 0)),
    stripe_payment_intent_id: params.stripePaymentIntentId ?? null,
    stripe_payment_status: params.stripePaymentStatus ?? null,
    rental_total_cents: Math.max(0, Math.round(params.rentalTotalCents ?? 0)),
    pickup_at: params.pickupAt ?? null,
    due_at: params.dueAt ?? null,
    insurance_proof_path: params.insuranceProofPath ?? null,
    insurance_proof_url: params.insuranceProofUrl ?? null,
    insurance_active_until: params.insuranceActiveUntil ?? null,
    insurance_policy_note: params.insurancePolicyNote ?? null,
    rental_agreement: params.rentalAgreement ?? null,
  };
}

export async function createRentalRemote(row: Omit<SupabaseRentalRow, "created_at" | "updated_at">): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error("Database not configured");
  }
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Database not configured");
  }

  const listing = getPublishedListingById(row.listing_id) ?? (await fetchListingByIdRemote(row.listing_id));
  const overlaps = await listingHasOverlappingRental({
    listingId: row.listing_id,
    startDate: row.start_date,
    endDate: row.end_date,
    fallbackBlocked: listing?.blockedDates ?? [],
  });
  if (overlaps) {
    throw new Error(getMessages().booking.datesBlocked);
  }

  const { error } = await supabase.from("rentals").insert(row);
  if (error) {
    const msg = error.message?.toLowerCase() ?? "";
    if (msg.includes("overlap") || msg.includes("blocked availability")) {
      throw new Error(getMessages().booking.datesBlocked);
    }
    // Migration may not be applied yet — retry without agreement jsonb.
    if (row.rental_agreement != null && (msg.includes("rental_agreement") || msg.includes("schema cache"))) {
      const { rental_agreement: _omit, ...withoutAgreement } = row;
      const retry = await supabase.from("rentals").insert(withoutAgreement);
      if (retry.error) throw retry.error;
      return;
    }
    throw error;
  }
}

export async function fetchRentalsForUserRemote(userId: string): Promise<SupabaseRentalRow[]> {
  if (!isSupabaseConfigured()) {
    throw new Error("Database not configured");
  }
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Database not configured");
  }
  const { data, error } = await supabase
    .from("rentals")
    .select("*")
    .or(`owner_id.eq.${userId},renter_id.eq.${userId}`)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as SupabaseRentalRow[];
}

export async function syncRentalsFromRemote(userId: string): Promise<RentalBooking[]> {
  const localBefore = loadRentalBookings();
  const rows = await fetchRentalsForUserRemote(userId);
  const remoteBookings: RentalBooking[] = [];

  for (const row of rows) {
    const localListing = getPublishedListingById(row.listing_id);
    let title = localListing?.title;
    if (!title) {
      const remoteListing = await fetchListingByIdRemote(row.listing_id);
      title = remoteListing?.title;
    }
    remoteBookings.push(rentalBookingFromRemoteRow(row, userId, title));
  }

  const byId = new Map<string, RentalBooking>();
  for (const booking of localBefore) byId.set(booking.id, booking);
  for (const remote of remoteBookings) {
    const local = byId.get(remote.id);
    byId.set(remote.id, local ? mergeRentalBooking(local, remote) : remote);
  }

  const merged = [...byId.values()].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
  );
  saveRentalBookings(merged);
  return merged;
}

export function loadRentalBookings(): RentalBooking[] {
  try {
    if (localStorage.getItem(RENTALS_VERSION_KEY) !== RENTALS_VERSION) {
      localStorage.removeItem(RENTALS_KEY);
      localStorage.setItem(RENTALS_VERSION_KEY, RENTALS_VERSION);
      return [];
    }
    const raw = localStorage.getItem(RENTALS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RentalBooking[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeBooking);
  } catch {
    return [];
  }
}

export function saveRentalBookings(bookings: RentalBooking[]): void {
  try {
    localStorage.setItem(RENTALS_KEY, JSON.stringify(bookings));
  } catch {
    /* ignore */
  }
}

export function updateBooking(
  id: string,
  patch: Partial<RentalBooking>,
): RentalBooking[] {
  const bookings = loadRentalBookings();
  const current = bookings.find((b) => b.id === id) ?? null;
  const next = bookings.map((b) => {
    if (b.id !== id) return b;
    const merged = { ...b, ...patch } as RentalBooking;
    return normalizeBooking(ensurePinsAndQr(merged, current));
  });
  saveRentalBookings(next);
  if (shouldSyncBookingPatch(patch)) {
    void updateRentalRemote(id, remotePatchFromBooking(patch));
  }
  return next;
}

export function getPendingApprovalRequests(bookings: RentalBooking[]): RentalBooking[] {
  return bookings.filter((b) => b.role === "host" && b.status === "pending_approval");
}

export function getPendingApprovalWaiting(bookings: RentalBooking[]): RentalBooking[] {
  return bookings.filter((b) => b.role === "renter" && b.status === "pending_approval");
}

export function getActiveBookings(bookings: RentalBooking[]): RentalBooking[] {
  return bookings.filter((b) => {
    if (b.status === "pending_approval") return false;
    if (b.status === "no_show" && b.noShowMarkedAt) return false;
    return ["pending_checkin", "active", "overdue", "disputed", "no_show"].includes(b.status);
  });
}

export function getUpcomingBookings(bookings: RentalBooking[]): RentalBooking[] {
  return bookings.filter((b) => b.status === "upcoming");
}

export function getHistoryBookings(bookings: RentalBooking[]): RentalBooking[] {
  return bookings.filter(
    (b) =>
      b.status === "completed" ||
      b.status === "cancelled" ||
      (b.status === "no_show" && Boolean(b.noShowMarkedAt)),
  );
}

export function formatRentalDateRange(start: string, end: string): string {
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return `${start} – ${end}`;
  return `${s.toLocaleDateString(undefined, opts)} – ${e.toLocaleDateString(undefined, opts)}`;
}

export function getRentalStatusLabel(status: RentalStatus): string {
  return getMessages().rentalStatus[status];
}

/** Localized via getMessages — prefer getRentalStatusLabel. */
export const RENTAL_STATUS_LABEL: Record<RentalStatus, string> = new Proxy(
  {} as Record<RentalStatus, string>,
  {
    get(_target, prop: string | symbol) {
      if (typeof prop !== "string") return undefined;
      return getMessages().rentalStatus[prop as RentalStatus];
    },
  },
);

export function isNoShowHistory(booking: RentalBooking): boolean {
  return Boolean(booking.noShowMarkedAt);
}

export function isDeliveryBooking(booking: RentalBooking): boolean {
  return booking.fulfillmentMethod === "delivery";
}

export function canRenterSeeHostAddress(booking: RentalBooking): boolean {
  return (
    booking.role === "renter" &&
    ["pending_checkin", "active", "overdue"].includes(booking.status)
  );
}

/** Pickup location visible to confirmed renter before check-in (not on public listing). */
export function getRenterPickupLocation(booking: RentalBooking): string | undefined {
  if (!canRenterSeeHostAddress(booking)) return undefined;
  if (booking.pickupAddress?.trim()) return booking.pickupAddress.trim();
  if (booking.fulfillmentMethod === "delivery" && booking.hostAddress?.trim()) {
    return booking.hostAddress.trim();
  }
  return undefined;
}
