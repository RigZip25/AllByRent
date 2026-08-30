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
  type ConnectOnboardingIntent,
} from "../lib/connectOnboardingBus";
import { connectAssets } from "../lib/connectAssets";
import {
  createConnectAccountLink,
  createConnectAccountSession,
  syncConnectAccountStatus,
} from "../lib/stripePayments";
import { getStripePublishableKey } from "../lib/stripeConfig";
import {
  APP_NAME,
  BRAND_GREEN,
  BRAND_GREEN_LIGHT,
  BRAND_SECURE,
  BRAND_SECURE_DEEP,
  BRAND_SECURE_SOFT,
} from "../lib/brand";
import { useMessages } from "../lib/i18n/react";
import { ConnectSetupError } from "./payments/ConnectSetupError";

const SURFACE = "#F4F7F5";
const PAPER = "#FFFEFA";
const INK = "#0B3D2A";
const MUTED = "#5C6B63";
const LINE = "#D8E0DA";
const MIST = "#E8F2EC";

const CONNECT_APPEARANCE = {
  overlays: "dialog" as const,
  variables: {
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSizeBase: "15px",
    spacingUnit: "10px",
    borderRadius: "14px",
    colorPrimary: BRAND_SECURE,
    colorBackground: PAPER,
    colorText: INK,
    colorSecondaryText: MUTED,
    colorBorder: LINE,
    colorDanger: "#B91C1C",
    buttonPrimaryColorBackground: BRAND_SECURE,
    buttonPrimaryColorBorder: BRAND_SECURE,
    buttonPrimaryColorText: "#FFFFFF",
    buttonSecondaryColorBackground: BRAND_SECURE_SOFT,
    buttonSecondaryColorBorder: "#D8D6F5",
    buttonSecondaryColorText: BRAND_SECURE_DEEP,
    buttonLabelFontWeight: "700",
    actionPrimaryColorText: BRAND_SECURE,
    actionSecondaryColorText: MUTED,
    badgeNeutralColorBackground: BRAND_SECURE_SOFT,
    badgeNeutralColorText: BRAND_SECURE_DEEP,
    badgeNeutralColorBorder: "#D8D6F5",
    badgeSuccessColorBackground: "#D1FAE5",
    badgeSuccessColorText: BRAND_GREEN,
    badgeSuccessColorBorder: "#A7F3D0",
    formAccentColor: BRAND_SECURE,
    formHighlightColorBorder: BRAND_SECURE,
    overlayBackdropColor: "rgba(6, 42, 28, 0.5)",
  },
};

type ConnectUiMode = "onboarding" | "management";
type Phase = "intro" | "form";

/**
 * Evorios payouts sheet:
 * 1) Branded intro with art (first-time)
 * 2) Continue → hosted Account Link (reliable on mobile) or embedded management
 */
