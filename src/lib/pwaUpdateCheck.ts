export type UpdateProbeResult = "available" | "current" | "unsupported";

function hasWaitingWorker(registration: ServiceWorkerRegistration): boolean {
  return Boolean(registration.waiting);
}

function listenForInstallingWorker(
  registration: ServiceWorkerRegistration,
  onWaiting: () => void,
): () => void {
  const onUpdateFound = () => {
    const worker = registration.installing;
    if (!worker) return;

    const onStateChange = () => {
      if (worker.state === "installed" && navigator.serviceWorker.controller) {
        onWaiting();
      }
    };

    worker.addEventListener("statechange", onStateChange);
  };

  registration.addEventListener("updatefound", onUpdateFound);
  return () => registration.removeEventListener("updatefound", onUpdateFound);
}

/** Returns true when a new service worker is already waiting. */
export async function hasPendingAppUpdate(): Promise<boolean> {
  if (!("serviceWorker" in navigator)) return false;
  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) return false;
  return hasWaitingWorker(registration);
}

/** Ask the browser to fetch a new SW, then report if one is waiting. */
export async function probeServiceWorkerUpdate(): Promise<UpdateProbeResult> {
  if (!("serviceWorker" in navigator)) return "unsupported";

  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) return "unsupported";

  if (hasWaitingWorker(registration)) return "available";

  try {
    await registration.update();
  } catch {
    /* network / offline */
  }

  await new Promise((resolve) => window.setTimeout(resolve, 400));

  if (hasWaitingWorker(registration)) return "available";
  return "current";
}

/** Ask a waiting service worker to activate, then resolve (or time out). */
export async function activateWaitingServiceWorker(timeoutMs = 1500): Promise<boolean> {
  if (!("serviceWorker" in navigator)) return false;
  const registration = await navigator.serviceWorker.getRegistration();
  const waiting = registration?.waiting;
  if (!waiting) return false;

  await new Promise<void>((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      window.clearTimeout(timer);
      resolve();
    };
    const onControllerChange = () => finish();
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    // Workbox and vite-plugin-pwa listen for this message.
    waiting.postMessage({ type: "SKIP_WAITING" });
    const timer = window.setTimeout(finish, timeoutMs);
  });

  return true;
}

export function watchServiceWorkerUpdates(onUpdateAvailable: () => void): () => void {
  if (!("serviceWorker" in navigator)) return () => undefined;

  let disposed = false;
  const cleanups: (() => void)[] = [];

  const attach = async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration || disposed) return;

    if (hasWaitingWorker(registration)) {
      onUpdateAvailable();
    }

    cleanups.push(listenForInstallingWorker(registration, onUpdateAvailable));
  };

  void attach();

  const onVisible = () => {
    if (document.visibilityState !== "visible") return;
    void probeServiceWorkerUpdate().then((result) => {
      if (result === "available") onUpdateAvailable();
    });
  };

  document.addEventListener("visibilitychange", onVisible);
  cleanups.push(() => document.removeEventListener("visibilitychange", onVisible));

  return () => {
    disposed = true;
    cleanups.forEach((fn) => fn());
  };
}
