import { describe, expect, it } from "vitest";
import {
  getActiveBookings,
  getUpcomingBookings,
  isUpcomingBooking,
  resolveMergedRentalStatus,
  type RentalBooking,
  type RentalStatus,
} from "./rentalsStorage";

function booking(overrides: Partial<RentalBooking> = {}): RentalBooking {
  return {
    id: "rental-1",
    role: "renter",
    status: "pending_checkin" as RentalStatus,
    itemTitle: "Pressure washer",
    itemEmoji: "📦",
    startDate: "2026-04-10",
    endDate: "2026-04-12",
    counterpartyId: "host-1",
    counterpartyName: "Dana",
    counterpartyIdentityVerified: false,
    counterpartyPhoneVerified: false,
    pickupLabel: "Pickup",
    totalUsd: 90,
    insuranceIncluded: false,
    listingModes: ["rent"],
    ...overrides,
  };
}

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

describe("upcoming versus active", () => {
  const april8 = new Date(2026, 3, 8, 9, 0);
  const april10 = new Date(2026, 3, 10, 9, 0);

  it("counts a confirmed booking that starts later as upcoming", () => {
    expect(isUpcomingBooking(booking(), april8)).toBe(true);
  });

  it("stops being upcoming on the day it starts", () => {
    expect(isUpcomingBooking(booking(), april10)).toBe(false);
  });

  it("stops being upcoming as soon as somebody scans at the handoff", () => {
    const scanned = booking({ hostHandedOverAt: "2026-04-08T10:00:00.000Z" });
    expect(isUpcomingBooking(scanned, april8)).toBe(false);
  });

  it("never counts a rental in progress or a finished one", () => {
    expect(isUpcomingBooking(booking({ status: "active" }), april8)).toBe(false);
    expect(isUpcomingBooking(booking({ status: "completed" }), april8)).toBe(false);
    expect(isUpcomingBooking(booking({ status: "cancelled" }), april8)).toBe(false);
    expect(isUpcomingBooking(booking({ status: "pending_approval" }), april8)).toBe(false);
  });

  it("puts each booking in exactly one of the two tabs", () => {
    const list = [
      booking({ id: "next-week" }),
      booking({ id: "today", startDate: "2026-04-08", status: "pending_checkin" }),
      booking({ id: "running", status: "active" }),
      booking({ id: "late", status: "overdue" }),
      booking({ id: "done", status: "completed" }),
    ];

    expect(getUpcomingBookings(list, april8).map((b) => b.id)).toEqual(["next-week"]);
    expect(getActiveBookings(list, april8).map((b) => b.id)).toEqual([
      "today",
      "running",
      "late",
    ]);
  });

  it("shows a booking the server marked upcoming once its day arrives", () => {
    const remote = booking({ id: "remote", status: "upcoming", startDate: "2026-04-10" });
    expect(getUpcomingBookings([remote], april10)).toEqual([]);
    expect(getActiveBookings([remote], april10).map((b) => b.id)).toEqual(["remote"]);
  });
});
