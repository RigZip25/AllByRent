import { describe, expect, it } from "vitest";
import { resolveMergedRentalStatus } from "./rentalsStorage";

describe("resolveMergedRentalStatus", () => {
  it("keeps a cancelled booking cancelled, whatever the other side says", () => {
    // The bug this replaces: `cancelled` ranked below everything, so a booking
    // cancelled on one device came back alive on the next sync.
    expect(resolveMergedRentalStatus("cancelled", "active")).toBe("cancelled");
    expect(resolveMergedRentalStatus("active", "cancelled")).toBe("cancelled");
    expect(resolveMergedRentalStatus("cancelled", "completed")).toBe("cancelled");
    expect(resolveMergedRentalStatus("cancelled", "pending_checkin")).toBe("cancelled");
  });

  it("lets a dispute outlive the completion it argues about", () => {
    expect(resolveMergedRentalStatus("disputed", "completed")).toBe("disputed");
    expect(resolveMergedRentalStatus("completed", "disputed")).toBe("disputed");
  });

  it("otherwise takes the side that got further", () => {
    expect(resolveMergedRentalStatus("pending_approval", "pending_checkin")).toBe(
      "pending_checkin",
    );
    expect(resolveMergedRentalStatus("active", "overdue")).toBe("overdue");
    expect(resolveMergedRentalStatus("overdue", "completed")).toBe("completed");
    expect(resolveMergedRentalStatus("pending_checkin", "no_show")).toBe("no_show");
  });

  it("is stable when both sides agree", () => {
    expect(resolveMergedRentalStatus("active", "active")).toBe("active");
    expect(resolveMergedRentalStatus("cancelled", "cancelled")).toBe("cancelled");
  });
});
