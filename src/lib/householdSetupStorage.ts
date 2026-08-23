/** First-time household garage setup (name + optional co-members). */

const HOUSEHOLD_SETUP_DONE_KEY = "allbyrent_household_garage_setup_done";

export function hasCompletedHouseholdGarageSetup(): boolean {
  try {
    return localStorage.getItem(HOUSEHOLD_SETUP_DONE_KEY) === "true";
  } catch {
    return false;
  }
}

export function markHouseholdGarageSetupDone(): void {
  try {
    localStorage.setItem(HOUSEHOLD_SETUP_DONE_KEY, "true");
  } catch {
    /* ignore */
  }
}

export function clearHouseholdGarageSetupDone(): void {
  try {
    localStorage.removeItem(HOUSEHOLD_SETUP_DONE_KEY);
  } catch {
    /* ignore */
  }
}
