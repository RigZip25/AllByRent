import { APP_NAME, BRAND_GREEN } from "../../lib/brand";
import { useMessages } from "../../lib/i18n/react";

export function OfflineScreen({ onRetry }: { onRetry?: () => void }) {
  const { systemUi: t } = useMessages();
  return (
    <div className="screen mx-auto flex h-full w-full max-w-[390px] flex-col items-center justify-center bg-white px-6 text-center">
      <p className="text-4xl" aria-hidden>
        📡
      </p>
      <h1 className="mt-4 text-xl font-bold" style={{ color: BRAND_GREEN }}>
        {t.offlineTitle}
      </h1>
      <p className="mt-2 text-base text-gray-500">{t.offlineBody(APP_NAME)}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 rounded-xl px-6 py-3 text-sm font-bold text-white"
          style={{ backgroundColor: BRAND_GREEN }}
        >
          {t.tryAgain}
        </button>
      ) : null}
    </div>
  );
}
