import type { ListingDraft } from "../screens/listing/types";

type GiftModes = Pick<ListingDraft["modes"], "gift" | "sell" | "rent" | "rentToOwn">;
type GiftPricing = Pick<ListingDraft["pricing"], "salePrice">;

/**
 * Gift is not a separate payment rail — it is Sell at $0 (free pickup).
 * Keep `modes.gift` for display/copy; always pair with `sell` + salePrice "0".
 */
export function isFreeGiveaway(draft: {
  modes: GiftModes;
  pricing: GiftPricing;
}): boolean {
  if (draft.modes.gift) return true;
  if (!draft.modes.sell) return false;
  const saleRaw = (draft.pricing.salePrice || "").trim();
  if (!saleRaw) return false;
  const sale = Number.parseFloat(saleRaw.replace(/[^0-9.]/g, ""));
  return Number.isFinite(sale) && sale <= 0;
}

/** True when the listing can take card money (rent and/or paid sell). */
export function listingChargesMoney(draft: {
  modes: GiftModes;
  pricing: GiftPricing;
}): boolean {
  if (draft.modes.rent || draft.modes.rentToOwn) return true;
  if (isFreeGiveaway(draft)) return false;
  return Boolean(draft.modes.sell);
}

/** Normalize gift ↔ sell@$0 before save / continue. */
export function applyGiftAsZeroSell(draft: ListingDraft): ListingDraft {
  const saleRaw = (draft.pricing.salePrice || "").trim();
  const sale = Number.parseFloat(saleRaw.replace(/[^0-9.]/g, ""));

  if (draft.modes.gift || (draft.modes.sell && saleRaw !== "" && Number.isFinite(sale) && sale <= 0)) {
    return {
      ...draft,
      modes: {
        ...draft.modes,
        gift: true,
        sell: true,
        rentToOwn: false,
      },
      pricing: {
        ...draft.pricing,
        salePrice: "0",
      },
    };
  }

  return draft;
}
