/**
 * @vitest-environment node
 *
 * Node has no Web Storage — stub a minimal localStorage/window for these cases.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ListingDraft } from "../screens/listing/types";

const TOMBSTONE_KEY = "allbyrent_removed_listing_tombstones";
const LISTINGS_KEY = "allbyrent_published_listings";

function installMemoryStorage(): Storage {
  const map = new Map<string, string>();
  const storage: Storage = {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key: string) {
      return map.has(key) ? map.get(key)! : null;
    },
    key(index: number) {
      return [...map.keys()][index] ?? null;
    },
    removeItem(key: string) {
      map.delete(key);
    },
    setItem(key: string, value: string) {
      map.set(key, String(value));
    },
  };
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: storage,
  });
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      localStorage: storage,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => true,
      setTimeout: globalThis.setTimeout.bind(globalThis),
    },
  });
  return storage;
}

beforeEach(() => {
  installMemoryStorage();
});

afterEach(() => {
  vi.restoreAllMocks();
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
  it("persists across reads so a deleted listing stays suppressed", async () => {
    const { noteListingRemovedLocally, isListingRecentlyRemoved } = await import("./listingStorage");
    noteListingRemovedLocally("listing-a");
    expect(isListingRecentlyRemoved("listing-a")).toBe(true);

    const raw = localStorage.getItem(TOMBSTONE_KEY);
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw!).some((row: { id: string }) => row.id === "listing-a")).toBe(true);
  });

  it("can clear a tombstone after a confirmed remote delete", async () => {
    const {
      noteListingRemovedLocally,
      clearListingRemovedTombstone,
      isListingRecentlyRemoved,
    } = await import("./listingStorage");
    noteListingRemovedLocally("listing-b");
    clearListingRemovedTombstone("listing-b");
    expect(isListingRecentlyRemoved("listing-b")).toBe(false);
  });

  it("drops expired tombstones", async () => {
    const { isListingRecentlyRemoved } = await import("./listingStorage");
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
  it("surfaces a storage-full event when localStorage refuses the write", async () => {
    const { savePublishedListing } = await import("./listingStorage");
    const notified = vi.fn();
    const originalDispatch = window.dispatchEvent.bind(window);
    window.dispatchEvent = ((event: Event) => {
      if (event.type === "evorios-listing-storage-full") notified();
      return originalDispatch(event);
    }) as typeof window.dispatchEvent;

    const originalSetItem = localStorage.setItem.bind(localStorage);
    localStorage.setItem = ((key: string, value: string) => {
      if (key === LISTINGS_KEY) {
        throw new DOMException("quota", "QuotaExceededError");
      }
      return originalSetItem(key, value);
    }) as Storage["setItem"];

    const result = savePublishedListing(draft("draft-1"));
    expect(result.ok).toBe(false);
    expect(notified).toHaveBeenCalled();
  });

  it("prunes older drafts and retries before failing", async () => {
    const { savePublishedListing } = await import("./listingStorage");
    savePublishedListing(draft("old-1", { updatedAt: "2020-01-01T00:00:00.000Z" }));
    savePublishedListing(draft("old-2", { updatedAt: "2020-02-01T00:00:00.000Z" }));

    const originalSetItem = localStorage.setItem.bind(localStorage);
    let listingWrites = 0;
    localStorage.setItem = ((key: string, value: string) => {
      if (key === LISTINGS_KEY) {
        listingWrites += 1;
        if (listingWrites === 1) {
          throw new DOMException("quota", "QuotaExceededError");
        }
      }
      return originalSetItem(key, value);
    }) as Storage["setItem"];

    const result = savePublishedListing(draft("new-draft"));
    expect(result.ok).toBe(true);
    expect(listingWrites).toBeGreaterThanOrEqual(2);
    const stored = JSON.parse(localStorage.getItem(LISTINGS_KEY)!) as ListingDraft[];
    expect(stored.some((row) => row.id === "new-draft")).toBe(true);
  });
});
