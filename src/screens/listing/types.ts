import type { Dispatch, SetStateAction } from "react";

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
  | "pending_sticker"
  | "active";

export type ListingDraft = {
  id: string;
  listingStatus: ListingPublishStatus;
  photos: string[];
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
    deliveryPrices: { miles: number; price: string }[];
  };
  generateQR: boolean;
  verificationPhoto: string | null;
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

export const STEPS = [
  { id: 1, name: "Photos" },
  { id: 2, name: "Item Info" },
  { id: 3, name: "Transaction Modes" },
  { id: 4, name: "Pickup & Delivery" },
  { id: 5, name: "Availability" },
  { id: 6, name: "QR Code" },
  { id: 7, name: "Review & Publish" },
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

export function createInitialListingDraft(): ListingDraft {
  return {
    id: createListingId(),
    listingStatus: "draft",
    photos: [],
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
      salePrice: "",
      rtoTotalPrice: "",
      rtoPeriodMonths: "",
      securityDeposit: "",
      minimumPeriod: "1 day",
    },
    blockedDates: [],
    paused: false,
    handoff: {
      inPerson: false,
      inPersonDays: ["Mo", "Tu", "We", "Th", "Fr"],
      inPersonTimeStart: "09:00",
      inPersonTimeEnd: "17:00",
      inPersonWeekendTimeStart: "10:00",
      inPersonWeekendTimeEnd: "14:00",
      contactless: false,
      contactlessInstructions: "",
      delivery: false,
      deliveryPrices: [],
    },
    generateQR: true,
    verificationPhoto: null,
  };
}
