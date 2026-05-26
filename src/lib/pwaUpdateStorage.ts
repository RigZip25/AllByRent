const UPDATE_SUCCESS_KEY = "allbyrent_pwa_update_success";
const SIMULATE_UPDATE_KEY = "allbyrent_simulate_update";

export function markPwaUpdateSuccessPending(): void {
  try {
    sessionStorage.setItem(UPDATE_SUCCESS_KEY, "true");
  } catch {
    /* ignore */
  }
}

export function consumePwaUpdateSuccess(): boolean {
  try {
    if (sessionStorage.getItem(UPDATE_SUCCESS_KEY) !== "true") return false;
    sessionStorage.removeItem(UPDATE_SUCCESS_KEY);
    return true;
  } catch {
    return false;
  }
}

/** Demo flag — works in installed PWA (localStorage survives restarts). */
export function isSimulateUpdateRequested(): boolean {
  try {
    return localStorage.getItem(SIMULATE_UPDATE_KEY) === "1";
  } catch {
    return false;
  }
}

export function requestSimulateUpdate(): void {
  try {
    localStorage.setItem(SIMULATE_UPDATE_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function clearSimulateUpdateRequest(): void {
  try {
    localStorage.removeItem(SIMULATE_UPDATE_KEY);
  } catch {
    /* ignore */
  }
}
