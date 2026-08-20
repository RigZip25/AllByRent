import type { VehicleMacropoint } from "./rentalsStorage";

/** Soft speeding signals — GPS estimates between coarse checkpoints are flaky. */
export const SOFT_HIGH_SPEED_MPH = 80;
export const SOFT_VERY_HIGH_SPEED_MPH = 95;

export type SoftSpeedSignal = {
  fromAt: string;
  toAt: string;
  speedMph: number;
  severity: "high" | "very_high";
};

export function softSpeedSignalsFromTrail(points: VehicleMacropoint[]): SoftSpeedSignal[] {
  const signals: SoftSpeedSignal[] = [];
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]!;
    const cur = points[i]!;
    const speed = cur.speedMph;
    if (speed == null || !Number.isFinite(speed)) continue;
    if (speed < SOFT_HIGH_SPEED_MPH) continue;
    signals.push({
      fromAt: prev.at,
      toAt: cur.at,
      speedMph: speed,
      severity: speed >= SOFT_VERY_HIGH_SPEED_MPH ? "very_high" : "high",
    });
  }
  return signals.sort((a, b) => b.speedMph - a.speedMph).slice(0, 5);
}

export function maxTrailSpeedMph(points: VehicleMacropoint[]): number | null {
  let max: number | null = null;
  for (const p of points) {
    if (p.speedMph == null || !Number.isFinite(p.speedMph)) continue;
    if (max == null || p.speedMph > max) max = p.speedMph;
  }
  return max;
}
