export type ConnectOnboardingIntent = "onboard" | "manage";

export type ConnectOnboardingOpenOpts = {
  returnPath: string;
  /** onboard = branded intro then Account Link; manage = embedded account settings. */
  intent?: ConnectOnboardingIntent;
};

type Opener = (opts: ConnectOnboardingOpenOpts) => void;

let opener: Opener | null = null;

export const CONNECT_ONBOARDING_DONE_EVENT = "evorios:connect-onboarding-done";

/** Mounted by ConnectOnboardingHost once in App. */
export function registerConnectOnboardingOpener(fn: Opener): () => void {
  opener = fn;
  return () => {
    if (opener === fn) opener = null;
  };
}

/** Opens Connect sheet if host is mounted. Returns false → caller should fall back. */
export function openConnectOnboardingSheet(opts: ConnectOnboardingOpenOpts): boolean {
  if (!opener) return false;
  opener(opts);
  return true;
}

export function emitConnectOnboardingDone(detail?: { screen?: string }): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(CONNECT_ONBOARDING_DONE_EVENT, { detail: detail ?? {} }),
  );
}

export function onConnectOnboardingDone(cb: (detail?: { screen?: string }) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (event: Event) => {
    const detail =
      event instanceof CustomEvent ? (event.detail as { screen?: string } | undefined) : undefined;
    cb(detail);
  };
  window.addEventListener(CONNECT_ONBOARDING_DONE_EVENT, handler);
  return () => window.removeEventListener(CONNECT_ONBOARDING_DONE_EVENT, handler);
}
