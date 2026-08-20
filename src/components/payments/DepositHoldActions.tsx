import { useState } from "react";
import { claimDepositHold, releaseDepositHold } from "../../lib/stripePayments";
import { isStripePaymentsEnabled } from "../../lib/stripeConfig";
import { useMessages } from "../../lib/i18n/react";
import type { DisputeResolutionOutcome } from "../../lib/disputesStorage";

const GREEN = "#0D5C3A";

export function DepositHoldActions({
  rentalId,
  role,
  depositStatus,
  depositAmountCents,
  disputeFrozen = false,
  disputeOutcome = null,
}: {
  rentalId: string;
  role: "host" | "renter";
  depositStatus?: string;
  depositAmountCents?: number;
  /** When an open/under_review dispute is active, freeze claim/release UI. */
  disputeFrozen?: boolean;
  /** After resolve — surface the clear next Stripe step (manual). */
  disputeOutcome?: DisputeResolutionOutcome | null;
}) {
  const t = useMessages();
  const [busy, setBusy] = useState<"release" | "claim" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [partialUsd, setPartialUsd] = useState("");

  if (!isStripePaymentsEnabled() || !depositAmountCents || depositAmountCents < 50) {
    return null;
  }

  if (depositStatus === "released" || depositStatus === "claimed") {
    return (
      <p className="text-xs text-muted-foreground">
        {depositStatus === "claimed"
          ? t.rentalDetail.depositStatusClaimed
          : t.rentalDetail.depositStatusReleased}
      </p>
    );
  }

  if (depositStatus !== "held" && depositStatus !== "requires_capture") {
    return null;
  }

  const amount = `$${(depositAmountCents / 100).toFixed(2)}`;

  if (disputeFrozen) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 space-y-1">
        <p className="text-sm font-semibold text-amber-950">
          {t.rentalDetail.depositFrozen} · {amount}
        </p>
        <p className="text-xs text-amber-900">{t.rentalDetail.depositHeldDuringDispute}</p>
      </div>
    );
  }

  const nextStep =
    disputeOutcome === "favor_renter"
      ? t.rentalDetail.depositNextRelease
      : disputeOutcome === "favor_host"
        ? t.rentalDetail.depositNextClaim
        : disputeOutcome === "split"
          ? t.rentalDetail.depositNextSupport
          : null;

  const handleRelease = () => {
    setBusy("release");
    setMessage(null);
    void releaseDepositHold(rentalId)
      .then((r) => {
        if (!r.ok) setMessage(r.error ?? t.rentalDetail.depositStatusReleased);
        else setMessage(t.rentalDetail.depositStatusReleased);
      })
      .finally(() => setBusy(null));
  };

  const handleClaim = (partial: boolean) => {
    setBusy("claim");
    setMessage(null);
    let amountCents: number | undefined;
    if (partial) {
      const usd = Number.parseFloat(partialUsd.replace(/^\$/, "").trim());
      if (!Number.isFinite(usd) || usd < 0.5) {
        setMessage(t.rentalDetail.depositPartialInvalid);
        setBusy(null);
        return;
      }
      amountCents = Math.round(usd * 100);
      if (amountCents >= depositAmountCents) {
        amountCents = undefined;
      }
    }
    void claimDepositHold(rentalId, {
      amountCents,
      reason: amountCents != null ? "partial_deposit_claim" : "full_deposit_claim",
    })
      .then((r) => {
        if (!r.ok) setMessage(r.error ?? t.rentalDetail.depositStatusClaimed);
        else {
          setMessage(
            amountCents != null
              ? t.rentalDetail.depositPartialClaimed
              : t.rentalDetail.depositStatusClaimed,
          );
        }
      })
      .finally(() => setBusy(null));
  };

  return (
    <div className="rounded-xl border border-border bg-card p-3 space-y-2">
      <p className="text-sm font-semibold">
        {t.rentalDetail.depositProtection} · {amount}
      </p>
      <p className="text-xs text-muted-foreground">
        {nextStep ?? t.rentalDetail.depositHoldActiveBody}
      </p>
      <p className="text-[11px] text-muted-foreground">{t.rentalDetail.depositPartialHint}</p>
      {message ? <p className="text-xs text-gray-700">{message}</p> : null}
      {role === "host" ? (
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0.5}
            step={0.01}
            inputMode="decimal"
            placeholder={t.rentalDetail.depositPartialPlaceholder}
            value={partialUsd}
            onChange={(e) => setPartialUsd(e.target.value)}
            className="flex-1 rounded-lg border border-border bg-white px-2.5 py-2 text-sm outline-none focus:border-[#0D5C3A]"
          />
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => handleClaim(true)}
            className="shrink-0 rounded-lg border border-border px-3 py-2 text-xs font-semibold"
          >
            {busy === "claim" ? "…" : t.rentalDetail.depositPartialClaimBtn}
          </button>
        </div>
      ) : null}
      <div className="flex gap-2">
        {(role === "host" || role === "renter") && (
          <button
            type="button"
            disabled={busy !== null}
            onClick={handleRelease}
            className="flex-1 rounded-lg border border-border py-2 text-sm font-medium"
          >
            {busy === "release" ? "…" : t.rentalDetail.depositReleaseBtn}
          </button>
        )}
        {role === "host" && (
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => handleClaim(false)}
            className="flex-1 rounded-lg py-2 text-sm font-medium text-white"
            style={{ backgroundColor: GREEN }}
          >
            {busy === "claim" ? "…" : t.rentalDetail.depositClaimBtn}
          </button>
        )}
      </div>
    </div>
  );
}
