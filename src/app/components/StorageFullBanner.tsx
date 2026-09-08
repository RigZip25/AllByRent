import { useMessages } from "../../lib/i18n/react";

export function StorageFullBanner({ onDismiss }: { onDismiss: () => void }) {
  const { systemUi: t } = useMessages();
  return (
    <div
      role="alert"
      className="sticky top-0 z-[60] w-full border-b px-3 py-2 text-center"
      style={{ backgroundColor: "#FEE2E2", borderColor: "#EF4444", color: "#991B1B" }}
    >
      <p className="text-[13px] font-semibold leading-snug">{t.storageFullTitle}</p>
      <p className="mt-0.5 text-[12px] leading-snug opacity-90">{t.storageFullBody}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="mt-1.5 text-[12px] font-bold underline"
      >
        {t.tryAgain}
      </button>
    </div>
  );
}
