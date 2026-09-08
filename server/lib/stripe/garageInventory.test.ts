import { describe, expect, it } from "vitest";

import {
  resolveSellLinePriceCents,
  validateAuctionListing,
  validateGarageSellLines,
  type GarageListingRow,
  type GarageLotRow,
} from "./garageInventory";

const HOST = "host-1";
const WINNER = "winner-1";

function listing(overrides: Partial<GarageListingRow> = {}): GarageListingRow {
  return {
    id: "listing-1",
    owner_id: HOST,
    title: "Vintage lamp",
    modes: ["sell"],
    pricing: { salePrice: "80" },
    availability: { paused: false },
    listing_status: "active",
    ...overrides,
  };
}

function lot(state: unknown): GarageLotRow {
  return { listing_id: "listing-1", state };
}

const AWAITING = {
  status: "awaiting_checkout",
  winnerBidderId: WINNER,
  winningBidUsd: 42.5,
  runnerUpAttempt: 2,
};

function validate(overrides: Partial<Parameters<typeof validateAuctionListing>[0]> = {}) {
  return validateAuctionListing({
    hostId: HOST,
    listingId: "listing-1",
    listing: listing(),
    lot: lot(AWAITING),
    winningBidUsd: 42.5,
    buyerId: WINNER,
    ...overrides,
  });
}

describe("validateAuctionListing", () => {
  it("charges the winning bid recorded by the host", () => {
    const result = validate();
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.bidCents).toBe(4250);
    expect(result.runnerUpAttempt).toBe(2);
  });

  it("prefers the bid ledger over a host-invented lot amount", () => {
    const result = validate({
      winningBidUsd: 99,
      topBid: { listing_id: "listing-1", bidder_id: WINNER, amount_cents: 5500 },
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.bidCents).toBe(5500);
  });

  it("refuses a bid amount the lot never recorded", () => {
    const result = validate({ winningBidUsd: 1 });
    expect(result.ok).toBe(false);
  });

  it("refuses a buyer who did not win the lot", () => {
    const result = validate({ buyerId: "someone-else" });
    expect(result).toEqual({ ok: false, error: "This lot is reserved for another bidder" });
  });

  it("refuses a lot that has not finished its auction", () => {
    const result = validate({ lot: lot({ status: "live", winningBidUsd: 42.5 }) });
    expect(result.ok).toBe(false);
  });

  it("refuses an item already sold", () => {
    const result = validate({ lot: lot({ ...AWAITING, status: "sold" }) });
    expect(result).toEqual({ ok: false, error: "Item already sold" });
  });

  it("refuses a listing that belongs to another host", () => {
    const result = validate({ listing: listing({ owner_id: "host-2" }) });
    expect(result).toEqual({ ok: false, error: "Listing host mismatch" });
  });
});

describe("resolveSellLinePriceCents", () => {
  it("charges an accepted offer instead of the sticker price", () => {
    const result = resolveSellLinePriceCents({
      listingId: "listing-1",
      salePriceCents: 8000,
      buyerId: "buyer-1",
      offers: [
        {
          listing_id: "listing-1",
          buyer_id: "buyer-1",
          amount_cents: 4000,
          status: "accepted",
        },
      ],
    });
    expect(result).toEqual({ ok: true, priceCents: 4000 });
  });

  it("refuses a listing reserved for someone else", () => {
    const result = resolveSellLinePriceCents({
      listingId: "listing-1",
      salePriceCents: 8000,
      buyerId: "buyer-1",
      offers: [
        {
          listing_id: "listing-1",
          buyer_id: "buyer-2",
          amount_cents: 4000,
          status: "accepted",
        },
      ],
    });
    expect(result.ok).toBe(false);
  });
});

describe("validateGarageSellLines", () => {
  it("lets the winner of an awaiting lot check out at the bid", () => {
    const result = validateGarageSellLines({
      hostId: HOST,
      listingIds: ["listing-1"],
      listings: [listing()],
      lots: [lot(AWAITING)],
      buyerId: WINNER,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.lines[0]?.priceCents).toBe(4250);
  });

  it("blocks sell when the listing has an active rental", () => {
    const result = validateGarageSellLines({
      hostId: HOST,
      listingIds: ["listing-1"],
      listings: [listing()],
      lots: [lot({ status: "active" })],
      buyerId: "buyer-1",
      rentalBlockedListingIds: ["listing-1"],
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/active rental/i);
  });
});
