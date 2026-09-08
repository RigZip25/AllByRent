import { afterEach, describe, expect, it, vi } from "vitest";

const QUEUE_KEY = "allbyrent_rental_sync_queue";

afterEach(() => {
  localStorage.removeItem(QUEUE_KEY);
  Object.defineProperty(navigator, "onLine", { configurable: true, get: () => true });
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("rental sync queue", () => {
  it("merges patches for the same rental id while offline", async () => {
    Object.defineProperty(navigator, "onLine", { configurable: true, get: () => false });
    vi.resetModules();
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
    Object.defineProperty(navigator, "onLine", { configurable: true, get: () => false });
    vi.resetModules();
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

    Object.defineProperty(navigator, "onLine", { configurable: true, get: () => true });
    await mod.flushRentalSyncQueue();
    expect(JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]")).toEqual([]);
  });
});
