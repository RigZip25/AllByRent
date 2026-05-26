const DISMISS_KEY = "allbyrent_pwa_install_dismissed";
const DISMISS_DAYS = 14;

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function isStandalonePwa(): boolean {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    nav.standalone === true
  );
}

export function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/i.test(navigator.userAgent) &&
    !(window as Window & { MSStream?: unknown }).MSStream
  );
}

export function isAndroid(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android/i.test(navigator.userAgent);
}

/** Safari on iOS — no beforeinstallprompt; user must use Share → Add to Home Screen. */
export function needsManualInstallInstructions(): boolean {
  return isIos() && !isStandalonePwa();
}

export function canShowInstallPrompt(): boolean {
  if (isStandalonePwa()) return false;
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return true;
    const dismissedAt = Number.parseInt(raw, 10);
    if (Number.isNaN(dismissedAt)) return true;
    const ms = DISMISS_DAYS * 24 * 60 * 60 * 1000;
    return Date.now() - dismissedAt > ms;
  } catch {
    return true;
  }
}

export function dismissInstallPrompt(): void {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}

export function clearInstallPromptDismissal(): void {
  try {
    localStorage.removeItem(DISMISS_KEY);
  } catch {
    /* ignore */
  }
}

let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;

export function captureInstallPrompt(event: Event): void {
  event.preventDefault();
  deferredInstallPrompt = event as BeforeInstallPromptEvent;
}

export function getDeferredInstallPrompt(): BeforeInstallPromptEvent | null {
  return deferredInstallPrompt;
}

export function clearDeferredInstallPrompt(): void {
  deferredInstallPrompt = null;
}
