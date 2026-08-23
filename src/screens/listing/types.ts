import type { Dispatch, SetStateAction } from "react";
import type { MediaRef } from "../../lib/mediaStore";
import type { VehicleExtrasConfig } from "../../lib/vehicleExtras";
import { emptyVehicleExtras } from "../../lib/vehicleExtras";
import type {
  HomeTerritoryBoundary,
  TravelOutsideHomeArea,
} from "../../lib/vehicleHomeTerritory";

export type { CategoryModeKey, CategoryModeRules } from "./listingItemCategories";
export type { VehicleExtrasConfig };
export type { HomeTerritoryBoundary, TravelOutsideHomeArea };

export type MinimumRentalPeriod = "1 day" | "3 days" | "1 week" | "2 weeks" | "1 month";

export type ListingAiSuggestions = {
  title: string;
  category: string;
  subcategory: string;
  grade: "personal" | "professional";
  condition: "new" | "like_new" | "good" | "fair";
  description: string;
  /** NEW retail / replacement estimate in marketplace currency. */
  estimatedValue: number;
  /** ISO currency used for estimatedValue (e.g. CZK, EUR, USD). */
  estimatedValueCurrency?: string;
  /** Manufacturer / brand name when visible or confidently identified. */
  brand?: string;
  /** Product model / line (without brand or screen size). */
  model?: string;
  /** Diagonal screen size in inches when applicable. */
  screenInches?: number;
  /** Sleeps / seats count when visible or confidently identified (tents, etc.). */
  personCapacity?: number;
  /** Season rating 1–4 when labeled on outdoor gear. */
  seasonRating?: number;
  /**
   * Best-guess model year from appearance / generation (vehicles).
   * Soft-fill only — VIN decode overwrites when present.
   */
  year?: number;
  /**
   * Dominant color key matching category color select options
   * (e.g. black, white, gray, red, …). Soft-fill only.
   */
  color?: string;
};

export type ListingPublishStatus =
  | "draft"
  | "published"
  | "pending_qr"
  | "active";

