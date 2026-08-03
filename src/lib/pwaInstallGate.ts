import { isNativeApp } from "./nativeShell";
import { isIntroDone, isOnboardingComplete } from "./onboardingStorage";
import { isStandalonePwa } from "./pwaInstall";

const GATE_DONE_KEY = "evorios_install_gate_done";

export function hasCompletedInstallGate(): boolean {
  if (typeof window === "undefined") return true;
  if (isNativeApp() || isStandalonePwa()) return true;
  try {
    if (localStorage.getItem(GATE_DONE_KEY) === "1") return true;
    // Returning users who already used the app in this browser — don't block again.
    // (Cleared by reset, so a fresh reset still shows the install coach.)
    if (isOnboardingComplete() || isIntroDone()) return true;
    return false;
  } catch {
    return false;
  }
}

export function markInstallGateDone(): void {
  try {
    localStorage.setItem(GATE_DONE_KEY, "1");
  } catch {
    /* ignore */
  }
}

/** Show gate for first browser visits (Safari/Chrome tab), not home-screen / store app. */
export function shouldShowInstallGate(): boolean {
  if (typeof window === "undefined") return false;
  // Store/Capacitor builds are already “installed” — never show Add to Home Screen coach.
  if (isNativeApp()) return false;
  if (isStandalonePwa()) return false;
  const params = new URLSearchParams(window.location.search);
  if (params.get("skipInstall") === "1") return false;
  return !hasCompletedInstallGate();
}
