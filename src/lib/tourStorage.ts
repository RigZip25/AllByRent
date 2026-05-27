const SHELL_TOUR_DONE_KEY = "allbyrent_shell_tour_done";

export function isShellTourDone(): boolean {
  try {
    return localStorage.getItem(SHELL_TOUR_DONE_KEY) === "true";
  } catch {
    return false;
  }
}

export function markShellTourDone(): void {
  try {
    localStorage.setItem(SHELL_TOUR_DONE_KEY, "true");
  } catch {
    /* ignore quota / private mode */
  }
}

/** Dev: run in console to see the shell tour again */
export function clearShellTourDone(): void {
  try {
    localStorage.removeItem(SHELL_TOUR_DONE_KEY);
  } catch {
    /* ignore */
  }
}
