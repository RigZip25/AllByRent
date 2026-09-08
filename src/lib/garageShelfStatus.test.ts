import { beforeEach, describe, expect, it, vi } from "vitest";
import { deriveGarageShelfStatus } from "./garageShelfStatus";
import type { ListingDraft } from "../screens/listing/types";

const store = new Map<string, string>();

beforeEach(() => {
  store.clear();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
  });
  vi.stubGlobal("window", {
    dispatchEvent: () => true,
  });
});

function listing(overrides: Partial<ListingDraft> = {}): ListingDraft {
  return {
    id: "listing-1",
    hostId: "host-1",
    title: "Lamp",
    description: "",
    category: "Home",
    subcategory: "",
    photos: [],
    modes: { rent: false, sell: true, gift: false },
    pricing: { salePrice: "20" },
    availability: {},
    listingStatus: "active",
    paused: false,
    ...overrides,
  } as ListingDraft;
}

describe("deriveGarageShelfStatus", () => {
  it("marks expired_no_bids as non-actionable ended", () => {
    store.set(
      "evorios_garage_lot_state",
      JSON.stringify({
        "listing-1": { status: "expired_no_bids", endedAt: "2026-03-01T00:00:00.000Z" },
      }),
    );
    expect(deriveGarageShelfStatus(listing())).toEqual({ kind: "ended", actionable: false });
  });

  it("keeps available lots actionable", () => {
    expect(deriveGarageShelfStatus(listing())).toEqual({ kind: "available", actionable: true });
  });
});
