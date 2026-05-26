/** Persists onboarding completion on this device (localStorage). */
const STORAGE_KEY = "allbyrent_onboarding_complete";

export function isOnboardingComplete(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function completeOnboarding(): void {
  try {
    localStorage.setItem(STORAGE_KEY, "true");
  } catch {
    /* ignore quota / private mode */
  }
}

/** Dev / support: run in browser console to see onboarding again */
export function clearOnboardingComplete(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export type InitialRoute = "splash" | "home";

export function getInitialRoute(): InitialRoute {
  return isOnboardingComplete() ? "home" : "splash";
}
