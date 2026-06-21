/** Full onboarding done (location set, earn path chosen, or explicit skip on location step). */
const ONBOARDING_COMPLETE_KEY = "allbyrent_onboarding_complete";
/** Intro finished or skipped — no more splash / Rentano hello on launch. */
const INTRO_DONE_KEY = "allbyrent_intro_done";
/** User chose earn vs rent on WhatDoYouWant (or explicitly skipped that step). */
const ROLE_CHOSEN_KEY = "allbyrent_role_chosen";

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
    localStorage.setItem(ROLE_CHOSEN_KEY, "true");
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

export function hasRoleChoice(): boolean {
  try {
    return localStorage.getItem(ROLE_CHOSEN_KEY) === "true";
  } catch {
    return false;
  }
}

export function markRoleChosen(): void {
  try {
    localStorage.setItem(ROLE_CHOSEN_KEY, "true");
  } catch {
    /* ignore */
  }
}

export type OnboardingResumeScreen =
  | "firstHello"
  | "whereAreYou"
  | "browseHub";

/** Next screen after splash (or when skipping splash after auth callback). */
export function resolveOnboardingResumeScreen(): OnboardingResumeScreen {
  if (!isIntroDone()) return "firstHello";
  if (!isOnboardingComplete()) return "whereAreYou";
  return "browseHub";
}

/** Dev: run in console to see full onboarding again */
export function clearOnboardingComplete(): void {
  try {
    localStorage.removeItem(ONBOARDING_COMPLETE_KEY);
    localStorage.removeItem(INTRO_DONE_KEY);
    localStorage.removeItem(ROLE_CHOSEN_KEY);
  } catch {
    /* ignore */
  }
}

export type InitialRoute = "splash" | "browseHub";

export function getInitialRoute(): InitialRoute {
  return isIntroDone() ? "browseHub" : "splash";
}
