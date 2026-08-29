import { useCallback, useEffect, useState } from "react";
import { Loader2, ShieldCheck, X } from "lucide-react";
import { loadConnectAndInitialize, type StripeConnectInstance } from "@stripe/connect-js";
import {
  ConnectAccountManagement,
  ConnectAccountOnboarding,
  ConnectComponentsProvider,
} from "@stripe/react-connect-js";
import {
  emitConnectOnboardingDone,
  registerConnectOnboardingOpener,
} from "../lib/connectOnboardingBus";
import { createConnectAccountSession, syncConnectAccountStatus } from "../lib/stripePayments";
import { getStripePublishableKey } from "../lib/stripeConfig";
import { APP_NAME, BRAND_GREEN, BRAND_GREEN_LIGHT } from "../lib/brand";
import { useMessages } from "../lib/i18n/react";
import { ConnectSetupError } from "./payments/ConnectSetupError";

const SURFACE = "#F0F4F2";
const PAPER = "#FFFEFA";
const INK = "#0B3D2A";
const MUTED = "#5C6B63";
const LINE = "#D8E0DA";
const MIST = "#E8F2EC";

/** Force Connect embedded UI onto Evorios green — Stripe defaults to purple otherwise. */
const CONNECT_APPEARANCE = {
  overlays: "dialog" as const,
  variables: {
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSizeBase: "15px",
    spacingUnit: "10px",
    borderRadius: "14px",
    colorPrimary: BRAND_GREEN,
    colorBackground: PAPER,
    colorText: INK,
    colorSecondaryText: MUTED,
    colorBorder: LINE,
    colorDanger: "#B91C1C",
    buttonPrimaryColorBackground: BRAND_GREEN,
    buttonPrimaryColorBorder: BRAND_GREEN,
    buttonPrimaryColorText: "#FFFFFF",
    buttonSecondaryColorBackground: MIST,
    buttonSecondaryColorBorder: LINE,
    buttonSecondaryColorText: BRAND_GREEN,
    buttonLabelFontWeight: "700",
    actionPrimaryColorText: BRAND_GREEN_LIGHT,
    actionSecondaryColorText: MUTED,
    badgeNeutralColorBackground: MIST,
    badgeNeutralColorText: INK,
    badgeNeutralColorBorder: LINE,
    badgeSuccessColorBackground: "#D1FAE5",
    badgeSuccessColorText: BRAND_GREEN,
    badgeSuccessColorBorder: "#A7F3D0",
    formAccentColor: BRAND_GREEN,
    formHighlightColorBorder: BRAND_GREEN_LIGHT,
    overlayBackdropColor: "rgba(6, 42, 28, 0.45)",
  },
};

type ConnectUiMode = "onboarding" | "management";

/**
 * Full-screen Evorios shell around Stripe Connect embedded components.
 * Appearance variables override Stripe’s default purple brand colors.
 */
