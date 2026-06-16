import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { RentanoTip } from "./RentanoTip";
import { PwaInstallPanel } from "./PwaInstallPanel";
import { BRAND_GREEN, APP_NAME } from "../lib/brand";

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

  return (
    <div className="mx-4 mb-3">
      <RentanoTip
        message={
          <span className="flex items-center justify-between gap-3">
            <span className="min-w-0">
              Install {APP_NAME} to your Home Screen (works like an app).
              <span className="ml-2 not-italic font-medium" style={{ color: BRAND_GREEN }}>
                {open ? "Hide" : "Show"}
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
