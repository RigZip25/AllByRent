import { getAccessToken } from "./stripePayments";
import type { MediaRef } from "./mediaStore";
import type { RentalBooking, RentalRole } from "./rentalsStorage";
import { generatePin, loadRentalBookings, updateBooking } from "./rentalsStorage";
import { agreementFullySigned } from "./rentalAgreement";
import { getMessages } from "./i18n";

export type HandoffStage = "pickup" | "return";

/** Neighbor-safe: if host doesn’t accept a contactless return, auto-complete after this window. */
export const CONTACTLESS_RETURN_AUTO_CONFIRM_MS = 24 * 60 * 60 * 1000;

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

function isContactless(booking: RentalBooking): boolean {
  return booking.fulfillmentMethod === "contactless";
}

function mergeLocalHandoff(
  booking: RentalBooking,
  role: RentalRole,
  stage: HandoffStage,
): { patch: Partial<RentalBooking>; waitingOther: boolean; completedStage: boolean } {
  const now = new Date().toISOString();
  const contactless = isContactless(booking);

  if (stage === "pickup") {
    let hostHandedOverAt =
      role === "host" ? booking.hostHandedOverAt ?? now : booking.hostHandedOverAt;
    let renterReceivedAt =
      role === "renter" ? booking.renterReceivedAt ?? now : booking.renterReceivedAt;

    // Contactless: renter QR/PIN unlock starts the rental (host authorized via staged access + PIN).
    if (contactless && role === "renter") {
      hostHandedOverAt = hostHandedOverAt ?? now;
      renterReceivedAt = renterReceivedAt ?? now;
    }

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

function applyExtras(
  patch: Partial<RentalBooking>,
  input: {
    stage: HandoffStage;
    odometerMiles?: number;
    conditionPhoto?: MediaRef | null;
    fuelLevelEighths?: number;
    defLevelEighths?: number;
    prepaidFullTank?: boolean;
    pumpPricePerGallonUsd?: number;
    fuelTopUpEstimateCents?: number;
    fuelShortfallFeeCents?: number;
    fuelClaimStatus?: RentalBooking["fuelClaimStatus"];
    fuelClaimNote?: string;
  },
): void {
  if (
    typeof input.odometerMiles === "number" &&
    Number.isFinite(input.odometerMiles) &&
    input.odometerMiles >= 0
  ) {
    if (input.stage === "pickup") {
      patch.startOdometerMiles = Math.round(input.odometerMiles);
    } else {
      patch.returnOdometerMiles = Math.round(input.odometerMiles);
    }
  }
  if (
    typeof input.fuelLevelEighths === "number" &&
    Number.isFinite(input.fuelLevelEighths) &&
    input.fuelLevelEighths >= 1 &&
    input.fuelLevelEighths <= 8
  ) {
    const level = Math.round(input.fuelLevelEighths);
    if (input.stage === "pickup") patch.startFuelLevelEighths = level;
    else patch.returnFuelLevelEighths = level;
  }
  if (
    typeof input.defLevelEighths === "number" &&
    Number.isFinite(input.defLevelEighths) &&
    input.defLevelEighths >= 1 &&
    input.defLevelEighths <= 8
  ) {
    const level = Math.round(input.defLevelEighths);
    if (input.stage === "pickup") patch.startDefLevelEighths = level;
    else patch.returnDefLevelEighths = level;
  }
  if (input.prepaidFullTank != null) {
    patch.prepaidFullTank = Boolean(input.prepaidFullTank);
  }
  if (
    typeof input.pumpPricePerGallonUsd === "number" &&
    Number.isFinite(input.pumpPricePerGallonUsd) &&
    input.pumpPricePerGallonUsd > 0
  ) {
    patch.returnFuelPumpPriceUsd = input.pumpPricePerGallonUsd;
  }
  if (typeof input.fuelTopUpEstimateCents === "number") {
    patch.fuelTopUpEstimateCents = Math.max(0, Math.round(input.fuelTopUpEstimateCents));
  }
  if (typeof input.fuelShortfallFeeCents === "number") {
    patch.fuelShortfallFeeCents = Math.max(0, Math.round(input.fuelShortfallFeeCents));
  }
  if (input.fuelClaimStatus) patch.fuelClaimStatus = input.fuelClaimStatus;
  if (typeof input.fuelClaimNote === "string") patch.fuelClaimNote = input.fuelClaimNote;
  if (input.conditionPhoto) {
    if (input.stage === "pickup") patch.pickupConditionPhoto = input.conditionPhoto;
    else patch.returnConditionPhoto = input.conditionPhoto;
  }
}

/**
 * Confirm one side of QR+PIN handoff (host or renter).
 * Tries server API first; falls back to local dual-confirm.
 * Contactless pickup: renter alone completing QR/PIN starts the rental.
 */
export async function confirmHandoffSide(input: {
  bookingId: string;
  role: RentalRole;
  stage: HandoffStage;
  pin: string;
  /** Vehicle rentals — odometer reading captured at this handoff. */
  odometerMiles?: number;
  /** Optional condition proof photo at this handoff. */
  conditionPhoto?: MediaRef | null;
  /** Fuel gauge eighths (1–8) when listing requires fuel tracking. */
  fuelLevelEighths?: number;
  /** DEF gauge eighths (1–8) for diesel. */
  defLevelEighths?: number;
  prepaidFullTank?: boolean;
  pumpPricePerGallonUsd?: number;
  fuelTopUpEstimateCents?: number;
  fuelShortfallFeeCents?: number;
  fuelClaimStatus?: RentalBooking["fuelClaimStatus"];
  fuelClaimNote?: string;
}): Promise<HandoffConfirmResult> {
  const booking = loadRentalBookings().find((b) => b.id === input.bookingId);
  if (!booking) return { ok: false, reason: "Rental not found" };

  if (input.stage === "pickup" && !agreementFullySigned(booking.rentalAgreement)) {
    return { ok: false, reason: getMessages().rentalAgreement.blockHandoff };
  }

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

  if (input.stage === "pickup") {
    if (input.role === "host" && booking.hostHandedOverAt && !booking.renterReceivedAt) {
      return { ok: true, booking, waitingOther: true, completedStage: false, alreadyDone: true };
    }
    if (
      input.role === "renter" &&
      booking.renterReceivedAt &&
      !booking.hostHandedOverAt &&
      !isContactless(booking)
    ) {
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
        applyExtras(patch, input);
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
        if (!/column|schema|not found/i.test(payload.error)) {
          return { ok: false, reason: payload.error };
        }
      }
    } catch {
      /* local fallback */
    }
  }

  const { patch, waitingOther, completedStage } = mergeLocalHandoff(booking, input.role, input.stage);
  applyExtras(patch, input);
  const nextList = updateBooking(booking.id, patch);
  const next = nextList.find((b) => b.id === booking.id) ?? { ...booking, ...patch };
  return { ok: true, booking: next, waitingOther, completedStage };
}

/**
 * Contactless return: if the host doesn’t accept within the window, auto-complete the deal.
 */
export async function maybeAutoConfirmContactlessReturn(
  booking: RentalBooking,
): Promise<RentalBooking | null> {
  if (!isContactless(booking)) return null;
  if (booking.status !== "active" && booking.status !== "overdue") return null;
  if (!booking.renterReturnedAt || booking.hostAcceptedReturnAt || booking.returnConfirmedAt) {
    return null;
  }
  const returnedMs = new Date(booking.renterReturnedAt).getTime();
  if (!Number.isFinite(returnedMs)) return null;
  if (Date.now() - returnedMs < CONTACTLESS_RETURN_AUTO_CONFIRM_MS) return null;

  const now = new Date().toISOString();
  const nextList = updateBooking(booking.id, {
    hostAcceptedReturnAt: now,
    status: "completed",
    returnConfirmedAt: booking.returnConfirmedAt ?? now,
    completedAt: booking.completedAt ?? now,
  });
  return nextList.find((b) => b.id === booking.id) ?? null;
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

/** Resolve the listing QR token/id this booking should match at handoff. */
export function resolveBookingQrTarget(booking: RentalBooking): {
  listingId?: string;
  qrToken?: string;
} {
  const listingId = booking.listingId?.trim() || undefined;
  const qrToken = booking.itemQrToken?.trim() || listingId || undefined;
  return { listingId, qrToken };
}
