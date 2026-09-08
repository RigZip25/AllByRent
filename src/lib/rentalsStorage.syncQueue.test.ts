/**
 * @vitest-environment node
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const QUEUE_KEY = "allbyrent_rental_sync_queue";

function installMemoryStorage(): void {
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
      setTimeout: (fn: () => void) => {
        // Avoid auto-flush from module install during offline assertions.
        void fn;
        return 0;
      },
    },
  });
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: { onLine: true },
  });
}

beforeEach(() => {
  installMemoryStorage();
  vi.resetModules();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("rental sync queue", () => {
  it("merges patches for the same rental id while offline", async () => {
    Object.defineProperty(globalThis.navigator, "onLine", {
      configurable: true,
      get: () => false,
    });
    vi.doMock("./supabaseClient", () => ({
      isSupabaseConfigured: () => true,
      getSupabaseClient: () => null,
    }));

    const { enqueueRentalRemoteSync } = await import("./rentalsStorage");
    enqueueRentalRemoteSync("rental-2", { status: "active" });
    enqueueRentalRemoteSync("rental-2", { runningLateMessage: "5 min" });

    const queued = JSON.parse(localStorage.getItem(QUEUE_KEY)!) as Array<{
      id: string;
      patch: Record<string, unknown>;
    }>;
    expect(queued).toHaveLength(1);
    expect(queued[0]?.id).toBe("rental-2");
    expect(queued[0]?.patch).toMatchObject({
      status: "active",
      runningLateMessage: "5 min",
    });
  });

  it("clears the queue after a successful flush", async () => {
    Object.defineProperty(globalThis.navigator, "onLine", {
      configurable: true,
      get: () => false,
    });
    vi.doMock("./supabaseClient", () => ({
      isSupabaseConfigured: () => true,
      getSupabaseClient: () => ({
        from: () => ({
          update: () => ({
            eq: async () => ({ error: null }),
          }),
        }),
      }),
    }));

    const mod = await import("./rentalsStorage");
    mod.enqueueRentalRemoteSync("rental-1", { status: "cancelled" });
    expect(JSON.parse(localStorage.getItem(QUEUE_KEY)!)).toHaveLength(1);

    Object.defineProperty(globalThis.navigator, "onLine", {
      configurable: true,
      get: () => true,
    });
    await mod.flushRentalSyncQueue();
    expect(JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]")).toEqual([]);
  });
});
