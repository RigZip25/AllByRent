import { getAccessToken } from "./stripePayments";
import type { RentalBooking, RentalRole } from "./rentalsStorage";
import { generatePin, loadRentalBookings, updateBooking } from "./rentalsStorage";

export type HandoffStage = "pickup" | "return";

export type HandoffConfirmResult =
  | {
      ok: true;
      booking: RentalBooking;
      waitingOther: boolean;
      completedStage: boolean;
      alreadyDone?: boolean;
    }
  | { ok: false; reason: string };

type ApiPayload = {
  ok?: boolean;
  alreadyDone?: boolean;
  status?: string;
  pickupPin?: string | null;
  returnPin?: string | null;
  hostHandedOverAt?: string | null;
  renterReceivedAt?: string | null;
  renterReturnedAt?: string | null;
  hostAcceptedReturnAt?: string | null;
  pickedUpAt?: string | null;
  returnedAt?: string | null;
  dueAt?: string | null;
  error?: string;
};

function mergeLocalHandoff(
  booking: RentalBooking,
  role: RentalRole,
  stage: HandoffStage,
): { patch: Partial<RentalBooking>; waitingOther: boolean; completedStage: boolean } {
  const now = new Date().toISOString();

  if (stage === "pickup") {
    const hostHandedOverAt =
      role === "host" ? booking.hostHandedOverAt ?? now : booking.hostHandedOverAt;
    const renterReceivedAt =
      role === "renter" ? booking.renterReceivedAt ?? now : booking.renterReceivedAt;
    const both = Boolean(hostHandedOverAt && renterReceivedAt);
    const patch: Partial<RentalBooking> = {
      hostHandedOverAt,
      renterReceivedAt,
    };
    if (both) {
      patch.status = "active";
      patch.pickupConfirmedAt = booking.pickupConfirmedAt ?? now;
      patch.returnPin = booking.returnPin ?? generatePin();
      if (!booking.returnDueAt && booking.endDate) {
        patch.returnDueAt = new Date(`${booking.endDate}T23:59:59.000Z`).toISOString();
      }
    }
    return {
      patch,
      waitingOther: !both,
      completedStage: both,
    };
  }

  const renterReturnedAt =
    role === "renter" ? booking.renterReturnedAt ?? now : booking.renterReturnedAt;
  const hostAcceptedReturnAt =
    role === "host" ? booking.hostAcceptedReturnAt ?? now : booking.hostAcceptedReturnAt;
  const both = Boolean(renterReturnedAt && hostAcceptedReturnAt);
  const patch: Partial<RentalBooking> = {
    renterReturnedAt,
    hostAcceptedReturnAt,
  };
  if (both) {
    patch.status = "completed";
    patch.returnConfirmedAt = booking.returnConfirmedAt ?? now;
    patch.completedAt = booking.completedAt ?? now;
  }
  return {
    patch,
    waitingOther: !both,
    completedStage: both,
  };
}

/**
 * Confirm one side of QR+PIN handoff (host or renter).
 * Tries server API first; falls back to local dual-confirm.
 */