export type ListingDraft = {
  id: string;
  /** Primary host account that owns this listing (auth user id or demo-user). */
  hostId?: string;
  listingStatus: ListingPublishStatus;
  /** Wizard step last visited (1–4) while status is draft. */
  wizardStep?: number;
  /**
   * Listing wizard layout version.
   * 1 = photos → details → review (legacy)
   * 2 = category → details → photos → review
   * 3 = category → photos → details → review (current)
   */
  wizardFlowVersion?: number;
  /** Client ISO timestamp of last draft edit (also mirrored via listings.updated_at). */
  updatedAt?: string;
  /** How many abandon-nudge pushes were sent for this draft. */
  nudgeCount?: number;
  lastNudgedAt?: string | null;
  /** Spotlight boost expiration (used for ranking; optional). */
  boostedUntil?: string | null;
  /** Boost tier (2/5/10 USD) (optional). */
  boostedTier?: number | null;
  photos: MediaRef[];
  videos: MediaRef[];
  aiSuggestions: ListingAiSuggestions | null;
  aiAnalysisPending: boolean;
  photoEnhancementPending: boolean;
  title: string;
  category: string;
  subcategory: string;
  grade: "personal" | "professional" | "";
  condition: "new" | "like_new" | "good" | "fair" | "";
  description: string;
  replacementValue: string;
  /** Manufacturer / equipment serial — required for heavy equipment & construction; optional tip for Photo / Electronics / Drones. */
  serialNumber: string;
  /** ISO VIN (17 chars) — required for Vehicles (incl. trailers); optional elsewhere with validation if set. */
  vin: string;
  /** US plate characters — optional helper to autofill VIN via /api/vin/plate. */
  licensePlate: string;
  /** Two-letter US state for plate lookup. */
  licensePlateState: string;
  /** Category-specific attributes (size, sun, make/year, etc.). */
  categorySpecs: Record<string, string>;
  /**
   * Neighbor-scale vehicle add-ons (unlimited miles, child seat, roof rack, delivery).
   * Only meaningful when category is Vehicles.
   */
  vehicleExtras: VehicleExtrasConfig;
  instructionsUrl: string;
  modes: {
    rent: boolean;
    sell: boolean;
    rentToOwn: boolean;
    gift: boolean;
  };
  pricing: {
    dailyRate: string;
    weeklyRate: string;
    monthlyRate: string;
    /** Optional long-term monthly pricing for rentals >= 30 days. */
    longTermEnabled?: boolean;
    longTermMonthlyRate?: string;
    salePrice: string;
    rtoTotalPrice: string;
    rtoPeriodMonths: string;
    securityDeposit: string;
    minimumPeriod: MinimumRentalPeriod;
  };
  blockedDates: { start: string; end: string }[];
  paused: boolean;
  handoff: {
    inPerson: boolean;
    inPersonDays: string[];
    inPersonTimeStart: string;
    inPersonTimeEnd: string;
    inPersonWeekendTimeStart: string;
    inPersonWeekendTimeEnd: string;
    contactless: boolean;
    contactlessInstructions: string;
    delivery: boolean;
    /** Over 50 lbs — heavy surcharge on delivery at checkout. */
    itemHeavy: boolean;
    /** Item weight in lbs (required when heavy + delivery). */
    itemWeightLbs?: number;
    /** Max distance host will deliver (default 20 mi). */
    deliveryMaxMiles: number;
    /** Single round-trip delivery fee set by the host. */
    deliveryRoundTripFee: string;
    deliveryPrices: { miles: number; price: string }[];
    /**
     * Renter must upload active insurance proof (vehicles / heavy / boats).
     * Undefined = use category default.
     */
    requireInsuranceProof?: boolean;
    /**
     * Require physical damage coverage (collision / comprehensive / equipment PD),
     * not liability alone. Forced for commercial equipment and Vehicles ≥ 26,000 lb.
     */
    requirePhysicalDamage?: boolean;
    /**
     * Rent only to professionals (attestation + credential upload in v1).
     * Default ON for Heavy Equipment / Construction when rent is enabled.
     */
    proRentersOnly?: boolean;
    /** Host-required minimum liability (stored as band key). */
    insuranceMinLiability?: string;
    /** Highest deductible the host will accept (band key). */
    insuranceMaxDeductible?: string;
    /**
     * Days before rental start that the vehicle must already be on the renter’s policy.
     * Default 1 when insurance proof is required.
     */
    insuranceCoverageLeadDays?: number;
    /**
     * Commercial transport (≥26k / semi): dedicated email where the renter’s
     * insurance agent must send coverage proof directly to the owner.
     */
    insuranceOwnerProofEmail?: string;
    /** Free-text insurance requirements / costs the renter must meet. */
    insuranceRequirementsNotes?: string;
    /** Optional structured minimum physical-damage coverage (USD string). */
    insurancePdMinUsd?: string;
    /** Optional structured minimum liability amount (USD string). */
    insuranceLiabilityMinUsd?: string;
    /** Optional fee the renter must cover for insurance / compliance (USD string). */
    insuranceRenterFeeUsd?: string;
    /**
     * Heavy / Construction: require the renter’s COI to list the host (or
     * property) as additional insured. Soft host preference — enforced as
     * renter attestation at booking, not carrier API verification.
     */
    coiAdditionalInsuredRequired?: boolean;
    /** Forced for commercial transport; CDL attestation + document at booking. */
    requireCdl?: boolean;
  /** Optional no-show fee (USD) host may flag from deposit after start window. */
    noShowFeeEnabled?: boolean;
    noShowFeeUsd?: string;
    /** Late return fee — grace + flat + hourly after return due. */
    lateReturnFeeEnabled?: boolean;
    lateReturnGraceMinutes?: number;
    lateReturnFlatFeeUsd?: string;
    lateReturnPerHourFeeUsd?: string;
    /**
     * Fuel policy override for powered rentals (default full-to-full + $20).
     * Levels are still captured only at handoff — not as a listing fuel field.
     */
    fuelPolicy?: "full_to_full" | "prepaid_full_tank";
    fuelMissingFeeUsd?: string;
    fuelTankGallons?: string;
    /**
     * Vehicles / powered boats: default min age 25. Opt-in allows 18–24 with higher hold
     * (youngDriverHoldMultiplier × security deposit).
     */
    allowYoungDrivers?: boolean;
    /** 1.5–2 typical; applied to security deposit only (not toll hold). */
    youngDriverHoldMultiplier?: number;
    /**
     * Real Estate: optional cleaning fee (USD string) shown at booking.
     * House rules live in categorySpecs.houseRules (required for rent).
     */
    cleaningFeeUsd?: string;
    /** Optional mirror of house rules when not stored in categorySpecs. */
    houseRules?: string;
    /**
     * Authorize an extra card hold for possible tolls (combined with security deposit).
     * Final plate bills can arrive later — GPS macropoints only support the hold.
     */
    tollHoldEnabled?: boolean;
    /** Max toll authorization in USD (string for draft parity). Default 50. */
    tollHoldAmountUsd?: string;
    /**
     * Rent-only (Vehicles / Boats): may the renter leave the listing’s home
     * admin territory (US state, or country elsewhere)? Default forbidden.
     */
    travelOutsideHomeArea?: TravelOutsideHomeArea;
    /** Snapshot of the listing’s home admin boundary for the travel rule. */
    homeTerritory?: HomeTerritoryBoundary;
  };
  generateQR: boolean;
  /** Stable token encoded into QR URL (separate from listing id). */
  qrToken: string;
  /** QR has been printed/attached + verified (required before renters can see listing). */
  qrReady: boolean;
  /** Host confirmed they printed the QR (optional, used for UX nudges). */
  qrPrintedConfirmed: boolean;
  verificationPhoto: MediaRef | null;
  /** Host queued this listing for bulk QR printing. */
  qrQueuedForBulk?: boolean;
};