export function ConnectOnboardingHost() {
  const t = useMessages();
  const [open, setOpen] = useState(false);
  const [connectInstance, setConnectInstance] = useState<StripeConnectInstance | null>(null);
  const [uiMode, setUiMode] = useState<ConnectUiMode>("onboarding");
  const [bootError, setBootError] = useState<string | null>(null);
  const [bootErrorCode, setBootErrorCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    return registerConnectOnboardingOpener(() => {
      setBootError(null);
      setBootErrorCode(null);
      setConnectInstance(null);
      setUiMode("onboarding");
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

    void (async () => {
      const first = await createConnectAccountSession();
      if (cancelled) return;
      if (!first.ok) {
        setBootError(first.reason);
        setBootErrorCode(first.code ?? null);
        setBusy(false);
        return;
      }

      setUiMode(first.mode);
      let usedFirstSecret = false;

      const instance = loadConnectAndInitialize({
        publishableKey: key,
        fetchClientSecret: async () => {
          if (!usedFirstSecret) {
            usedFirstSecret = true;
            return first.clientSecret;
          }
          const next = await createConnectAccountSession();
          if (!next.ok) {
            if (!cancelled) {
              setBootError(next.reason);
              setBootErrorCode(next.code ?? null);
            }
            throw new Error(next.reason);
          }
          if (!cancelled) {
            setUiMode(next.mode);
            setBootError(null);
            setBootErrorCode(null);
          }
          return next.clientSecret;
        },
        appearance: CONNECT_APPEARANCE,
      });

      if (cancelled) return;
      setConnectInstance(instance);
      setBusy(false);
    })();

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

  const title =
    uiMode === "management" ? t.profile.connectManageTitle : t.profile.connectEmbeddedTitle;
  const body =
    uiMode === "management" ? t.profile.connectManageBody : t.profile.connectEmbeddedBody;

  return (
    <div
      className="fixed inset-0 z-[90] flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-labelledby="connect-onboarding-title"
      style={{
        background: `linear-gradient(165deg, #062a1c 0%, ${BRAND_GREEN} 38%, #0a4a30 100%)`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 10%, rgba(255,255,255,0.55) 0%, transparent 42%), radial-gradient(circle at 90% 80%, rgba(245,158,11,0.35) 0%, transparent 36%)",
        }}
      />

      <header
        className="relative z-[1] flex shrink-0 items-start gap-3 px-4 pb-3 pt-[max(0.85rem,env(safe-area-inset-top))]"
      >
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/70">
            {APP_NAME}
          </p>
          <p
            id="connect-onboarding-title"
            className="mt-1 text-[22px] font-extrabold leading-tight text-white"
          >
            {title}
          </p>
          <p className="mt-1.5 max-w-[34rem] text-[13px] leading-relaxed text-white/80">{body}</p>
        </div>
        <button
          type="button"
          onClick={handleExit}
          className="rounded-full bg-white/15 p-2.5 text-white backdrop-blur-sm active:bg-white/25"
          aria-label={t.common.close}
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      <div
        className="relative z-[1] mx-3 mb-[max(0.75rem,env(safe-area-inset-bottom))] flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.35rem] border shadow-2xl sm:mx-auto sm:w-full sm:max-w-[480px]"
        style={{
          backgroundColor: SURFACE,
          borderColor: "rgba(255,255,255,0.28)",
        }}
      >
        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2 pt-2 sm:px-3">
          {bootError ? (
            <div className="space-y-3 px-2 py-3">
              <ConnectSetupError message={bootError} code={bootErrorCode} />
              <button
                type="button"
                onClick={handleExit}
                className="w-full rounded-xl py-3 text-sm font-bold text-white"
                style={{ backgroundColor: BRAND_GREEN }}
              >
                {t.profile.connectEmbeddedDone}
              </button>
            </div>
          ) : null}

          {!bootError && (busy || !connectInstance) ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20" style={{ color: MUTED }}>
              <Loader2 className="h-7 w-7 animate-spin" style={{ color: BRAND_GREEN }} />
              <p className="text-[13px] font-medium">{t.profile.openingStripe}</p>
            </div>
          ) : null}

          {!bootError && connectInstance ? (
            <div
              className="overflow-hidden rounded-2xl border bg-[var(--connect-paper,#FFFEFA)] px-1 py-1"
              style={{
                borderColor: LINE,
                // Help Connect inherit a calm surface (Stripe reads parent background).
                ["--connect-paper" as string]: PAPER,
                backgroundColor: PAPER,
              }}
            >
              <ConnectComponentsProvider connectInstance={connectInstance}>
                {uiMode === "management" ? (
                  <ConnectAccountManagement
                    collectionOptions={{
                      fields: "eventually_due",
                      futureRequirements: "include",
                    }}
                    onLoadError={({ error }) => {
                      setBootError(error.message || t.profile.connectEmbeddedFailed);
                    }}
                  />
                ) : (
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
                )}
              </ConnectComponentsProvider>
            </div>
          ) : null}
        </div>

        <footer
          className="flex shrink-0 items-center justify-center gap-1.5 border-t px-4 py-2.5"
          style={{ borderColor: LINE, backgroundColor: MIST }}
        >
          <ShieldCheck className="h-3.5 w-3.5" style={{ color: BRAND_GREEN }} />
          <p className="text-[11px] font-medium" style={{ color: MUTED }}>
            {t.profile.connectSecureFooter}
          </p>
        </footer>
      </div>
    </div>
  );
}
