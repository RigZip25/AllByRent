import { useState } from "react";
import { ExternalLink, Share, Smartphone } from "lucide-react";
import { BRAND_AMBER, BRAND_GREEN } from "../lib/brand";
import { PWA_INSTALL_DISMISS_DAYS } from "../lib/pwaInstall";

type Platform = "ios" | "android";

type PwaInstallPanelProps = {
  nativeInstallReady: boolean;
  manualIos: boolean;
  onInstall: () => void;
  onDismiss?: () => void;
  showDismissActions?: boolean;
};

function PlatformToggle({
  value,
  onChange,
}: {
  value: Platform;
  onChange: (value: Platform) => void;
}) {
  return (
    <div
      className="inline-flex overflow-hidden rounded-full border bg-white"
      style={{ borderColor: `${BRAND_GREEN}33` }}
      role="tablist"
      aria-label="Platform"
    >
      {(["ios", "android"] as const).map((tab) => {
        const active = value === tab;
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab)}
            className="px-3 py-1.5 text-sm font-bold capitalize"
            style={{
              backgroundColor: active ? BRAND_GREEN : "transparent",
              color: active ? "white" : "#374151",
            }}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}

export function PwaInstallPanel({
  nativeInstallReady,
  manualIos,
  onInstall,
  onDismiss,
  showDismissActions = false,
}: PwaInstallPanelProps) {
  const [platform, setPlatform] = useState<Platform>(() => (manualIos ? "ios" : "android"));

  return (
    <div
      className="rounded-2xl border px-3.5 py-3"
      style={{ backgroundColor: "#F0FDF4", borderColor: BRAND_GREEN }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <PlatformToggle
          value={platform}
          onChange={setPlatform}
        />
        {showDismissActions && onDismiss ? (
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onDismiss}
              className="text-sm font-medium text-gray-500 underline"
            >
              Remind in {PWA_INSTALL_DISMISS_DAYS} days
            </button>
          </div>
        ) : null}
      </div>

      {platform === "ios" ? (
        <div className="mt-3 text-sm leading-relaxed text-[#374151]">
          <div className="flex items-start gap-2">
            <Smartphone className="mt-0.5 h-4 w-4 shrink-0" style={{ color: BRAND_GREEN }} />
            <div>
              Open in <strong>Safari</strong>.
            </div>
          </div>
          <div className="mt-2 flex items-start gap-2">
            <Share className="mt-0.5 h-4 w-4 shrink-0" style={{ color: BRAND_GREEN }} />
            <div>
              Tap <strong>Share</strong> → <strong>Add to Home Screen</strong>.
            </div>
          </div>
          <div className="mt-2 flex items-start gap-2">
            <ExternalLink className="mt-0.5 h-4 w-4 shrink-0" style={{ color: BRAND_GREEN }} />
            <div>
              Tip: if you opened via another app, use <strong>Open in Safari</strong> first.
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-3 text-sm leading-relaxed text-[#374151]">
          {nativeInstallReady ? (
            <>
              <p>One tap install — faster open, full screen, no browser bar.</p>
              <button
                type="button"
                onClick={onInstall}
                className="mt-2.5 inline-flex w-full items-center justify-center rounded-full px-4 py-2.5 text-sm font-bold shadow-md transition-opacity active:opacity-90"
                style={{ backgroundColor: BRAND_AMBER, color: BRAND_GREEN }}
              >
                Install app
              </button>
            </>
          ) : (
            <p>
              In Chrome: menu <strong>⋮</strong> → <strong>Install app</strong> or{" "}
              <strong>Add to Home screen</strong>.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
