/**
 * Tunables for the AI-first listing flow.
 *
 * Scores coming back from the model are a ranking signal, not a calibrated
 * probability, so the cut-offs live here (overridable per environment) instead
 * of being hard-coded next to the UI that reads them.
 */

function envNumber(raw: unknown, fallback: number): number {
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

const env = import.meta.env as Record<string, string | undefined>;

export const AI_CATEGORY_CONFIG = {
  /** At or above this score a single suggestion is shown. */
  highScore: envNumber(env.VITE_AI_CATEGORY_HIGH_SCORE, 0.75),
  /** At or above this score up to three suggestions are shown instead. */
  multiScore: envNumber(env.VITE_AI_CATEGORY_MULTI_SCORE, 0.45),
  /** Hard cap on suggestions offered on the "which one fits best?" screen. */
  maxSuggestions: Math.max(1, Math.round(envNumber(env.VITE_AI_CATEGORY_MAX_SUGGESTIONS, 3))),
  /** Analysis is abandoned after this long so the UI never hangs on a loader. */
  requestTimeoutMs: Math.max(
    3000,
    Math.round(envNumber(env.VITE_AI_CATEGORY_TIMEOUT_MS, 25_000)),
  ),
  /** Photos sent per analysis call — cover shot plus one detail shot. */
  maxPhotos: Math.max(1, Math.round(envNumber(env.VITE_AI_CATEGORY_MAX_PHOTOS, 2))),
} as const;

export type ConfidenceTier = "high" | "medium" | "low";

export function confidenceTier(score: number): ConfidenceTier {
  if (!Number.isFinite(score)) return "low";
  if (score >= AI_CATEGORY_CONFIG.highScore) return "high";
  if (score >= AI_CATEGORY_CONFIG.multiScore) return "medium";
  return "low";
}
