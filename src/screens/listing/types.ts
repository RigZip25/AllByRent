import type { Dispatch, SetStateAction } from "react";
import type { MediaRef } from "../../lib/mediaStore";

export type { CategoryModeKey, CategoryModeRules } from "./listingItemCategories";

export type MinimumRentalPeriod = "1 day" | "3 days" | "1 week" | "2 weeks" | "1 month";

export type ListingAiSuggestions = {
  title: string;
  category: string;
  subcategory: string;
  grade: "personal" | "professional";
  condition: "new" | "like_new" | "good" | "fair";
  description: string;
  estimatedValue: number;
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
  onPublish: () => void;
  onGoToStep: (step: number) => void;
};

/** @deprecated Use Step7ReviewProps */
export type Step6ReviewProps = Step7ReviewProps;

/** Fast-path listing wizard (pickup, hours, QR deferred to post-publish). */
export const STEPS = [
  { id: 1, name: "Photos" },
  { id: 2, name: "Details & pricing" },
  { id: 3, name: "Review & publish" },
] as const;

export const TOTAL_LISTING_STEPS = STEPS.length;

export const LISTING_STEP_LABELS = STEPS.map((step) => step.name);

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
    instructionsUrl: "",
    modes: {
      rent: true,
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
    },
    generateQR: true,
    qrToken: createQrToken(),
    qrReady: false,
    qrPrintedConfirmed: false,
    verificationPhoto: null,
    qrQueuedForBulk: false,
  };
}