export async function confirmHandoffSide(input: {
  bookingId: string;
  role: RentalRole;
  stage: HandoffStage;
  pin: string;
}): Promise<HandoffConfirmResult> {
  const booking = loadRentalBookings().find((b) => b.id === input.bookingId);
  if (!booking) return { ok: false, reason: "Rental not found" };

  const pin = input.pin.trim();
  if (!/^\d{6}$/.test(pin)) return { ok: false, reason: "Enter the 6-digit PIN" };

  const expected =
    input.stage === "pickup" ? booking.pickupPin?.trim() : booking.returnPin?.trim();
  if (!expected || expected !== pin) {
    return {
      ok: false,
      reason: input.stage === "pickup" ? "Incorrect pickup PIN" : "Incorrect return PIN",
    };
  }

  if (input.stage === "pickup" && booking.status !== "pending_checkin" && booking.status !== "upcoming") {
    if (booking.status === "active" || booking.pickupConfirmedAt) {
      return { ok: true, booking, waitingOther: false, completedStage: true, alreadyDone: true };
    }
    return { ok: false, reason: "Rental is not waiting for pickup" };
  }
  if (
    input.stage === "return" &&
    booking.status !== "active" &&
    booking.status !== "overdue"
  ) {
    if (booking.status === "completed" || booking.returnConfirmedAt) {
      return { ok: true, booking, waitingOther: false, completedStage: true, alreadyDone: true };
    }
    return { ok: false, reason: "Rental is not out for return" };
  }

  // Already confirmed my side?
  if (input.stage === "pickup") {
    if (input.role === "host" && booking.hostHandedOverAt && !booking.renterReceivedAt) {
      return { ok: true, booking, waitingOther: true, completedStage: false, alreadyDone: true };
    }
    if (input.role === "renter" && booking.renterReceivedAt && !booking.hostHandedOverAt) {
      return { ok: true, booking, waitingOther: true, completedStage: false, alreadyDone: true };
    }
  }
  if (input.stage === "return") {
    if (input.role === "renter" && booking.renterReturnedAt && !booking.hostAcceptedReturnAt) {
      return { ok: true, booking, waitingOther: true, completedStage: false, alreadyDone: true };
    }
    if (input.role === "host" && booking.hostAcceptedReturnAt && !booking.renterReturnedAt) {
      return { ok: true, booking, waitingOther: true, completedStage: false, alreadyDone: true };
    }
  }

  const token = await getAccessToken();
  if (token) {
    try {
      const res = await fetch("/api/rentals/confirm-handoff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rentalId: booking.id,
          stage: input.stage,
          pin,
        }),
      });
      const payload = (await res.json().catch(() => ({}))) as ApiPayload;
      if (res.ok && payload.ok) {
        const patch: Partial<RentalBooking> = {
          status: (payload.status as RentalBooking["status"]) ?? booking.status,
          pickupPin: payload.pickupPin ?? booking.pickupPin,
          returnPin: payload.returnPin ?? booking.returnPin,
          hostHandedOverAt: payload.hostHandedOverAt ?? booking.hostHandedOverAt,
          renterReceivedAt: payload.renterReceivedAt ?? booking.renterReceivedAt,
          renterReturnedAt: payload.renterReturnedAt ?? booking.renterReturnedAt,
          hostAcceptedReturnAt: payload.hostAcceptedReturnAt ?? booking.hostAcceptedReturnAt,
          pickupConfirmedAt: payload.pickedUpAt ?? booking.pickupConfirmedAt,
          returnConfirmedAt: payload.returnedAt ?? booking.returnConfirmedAt,
          returnDueAt: payload.dueAt ?? booking.returnDueAt,
        };
        if (patch.status === "completed") {
          patch.completedAt = booking.completedAt ?? new Date().toISOString();
        }
        const nextList = updateBooking(booking.id, patch);
        const next = nextList.find((b) => b.id === booking.id) ?? booking;
        const completedStage =
          input.stage === "pickup"
            ? Boolean(next.hostHandedOverAt && next.renterReceivedAt)
            : Boolean(next.renterReturnedAt && next.hostAcceptedReturnAt);
        return {
          ok: true,
          booking: next,
          waitingOther: !completedStage,
          completedStage,
          alreadyDone: payload.alreadyDone,
        };
      }
      if (payload.error) {
        // Fall through to local if columns missing / API unavailable.
        if (!/column|schema|not found/i.test(payload.error)) {
          return { ok: false, reason: payload.error };
        }
      }
    } catch {
      /* local fallback */
    }
  }

  const { patch, waitingOther, completedStage } = mergeLocalHandoff(booking, input.role, input.stage);
  const nextList = updateBooking(booking.id, patch);
  const next = nextList.find((b) => b.id === booking.id) ?? { ...booking, ...patch };
  return { ok: true, booking: next, waitingOther, completedStage };
}

export function handoffTimelineState(booking: RentalBooking): {
  hostHanded: boolean;
  renterReceived: boolean;
  renterReturned: boolean;
  hostAcceptedReturn: boolean;
  pickupComplete: boolean;
  returnComplete: boolean;
} {
  const hostHanded = Boolean(booking.hostHandedOverAt);
  const renterReceived = Boolean(booking.renterReceivedAt);
  const renterReturned = Boolean(booking.renterReturnedAt);
  const hostAcceptedReturn = Boolean(booking.hostAcceptedReturnAt);
  return {
    hostHanded,
    renterReceived,
    renterReturned,
    hostAcceptedReturn,
    pickupComplete:
      Boolean(booking.pickupConfirmedAt) ||
      (hostHanded && renterReceived) ||
      booking.status === "active" ||
      booking.status === "overdue" ||
      booking.status === "completed",
    returnComplete:
      Boolean(booking.returnConfirmedAt) ||
      (renterReturned && hostAcceptedReturn) ||
      booking.status === "completed",
  };
}
