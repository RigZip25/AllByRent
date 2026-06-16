import { Share, Smartphone, X } from "lucide-react";
import { APP_NAME, BRAND_AMBER, BRAND_GREEN } from "../lib/brand";

type PwaInstallBannerProps = {
  onInstall: () => void;
  onDismiss: () => void;
  nativeInstallReady: boolean;
  manualIos: boolean;
  compact?: boolean;
};

export function PwaInstallBanner({
  onInstall,
  onDismiss,
  nativeInstallReady,
  manualIos,
  compact = false,
}: PwaInstallBannerProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/20 shadow-lg ${
        compact ? "mx-0" : ""
      }`}
      style={{
        background: `linear-gradient(135deg, ${BRAND_GREEN} 0%, #0a3d28 100%)`,
      }}
    >
      <button
        type="button"
        onClick={onDismiss}
        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        aria-label="Dismiss install tip"
      >
        <X className="h-4 w-4" />
      </button>

      <div className={`flex gap-3 pr-10 ${compact ? "p-3.5" : "p-4"}`}>
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15"
          aria-hidden
        >
          <Smartphone className="h-5 w-5 text-white" strokeWidth={1.75} />
        </div>

        <div className="min-w-0 flex-1 text-left">
          <p className="text-sm font-bold leading-snug text-white">
            Add {APP_NAME} to your Home Screen
          </p>
          {manualIos ? (
            <p className="mt-1 text-xs leading-relaxed text-white/85">
              Tap{" "}
              <span className="inline-flex items-center gap-0.5 font-semibold text-white">
                Share <Share className="inline h-3.5 w-3.5" />
              </span>{" "}
              in Safari, then <strong>Add to Home Screen</strong> — works like a real app.
            </p>
          ) : nativeInstallReady ? (
            <p className="mt-1 text-xs leading-relaxed text-white/85">
              One tap — faster open, full screen, no browser bar.
            </p>
          ) : (
            <p className="mt-1 text-xs leading-relaxed text-white/85">
              In Chrome: menu <strong>⋮</strong> → <strong>Install app</strong> or{" "}
              <strong>Add to Home screen</strong>.
            </p>
          )}

          {nativeInstallReady && !manualIos ? (
            <button
              type="button"
              onClick={onInstall}
              className="mt-2.5 rounded-full px-4 py-2 text-xs font-bold shadow-md transition-opacity hover:opacity-95"
              style={{ backgroundColor: BRAND_AMBER, color: BRAND_GREEN }}
            >
              Install app
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
