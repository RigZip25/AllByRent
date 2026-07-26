/** Server-side garage listing / lot availability checks for checkout. */

export type GarageListingRow = {
  id: string;
  owner_id: string;
  title: string | null;
  modes: unknown;
  pricing: unknown;
  availability: unknown;
  listing_status: string | null;
};

export type GarageLotRow = {
  listing_id: string;
  state: unknown;
};

const PLATFORM_FEE_RATE = 0.1;

function modesIncludeSell(modes: unknown): boolean {
  return Array.isArray(modes) && modes.includes("sell");
}

function isPaused(availability: unknown): boolean {
  return Boolean(
    availability &&
      typeof availability === "object" &&
      (availability as { paused?: unknown }).paused === true,
  );
}

export function parseSalePriceUsd(pricing: unknown): number | null {
  if (!pricing || typeof pricing !== "object") return null;
  const raw = (pricing as { salePrice?: unknown }).salePrice;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw !== "string") return null;
  const n = Number.parseFloat(raw.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : null;
}

export function lotStatus(state: unknown): string {
  if (!state || typeof state !== "object") return "active";
  const status = (state as { status?: unknown }).status;
  return typeof status === "string" ? status : "active";
}

export function isLotUnavailable(status: string): boolean {
  return status === "sold" || status === "awaiting_checkout";
}

export function platformFeeFromSubtotalCents(subtotalCents: number): number {
  return Math.round(subtotalCents * PLATFORM_FEE_RATE);
}

export type ValidatedGarageLine = {
  listingId: string;
  title: string;
  priceCents: number;
};

export function validateGarageSellLines(input: {
  hostId: string;
  listingIds: string[];
  listings: GarageListingRow[];
  lots: GarageLotRow[];
}): { ok: true; lines: ValidatedGarageLine[]; subtotalCents: number } | { ok: false; error: string } {
  const byId = new Map(input.listings.map((row) => [row.id, row]));
  const lotById = new Map(input.lots.map((row) => [row.listing_id, row]));
  const lines: ValidatedGarageLine[] = [];

  for (const listingId of input.listingIds) {
    const row = byId.get(listingId);
    if (!row) {
      return { ok: false, error: `Listing unavailable: ${listingId}` };
    }
    if (row.owner_id !== input.hostId) {
      return { ok: false, error: "Listing host mismatch" };
    }
    if (row.listing_status !== "active") {
      return { ok: false, error: "Listing is not active" };
    }
    if (!modesIncludeSell(row.modes)) {
      return { ok: false, error: "Listing is not for sale" };
    }
    if (isPaused(row.availability)) {
      return { ok: false, error: "Listing is paused" };
    }
    const status = lotStatus(lotById.get(listingId)?.state);
    if (isLotUnavailable(status)) {
      return { ok: false, error: "Item already sold or reserved" };
    }
    const priceUsd = parseSalePriceUsd(row.pricing);
    if (priceUsd == null || priceUsd <= 0) {
      return { ok: false, error: "Listing has no valid sale price" };
    }
    lines.push({
      listingId,
      title: (row.title ?? "Sale item").slice(0, 200),
      priceCents: Math.round(priceUsd * 100),
    });
  }

  const subtotalCents = lines.reduce((sum, line) => sum + line.priceCents, 0);
  if (subtotalCents < 50) {
    return { ok: false, error: "Order total too low" };
  }
  return { ok: true, lines, subtotalCents };
}

export function validateAuctionListing(input: {
  hostId: string;
  listingId: string;
  listing: GarageListingRow | null;
  lot: GarageLotRow | null;
  winningBidUsd: number;
}): { ok: true; title: string; bidCents: number } | { ok: false; error: string } {
  const row = input.listing;
  if (!row) return { ok: false, error: "Listing unavailable" };
  if (row.owner_id !== input.hostId) return { ok: false, error: "Listing host mismatch" };
  if (row.listing_status !== "active") return { ok: false, error: "Listing is not active" };
  if (!modesIncludeSell(row.modes)) return { ok: false, error: "Listing is not for sale" };
  if (isPaused(row.availability)) return { ok: false, error: "Listing is paused" };
  const status = lotStatus(input.lot?.state);
  if (status === "sold") return { ok: false, error: "Item already sold" };
  if (!(input.winningBidUsd > 0)) return { ok: false, error: "Invalid winning bid" };
  return {
    ok: true,
    title: (row.title ?? "Sale item").slice(0, 200),
    bidCents: Math.round(input.winningBidUsd * 100),
  };
}
