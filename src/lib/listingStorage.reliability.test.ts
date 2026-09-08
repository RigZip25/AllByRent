import { afterEach, describe, expect, it, vi } from "vitest";
import {
  clearListingRemovedTombstone,
  isListingRecentlyRemoved,
  noteListingRemovedLocally,
  savePublishedListing,
} from "./listingStorage";
import type { ListingDraft } from "../screens/listing/types";

const TOMBSTONE_KEY = "allbyrent_removed_listing_tombstones";
const LISTINGS_KEY = "allbyrent_published_listings";

afterEach(() => {
  localStorage.removeItem(TOMBSTONE_KEY);
  localStorage.removeItem(LISTINGS_KEY);
});

function draft(id: string, overrides: Partial<ListingDraft> = {}): ListingDraft {
  return {
    id,
    title: `Draft ${id}`,
    description: "",
    listingStatus: "draft",
    photos: [],
    videos: [],
    modes: { rent: true, sell: false, gift: false },
    pricing: {
      dailyRate: "10",
      salePrice: "",
      minimumPeriod: "1 day",
    },
    handoff: {
      itemHeavy: false,
      deliveryMaxMiles: 0,
      deliveryRoundTripFee: "",
      inPersonTimeStart: "09:00",
      inPersonTimeEnd: "17:00",
      inPersonWeekendTimeStart: "10:00",
      inPersonWeekendTimeEnd: "16:00",
    },
    category: "Tools & DIY",
    subcategory: "Power Tools",
    updatedAt: new Date().toISOString(),
    ...overrides,
  } as ListingDraft;
}

describe("listing removal tombstones", () => {
  it("persists across reads so a deleted listing stays suppressed", () => {
    noteListingRemovedLocally("listing-a");
    expect(isListingRecentlyRemoved("listing-a")).toBe(true);

    const raw = localStorage.getItem(TOMBSTONE_KEY);
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw!).some((row: { id: string }) => row.id === "listing-a")).toBe(true);
  });

  it("can clear a tombstone after a confirmed remote delete", () => {
    noteListingRemovedLocally("listing-b");
    clearListingRemovedTombstone("listing-b");
    expect(isListingRecentlyRemoved("listing-b")).toBe(false);
  });

  it("drops expired tombstones", () => {
    const old = Date.now() - 31 * 24 * 60 * 60 * 1000;
    localStorage.setItem(
      TOMBSTONE_KEY,
      JSON.stringify([{ id: "stale", removedAt: old }, { id: "fresh", removedAt: Date.now() }]),
    );
    expect(isListingRecentlyRemoved("stale")).toBe(false);
    expect(isListingRecentlyRemoved("fresh")).toBe(true);
  });
});

describe("savePublishedListing quota", () => {
  it("surfaces a storage-full event when localStorage refuses the write", () => {
    const notified = vi.fn();
    window.addEventListener("evorios-listing-storage-full", notified);

    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key: string, value: string) {
      if (key === LISTINGS_KEY) {
        throw new DOMException("quota", "QuotaExceededError");
      }
      return original.call(this, key, value);
    };

    try {
      const result = savePublishedListing(draft("draft-1"));
      expect(result.ok).toBe(false);
      expect(notified).toHaveBeenCalled();
    } finally {
      Storage.prototype.setItem = original;
      window.removeEventListener("evorios-listing-storage-full", notified);
    }
  });

  it("prunes older drafts and retries before failing", () => {
    savePublishedListing(draft("old-1", { updatedAt: "2020-01-01T00:00:00.000Z" }));
    savePublishedListing(draft("old-2", { updatedAt: "2020-02-01T00:00:00.000Z" }));

    const original = Storage.prototype.setItem;
    let listingWrites = 0;
    Storage.prototype.setItem = function (key: string, value: string) {
      if (key === LISTINGS_KEY) {
        listingWrites += 1;
        if (listingWrites === 1) {
          throw new DOMException("quota", "QuotaExceededError");
        }
      }
      return original.call(this, key, value);
    };

    try {
      const result = savePublishedListing(draft("new-draft"));
      expect(result.ok).toBe(true);
      expect(listingWrites).toBeGreaterThanOrEqual(2);
      const stored = JSON.parse(localStorage.getItem(LISTINGS_KEY)!) as ListingDraft[];
      expect(stored.some((row) => row.id === "new-draft")).toBe(true);
    } finally {
      Storage.prototype.setItem = original;
    }
  });
});
