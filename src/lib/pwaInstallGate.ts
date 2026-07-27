import { isStandalonePwa } from "./pwaInstall";

const GATE_DONE_KEY = "evorios_install_gate_done";
const BROWSER_CONTINUE_KEY = "evorios_install_gate_browser";

export function hasCompletedInstallGate(): boolean {
  if (typeof window === "undefined") return true;
  if (isStandalonePwa()) return true;
  try {
    return localStorage.getItem(GATE_DONE_KEY) === "1";
  } catch {
    return false;
  }
}

export function hasChosenBrowserContinue(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(BROWSER_CONTINUE_KEY) === "1";
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

export function markBrowserContinue(): void {
  try {
    localStorage.setItem(GATE_DONE_KEY, "1");
    localStorage.setItem(BROWSER_CONTINUE_KEY, "1");
  } catch {
    /* ignore */
  }
}

/** Show gate for first browser visits (Safari/Chrome tab), not home-screen app. */
export function shouldShowInstallGate(): boolean {
  if (typeof window === "undefined") return false;
  if (isStandalonePwa()) return false;
  const params = new URLSearchParams(window.location.search);
  if (params.get("skipInstall") === "1") return false;
  return !hasCompletedInstallGate();
}
