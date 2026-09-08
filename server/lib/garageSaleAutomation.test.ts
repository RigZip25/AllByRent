import { describe, expect, it } from "vitest";
import {
  buildAwaitingCheckoutState,
  buildExpiredNoBidsState,
  pickNextBid,
  pickWinningBid,
  shouldCloseClassicAuction,
  type BidRow,
} from "./garageSaleAutomation";

function bid(overrides: Partial<BidRow> = {}): BidRow {
  return {
    listing_id: "listing-1",
    bidder_id: "bidder-a",
    amount_cents: 1000,
    placed_at: "2026-03-01T12:00:00.000Z",
    ...overrides,
  };
}

describe("pickWinningBid", () => {
  it("picks the highest amount", () => {
    const winner = pickWinningBid([
      bid({ bidder_id: "a", amount_cents: 1000, placed_at: "2026-03-01T12:00:00.000Z" }),
      bid({ bidder_id: "b", amount_cents: 1500, placed_at: "2026-03-01T12:05:00.000Z" }),
    ]);
    expect(winner?.bidder_id).toBe("b");
  });

  it("breaks ties with the earliest placed_at (first highest wins)", () => {
    const winner = pickWinningBid([
      bid({ bidder_id: "late", amount_cents: 2000, placed_at: "2026-03-01T12:10:00.000Z" }),
      bid({ bidder_id: "first", amount_cents: 2000, placed_at: "2026-03-01T12:00:00.000Z" }),
    ]);
    expect(winner?.bidder_id).toBe("first");
  });
});

describe("pickNextBid", () => {
  it("skips forfeited bidders", () => {
    const next = pickNextBid(
      [
        bid({ bidder_id: "winner", amount_cents: 3000 }),
        bid({ bidder_id: "runner", amount_cents: 2500, placed_at: "2026-03-01T11:00:00.000Z" }),
      ],
      ["winner"],
    );
    expect(next?.bidder_id).toBe("runner");
  });
});

describe("shouldCloseClassicAuction", () => {
  it("closes active auction prefs past endsAt", () => {
    expect(
      shouldCloseClassicAuction({
        prefs: { kind: "auction", endsAt: "2026-03-01T10:00:00.000Z" },
        lotStatus: "active",
        nowMs: Date.parse("2026-03-01T11:00:00.000Z"),
      }),
    ).toBe(true);
  });

  it("ignores buy-now prefs and non-active lots", () => {
    expect(
      shouldCloseClassicAuction({
        prefs: { kind: "buy_now", endsAt: "2026-03-01T10:00:00.000Z" },
        lotStatus: "active",
        nowMs: Date.parse("2026-03-01T11:00:00.000Z"),
      }),
    ).toBe(false);
    expect(
      shouldCloseClassicAuction({
        prefs: { kind: "auction", endsAt: "2026-03-01T10:00:00.000Z" },
        lotStatus: "awaiting_checkout",
        nowMs: Date.parse("2026-03-01T11:00:00.000Z"),
      }),
    ).toBe(false);
  });
});

describe("lot state builders", () => {
  it("builds awaiting checkout and expired shapes", () => {
    expect(
      buildAwaitingCheckoutState({
        winnerBidderId: "w",
        winningBidUsd: 12,
        endedAt: "t",
        payByIso: "p",
        forfeitedBidderIds: [],
        runnerUpAttempt: 1,
      }).status,
    ).toBe("awaiting_checkout");
    expect(buildExpiredNoBidsState("t").status).toBe("expired_no_bids");
  });
});
