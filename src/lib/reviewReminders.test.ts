import { describe, expect, it, vi } from "vitest";

vi.mock("../../server/lib/notifications", () => ({
  insertNotification: vi.fn(async () => undefined),
}));

import { runReviewReminders } from "../../server/lib/reviewReminders";
import { insertNotification } from "../../server/lib/notifications";

function thenableQuery(result: { data: unknown; error: null }) {
  const api: Record<string, unknown> = {};
  const self = () => api;
  for (const method of ["select", "eq", "gte", "lte", "limit", "ilike"]) {
    api[method] = self;
  }
  (api as { then: unknown }).then = (
    resolve: (v: unknown) => unknown,
    reject?: (e: unknown) => unknown,
  ) => Promise.resolve(result).then(resolve, reject);
  return api;
}

describe("runReviewReminders (Stage 18 / V7)", () => {
  it("reminds participants who have not reviewed a completed rental", async () => {
    const insert = insertNotification as unknown as ReturnType<typeof vi.fn>;
    insert.mockClear();

    const updatedAt = new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString();
    let call = 0;
    const admin = {
      from: () => {
        call += 1;
        if (call === 1) {
          return thenableQuery({
            data: [
              {
                id: "rental-1",
                owner_id: "host-1",
                renter_id: "renter-1",
                updated_at: updatedAt,
              },
            ],
            error: null,
          });
        }
        if (call === 2) {
          return thenableQuery({ data: [{ reviewer_id: "host-1" }], error: null });
        }
        return thenableQuery({ data: [], error: null });
      },
    };

    const result = await runReviewReminders(admin as never);
    expect(result.scanned).toBe(1);
    expect(result.reminded).toBe(1);
    expect(insert).toHaveBeenCalledTimes(1);
    expect(insert.mock.calls[0][1]).toMatchObject({
      recipientId: "renter-1",
      type: "review_reminder",
    });
  });
});
