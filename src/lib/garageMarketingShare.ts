import { garageDisplayName } from "./garageDisplay";
import { getActiveRentLocationLabel } from "./listingStorage";
import { loadUserProfile } from "./userProfileStorage";
import {
  buildGarageItemSharePayload,
  buildGarageSharePayload,
  garageItemShareUrl,
  garageShareUrl,
  type SharePayload,
} from "./socialShare";
import type { ListingDraft } from "../screens/listing/types";
import { getShopOffer } from "./garageShopStorage";

export function hostGarageSharePayload(params: {
  hostId: string;
  listingCount?: number;
  openUntilLabel?: string;
}): SharePayload {
  const profile = loadUserProfile();
  const city = getActiveRentLocationLabel().trim();
  const garageName = profile.displayName?.trim() || garageDisplayName(params.hostId);
  return buildGarageSharePayload({
    garageName,
    url: garageShareUrl(params.hostId),
    city: city || undefined,
    listingCount: params.listingCount,
    openUntilLabel: params.openUntilLabel,
  });
}

export function hostGarageItemSharePayload(params: {
  hostId: string;
  listing: ListingDraft;
}): SharePayload {
  const profile = loadUserProfile();
  const city = getActiveRentLocationLabel().trim();
  const garageName = profile.displayName?.trim() || garageDisplayName(params.hostId);
  const offer = getShopOffer(params.listing);
  const title = params.listing.title?.trim() || "Sale item";
  const priceUsd = offer?.buyNowUsd ?? (Number.parseFloat(params.listing.pricing.salePrice) || 0);
  return buildGarageItemSharePayload({
    title,
    priceUsd,
    url: garageItemShareUrl(params.hostId, params.listing.id),
    city: city || undefined,
    garageName,
  });
}
