import { type Category, type ComplianceFlag, type ListingIntent } from "./taxonomy";

export type ListingScope = Extract<ListingIntent, "list-business" | "list-personal">;

export type ListingStepId =
  | "scope"
  | "category"
  | "subcategory"
  | "details"
  | "pricing"
  | "availability"
  | "location"
  | "rules"
  | "photos"
  | "review";

export type ListingStep = {
  id: ListingStepId;
  label: string;
  requiredFor: ListingScope[];
};

export type ListingDraft = {
  categoryId?: Category["id"];
  complianceFlags: ComplianceFlag[];
  description?: string;
  locationCountry?: string;
  locationRegion?: string;
  photos: string[];
  priceAmount?: number;
  priceCurrency?: string;
  scope?: ListingScope;
  subcategoryId?: string;
  title?: string;
};

export const listingSteps: ListingStep[] = [
  {
    id: "scope",
    label: "Choose listing type",
    requiredFor: ["list-personal", "list-business"],
  },
  {
    id: "category",
    label: "Choose category",
    requiredFor: ["list-personal", "list-business"],
  },
  {
    id: "subcategory",
    label: "Choose personal or professional subcategory",
    requiredFor: ["list-personal", "list-business"],
  },
  {
    id: "details",
    label: "Add item details",
    requiredFor: ["list-personal", "list-business"],
  },
  {
    id: "pricing",
    label: "Set rental price",
    requiredFor: ["list-personal", "list-business"],
  },
  {
    id: "availability",
    label: "Set availability",
    requiredFor: ["list-personal", "list-business"],
  },
  {
    id: "location",
    label: "Set pickup or service location",
    requiredFor: ["list-personal", "list-business"],
  },
  {
    id: "rules",
    label: "Set rules and compliance requirements",
    requiredFor: ["list-business"],
  },
  {
    id: "photos",
    label: "Upload photos",
    requiredFor: ["list-personal", "list-business"],
  },
  {
    id: "review",
    label: "Review listing",
    requiredFor: ["list-personal", "list-business"],
  },
];

export const createEmptyListingDraft = (scope?: ListingScope): ListingDraft => ({
  complianceFlags: [],
  photos: [],
  scope,
});

export const getListingStepsForScope = (scope: ListingScope) =>
  listingSteps.filter((step) => step.requiredFor.includes(scope));
