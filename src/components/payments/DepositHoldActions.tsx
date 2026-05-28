import { useState } from "react";
import { claimDepositHold, releaseDepositHold } from "../../lib/stripePayments";
import { isStripePaymentsEnabled } from "../../lib/stripeConfig";

const GREEN = "#0D5C3A";

export function DepositHoldActions({
  rentalId,
  role,
  depositStatus,
  depositAmountCents,
}: {
  rentalId: string;
  role: "host" | "renter";
  depositStatus?: string;
  depositAmountCents?: number;
}) {
  const [busy, setBusy] = useState<"release" | "claim" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!isStripePaymentsEnabled() || !depositAmountCents || depositAmountCents < 50) {
    return null;
  }

  if (depositStatus === "released" || depositStatus === "claimed") {
    return (
      <p className="text-xs text-muted-foreground">
        Deposit: {depositStatus === "claimed" ? "claimed by host" : "released"}
      </p>
    );
  }

  if (depositStatus !== "held" && depositStatus !== "requires_capture") {
    return null;
  }

  const handleRelease = () => {
    setBusy("release");
    setMessage(null);
    void releaseDepositHold(rentalId)
      .then((r) => {
        if (!r.ok) setMessage(r.error ?? "Could not release deposit");
        else setMessage("Deposit hold released.");
      })
      .finally(() => setBusy(null));
  };

  const handleClaim = () => {
    setBusy("claim");
    setMessage(null);
    void claimDepositHold(rentalId)
      .then((r) => {
        if (!r.ok) setMessage(r.error ?? "Could not claim deposit");
        else setMessage("Deposit captured.");
      })
      .finally(() => setBusy(null));
  };

  return (
    <div className="rounded-xl border border-border bg-card p-3 space-y-2">
      <p className="text-sm font-semibold">
        Security deposit · ${(depositAmountCents / 100).toFixed(2)}
      </p>
      <p className="text-xs text-muted-foreground">
        Hold is active. Owner can claim within 48h after return; otherwise release to renter.
      </p>
      {message ? <p className="text-xs text-gray-700">{message}</p> : null}
      <div className="flex gap-2">
        {(role === "host" || role === "renter") && (
          <button
            type="button"
            disabled={busy !== null}
            onClick={handleRelease}
            className="flex-1 rounded-lg border border-border py-2 text-sm font-medium"
          >
            {busy === "release" ? "Releasing…" : "Release hold"}
          </button>
        )}
        {role === "host" && (
          <button
            type="button"
            disabled={busy !== null}
            onClick={handleClaim}
            className="flex-1 rounded-lg py-2 text-sm font-medium text-white"
            style={{ backgroundColor: GREEN }}
          >
            {busy === "claim" ? "Claiming…" : "Claim deposit"}
          </button>
        )}
      </div>
    </div>
  );
}
