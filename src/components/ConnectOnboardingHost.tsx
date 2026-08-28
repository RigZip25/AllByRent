import { useCallback, useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { loadConnectAndInitialize, type StripeConnectInstance } from "@stripe/connect-js";
import { ConnectAccountOnboarding, ConnectComponentsProvider } from "@stripe/react-connect-js";
import {
  emitConnectOnboardingDone,
  registerConnectOnboardingOpener,
} from "../lib/connectOnboardingBus";
import { createConnectAccountSession, syncConnectAccountStatus } from "../lib/stripePayments";
import { getStripePublishableKey } from "../lib/stripeConfig";
import { useMessages } from "../lib/i18n/react";
import { ConnectSetupError } from "./payments/ConnectSetupError";

const GREEN = "#0D5C3A";
const BORDER = "#E8E6E0";

/**
 * Global host for embedded Stripe Connect onboarding.
 * Callers use startConnectOnboarding() → opens this sheet instead of redirecting to Stripe.
 */
export function ConnectOnboardingHost() {
  const t = useMessages();
  const [open, setOpen] = useState(false);
  const [connectInstance, setConnectInstance] = useState<StripeConnectInstance | null>(null);
  const [bootError, setBootError] = useState<string | null>(null);
  const [bootErrorCode, setBootErrorCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    return registerConnectOnboardingOpener(() => {
      setBootError(null);
      setBootErrorCode(null);
      setConnectInstance(null);
      setOpen(true);
    });
  }, []);

  useEffect(() => {
    if (!open) return;

    const key = getStripePublishableKey();
    if (!key) {
      setBootError("Stripe not configured. Set VITE_STRIPE_PUBLISHABLE_KEY on Vercel.");
      return;
    }

    let cancelled = false;
    setBusy(true);

    const instance = loadConnectAndInitialize({
      publishableKey: key,
      fetchClientSecret: async () => {
        const result = await createConnectAccountSession();
        if (!result.ok) {
          if (!cancelled) {
            setBootError(result.reason);
            setBootErrorCode(result.code ?? null);
            if (result.code === "already_connected") {
              void syncConnectAccountStatus().then(() => {
                emitConnectOnboardingDone();
                setOpen(false);
              });
            }
          }
          throw new Error(result.reason);
        }
        if (!cancelled) {
          setBootError(null);
          setBootErrorCode(null);
        }
        return result.clientSecret;
      },
      appearance: {
        overlays: "dialog",
        variables: {
          colorPrimary: GREEN,
          buttonPrimaryColorText: "#ffffff",
          colorText: "#111827",
          colorSecondaryText: "#6B7280",
          colorBorder: BORDER,
          borderRadius: "12px",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        },
      },
    });

    if (!cancelled) {
      setConnectInstance(instance);
      setBusy(false);
    }

    return () => {
      cancelled = true;
    };
  }, [open]);

  const close = useCallback(() => {
    setOpen(false);
    setConnectInstance(null);
    setBootError(null);
    setBootErrorCode(null);
  }, []);

  const handleExit = useCallback(() => {
    void (async () => {
      setBusy(true);
      try {
        await syncConnectAccountStatus();
      } finally {
        emitConnectOnboardingDone();
        setBusy(false);
        close();
      }
    })();
  }, [close]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-black/45 px-0 pb-0 pt-8 sm:items-center sm:px-3 sm:pb-3 sm:pt-10"
      role="dialog"
      aria-modal="true"
      aria-labelledby="connect-onboarding-title"
    >
      <div className="flex h-[min(94dvh,820px)] w-full max-w-[480px] flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
        <div className="flex items-start gap-3 border-b px-4 pb-3 pt-4" style={{ borderColor: BORDER }}>
          <div className="min-w-0 flex-1">
            <p id="connect-onboarding-title" className="text-[17px] font-extrabold" style={{ color: GREEN }}>
              {t.profile.connectEmbeddedTitle}
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-gray-600">{t.profile.connectEmbeddedBody}</p>
          </div>
          <button
            type="button"
            onClick={handleExit}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
            aria-label={t.common.close}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
          {bootError ? (
            <div className="space-y-3 px-1 py-2">
              <ConnectSetupError message={bootError} code={bootErrorCode} />
              <button
                type="button"
                onClick={handleExit}
                className="w-full rounded-xl py-3 text-sm font-bold text-white"
                style={{ backgroundColor: GREEN }}
              >
                {t.profile.connectEmbeddedDone}
              </button>
            </div>
          ) : null}

          {!bootError && (busy || !connectInstance) ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
              <Loader2 className="h-7 w-7 animate-spin" style={{ color: GREEN }} />
              <p className="text-[13px] font-medium">{t.profile.openingStripe}</p>
            </div>
          ) : null}

          {!bootError && connectInstance ? (
            <ConnectComponentsProvider connectInstance={connectInstance}>
              <ConnectAccountOnboarding
                onExit={handleExit}
                collectionOptions={{
                  fields: "eventually_due",
                  futureRequirements: "include",
                }}
                onLoadError={({ error }) => {
                  setBootError(error.message || t.profile.connectEmbeddedFailed);
                }}
              />
            </ConnectComponentsProvider>
          ) : null}
        </div>
      </div>
    </div>
  );
}
