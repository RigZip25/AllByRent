import { useState } from "react";
import { ExternalLink, Share } from "lucide-react";
import { APP_NAME, BRAND_AMBER, BRAND_GREEN, PWA_SHORT_NAME } from "../lib/brand";
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

      <p className="mt-3 text-[13px] font-semibold leading-snug" style={{ color: BRAND_GREEN }}>
        {APP_NAME} — your neighborhood marketplace
      </p>
      <p className="mt-1 text-[12px] leading-snug text-gray-500">
        Home Screen label: <strong>{PWA_SHORT_NAME}</strong> (so it stands out among icons).
      </p>

      {platform === "ios" ? (
        <div className="mt-3 text-sm leading-relaxed text-[#374151]">
          <div className="flex items-start gap-2">
            <Share className="mt-0.5 h-4 w-4 shrink-0" style={{ color: BRAND_GREEN }} />
            <div>
              Safari (bottom center): square with arrow → <strong>View More</strong> →{" "}
              <strong>Add to Home Screen</strong>. Keep the name{" "}
              <strong>{PWA_SHORT_NAME}</strong> (or edit it) → <strong>Add</strong>.
            </div>
          </div>
          <div className="mt-2 flex items-start gap-2">
            <ExternalLink className="mt-0.5 h-4 w-4 shrink-0" style={{ color: BRAND_GREEN }} />
            <div>
              Not in Safari? Use <strong>Open in Safari</strong> first.
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-3 text-sm leading-relaxed text-[#374151]">
          {nativeInstallReady ? (
            <>
              <p>
                One tap install — shows as <strong>{PWA_SHORT_NAME}</strong>, full screen, no
                browser bar.
              </p>
              <button
                type="button"
                onClick={onInstall}
                className="mt-2.5 inline-flex w-full items-center justify-center rounded-full px-4 py-2.5 text-sm font-bold shadow-md transition-opacity active:opacity-90"
                style={{ backgroundColor: BRAND_AMBER, color: BRAND_GREEN }}
              >
                Install {PWA_SHORT_NAME}
              </button>
            </>
          ) : (
            <p>
              In Chrome: menu <strong>⋮</strong> → <strong>Install app</strong> or{" "}
              <strong>Add to Home screen</strong> — look for{" "}
              <strong>Neighborhood Marketplace</strong> in the prompt.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
