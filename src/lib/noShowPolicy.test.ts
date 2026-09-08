import { describe, expect, it } from "vitest";
import { canAutoCancelNoShow, canSuggestSoftNoShow } from "./noShowPolicy";
import type { RentalBooking } from "./rentalsStorage";

const PICKUP = "2026-04-10T15:00:00.000Z";
const PICKUP_MS = Date.parse(PICKUP);
const HOUR = 60 * 60 * 1000;

function booking(overrides: Partial<RentalBooking> = {}): RentalBooking {
  return {
    id: "rental-1",
    role: "host",
    status: "pending_checkin",
    itemTitle: "Cargo trailer",
    itemEmoji: "📦",
    startDate: "2026-04-10",
    endDate: "2026-04-12",
    counterpartyId: "renter-1",
    counterpartyName: "Marco",
    counterpartyIdentityVerified: false,
    counterpartyPhoneVerified: false,
    pickupLabel: "Pickup",
    totalUsd: 120,
    insuranceIncluded: false,
    listingModes: ["rent"],
    pickupScheduledAt: PICKUP,
    ...overrides,
  };
}

describe("canSuggestSoftNoShow", () => {
  it("waits two hours past the pickup window", () => {
    expect(canSuggestSoftNoShow(booking(), PICKUP_MS + HOUR)).toBe(false);
    expect(canSuggestSoftNoShow(booking(), PICKUP_MS + 2 * HOUR)).toBe(true);
  });

  it("holds off while a running-late note is still in its grace", () => {
    const graceUntil = new Date(PICKUP_MS + 2.5 * HOUR).toISOString();
    const late = booking({ pickupGraceUntil: graceUntil });
    expect(canSuggestSoftNoShow(late, PICKUP_MS + 2 * HOUR)).toBe(false);
    expect(canSuggestSoftNoShow(late, PICKUP_MS + 3 * HOUR)).toBe(true);
  });

  it("says nothing once the item has changed hands", () => {
    expect(
      canSuggestSoftNoShow(booking({ hostHandedOverAt: PICKUP }), PICKUP_MS + 5 * HOUR),
    ).toBe(false);
    expect(
      canSuggestSoftNoShow(booking({ pickupConfirmedAt: PICKUP }), PICKUP_MS + 5 * HOUR),
    ).toBe(false);
  });
});

describe("canAutoCancelNoShow", () => {
  it("cancels a soft no-show the host never confirmed, a day after pickup", () => {
    const soft = booking({ status: "no_show" });
    expect(canAutoCancelNoShow(soft, PICKUP_MS + 12 * HOUR)).toBe(false);
    expect(canAutoCancelNoShow(soft, PICKUP_MS + 24 * HOUR)).toBe(true);
  });

  it("leaves a no-show the host did confirm alone", () => {
    const marked = booking({ status: "no_show", noShowMarkedAt: PICKUP });
    expect(canAutoCancelNoShow(marked, PICKUP_MS + 48 * HOUR)).toBe(false);
  });
});
