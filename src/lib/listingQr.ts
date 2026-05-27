const LISTING_QR_BASE_URL = "https://allbyrent.com/item";

export function getListingQrUrl(qrTokenOrListingId: string): string {
  return `${LISTING_QR_BASE_URL}/${qrTokenOrListingId}`;
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
    qrUrl: getListingQrUrl(draft.qrToken ?? draft.id),
  };
}
