import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { RentanoTip } from "./RentanoTip";
import { PwaInstallPanel } from "./PwaInstallPanel";
import { BRAND_GREEN, APP_NAME, PWA_SHORT_NAME } from "../lib/brand";
import { useMessages } from "../lib/i18n/react";

type PwaInstallRentanoTipProps = {
  nativeInstallReady: boolean;
  manualIos: boolean;
  onInstall: () => void;
  onDismiss: () => void;
};

export function PwaInstallRentanoTip({
  nativeInstallReady,
  manualIos,
  onInstall,
  onDismiss,
}: PwaInstallRentanoTipProps) {
  const [open, setOpen] = useState(false);
  const { pwa } = useMessages();

  return (
    <div className="mx-4 mb-3">
      <RentanoTip
        message={
          <span className="flex items-center justify-between gap-3">
            <span className="min-w-0">
              {pwa.tipInstallBefore(APP_NAME)}
              <strong>{PWA_SHORT_NAME}</strong>
              {pwa.tipInstallAfter}
              <span className="ml-2 not-italic font-medium" style={{ color: BRAND_GREEN }}>
                {open ? pwa.tipHide : pwa.tipShow}
              </span>
            </span>
            {open ? (
              <ChevronUp className="h-5 w-5 shrink-0" style={{ color: BRAND_GREEN }} />
            ) : (
              <ChevronDown className="h-5 w-5 shrink-0" style={{ color: BRAND_GREEN }} />
            )}
          </span>
        }
        onTap={() => setOpen((v) => !v)}
      />

      {open ? (
        <div className="mt-2">
          <PwaInstallPanel
            nativeInstallReady={nativeInstallReady}
            manualIos={manualIos}
            onInstall={onInstall}
            onDismiss={onDismiss}
            showDismissActions
          />
        </div>
      ) : null}
    </div>
  );
}
