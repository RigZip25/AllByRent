/** Full onboarding done (location set, earn path chosen, or explicit skip on location step). */
const ONBOARDING_COMPLETE_KEY = "allbyrent_onboarding_complete";
/** Intro finished or skipped — no more splash / Rentano hello on launch. */
const INTRO_DONE_KEY = "allbyrent_intro_done";

export function isOnboardingComplete(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_COMPLETE_KEY) === "true";
  } catch {
    return false;
  }
}

export function completeOnboarding(): void {
  try {
    localStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");
    localStorage.setItem(INTRO_DONE_KEY, "true");
  } catch {
    /* ignore quota / private mode */
  }
}

export function isIntroDone(): boolean {
  try {
    if (localStorage.getItem(ONBOARDING_COMPLETE_KEY) === "true") return true;
    return localStorage.getItem(INTRO_DONE_KEY) === "true";
  } catch {
    return false;
  }
}

export function markIntroDone(): void {
  try {
    localStorage.setItem(INTRO_DONE_KEY, "true");
  } catch {
    /* ignore */
  }
}

/** Dev: run in console to see full onboarding again */
export function clearOnboardingComplete(): void {
  try {
    localStorage.removeItem(ONBOARDING_COMPLETE_KEY);
    localStorage.removeItem(INTRO_DONE_KEY);
  } catch {
    /* ignore */
  }
}

export type InitialRoute = "splash" | "home";

export function getInitialRoute(): InitialRoute {
  return isIntroDone() ? "home" : "splash";
}
