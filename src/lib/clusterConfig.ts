/** Product default — see docs/CLUSTER_POLICY.md */
export const CLUSTER_RADIUS_DEFAULT_MI = 25;

/** User can widen when the block is sparse or rural. */
export const CLUSTER_RADIUS_EXPANDED_MI = 50;

/** Dense urban blocks (future per-area tuning). */
export const CLUSTER_RADIUS_DENSE_MI = 5;

/** Upper bound for manual widen. */
export const CLUSTER_RADIUS_MAX_MI = 100;

const STORAGE_KEY = "evorios_cluster_radius_mi";

export function getClusterRadiusMi(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const miles = Number(raw);
      if (
        Number.isFinite(miles) &&
        miles >= CLUSTER_RADIUS_DENSE_MI &&
        miles <= CLUSTER_RADIUS_MAX_MI
      ) {
        return miles;
      }
    }
  } catch {
    /* private mode */
  }
  return CLUSTER_RADIUS_DEFAULT_MI;
}

export function setClusterRadiusMi(miles: number): void {
  const clamped = Math.min(
    CLUSTER_RADIUS_MAX_MI,
    Math.max(CLUSTER_RADIUS_DENSE_MI, Math.round(miles)),
  );
  try {
    localStorage.setItem(STORAGE_KEY, String(clamped));
  } catch {
    /* ignore */
  }
}

/** Widen search: 25 → 50 → 100 mi. */
export function expandClusterRadius(): number {
  const current = getClusterRadiusMi();
  const next =
    current < CLUSTER_RADIUS_EXPANDED_MI
      ? CLUSTER_RADIUS_EXPANDED_MI
      : CLUSTER_RADIUS_MAX_MI;
  setClusterRadiusMi(next);
  return next;
}

export function clusterLabelForCity(city: string, radiusMi = getClusterRadiusMi()): string {
  if (!city.trim()) return "Set your block";
  return `${city} · within ${radiusMi} mi`;
}
