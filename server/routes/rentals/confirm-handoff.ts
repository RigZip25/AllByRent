import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors, handleOptions } from "../../lib/cors";
import { withApiErrorHandling } from "../../lib/safeHandler";
import { getAdminClient, getUserFromBearer } from "../../lib/passkey/supabaseAdmin";

type Body = {
  rentalId?: string;
  /** pickup = host hands over / renter receives; return = renter returns / host accepts */
  stage?: "pickup" | "return";
  pin?: string;
};

function generatePin(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * Dual-sided handoff confirm.
 * Host + renter each confirm their side; status flips only when both sides are done.
 */
export default withApiErrorHandling(async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  applyCors(res, typeof req.headers.origin === "string" ? req.headers.origin : undefined);

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const user = await getUserFromBearer(req.headers.authorization);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const admin = getAdminClient();
  if (!admin) {
    res.status(503).json({ error: "Database not configured" });
    return;
  }

  const body = (req.body ?? {}) as Body;
  const rentalId = typeof body.rentalId === "string" ? body.rentalId.trim() : "";
  const stage = body.stage === "return" ? "return" : "pickup";
  const pin = typeof body.pin === "string" ? body.pin.trim() : "";

  if (!rentalId) {
    res.status(400).json({ error: "rentalId is required" });
    return;
  }
  if (!/^\d{6}$/.test(pin)) {
    res.status(400).json({ error: "Valid 6-digit PIN is required" });
    return;
  }

  const { data: rental, error } = await admin
    .from("rentals")
    .select(
      "id, owner_id, renter_id, status, pickup_pin, return_pin, host_handed_over_at, renter_received_at, renter_returned_at, host_accepted_return_at, picked_up_at, returned_at, due_at, end_date",
    )
    .eq("id", rentalId)
    .maybeSingle();

  if (error || !rental) {
    res.status(404).json({ error: "Rental not found" });
    return;
  }

  const isHost = rental.owner_id === user.id;
  const isRenter = rental.renter_id === user.id;
  if (!isHost && !isRenter) {
    res.status(403).json({ error: "Not a participant on this rental" });
    return;
  }

  const now = new Date().toISOString();
  const patch: Record<string, string | null> = {};

  if (stage === "pickup") {
    if (!["pending_checkin", "upcoming"].includes(String(rental.status))) {
      if (rental.status === "active" || rental.picked_up_at) {
        res.status(200).json({
          ok: true,
          alreadyDone: true,
          status: rental.status,
          hostHandedOverAt: rental.host_handed_over_at,
          renterReceivedAt: rental.renter_received_at,
        });
        return;
      }
      res.status(409).json({ error: "Rental is not waiting for pickup" });
      return;
    }

    const expectedPin = String(rental.pickup_pin ?? "");
    if (!expectedPin || expectedPin !== pin) {
      res.status(403).json({ error: "Incorrect pickup PIN" });
      return;
    }

    if (isHost) {
      if (!rental.host_handed_over_at) patch.host_handed_over_at = now;
    } else if (!rental.renter_received_at) {
      patch.renter_received_at = now;
    }

    const hostDone = Boolean(rental.host_handed_over_at || patch.host_handed_over_at);
    const renterDone = Boolean(rental.renter_received_at || patch.renter_received_at);

    if (hostDone && renterDone) {
      patch.status = "active";
      patch.picked_up_at = rental.picked_up_at ?? now;
      if (!rental.return_pin) patch.return_pin = generatePin();
      if (!rental.due_at && rental.end_date) {
        patch.due_at = new Date(`${rental.end_date}T23:59:59.000Z`).toISOString();
      }
    }
  } else {
    if (!["active", "overdue"].includes(String(rental.status))) {
      if (rental.status === "completed" || rental.returned_at) {
        res.status(200).json({
          ok: true,
          alreadyDone: true,
          status: rental.status,
          renterReturnedAt: rental.renter_returned_at,
          hostAcceptedReturnAt: rental.host_accepted_return_at,
        });
        return;
      }
      res.status(409).json({ error: "Rental is not out for return" });
      return;
    }

    const expectedPin = String(rental.return_pin ?? "");
    if (!expectedPin || expectedPin !== pin) {
      res.status(403).json({ error: "Incorrect return PIN" });
      return;
    }

    if (isRenter) {
      if (!rental.renter_returned_at) patch.renter_returned_at = now;
    } else if (!rental.host_accepted_return_at) {
      patch.host_accepted_return_at = now;
    }

    const renterDone = Boolean(rental.renter_returned_at || patch.renter_returned_at);
    const hostDone = Boolean(rental.host_accepted_return_at || patch.host_accepted_return_at);

    if (renterDone && hostDone) {
      patch.status = "completed";
      patch.returned_at = rental.returned_at ?? now;
    }
  }

  if (Object.keys(patch).length === 0) {
    res.status(200).json({
      ok: true,
      alreadyDone: true,
      status: rental.status,
      hostHandedOverAt: rental.host_handed_over_at,
      renterReceivedAt: rental.renter_received_at,
      renterReturnedAt: rental.renter_returned_at,
      hostAcceptedReturnAt: rental.host_accepted_return_at,
    });
    return;
  }

  const { data: updated, error: updateError } = await admin
    .from("rentals")
    .update(patch)
    .eq("id", rentalId)
    .select(
      "id, status, pickup_pin, return_pin, host_handed_over_at, renter_received_at, renter_returned_at, host_accepted_return_at, picked_up_at, returned_at, due_at",
    )
    .maybeSingle();

  if (updateError || !updated) {
    res.status(500).json({ error: updateError?.message ?? "Failed to update rental" });
    return;
  }

  res.status(200).json({
    ok: true,
    status: updated.status,
    pickupPin: updated.pickup_pin,
    returnPin: updated.return_pin,
    hostHandedOverAt: updated.host_handed_over_at,
    renterReceivedAt: updated.renter_received_at,
    renterReturnedAt: updated.renter_returned_at,
    hostAcceptedReturnAt: updated.host_accepted_return_at,
    pickedUpAt: updated.picked_up_at,
    returnedAt: updated.returned_at,
    dueAt: updated.due_at,
  });
});
