import { getListingDisplayTitle } from "./listingQr";
import { loadPublishedListings, getPublishedListingById } from "./listingStorage";
import type { ListingDraft } from "../screens/listing/types";
import { summarizeListingDraft } from "./listingDraftSummary";

function oneLineListing(listing: ListingDraft): string {
  const title = getListingDisplayTitle(listing.title) || listing.title || "Untitled";
  const modes = [
    listing.modes.rent ? "rent" : null,
    listing.modes.sell ? "sell" : null,
    listing.modes.gift ? "gift" : null,
  ]
    .filter(Boolean)
    .join("/");
  const priceBits: string[] = [];
  if (listing.modes.rent && listing.pricing?.dailyRate?.trim()) {
    priceBits.push(`$${listing.pricing.dailyRate.trim()}/day`);
  }
  if (listing.modes.sell && listing.pricing?.salePrice?.trim()) {
    priceBits.push(`sell $${listing.pricing.salePrice.trim()}`);
  }
  if (listing.modes.gift) priceBits.push("gift");
  return `- ${title} (${listing.category}${listing.subcategory ? ` / ${listing.subcategory}` : ""}${
    modes ? ` · ${modes}` : ""
  }${priceBits.length ? ` · ${priceBits.join(", ")}` : ""})`;
}

/**
 * Ground AI chat in real listing rows the user can see on this device.
 * Prefer a focused listing when the user is chatting about one item.
 */
export function buildListingAiContext(params: {
  userId?: string | null;
  focusedListingId?: string | null;
  draft?: ListingDraft | null;
  maxListings?: number;
}): string | undefined {
  const parts: string[] = [];
  const focusedId = params.focusedListingId?.trim();
  if (focusedId) {
    const focused = getPublishedListingById(focusedId);
    if (focused) {
      parts.push(`Focused listing:\n${summarizeListingDraft(focused)}`);
    }
  }
  if (params.draft && (!focusedId || params.draft.id !== focusedId)) {
    parts.push(`Current draft:\n${summarizeListingDraft(params.draft)}`);
  }

  const all = loadPublishedListings();
  const own = params.userId
    ? all.filter((l) => l.hostId === params.userId)
    : [];
  const pool = (own.length > 0 ? own : all).slice(0, params.maxListings ?? 8);
  if (pool.length > 0) {
    parts.push(
      `Nearby / known listings (use only these facts; do not invent prices or availability):\n${pool
        .map(oneLineListing)
        .join("\n")}`,
    );
  }

  return parts.length > 0 ? parts.join("\n\n") : undefined;
}
