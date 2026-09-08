import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  acceptCoHostInvite,
  activateCoHostInvite,
  getActiveCoHostHostIds,
  inviteCoHost,
  loadCoHostRecords,
} from "./coHostStorage";
import { saveFavoriteListingIds, loadFavoriteListingIds } from "./favoritesStorage";

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
    clear: () => store.clear(),
  });
});

describe("Stage 14 co-host consent", () => {
  it("does not let the host Mark active unilaterally", () => {
    const invited = inviteCoHost("host-1", "helper@example.com", "host@example.com");
    expect(invited.ok).toBe(true);
    if (!invited.ok) return;
    expect(activateCoHostInvite("host-1", invited.record.id)).toBe(false);
    expect(loadCoHostRecords()[0]?.status).toBe("pending");
  });

  it("only counts active co-hosts bound to a user id", () => {
    const invited = inviteCoHost("host-1", "helper@example.com", "host@example.com");
    expect(invited.ok).toBe(true);
    if (!invited.ok) return;
    acceptCoHostInvite(invited.record.id, "helper-user");
    expect(getActiveCoHostHostIds("helper-user", "helper@example.com")).toEqual(["host-1"]);
    expect(getActiveCoHostHostIds("other-user", "helper@example.com")).toEqual([]);
  });
});

describe("Stage 14 favorites remote wins", () => {
  it("replaces local favorites instead of unioning", () => {
    saveFavoriteListingIds(["local-only", "shared"]);
    // Simulate remote sync write path (same as syncFavoritesFromRemote after fetch).
    saveFavoriteListingIds(["shared", "remote-only"]);
    expect(loadFavoriteListingIds().sort()).toEqual(["remote-only", "shared"].sort());
  });
});
