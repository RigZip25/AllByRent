import { useState } from "react";
import { ExternalLink, Share } from "lucide-react";
import { APP_NAME, BRAND_AMBER, BRAND_GREEN, PWA_SHORT_NAME } from "../lib/brand";
import { useMessages } from "../lib/i18n/react";
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
  ariaLabel,
}: {
  value: Platform;
  onChange: (value: Platform) => void;
  ariaLabel: string;
}) {
  return (
    <div
      className="inline-flex overflow-hidden rounded-full border bg-white"
      style={{ borderColor: `${BRAND_GREEN}33` }}
      role="tablist"
      aria-label={ariaLabel}
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
  const { pwa: t } = useMessages();
  const [platform, setPlatform] = useState<Platform>(() => (manualIos ? "ios" : "android"));
  const ios = t.iosShareSteps;
  const notSafari = t.iosNotSafari;
  const android = t.androidManual;

  return (
    <div
      className="rounded-2xl border px-3.5 py-3"
      style={{ backgroundColor: "#F0FDF4", borderColor: BRAND_GREEN }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <PlatformToggle value={platform} onChange={setPlatform} ariaLabel={t.platformAria} />
        {showDismissActions && onDismiss ? (
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onDismiss}
              className="text-sm font-medium text-gray-500 underline"
            >
              {t.remindInDays(PWA_INSTALL_DISMISS_DAYS)}
            </button>
          </div>
        ) : null}
      </div>

      <p className="mt-3 text-[13px] font-semibold leading-snug" style={{ color: BRAND_GREEN }}>
        {t.tagline(APP_NAME)}
      </p>
      <p className="mt-1 text-[12px] leading-snug text-gray-500">
        {t.homeScreenBefore}
        <strong>{PWA_SHORT_NAME}</strong>
        {t.homeScreenAfter}
      </p>

      {platform === "ios" ? (
        <div className="mt-3 text-sm leading-relaxed text-[#374151]">
          <div className="flex items-start gap-2">
            <Share className="mt-0.5 h-4 w-4 shrink-0" style={{ color: BRAND_GREEN }} />
            <div>
              {ios.beforeViewMore}
              <strong>{ios.viewMore}</strong>
              {ios.mid}
              <strong>{ios.addToHome}</strong>
              {ios.keepName}
              <strong>{PWA_SHORT_NAME}</strong>
              {ios.orEdit}
              <strong>{ios.add}</strong>.
            </div>
          </div>
          <div className="mt-2 flex items-start gap-2">
            <ExternalLink className="mt-0.5 h-4 w-4 shrink-0" style={{ color: BRAND_GREEN }} />
            <div>
              {notSafari.before}
              <strong>{notSafari.openInSafari}</strong>
              {notSafari.after}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-3 text-sm leading-relaxed text-[#374151]">
          {nativeInstallReady ? (
            <>
              <p>{t.androidReady(PWA_SHORT_NAME)}</p>
              <button
                type="button"
                onClick={onInstall}
                className="mt-2.5 inline-flex w-full items-center justify-center rounded-full px-4 py-2.5 text-sm font-bold shadow-md transition-opacity active:opacity-90"
                style={{ backgroundColor: BRAND_AMBER, color: BRAND_GREEN }}
              >
                {t.installShort(PWA_SHORT_NAME)}
              </button>
            </>
          ) : (
            <p>
              {android.beforeMenu}
              <strong>⋮</strong> → <strong>{android.installApp}</strong>
              {android.or}
              <strong>{android.addToHome}</strong>
              {android.lookFor}
              <strong>{android.promptName}</strong>
              {android.after}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