export type StepProps = {
  draft: ListingDraft;
  setDraft: Dispatch<SetStateAction<ListingDraft>>;
  onStepReadyChange?: (ready: boolean) => void;
};

export type Step7ReviewProps = StepProps & {
  profileCity: string;
  isPublishing: boolean;
  isEditing?: boolean;
  onPublish: () => void;
  onGoToStep: (step: number) => void;
};

/** @deprecated Use Step7ReviewProps */
export type Step6ReviewProps = Step7ReviewProps;

/** Fast-path listing wizard step ids (labels via listing.steps.* / getSteps). */
export const LISTING_STEP = {
  category: 1,
  photos: 2,
  details: 3,
  review: 4,
} as const;

/** Bump when step order changes so resume remapping stays correct. */
export const WIZARD_FLOW_VERSION = 3;

export const STEPS = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }] as const;

export const TOTAL_LISTING_STEPS = STEPS.length;

/** Resolve wizard step labels from the i18n catalog. */
export function getSteps(listing: {
  steps: {
    category: string;
    detailsPricing: string;
    photos: string;
    reviewPublish: string;
  };
}) {
  return [
    { id: 1 as const, name: listing.steps.category },
    { id: 2 as const, name: listing.steps.photos },
    { id: 3 as const, name: listing.steps.detailsPricing },
    { id: 4 as const, name: listing.steps.reviewPublish },
  ];
}

/** @deprecated Prefer getSteps(getMessages().listing) — EN snapshot only. */
export const LISTING_STEP_LABELS = [
  "Category",
  "Photos",
  "Details & pricing",
  "Review & publish",
] as const;

/**
 * Remap older drafts onto category → photos → details → review.
 * v1: photos → details → review (3 steps)
 * v2: category → details → photos → review
 * v3+: current order
 */
