import { LISTING_QR_BASE_URL } from "./brand";

/** QR handoff stickers are for rentals only — sell/gift listings skip them. */
export function listingRequiresQrSticker(modes: {
  rent?: boolean;
  rentToOwn?: boolean;
  sell?: boolean;
  gift?: boolean;
}): boolean {
  return Boolean(modes.rent || modes.rentToOwn);
}

export function getListingQrUrl(qrTokenOrListingId: string): string {
  return `${LISTING_QR_BASE_URL}/${encodeURIComponent(qrTokenOrListingId.trim())}`;
}

/** Prefer stable listing id in share/QR URLs so /item/:id resolves without a qr_code lookup. */
export function getListingPublicUrl(listing: { id: string; qrToken?: string }): string {
  return getListingQrUrl(listing.id.trim() || listing.qrToken?.trim() || "");
}

export function getListingDisplayTitle(title: string): string {
  const trimmed = title.trim();
  return trimmed || "Untitled item";
}

export function listingDraftToStickerRow(draft: {
  id: string;
  title: string;
  qrToken?: string;
}) {
  return {
    id: draft.id,
    title: getListingDisplayTitle(draft.title),
    qrUrl: getListingPublicUrl(draft),
  };
}
