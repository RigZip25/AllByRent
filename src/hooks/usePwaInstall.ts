import { useCallback, useEffect, useState } from "react";
import {
  canShowInstallPrompt,
  captureInstallPrompt,
  clearDeferredInstallPrompt,
  dismissInstallPrompt,
  getDeferredInstallPrompt,
  isStandalonePwa,
  needsManualInstallInstructions,
  type BeforeInstallPromptEvent,
} from "../lib/pwaInstall";

export function usePwaInstall() {
  const [visible, setVisible] = useState(false);
  const [nativeInstallReady, setNativeInstallReady] = useState(false);
  const [manualIos, setManualIos] = useState(false);

  useEffect(() => {
    if (isStandalonePwa() || !canShowInstallPrompt()) return;

    setManualIos(needsManualInstallInstructions());
    setVisible(true);

    if (getDeferredInstallPrompt()) {
      setNativeInstallReady(true);
    }

    const onBeforeInstall = (event: Event) => {
      captureInstallPrompt(event);
      setNativeInstallReady(true);
      setVisible(true);
    };

    const onInstalled = () => {
      clearDeferredInstallPrompt();
      setVisible(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    const prompt = getDeferredInstallPrompt() as BeforeInstallPromptEvent | null;
    if (!prompt) return false;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    clearDeferredInstallPrompt();
    setNativeInstallReady(false);
    if (outcome === "accepted") {
      setVisible(false);
      return true;
    }
    return false;
  }, []);

  const dismiss = useCallback(() => {
    dismissInstallPrompt();
    setVisible(false);
  }, []);

  return {
    visible,
    nativeInstallReady,
    manualIos,
    install,
    dismiss,
  };
}