export function normalizeWizardResumeStep(
  wizardStep: number | undefined,
  flowVersion: number | undefined,
): number {
  // No saved progress → always start at category (never treat as legacy photos).
  if (typeof wizardStep !== "number" || !Number.isFinite(wizardStep) || wizardStep < 1) {
    return LISTING_STEP.category;
  }
  const raw = Math.floor(wizardStep);
  const version = flowVersion ?? 1;

  if (version >= WIZARD_FLOW_VERSION) {
    return Math.min(Math.max(raw, 1), TOTAL_LISTING_STEPS);
  }

  // v2: category=1, details=2, photos=3, review=4 → photos before details
  if (version === 2) {
    if (raw <= 1) return LISTING_STEP.category;
    if (raw === 2 || raw === 3) return LISTING_STEP.photos;
    return LISTING_STEP.review;
  }

  // Legacy v1 3-step: 1=photos, 2=details, 3=review
  if (raw <= 1) return LISTING_STEP.photos;
  if (raw === 2) return LISTING_STEP.details;
  return LISTING_STEP.review;
}

/** First step for a brand-new listing (optional shelf prefill skips category). */
export function initialListingWizardStep(prefill?: {
  category?: string;
  subcategory?: string;
} | null): number {
  if (prefill?.category?.trim() && prefill?.subcategory?.trim()) {
    return LISTING_STEP.photos;
  }
  return LISTING_STEP.category;
}

export const DELIVERY_DISTANCE_TIERS = [5, 10, 15, 25, 50] as const;

export function createDeliveryPriceRows(
  existing: { miles: number; price: string }[] = [],
): { miles: number; price: string }[] {
  return DELIVERY_DISTANCE_TIERS.map((miles) => {
    const row = existing.find((entry) => entry.miles === miles);
    return { miles, price: row?.price ?? "" };
  });
}

function createListingId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `listing-${Date.now()}`;
}

function createQrToken(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `qr-${Date.now()}`;
}

export function createInitialListingDraft(): ListingDraft {
  return {
    id: createListingId(),
    listingStatus: "draft",
    wizardStep: 1,
    wizardFlowVersion: WIZARD_FLOW_VERSION,
    updatedAt: new Date().toISOString(),
    nudgeCount: 0,
    lastNudgedAt: null,
    boostedUntil: null,
    boostedTier: null,
    photos: [],
    videos: [],
    aiSuggestions: null,
    aiAnalysisPending: false,
    photoEnhancementPending: false,
    title: "",
    category: "",
    subcategory: "",
    grade: "",
    condition: "",
    description: "",
    replacementValue: "",
    serialNumber: "",
    vin: "",
    licensePlate: "",
    licensePlateState: "",
    categorySpecs: {},
    vehicleExtras: emptyVehicleExtras(),
    instructionsUrl: "",
    modes: {
      // Host must pick Rent and/or Sell — defaulting rent ON forced QR stickers on sell-only posts.
      rent: false,
      sell: false,
      rentToOwn: false,
      gift: false,
    },
    pricing: {
      dailyRate: "",
      weeklyRate: "",
      monthlyRate: "",
      longTermEnabled: false,
      longTermMonthlyRate: "",
      salePrice: "",
      rtoTotalPrice: "",
      rtoPeriodMonths: "",
      securityDeposit: "",
      minimumPeriod: "1 day",
    },
    blockedDates: [],
    paused: false,
    handoff: {
      inPerson: true,
      inPersonDays: ["Mo", "Tu", "We", "Th", "Fr"],
      inPersonTimeStart: "09:00",
      inPersonTimeEnd: "17:00",
      inPersonWeekendTimeStart: "10:00",
      inPersonWeekendTimeEnd: "14:00",
      contactless: false,
      contactlessInstructions: "",
      delivery: false,
      itemHeavy: false,
      deliveryMaxMiles: 20,
      deliveryRoundTripFee: "",
      deliveryPrices: [],
      tollHoldEnabled: false,
      tollHoldAmountUsd: "50",
      travelOutsideHomeArea: "forbidden",
    },
    generateQR: true,
    qrToken: createQrToken(),
    qrReady: false,
    qrPrintedConfirmed: false,
    verificationPhoto: null,
    qrQueuedForBulk: false,
  };
}
