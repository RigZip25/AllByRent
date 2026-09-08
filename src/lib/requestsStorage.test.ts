import { describe, expect, it } from "vitest";
import {
  REQUEST_LIFETIME_DAYS,
  isRequestExpired,
  isRequestLive,
  requestBelongsToShelf,
  type WantedRequest,
} from "./requestsStorage";

function ask(overrides: Partial<WantedRequest> = {}): WantedRequest {
  const createdAt = new Date("2026-01-01T12:00:00Z").toISOString();
  return {
    id: "req-1",
    renterId: "renter-1",
    category: "Tools & DIY",
    subcategory: "Ladders",
    description: "Need a 6ft ladder",
    locationLabel: "Oak Park",
    createdAt,
    status: "open",
    expiresAt: new Date(
      Date.parse(createdAt) + REQUEST_LIFETIME_DAYS * 86_400_000,
    ).toISOString(),
    ...overrides,
  };
}

const dayAfterPosting = (days: number) =>
  Date.parse("2026-01-01T12:00:00Z") + days * 86_400_000;

describe("ask lifecycle", () => {
  it("shows an open ask until it runs out", () => {
    expect(isRequestLive(ask(), dayAfterPosting(29))).toBe(true);
    expect(isRequestLive(ask(), dayAfterPosting(31))).toBe(false);
    expect(isRequestExpired(ask(), dayAfterPosting(31))).toBe(true);
  });

  it("hides asks the renter already closed", () => {
    expect(isRequestLive(ask({ status: "fulfilled" }), dayAfterPosting(1))).toBe(false);
    expect(isRequestLive(ask({ status: "cancelled" }), dayAfterPosting(1))).toBe(false);
  });

  it("keeps asks with no expiry visible rather than dropping them", () => {
    const legacy = ask({ expiresAt: undefined });
    expect(isRequestLive(legacy, dayAfterPosting(400))).toBe(true);
    expect(isRequestExpired(legacy, dayAfterPosting(400))).toBe(false);
  });
});

describe("requestBelongsToShelf", () => {
  it("matches the shelf it was posted on", () => {
    expect(
      requestBelongsToShelf(ask(), { category: "Tools & DIY", subcategory: "Ladders" }),
    ).toBe(true);
    expect(
      requestBelongsToShelf(ask(), { category: "Tools & DIY", subcategory: "Drills" }),
    ).toBe(false);
  });

  it("follows a shelf that was renamed after the ask was posted", () => {
    const moved = ask({ category: "Office & Business", subcategory: "Office Furniture" });
    expect(
      requestBelongsToShelf(moved, {
        category: "Home & Office Furniture",
        subcategory: "Office Desks & Chairs",
      }),
    ).toBe(true);
  });
});
