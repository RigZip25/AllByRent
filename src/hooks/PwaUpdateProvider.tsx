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
  activateWaitingServiceWorker,
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
import {
  clearPwaUpdatePending,
  isQuietUpdateHour,
  markPwaUpdatePending,
  msUntilNextQuietUpdate,
  readPwaUpdatePendingAt,
  shouldAutoApplyDeferredUpdate,
} from "../lib/pwaQuietUpdate";
import { isSeoApexHost } from "../lib/brand";
import { isNativeApp } from "../lib/nativeShell";

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
  const applyingRef = useRef(false);
  const quietTimerRef = useRef(0);
  const updateAvailableRef = useRef(false);
  /** Blocks mid-session reload while the user is explicitly checking for updates. */
  const suppressAutoApplyRef = useRef(false);
  const buildStamp = formatBuildStamp();

  useEffect(() => {
    updateAvailableRef.current = updateAvailable;
  }, [updateAvailable]);

  const applyUpdate = useCallback(async () => {
    if (applyingRef.current) return;
    applyingRef.current = true;
    clearSimulateUpdateRequest();
    clearPwaUpdatePending();
    markPwaUpdateSuccessPending();
    setUpdateAvailable(false);

    try {
      // vite-plugin-pwa `registerType: 'autoUpdate'` makes updateSW() a no-op — do not await it
      // and return early (that left the Install sheet stuck on “Updating…” forever).
      await activateWaitingServiceWorker();
      // Always reload so the new shell loads and consumePwaUpdateSuccess can show the banner.
      window.location.reload();
    } catch (error) {
      applyingRef.current = false;
      throw error;
    }
  }, []);

  const applyUpdateRef = useRef(applyUpdate);
  useEffect(() => {
    applyUpdateRef.current = applyUpdate;
  }, [applyUpdate]);

  const tryAutoApply = useCallback(() => {
    if (suppressAutoApplyRef.current) return;
    if (!shouldAutoApplyDeferredUpdate()) return;
    void (async () => {
      if (suppressAutoApplyRef.current) return;
      const pendingSw = await hasPendingAppUpdate();
      // Only reload when a waiting SW (or simulate) can actually install — never on a stale pending flag alone.
      if (!pendingSw && !isSimulateUpdateRequested()) return;
      await applyUpdateRef.current();
    })();
  }, []);

  const scheduleQuietApply = useCallback(() => {
    window.clearTimeout(quietTimerRef.current);
    const delay = msUntilNextQuietUpdate();
    const capped = Math.min(delay, 24 * 60 * 60 * 1000);
    quietTimerRef.current = window.setTimeout(() => {
      if (isQuietUpdateHour()) {
        tryAutoApply();
      } else {
        scheduleQuietApply();
      }
    }, Math.max(capped, 1000));
  }, [tryAutoApply]);

  const markUpdateAvailable = useCallback(
    (opts?: { allowAutoApply?: boolean }) => {
      setUpdateAvailable(true);
      updateAvailableRef.current = true;
      if (readPwaUpdatePendingAt() == null) {
        markPwaUpdatePending();
      }
      const allowAutoApply = opts?.allowAutoApply !== false && !suppressAutoApplyRef.current;
      // Download anytime; apply only in quiet hours / next launch — never during a manual check.
      if (allowAutoApply && shouldAutoApplyDeferredUpdate()) {
        void applyUpdateRef.current();
        return;
      }
      scheduleQuietApply();
    },
    [scheduleQuietApply],
  );

  useEffect(() => {
    if (hasBuildIdChanged()) {
      writeStoredBuildId(APP_BUILD_ID);
      void refreshAppShell();
      return;
    }
    writeStoredBuildId(APP_BUILD_ID);

    if (consumePwaUpdateSuccess()) {
      setUpdateJustCompleted(true);
      clearPwaUpdatePending();
    }

    if (readSimulateFromUrl() || isSimulateUpdateRequested()) {
      markUpdateAvailable();
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get("simulateUpdateSuccess") === "1") {
      setUpdateJustCompleted(true);
      setUpdateAvailable(false);
      clearPwaUpdatePending();
      params.delete("simulateUpdateSuccess");
      const next = `${window.location.pathname}${params.toString() ? `?${params}` : ""}${window.location.hash}`;
      window.history.replaceState({}, "", next);
    }

    const cleanups: (() => void)[] = [];

    // Apex SEO host proxies the SPA for /rent only — never install the PWA SW there.
    // Native store builds ship a fresh binary; service workers fight Capacitor caching.
    if (isSeoApexHost() || isNativeApp()) {
      return () => {
        for (const fn of cleanups) fn();
      };
    }

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
      } else if (readPwaUpdatePendingAt() != null) {
        tryAutoApply();
      }
    });

    const stopWatch = watchServiceWorkerUpdates(() => {
      markUpdateAvailable();
    });

    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      void probeServiceWorkerUpdate().then((result) => {
        if (result === "available") markUpdateAvailable();
        else tryAutoApply();
      });
    };
    document.addEventListener("visibilitychange", onVisible);
    cleanups.push(() => document.removeEventListener("visibilitychange", onVisible));

    if (readPwaUpdatePendingAt() != null) {
      scheduleQuietApply();
      tryAutoApply();
    }

    const win = window as Window & {
      __simulatePwaUpdate?: () => void;
      __simulatePwaUpdateSuccess?: () => void;
      __checkPwaUpdate?: () => Promise<UpdateCheckStatus>;
    };
    win.__simulatePwaUpdate = () => {
      requestSimulateUpdate();
      markUpdateAvailable();
    };
    win.__simulatePwaUpdateSuccess = () => {
      setUpdateJustCompleted(true);
      setUpdateAvailable(false);
      clearSimulateUpdateRequest();
      clearPwaUpdatePending();
    };
    win.__checkPwaUpdate = async () => {
      setCheckStatus("checking");
      suppressAutoApplyRef.current = true;
      try {
        const result = await probeServiceWorkerUpdate();
        if (result === "available") markUpdateAvailable({ allowAutoApply: false });
        setCheckStatus(result);
        return result;
      } finally {
        suppressAutoApplyRef.current = false;
      }
    };

    return () => {
      stopWatch();
      window.clearTimeout(quietTimerRef.current);
      cleanups.forEach((fn) => fn());
    };
  }, [markUpdateAvailable, scheduleQuietApply, tryAutoApply]);

  const checkForUpdates = useCallback(async (): Promise<UpdateCheckStatus> => {
    setCheckStatus("checking");
    suppressAutoApplyRef.current = true;
    try {
      const result = await probeServiceWorkerUpdate();
      if (result === "available") {
        // Show the update card; stay on Notifications — user taps Update when ready.
        markUpdateAvailable({ allowAutoApply: false });
      }
      setCheckStatus(result);
      return result;
    } finally {
      suppressAutoApplyRef.current = false;
    }
  }, [markUpdateAvailable]);

  const simulateUpdateNotification = useCallback(() => {
    requestSimulateUpdate();
    markUpdateAvailable();
  }, [markUpdateAvailable]);

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
