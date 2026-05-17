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
  brand?: string;
  categoryId?: Category["id"];
  complianceFlags: ComplianceFlag[];
  description?: string;
  model?: string;
  locationCountry?: string;
  locationRegion?: string;
  photos: string[];
  priceAmount?: number;
  priceCurrency?: string;
  quantity: number;
  scope?: ListingScope;
  serialNumbers?: string[];
  subcategoryId?: string;
  title?: string;
};

export type AssetCondition = "excellent" | "fair" | "good" | "needs-review";

export type AssetUnit = {
  assetUnitId: string;
  condition: AssetCondition;
  createdAt: string;
  listingId: string;
  ownerId: string;
  qrPayload: AssetQrPayload;
  serialNumber?: string;
  unitIndex: number;
};

export type AssetQrPayload = {
  assetUnitId: string;
  categoryId?: string;
  checksum: string;
  listingId: string;
  ownerId: string;
  publicLabel: string;
  version: 1;
};

export type PublishedListing = ListingDraft & {
  assetUnits: AssetUnit[];
  listingId: string;
  ownerId: string;
  publishedAt: string;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const createId = (prefix: string, seed: string) => `${prefix}_${slugify(seed)}_${Date.now().toString(36)}`;

const createChecksum = (value: string) => {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash).toString(36);
};

export const buildAssetQrPayload = ({
  assetUnitId,
  categoryId,
  listingId,
  ownerId,
  publicLabel,
}: Omit<AssetQrPayload, "checksum" | "version">): AssetQrPayload => {
  const checksumSource = [assetUnitId, categoryId, listingId, ownerId, publicLabel].join("|");

  return {
    assetUnitId,
    categoryId,
    checksum: createChecksum(checksumSource),
    listingId,
    ownerId,
    publicLabel,
    version: 1,
  };
};

export const encodeAssetQrPayload = (payload: AssetQrPayload) =>
  btoa(JSON.stringify(payload));

export const createPublishedListing = (draft: ListingDraft, ownerId: string): PublishedListing => {
  const listingId = createId("lst", `${ownerId}-${draft.title ?? "listing"}`);
  const publishedAt = new Date().toISOString();
  const quantity = Math.max(1, draft.quantity);
  const publicLabel = [draft.brand, draft.model, draft.title].filter(Boolean).join(" ") || "Rental item";

  const assetUnits: AssetUnit[] = Array.from({ length: quantity }, (_, index) => {
    const unitIndex = index + 1;
    const serialNumber = draft.serialNumbers?.[index];
    const assetUnitId = createId("asset", `${listingId}-${unitIndex}-${serialNumber ?? "unit"}`);
    const qrPayload = buildAssetQrPayload({
      assetUnitId,
      categoryId: draft.categoryId,
      listingId,
      ownerId,
      publicLabel,
    });

    return {
      assetUnitId,
      condition: "good",
      createdAt: publishedAt,
      listingId,
      ownerId,
      qrPayload,
      serialNumber,
      unitIndex,
    };
  });

  return {
    ...draft,
    assetUnits,
    listingId,
    ownerId,
    publishedAt,
    quantity,
  };
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
  quantity: 1,
  scope,
});

export const getListingStepsForScope = (scope: ListingScope) =>
  listingSteps.filter((step) => step.requiredFor.includes(scope));
