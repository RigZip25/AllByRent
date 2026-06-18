import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { registerSW } from "virtual:pwa-register";
import {
  hasPendingAppUpdate,
  probeServiceWorkerUpdate,
  watchServiceWorkerUpdates,
} from "../lib/pwaUpdateCheck";
import {
  APP_BUILD_ID,
  formatBuildStamp,
  hasBuildIdChanged,
  writeStoredBuildId,
} from "../lib/buildInfo";
import { refreshAppShell } from "../lib/refreshAppShell";
import {
  clearSimulateUpdateRequest,
  consumePwaUpdateSuccess,
  isSimulateUpdateRequested,
  markPwaUpdateSuccessPending,
  requestSimulateUpdate,
} from "../lib/pwaUpdateStorage";

type UpdateSWFn = (reloadPage?: boolean) => Promise<void>;

export type UpdateCheckStatus = "available" | "current" | "unsupported" | "checking";

type PwaUpdateContextValue = {
  updateAvailable: boolean;
  updateJustCompleted: boolean;
  buildStamp: string;
  checkStatus: UpdateCheckStatus | null;
  applyUpdate: () => Promise<void>;
  dismissUpdateSuccess: () => void;
  checkForUpdates: () => Promise<UpdateCheckStatus>;
  simulateUpdateNotification: () => void;
};

const PwaUpdateContext = createContext<PwaUpdateContextValue | null>(null);

function readSimulateFromUrl(): boolean {
  const params = new URLSearchParams(window.location.search);
  if (params.get("simulateUpdate") !== "1") return false;
  requestSimulateUpdate();
  params.delete("simulateUpdate");
  const next = `${window.location.pathname}${params.toString() ? `?${params}` : ""}${window.location.hash}`;
  window.history.replaceState({}, "", next);
  return true;
}

export function PwaUpdateProvider({ children }: { children: ReactNode }) {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateJustCompleted, setUpdateJustCompleted] = useState(false);
  const [checkStatus, setCheckStatus] = useState<UpdateCheckStatus | null>(null);
  const updateSWRef = useRef<UpdateSWFn | null>(null);
  const buildStamp = formatBuildStamp();

  const markUpdateAvailable = useCallback(() => {
    setUpdateAvailable(true);
  }, []);

  // Do not auto-reload the shell — user confirms via Notifications (avoids "frozen" taps mid-update).

  useEffect(() => {
    if (hasBuildIdChanged()) {
      writeStoredBuildId(APP_BUILD_ID);
      void refreshAppShell();
      return;
    }
    writeStoredBuildId(APP_BUILD_ID);

    if (consumePwaUpdateSuccess()) {
      setUpdateJustCompleted(true);
    }

    if (readSimulateFromUrl() || isSimulateUpdateRequested()) {
      setUpdateAvailable(true);
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get("simulateUpdateSuccess") === "1") {
      setUpdateJustCompleted(true);
      setUpdateAvailable(false);
      params.delete("simulateUpdateSuccess");
      const next = `${window.location.pathname}${params.toString() ? `?${params}` : ""}${window.location.hash}`;
      window.history.replaceState({}, "", next);
    }

    const cleanups: (() => void)[] = [];

    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        markUpdateAvailable();
      },
      onRegisteredSW(_url, registration) {
        if (!registration) return;
        const tick = () => {
          void registration.update().catch(() => undefined);
        };
        tick();
        const intervalId = window.setInterval(tick, 5 * 60 * 1000);
        cleanups.push(() => window.clearInterval(intervalId));
      },
    });

    updateSWRef.current = updateSW;

    void probeServiceWorkerUpdate().then((result) => {
      if (result === "available") {
        markUpdateAvailable();
      }
    });

    const stopWatch = watchServiceWorkerUpdates(() => {
      markUpdateAvailable();
    });

    const win = window as Window & {
      __simulatePwaUpdate?: () => void;
      __simulatePwaUpdateSuccess?: () => void;
      __checkPwaUpdate?: () => Promise<UpdateCheckStatus>;
    };
    win.__simulatePwaUpdate = () => {
      requestSimulateUpdate();
      setUpdateAvailable(true);
    };
    win.__simulatePwaUpdateSuccess = () => {
      setUpdateJustCompleted(true);
      setUpdateAvailable(false);
      clearSimulateUpdateRequest();
    };
    win.__checkPwaUpdate = async () => {
      setCheckStatus("checking");
      const result = await probeServiceWorkerUpdate();
      if (result === "available") markUpdateAvailable();
      setCheckStatus(result);
      return result;
    };

    return () => {
      stopWatch();
      cleanups.forEach((fn) => fn());
    };
  }, [markUpdateAvailable]);

  const checkForUpdates = useCallback(async (): Promise<UpdateCheckStatus> => {
    setCheckStatus("checking");
    const result = await probeServiceWorkerUpdate();
    if (result === "available") {
      markUpdateAvailable();
    }
    setCheckStatus(result);
    return result;
  }, [markUpdateAvailable]);

  const simulateUpdateNotification = useCallback(() => {
    requestSimulateUpdate();
    setUpdateAvailable(true);
  }, []);

  const applyUpdate = useCallback(async () => {
    clearSimulateUpdateRequest();
    markPwaUpdateSuccessPending();
    setUpdateAvailable(false);

    const pending = await hasPendingAppUpdate();
    if (pending && updateSWRef.current) {
      await updateSWRef.current(true);
      return;
    }

    window.location.reload();
  }, []);

  const dismissUpdateSuccess = useCallback(() => {
    setUpdateJustCompleted(false);
    clearSimulateUpdateRequest();
  }, []);

  return (
    <PwaUpdateContext.Provider
      value={{
        updateAvailable,
        updateJustCompleted,
        buildStamp,
        checkStatus,
        applyUpdate,
        dismissUpdateSuccess,
        checkForUpdates,
        simulateUpdateNotification,
      }}
    >
      {children}
    </PwaUpdateContext.Provider>
  );
}

export function usePwaUpdate() {
  const ctx = useContext(PwaUpdateContext);
  if (!ctx) {
    throw new Error("usePwaUpdate must be used within PwaUpdateProvider");
  }
  return ctx;
}
