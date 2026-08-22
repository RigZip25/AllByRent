import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { ConnectSetupError } from "./payments/ConnectSetupError";
import { useAuth } from "../hooks/AuthProvider";
import {
  fetchStoreLiveByHostIds,
  getLocalStoreLive,
  onStoreLiveChanged,
  pushStoreLiveRemote,
} from "../lib/garageStoreLive";
import { resolveHostAccountId } from "../lib/hostIdentity";
import { useMessages } from "../lib/i18n/react";
import { startConnectOnboarding } from "../lib/repositories/connectRepository";
import { loadSellerGoPublicStatus } from "../lib/sellerGoPublic";

const GREEN = "#1A9E6E";
const GREEN_DARK = "#0D5C3A";
const BORDER = "#E8E6E0";
const AMBER = "#B45309";

type Props = {
  onOpenProfile?: () => void;
};

/**
 * Garage Open/Pause tumbler. Stripe Connect (payoutsReady) required before turning Live on —
 * including for gift-only shelves.
 */
export function StoreLiveToggle({ onOpenProfile }: Props) {
  const auth = useAuth();
  const t = useMessages();
  const hostId = resolveHostAccountId(auth.userId);
  const [storeLive, setStoreLive] = useState(() => getLocalStoreLive(hostId));
  const [payoutsReady, setPayoutsReady] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [busy, setBusy] = useState<"toggle" | "stripe" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  useEffect(() => {
    if (!hostId) {
      setStoreLive(false);
      return;
    }
    setStoreLive(getLocalStoreLive(hostId));
    void fetchStoreLiveByHostIds([hostId]).then((map) => {
      if (Object.prototype.hasOwnProperty.call(map, hostId)) {
        setStoreLive(Boolean(map[hostId]));
      }
    });
    return onStoreLiveChanged((id, live) => {
      if (id === hostId) setStoreLive(live);
    });
  }, [hostId]);

  useEffect(() => {
    let mounted = true;
    setStatusLoading(true);
    void loadSellerGoPublicStatus(auth.userId, { requiresPhone: false })
      .then((status) => {
        if (!mounted) return;
        setPayoutsReady(Boolean(status.payoutsReady));
      })
      .finally(() => {
        if (mounted) setStatusLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [auth.userId]);

  const needsStripe = !payoutsReady;
  const canOpen = Boolean(hostId) && payoutsReady;

  const handleToggle = () => {
    if (!hostId || busy) return;
    setError(null);
    setErrorCode(null);

    if (!storeLive && needsStripe) {
      setError(t.garageUi.storeLiveStripeRequired);
      return;
    }

    const next = !storeLive;
    setBusy("toggle");
    setStoreLive(next);
    void pushStoreLiveRemote(hostId, next)
      .then((result) => {
        if (!result.ok) {
          setStoreLive(!next);
          setError(result.reason);
        }
      })
      .finally(() => setBusy(null));
  };

  const handleSetupStripe = () => {
    if (busy) return;
    setBusy("stripe");
    setError(null);
    setErrorCode(null);
    void startConnectOnboarding("/?screen=garage")
      .then((result) => {
        if (result.ok) {
          window.location.assign(result.url);
          return;
        }
        if (result.code === "already_connected") {
          setPayoutsReady(true);
          setError(null);
          return;
        }
        setError(result.reason || t.garageUi.storeLiveStripeRequired);
        setErrorCode(result.code ?? null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : t.garageUi.storeLiveStripeRequired);
      })
      .finally(() => setBusy(null));
  };

  return (
    <div
      className="mb-3 rounded-2xl border bg-white p-4"
      style={{ borderColor: storeLive ? "#A7F3D0" : BORDER }}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold" style={{ color: GREEN_DARK }}>
            {storeLive ? t.garageUi.storeLiveOnTitle : t.garageUi.storeLiveOffTitle}
          </p>
          <p className="mt-0.5 text-[12px] leading-snug text-gray-500">
            {storeLive ? t.garageUi.storeLiveOnBody : t.garageUi.storeLiveOffBody}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={storeLive}
          aria-label={storeLive ? t.garageUi.storeLivePause : t.garageUi.storeLiveOpen}
          disabled={!hostId || busy === "toggle" || statusLoading}
          onClick={handleToggle}
          className="relative h-8 w-[52px] shrink-0 rounded-full transition-colors disabled:opacity-50"
          style={{ backgroundColor: storeLive ? GREEN : "#D1D5DB" }}
        >
          {busy === "toggle" ? (
            <Loader2 className="absolute inset-0 m-auto h-4 w-4 animate-spin text-white" />
          ) : (
            <span
              className="absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-[left]"
              style={{ left: storeLive ? "22px" : "4px" }}
            />
          )}
        </button>
      </div>

      {!storeLive && needsStripe && !statusLoading ? (
        <div
          className="mt-3 rounded-xl border px-3 py-2.5"
          style={{ borderColor: "#FDE68A", backgroundColor: "#FFFBEB" }}
        >
          <p className="text-[13px] font-semibold" style={{ color: AMBER }}>
            {t.garageUi.storeLiveStripeGateTitle}
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-amber-900/90">
            {t.garageUi.storeLiveStripeGateBody}
          </p>
          <button
            type="button"
            onClick={handleSetupStripe}
            disabled={busy === "stripe" || !hostId}
            className="mt-2.5 w-full rounded-xl py-2.5 text-[13px] font-bold text-white disabled:opacity-60"
            style={{ backgroundColor: GREEN_DARK }}
          >
            {busy === "stripe" ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t.garageUi.storeLiveStripeOpening}
              </span>
            ) : (
              t.garageUi.storeLiveStripeCta
            )}
          </button>
          {onOpenProfile ? (
            <button
              type="button"
              onClick={onOpenProfile}
              className="mt-2 w-full text-center text-[12px] font-semibold text-gray-600 underline"
            >
              {t.garageUi.storeLiveOpenProfile}
            </button>
          ) : null}
        </div>
      ) : null}

      {!storeLive && canOpen && !statusLoading ? (
        <p className="mt-2 text-[12px] text-gray-500">{t.garageUi.storeLiveReadyHint}</p>
      ) : null}

      {error ? (
        errorCode || /stripe|payout|connect|bank|platform/i.test(error) ? (
          <ConnectSetupError message={error} code={errorCode} />
        ) : (
          <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-800">
            {error}
          </p>
        )
      ) : null}
    </div>
  );
}
