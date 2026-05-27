const FOUNDING_HOST_PROMO_SEEN_KEY = "founding_host_promo_seen";

export function isFoundingHostPromoSeen(): boolean {
  try {
    return localStorage.getItem(FOUNDING_HOST_PROMO_SEEN_KEY) === "true";
  } catch {
    return false;
  }
}

export function markFoundingHostPromoSeen(): void {
  try {
    localStorage.setItem(FOUNDING_HOST_PROMO_SEEN_KEY, "true");
  } catch {
    /* ignore quota / private mode */
  }
}

/** Dev: run in console to show the founding-host promo again */
export function clearFoundingHostPromoSeen(): void {
  try {
    localStorage.removeItem(FOUNDING_HOST_PROMO_SEEN_KEY);
  } catch {
    /* ignore */
  }
}
