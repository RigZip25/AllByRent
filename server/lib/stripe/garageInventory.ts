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

/** Platform cut taken from the seller via Connect application_fee (buyer pays listed price only). */
export function platformFeeFromSubtotalCents(subtotalCents: number): number {
  return Math.round(subtotalCents * PLATFORM_FEE_RATE);
}

/** Buyer-facing charge = listed item total; seller absorbs platform fee. */
export function buyerChargeFromSubtotalCents(subtotalCents: number): number {
  return Math.max(0, Math.round(subtotalCents));
}

export type ValidatedGarageLine = {
  listingId: string;
  title: string;
  priceCents: number;
};

export type AcceptedOfferRow = {
  listing_id: string;
  buyer_id: string;
  amount_cents: number;
  status: string;
};

export type BidRow = {
  listing_id: string;
  bidder_id: string;
  amount_cents: number;
};

/**
 * What the buyer pays for one sell line.
 *
 * An accepted neighbour offer beats the shelf price — otherwise a $40 deal
 * was charged as the $80 sticker. A winning bid awaiting checkout does the
 * same. Guests (no buyer id) only ever see the shelf price.
 */
export function resolveSellLinePriceCents(input: {
  listingId: string;
  salePriceCents: number;
  buyerId?: string | null;
  offers?: AcceptedOfferRow[];
  lotState?: unknown;
}): { ok: true; priceCents: number } | { ok: false; error: string } {
  const buyerId = input.buyerId?.trim() || "";
  if (buyerId && input.offers?.length) {
    const acceptedForOther = input.offers.find(
      (offer) =>
        offer.listing_id === input.listingId &&
        offer.status === "accepted" &&
        offer.buyer_id !== buyerId,
    );
    if (acceptedForOther) {
      return { ok: false, error: "Item is reserved for another buyer" };
    }
    const mine = input.offers.find(
      (offer) =>
        offer.listing_id === input.listingId &&
        offer.status === "accepted" &&
        offer.buyer_id === buyerId &&
        offer.amount_cents >= 50,
    );
    if (mine) {
      return { ok: true, priceCents: Math.round(mine.amount_cents) };
    }
  }

  const awaiting = readAwaitingCheckout(input.lotState);
  if (awaiting && buyerId && awaiting.winnerBidderId === buyerId) {
    return { ok: true, priceCents: Math.round(awaiting.winningBidUsd * 100) };
  }

  if (input.salePriceCents < 50) {
    return { ok: false, error: "Listing has no valid sale price" };
  }
  return { ok: true, priceCents: input.salePriceCents };
}

export function validateGarageSellLines(input: {
  hostId: string;
  listingIds: string[];
  listings: GarageListingRow[];
  lots: GarageLotRow[];
  buyerId?: string | null;
  offers?: AcceptedOfferRow[];
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
    const lotState = lotById.get(listingId)?.state;
    const status = lotStatus(lotState);
    // A winner checking out their own reserved lot is allowed through.
    const awaiting = readAwaitingCheckout(lotState);
    const buyerIsWinner =
      Boolean(input.buyerId) && awaiting?.winnerBidderId === input.buyerId;
    if (status === "sold" || (status === "awaiting_checkout" && !buyerIsWinner)) {
      return { ok: false, error: "Item already sold or reserved" };
    }
    const priceUsd = parseSalePriceUsd(row.pricing);
    const salePriceCents = priceUsd != null && priceUsd > 0 ? Math.round(priceUsd * 100) : 0;
    const priced = resolveSellLinePriceCents({
      listingId,
      salePriceCents,
      buyerId: input.buyerId,
      offers: input.offers,
      lotState,
    });
    if (!priced.ok) return priced;
    lines.push({
      listingId,
      title: (row.title ?? "Sale item").slice(0, 200),
      priceCents: priced.priceCents,
    });
  }

  const subtotalCents = lines.reduce((sum, line) => sum + line.priceCents, 0);
  if (subtotalCents < 50) {
    return { ok: false, error: "Order total too low" };
  }
  return { ok: true, lines, subtotalCents };
}

/**
 * The awaiting-checkout lot state is written by the host and names both the
 * winner and the amount, so it — not the buyer's request — decides the charge.
 */
function readAwaitingCheckout(
  state: unknown,
): { winnerBidderId: string; winningBidUsd: number; runnerUpAttempt: number } | null {
  if (!state || typeof state !== "object") return null;
  const record = state as Record<string, unknown>;
  if (record.status !== "awaiting_checkout") return null;
  const amount = Number(record.winningBidUsd);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  const attempt = Number(record.runnerUpAttempt);
  return {
    winnerBidderId: typeof record.winnerBidderId === "string" ? record.winnerBidderId : "",
    winningBidUsd: amount,
    runnerUpAttempt: Number.isFinite(attempt) ? Math.max(1, Math.round(attempt)) : 1,
  };
}

export function validateAuctionListing(input: {
  hostId: string;
  listingId: string;
  listing: GarageListingRow | null;
  lot: GarageLotRow | null;
  winningBidUsd: number;
  buyerId: string;
  /** Highest live bid on the listing; when set, it — not the lot JSON — is the charge. */
  topBid?: BidRow | null;
}):
  | { ok: true; title: string; bidCents: number; runnerUpAttempt: number }
  | { ok: false; error: string } {
  const row = input.listing;
  if (!row) return { ok: false, error: "Listing unavailable" };
  if (row.owner_id !== input.hostId) return { ok: false, error: "Listing host mismatch" };
  if (row.listing_status !== "active") return { ok: false, error: "Listing is not active" };
  if (!modesIncludeSell(row.modes)) return { ok: false, error: "Listing is not for sale" };
  if (isPaused(row.availability)) return { ok: false, error: "Listing is paused" };
  const status = lotStatus(input.lot?.state);
  if (status === "sold") return { ok: false, error: "Item already sold" };
  if (!(input.winningBidUsd > 0)) return { ok: false, error: "Invalid winning bid" };

  const awaiting = readAwaitingCheckout(input.lot?.state);
  if (!awaiting) {
    return { ok: false, error: "Auction result is not confirmed for this lot yet" };
  }

  // Prefer the bid ledger over the host-written lot amount: a lot state the
  // host can invent would otherwise invent the charge too.
  if (input.topBid) {
    if (input.topBid.bidder_id !== input.buyerId) {
      return { ok: false, error: "This lot is reserved for another bidder" };
    }
    if (input.topBid.amount_cents < 50) {
      return { ok: false, error: "Invalid winning bid" };
    }
    return {
      ok: true,
      title: (row.title ?? "Sale item").slice(0, 200),
      bidCents: Math.round(input.topBid.amount_cents),
      runnerUpAttempt: awaiting.runnerUpAttempt,
    };
  }

  if (awaiting.winnerBidderId && awaiting.winnerBidderId !== input.buyerId) {
    return { ok: false, error: "This lot is reserved for another bidder" };
  }
  if (Math.round(awaiting.winningBidUsd * 100) !== Math.round(input.winningBidUsd * 100)) {
    return { ok: false, error: "Amount does not match the winning bid" };
  }

  return {
    ok: true,
    title: (row.title ?? "Sale item").slice(0, 200),
    bidCents: Math.round(awaiting.winningBidUsd * 100),
    runnerUpAttempt: awaiting.runnerUpAttempt,
  };
}
