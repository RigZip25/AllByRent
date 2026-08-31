/** Full onboarding done (location set, earn path chosen, or explicit skip on location step). */
const ONBOARDING_COMPLETE_KEY = "allbyrent_onboarding_complete";
/** Intro finished or skipped — skip firstHello; branded splash still shows on cold start. */
const INTRO_DONE_KEY = "allbyrent_intro_done";
/** Product “what is Evorios” marketplace intro seen. */
const PRODUCT_INTRO_DONE_KEY = "allbyrent_product_intro_done";
/** User chose earn vs rent on WhatDoYouWant (or explicitly skipped that step). */
const ROLE_CHOSEN_KEY = "allbyrent_role_chosen";
/** Post-splash Sign in / Sign up / Continue as guest seen (or user already signed in). */
const AUTH_WELCOME_DONE_KEY = "allbyrent_auth_welcome_done";

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
    localStorage.setItem(PRODUCT_INTRO_DONE_KEY, "true");
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

export function hasProductIntro(): boolean {
  try {
    if (localStorage.getItem(ONBOARDING_COMPLETE_KEY) === "true") return true;
    return localStorage.getItem(PRODUCT_INTRO_DONE_KEY) === "true";
  } catch {
    return false;
  }
}

export function markProductIntroDone(): void {
  try {
    localStorage.setItem(PRODUCT_INTRO_DONE_KEY, "true");
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

export function hasAuthWelcomeDone(): boolean {
  try {
    return localStorage.getItem(AUTH_WELCOME_DONE_KEY) === "true";
  } catch {
    return false;
  }
}

export function markAuthWelcomeDone(): void {
  try {
    localStorage.setItem(AUTH_WELCOME_DONE_KEY, "true");
  } catch {
    /* ignore */
  }
}

export function clearAuthWelcomeDone(): void {
  try {
    localStorage.removeItem(AUTH_WELCOME_DONE_KEY);
  } catch {
    /* ignore */
  }
}

export type OnboardingResumeScreen =
  | "firstHello"
  | "whatIsEvorios"
  | "whatDoYouWant"
  | "whereAreYou"
  | "home";

/** Next screen after splash (or when skipping splash after auth callback). */
export function resolveOnboardingResumeScreen(): OnboardingResumeScreen {
  if (!isIntroDone()) return "firstHello";
  if (!hasProductIntro()) return "whatIsEvorios";
  if (!hasRoleChoice()) return "whatDoYouWant";
  if (!isOnboardingComplete()) return "whereAreYou";
  return "home";
}

/** Dev: run in console to see full onboarding again */
export function clearOnboardingComplete(): void {
  try {
    localStorage.removeItem(ONBOARDING_COMPLETE_KEY);
    localStorage.removeItem(INTRO_DONE_KEY);
    localStorage.removeItem(PRODUCT_INTRO_DONE_KEY);
    localStorage.removeItem(ROLE_CHOSEN_KEY);
    localStorage.removeItem(AUTH_WELCOME_DONE_KEY);
  } catch {
    /* ignore */
  }
}

export type InitialRoute = "splash" | "home";

/** Cold start always prefers splash; deep links use skipSplash separately. */
export function getInitialRoute(): InitialRoute {
  return "splash";
}
