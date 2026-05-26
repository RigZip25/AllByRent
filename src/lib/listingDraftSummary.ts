import type { ListingDraft } from "../screens/listing/types";

export function summarizeListingDraft(draft: ListingDraft): string {
  const modes = (
    Object.entries(draft.modes) as [keyof ListingDraft["modes"], boolean][]
  )
    .filter(([, on]) => on)
    .map(([key]) => key)
    .join(", ");

  const parts = [
    `title="${draft.title || "(empty)"}"`,
    `category="${draft.category || "(empty)"}"`,
    `subcategory="${draft.subcategory || "(empty)"}"`,
    `grade=${draft.grade || "unset"}`,
    `condition=${draft.condition || "unset"}`,
    `photos=${draft.photos.length}`,
    `modes=[${modes || "none"}]`,
    `dailyRate=${draft.pricing.dailyRate || "—"}`,
    `salePrice=${draft.pricing.salePrice || "—"}`,
    `inPerson=${draft.handoff.inPerson}`,
    `contactless=${draft.handoff.contactless}`,
    `delivery=${draft.handoff.delivery}`,
    `generateQR=${draft.generateQR}`,
    `status=${draft.listingStatus}`,
  ];

  if (draft.description.trim()) {
    parts.push(
      `description="${draft.description.trim().slice(0, 200)}${draft.description.length > 200 ? "…" : ""}"`,
    );
  }

  return parts.join(", ");
}
