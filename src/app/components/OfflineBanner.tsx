import { APP_NAME, BRAND_GREEN } from "../../lib/brand";
import { useMessages } from "../../lib/i18n/react";

/** Non-blocking strip so cached screens stay usable while offline. */
export function OfflineBanner({ onRetry }: { onRetry?: () => void }) {
  const { systemUi: t } = useMessages();
  return (
    <div
      role="status"
      className="sticky top-0 z-[60] w-full border-b px-3 py-2 text-center"
      style={{ backgroundColor: "#FEF3C7", borderColor: "#F59E0B", color: "#92400E" }}
    >
      <p className="text-[13px] font-semibold leading-snug">{t.offlineBannerTitle}</p>
      <p className="mt-0.5 text-[12px] leading-snug opacity-90">{t.offlineBannerBody(APP_NAME)}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1.5 text-[12px] font-bold underline"
          style={{ color: BRAND_GREEN }}
        >
          {t.tryAgain}
        </button>
      ) : null}
    </div>
  );
}
