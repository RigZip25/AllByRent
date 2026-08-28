export type ConnectOnboardingOpenOpts = {
  returnPath: string;
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

/** Opens embedded Connect sheet if host is mounted. Returns false → caller should use Account Link redirect. */
export function openConnectOnboardingSheet(opts: ConnectOnboardingOpenOpts): boolean {
  if (!opener) return false;
  opener(opts);
  return true;
}

export function emitConnectOnboardingDone(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CONNECT_ONBOARDING_DONE_EVENT));
}

export function onConnectOnboardingDone(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener(CONNECT_ONBOARDING_DONE_EVENT, handler);
  return () => window.removeEventListener(CONNECT_ONBOARDING_DONE_EVENT, handler);
}
