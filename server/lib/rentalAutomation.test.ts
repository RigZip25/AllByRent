import { describe, expect, it } from "vitest";
import {
  depositReleaseDueAt,
  noShowDueAtMs,
  type DepositRow,
  type DisputeRow,
} from "./rentalAutomation";

const DAY = 24 * 60 * 60 * 1000;
const CLAIM_WINDOW = 48 * 60 * 60 * 1000;

function rental(overrides: Partial<DepositRow> = {}): DepositRow {
  return {
    id: "rental-1",
    owner_id: "host-1",
    renter_id: "renter-1",
    status: "completed",
    deposit_status: "held",
    deposit_amount_cents: 20000,
    deposit_claim_deadline_at: null,
    stripe_deposit_payment_intent_id: "pi_deposit",
    returned_at: null,
    picked_up_at: "2026-03-01T15:00:00.000Z",
    cancelled_at: null,
    end_date: "2026-03-05",
    ...overrides,
  };
}

function dispute(overrides: Partial<DisputeRow> = {}): DisputeRow {
  return {
    rental_id: "rental-1",
    status: "resolved",
    resolution_outcome: "favor_renter",
    resolved_at: "2026-03-06T10:00:00.000Z",
    ...overrides,
  };
}

describe("depositReleaseDueAt", () => {
  it("gives the host the claim window after the item comes back", () => {
    const returned = "2026-03-05T18:00:00.000Z";
    expect(depositReleaseDueAt(rental({ returned_at: returned }), undefined)).toBe(
      Date.parse(returned) + CLAIM_WINDOW,
    );
  });

  it("honours the deadline the payment webhook wrote", () => {
    const deadline = "2026-03-07T18:00:00.000Z";
    expect(
      depositReleaseDueAt(
        rental({ returned_at: "2026-03-05T18:00:00.000Z", deposit_claim_deadline_at: deadline }),
        undefined,
      ),
    ).toBe(Date.parse(deadline));
  });

  it("falls back to the end of the rental when no return was recorded", () => {
    expect(depositReleaseDueAt(rental(), undefined)).toBe(
      Date.parse("2026-03-05T23:59:59.999Z") + CLAIM_WINDOW,
    );
  });

  it("releases at once when the booking ended before pickup", () => {
    const cancelledAt = "2026-03-02T09:00:00.000Z";
    expect(
      depositReleaseDueAt(
        rental({ status: "cancelled", picked_up_at: null, cancelled_at: cancelledAt }),
        undefined,
      ),
    ).toBe(Date.parse(cancelledAt));
  });

  it("still waits out the claim window when a cancelled rental was picked up", () => {
    const due = depositReleaseDueAt(
      rental({ status: "cancelled", cancelled_at: "2026-03-04T09:00:00.000Z" }),
      undefined,
    );
    expect(due).toBe(Date.parse("2026-03-05T23:59:59.999Z") + CLAIM_WINDOW);
  });

  it("holds everything while a dispute is open", () => {
    expect(depositReleaseDueAt(rental(), dispute({ status: "open" }))).toBeNull();
    expect(depositReleaseDueAt(rental(), dispute({ status: "under_review" }))).toBeNull();
  });

  it("releases as soon as a dispute ends in the renter's favour", () => {
    const resolved = "2026-03-06T10:00:00.000Z";
    expect(depositReleaseDueAt(rental(), dispute({ resolved_at: resolved }))).toBe(
      Date.parse(resolved),
    );
  });

  it("gives the host a fresh window when the dispute went their way", () => {
    const resolved = "2026-03-06T10:00:00.000Z";
    expect(
      depositReleaseDueAt(
        rental(),
        dispute({ resolution_outcome: "favor_host", resolved_at: resolved }),
      ),
    ).toBe(Date.parse(resolved) + CLAIM_WINDOW);
  });

  it("gives the host the same window to claim their share of a split", () => {
    const resolved = "2026-03-06T10:00:00.000Z";
    expect(
      depositReleaseDueAt(rental(), dispute({ resolution_outcome: "split", resolved_at: resolved })),
    ).toBe(Date.parse(resolved) + CLAIM_WINDOW);
  });

  it("keeps the hold while the rental is still running", () => {
    expect(depositReleaseDueAt(rental({ status: "active" }), undefined)).toBeNull();
    expect(depositReleaseDueAt(rental({ status: "overdue" }), undefined)).toBeNull();
  });

  it("does not release a no-show until the host has dealt with it", () => {
    // A no-show may still carry a fee the host is entitled to claim; the hold
    // comes off once the booking is cancelled, which is a day later at most.
    expect(depositReleaseDueAt(rental({ status: "no_show" }), undefined)).toBeNull();
  });

  it("treats a withdrawn dispute as no dispute at all", () => {
    const resolved = "2026-03-06T10:00:00.000Z";
    expect(
      depositReleaseDueAt(
        rental(),
        dispute({ resolution_outcome: "withdrawn", resolved_at: resolved }),
      ),
    ).toBe(Date.parse(resolved));
  });

  it("does not wait forever on a rental that ended a month ago", () => {
    const due = depositReleaseDueAt(rental({ returned_at: "2026-03-05T18:00:00.000Z" }), undefined);
    expect(due).not.toBeNull();
    expect(due! - Date.parse("2026-03-05T18:00:00.000Z")).toBeLessThanOrEqual(3 * DAY);
  });
});

describe("noShowDueAtMs", () => {
  const pickup = "2026-03-01T15:00:00.000Z";
  const pickupMs = Date.parse(pickup);

  it("is two hours after the pickup window when nobody said anything", () => {
    expect(noShowDueAtMs({ pickup_at: pickup, pickup_grace_until: null })).toBe(
      pickupMs + 2 * 60 * 60 * 1000,
    );
  });

  it("waits for the grace a running-late note bought", () => {
    const grace = new Date(pickupMs + 3 * 60 * 60 * 1000).toISOString();
    expect(noShowDueAtMs({ pickup_at: pickup, pickup_grace_until: grace })).toBe(
      Date.parse(grace),
    );
  });

  it("never brings the no-show forward", () => {
    const grace = new Date(pickupMs + 30 * 60 * 1000).toISOString();
    expect(noShowDueAtMs({ pickup_at: pickup, pickup_grace_until: grace })).toBe(
      pickupMs + 2 * 60 * 60 * 1000,
    );
  });
});
