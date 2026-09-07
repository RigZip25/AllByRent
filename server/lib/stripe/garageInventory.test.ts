import { describe, expect, it } from "vitest";

import {
  validateAuctionListing,
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

  it("refuses a paused or inactive listing", () => {
    expect(validate({ listing: listing({ availability: { paused: true } }) }).ok).toBe(false);
    expect(validate({ listing: listing({ listing_status: "draft" }) }).ok).toBe(false);
  });

  it("refuses a rent-only listing", () => {
    const result = validate({ listing: listing({ modes: ["rent"] }) });
    expect(result).toEqual({ ok: false, error: "Listing is not for sale" });
  });

  it("defaults the runner-up attempt when the lot omits it", () => {
    const result = validate({ lot: lot({ ...AWAITING, runnerUpAttempt: undefined }) });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.runnerUpAttempt).toBe(1);
  });
});