export function ConnectOnboardingHost() {
  const t = useMessages();
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("intro");
  const [intent, setIntent] = useState<ConnectOnboardingIntent>("onboard");
  const [returnPath, setReturnPath] = useState("/?screen=personalInfo");
  const [connectInstance, setConnectInstance] = useState<StripeConnectInstance | null>(null);
  const [uiMode, setUiMode] = useState<ConnectUiMode>("onboarding");
  const [bootError, setBootError] = useState<string | null>(null);
  const [bootErrorCode, setBootErrorCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [bootKey, setBootKey] = useState(0);

  useEffect(() => {
    return registerConnectOnboardingOpener((opts) => {
      const nextIntent = opts.intent === "manage" ? "manage" : "onboard";
      setBootError(null);
      setBootErrorCode(null);
      setConnectInstance(null);
      setUiMode(nextIntent === "manage" ? "management" : "onboarding");
      setIntent(nextIntent);
      setBusy(false);
      setReturnPath(opts.returnPath || "/?screen=personalInfo");
      // First-time: show art intro. Management: go straight to embedded form.
      setPhase(nextIntent === "manage" ? "form" : "intro");
      setOpen((wasOpen) => {
        if (wasOpen && nextIntent === "manage") {
          queueMicrotask(() => setBootKey((k) => k + 1));
        }
        return true;
      });
    });
  }, []);

  // Boot Stripe / Account Link only after intro Continue (or immediately for manage).
  useEffect(() => {
    if (!open || phase !== "form") return;

    let cancelled = false;
    setBusy(true);
    setConnectInstance(null);
    setBootError(null);
    setBootErrorCode(null);

    void (async () => {
      try {
        // First-time onboarding: hosted Account Link after the branded intro.
        if (intent === "onboard") {
          const link = await createConnectAccountLink(returnPath);
          if (cancelled) return;
          if (!link.ok) {
            setBootError(link.reason);
            setBootErrorCode(link.code ?? null);
            setBusy(false);
            return;
          }
          window.location.assign(link.url);
          return;
        }

        const key = getStripePublishableKey();
        if (!key) {
          setBootError("Payouts aren’t configured yet. Try again later or contact support.");
          setBusy(false);
          return;
        }

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
      } catch (err) {
        if (cancelled) return;
        setBootError(err instanceof Error ? err.message : t.profile.connectEmbeddedFailed);
        setBusy(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, phase, intent, returnPath, bootKey, t.profile.connectEmbeddedFailed]);

  const close = useCallback(() => {
    setOpen(false);
    setPhase("intro");
    setConnectInstance(null);
    setBootError(null);
    setBootErrorCode(null);
    setBusy(false);
  }, []);

  const handleExit = useCallback(() => {
    void (async () => {
      setBusy(true);
      try {
        if (phase === "form" && intent === "manage") {
          await syncConnectAccountStatus();
        }
      } finally {
        let screen = "personalInfo";
        try {
          const q = returnPath.includes("?") ? returnPath.split("?")[1] ?? "" : "";
          const fromPath = new URLSearchParams(q).get("screen");
          if (fromPath) screen = fromPath;
        } catch {
          /* keep personalInfo */
        }
        emitConnectOnboardingDone({ screen, outcome: "embedded" });
        setBusy(false);
        close();
      }
    })();
  }, [close, phase, intent, returnPath]);

  const startForm = useCallback(() => {
    setBootError(null);
    setBootErrorCode(null);
    setPhase("form");
  }, []);

  const retryBoot = useCallback(() => {
    setBootError(null);
    setBootErrorCode(null);
    setConnectInstance(null);
    setBootKey((k) => k + 1);
  }, []);

  if (!open) return null;

  const title =
    phase === "intro"
      ? t.profile.connectIntroTitle
      : uiMode === "management"
        ? t.profile.connectManageTitle
        : t.profile.connectEmbeddedTitle;
  const body =
    phase === "intro"
      ? t.profile.connectIntroBody
      : uiMode === "management"
        ? t.profile.connectManageBody
        : t.profile.connectEmbeddedBody;

  return (
    <div
      className="fixed inset-0 z-[110] flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-labelledby="connect-onboarding-title"
      style={{
        background: `linear-gradient(168deg, #041f16 0%, ${BRAND_GREEN} 42%, #0c3d2e 78%, #1e1a4a 100%)`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.2]"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 15% 0%, rgba(255,255,255,0.35) 0%, transparent 45%), radial-gradient(ellipse at 100% 100%, rgba(99,91,255,0.45) 0%, transparent 48%)",
        }}
      />

      <header className="relative z-[1] flex shrink-0 items-start gap-3 px-4 pb-3 pt-[max(0.85rem,env(safe-area-inset-top))]">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/70">
              {APP_NAME}
            </p>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/95"
              style={{
                backgroundColor: "rgba(99,91,255,0.32)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: BRAND_GREEN_LIGHT }} />
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "#C4C0FF" }} />
              {t.profile.connectLaneBadge}
            </span>
          </div>
          <p
            id="connect-onboarding-title"
            className="mt-1.5 text-[22px] font-extrabold leading-tight text-white"
          >
            {title}
          </p>
          <p className="mt-1.5 max-w-[34rem] text-[13px] leading-relaxed text-white/80">
            {body}
          </p>
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
        {phase === "intro" ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-2 pt-3">
              <img
                src={connectAssets.securePreview}
                alt={t.profile.connectIntroAlt}
                className="mx-auto h-auto max-h-[min(42vh,380px)] w-full max-w-[260px] rounded-2xl object-contain object-top"
                style={{ backgroundColor: "#FFFFFF" }}
              />
              <ul className="mx-auto mt-3 max-w-[28rem] space-y-2 px-1">
                {t.profile.connectIntroPoints.map((point) => (
                  <li
                    key={point}
                    className="flex gap-2 text-[12px] leading-snug"
                    style={{ color: INK }}
                  >
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: BRAND_SECURE }}
                      aria-hidden
                    />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <p
                className="mx-auto mt-3 max-w-[28rem] text-center text-[12px] leading-relaxed"
                style={{ color: MUTED }}
              >
                {t.profile.connectIntroHint}
              </p>
            </div>
            <div
              className="shrink-0 space-y-2 border-t px-4 py-3"
              style={{ borderColor: "#D8D6F5", backgroundColor: BRAND_SECURE_SOFT }}
            >
              <button
                type="button"
                onClick={startForm}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[15px] font-bold text-white active:opacity-90"
                style={{ backgroundColor: BRAND_SECURE }}
              >
                {t.profile.connectIntroCta}
              </button>
              <p
                className="flex items-center justify-center gap-1.5 text-[11px] font-medium"
                style={{ color: BRAND_SECURE_DEEP }}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                {t.profile.connectSecureFooter}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-2 pt-2 sm:px-3">
              {bootError ? (
                <div className="space-y-3 px-2 py-3">
                  <ConnectSetupError message={bootError} code={bootErrorCode} />
                  <button
                    type="button"
                    onClick={() => {
                      if (intent === "onboard") setPhase("intro");
                      else retryBoot();
                    }}
                    className="w-full rounded-xl py-3 text-sm font-bold text-white"
                    style={{ backgroundColor: BRAND_SECURE }}
                  >
                    {intent === "onboard" ? t.profile.connectIntroBack : t.systemUi.tryAgain}
                  </button>
                  <button
                    type="button"
                    onClick={handleExit}
                    className="w-full rounded-xl py-3 text-sm font-bold"
                    style={{ backgroundColor: MIST, color: BRAND_GREEN }}
                  >
                    {t.profile.connectEmbeddedDone}
                  </button>
                </div>
              ) : null}

              {!bootError && (busy || (intent === "manage" && !connectInstance)) ? (
                <div className="relative flex flex-col items-center justify-center gap-3 px-2 py-6">
                  <img
                    src={connectAssets.securePreview}
                    alt={t.profile.connectIntroAlt}
                    className="w-full max-w-[320px] rounded-2xl object-contain opacity-90 shadow-sm"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl bg-white/55 backdrop-blur-[2px]">
                    <Loader2 className="h-7 w-7 animate-spin" style={{ color: BRAND_SECURE }} />
                    <p className="text-[13px] font-medium" style={{ color: MUTED }}>
                      {t.profile.openingStripe}
                    </p>
                  </div>
                </div>
              ) : null}

              {!bootError && connectInstance ? (
                <div
                  className="min-h-[320px] rounded-2xl border px-1 py-1"
                  style={{
                    borderColor: LINE,
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
              style={{ borderColor: "#D8D6F5", backgroundColor: BRAND_SECURE_SOFT }}
            >
              <ShieldCheck className="h-3.5 w-3.5" style={{ color: BRAND_SECURE }} />
              <p className="text-[11px] font-medium" style={{ color: BRAND_SECURE_DEEP }}>
                {t.profile.connectSecureFooter}
              </p>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
