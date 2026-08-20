/**
 * Host-configured late return fee — defaults match common car-share norms
 * (short grace, then flat late fee + hourly additional usage).
 *
 * Market reference pattern (peer car rental):
 * - ~0–29 min: grace (no charge)
 * - then: late fee + additional usage (hourly / daily)
 *
 * Hosts can tune amounts; we keep flat + per-hour for transparent invoices.
 */

export const DEFAULT_LATE_RETURN_GRACE_MINUTES = 30;
/** Flat late fee once past grace (car-share–like ~$20). */
export const DEFAULT_LATE_RETURN_FLAT_USD = "20";
/** Additional usage per started hour after grace. */
export const DEFAULT_LATE_RETURN_PER_HOUR_USD = "15";

export type LateReturnFeePolicy = {
  enabled: boolean;
  /** Minutes after return-due before fees start. */
  graceMinutes: number;
  /** Flat fee (USD string) once past grace — optional if per-hour is set. */
  flatFeeUsd: string;
  /** Per-hour fee (USD string) after grace — optional if flat is set. */
  perHourFeeUsd: string;
};

/** Frozen snapshot copied onto booking / agreement at booking time. */
export type LateReturnFeeSnapshot = {
  enabled: boolean;
  graceMinutes: number;
  flatFeeCents: number;
  perHourFeeCents: number;
};

export function emptyLateReturnFeePolicy(): LateReturnFeePolicy {
  return {
    enabled: false,
    graceMinutes: DEFAULT_LATE_RETURN_GRACE_MINUTES,
    flatFeeUsd: DEFAULT_LATE_RETURN_FLAT_USD,
    perHourFeeUsd: DEFAULT_LATE_RETURN_PER_HOUR_USD,
  };
}

/** Sensible on-by-default for Vehicles / powered listings at publish time. */
export function defaultLateReturnFeePolicyForCategory(category?: string): LateReturnFeePolicy {
  const cat = (category ?? "").trim();
  if (cat === "Vehicles" || /boat|heavy|equipment|construction/i.test(cat)) {
    return {
      enabled: true,
      graceMinutes: DEFAULT_LATE_RETURN_GRACE_MINUTES,
      flatFeeUsd: DEFAULT_LATE_RETURN_FLAT_USD,
      perHourFeeUsd: DEFAULT_LATE_RETURN_PER_HOUR_USD,
    };
  }
  return emptyLateReturnFeePolicy();
}

function parseUsdToCents(raw: string | number | undefined | null): number {
  if (raw == null) return 0;
  const n =
    typeof raw === "number"
      ? raw
      : Number.parseFloat(String(raw).replace(/^\$/, "").trim());
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.round(n * 100);
}

export function normalizeLateReturnFeePolicy(raw: unknown): LateReturnFeePolicy {
  const base = emptyLateReturnFeePolicy();
  if (!raw || typeof raw !== "object") return base;
  const obj = raw as Record<string, unknown>;

  const graceRaw =
    typeof obj.graceMinutes === "number"
      ? obj.graceMinutes
      : typeof obj.graceMinutes === "string"
        ? Number.parseInt(obj.graceMinutes, 10)
        : base.graceMinutes;
  const graceMinutes = Number.isFinite(graceRaw)
    ? Math.max(0, Math.min(24 * 60, Math.round(graceRaw)))
    : base.graceMinutes;

  const flatFeeUsd =
    typeof obj.flatFeeUsd === "string"
      ? obj.flatFeeUsd
      : typeof obj.flatFeeUsd === "number"
        ? String(obj.flatFeeUsd)
        : base.flatFeeUsd;

  const perHourFeeUsd =
    typeof obj.perHourFeeUsd === "string"
      ? obj.perHourFeeUsd
      : typeof obj.perHourFeeUsd === "number"
        ? String(obj.perHourFeeUsd)
        : base.perHourFeeUsd;

  return {
    enabled: Boolean(obj.enabled),
    graceMinutes,
    flatFeeUsd: flatFeeUsd.trim() || base.flatFeeUsd,
    perHourFeeUsd: perHourFeeUsd.trim() || base.perHourFeeUsd,
  };
}

export function lateReturnPolicyFromListingHandoff(handoff: {
  lateReturnFeeEnabled?: boolean;
  lateReturnGraceMinutes?: number;
  lateReturnFlatFeeUsd?: string;
  lateReturnPerHourFeeUsd?: string;
} | null | undefined): LateReturnFeePolicy {
  return normalizeLateReturnFeePolicy({
    enabled: Boolean(handoff?.lateReturnFeeEnabled),
    graceMinutes: handoff?.lateReturnGraceMinutes,
    flatFeeUsd: handoff?.lateReturnFlatFeeUsd,
    perHourFeeUsd: handoff?.lateReturnPerHourFeeUsd,
  });
}

export function snapshotLateReturnFeePolicy(
  policy: LateReturnFeePolicy | null | undefined,
): LateReturnFeeSnapshot | null {
  if (!policy?.enabled) return null;
  const flatFeeCents = parseUsdToCents(policy.flatFeeUsd);
  const perHourFeeCents = parseUsdToCents(policy.perHourFeeUsd);
  if (flatFeeCents <= 0 && perHourFeeCents <= 0) return null;
  return {
    enabled: true,
    graceMinutes: Math.max(0, Math.round(policy.graceMinutes || 0)),
    flatFeeCents,
    perHourFeeCents,
  };
}

export function normalizeLateReturnFeeSnapshot(
  raw: unknown,
): LateReturnFeeSnapshot | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  if (!obj.enabled) return null;
  const grace =
    typeof obj.graceMinutes === "number" && Number.isFinite(obj.graceMinutes)
      ? Math.max(0, Math.round(obj.graceMinutes))
      : DEFAULT_LATE_RETURN_GRACE_MINUTES;
  const flatFeeCents =
    typeof obj.flatFeeCents === "number" && Number.isFinite(obj.flatFeeCents)
      ? Math.max(0, Math.round(obj.flatFeeCents))
      : parseUsdToCents(obj.flatFeeUsd as string | undefined);
  const perHourFeeCents =
    typeof obj.perHourFeeCents === "number" && Number.isFinite(obj.perHourFeeCents)
      ? Math.max(0, Math.round(obj.perHourFeeCents))
      : parseUsdToCents(obj.perHourFeeUsd as string | undefined);
  if (flatFeeCents <= 0 && perHourFeeCents <= 0) return null;
  return { enabled: true, graceMinutes: grace, flatFeeCents, perHourFeeCents };
}

export function resolveReturnDueMs(input: {
  returnDueAt?: string | null;
  endDate?: string | null;
}): number | null {
  if (input.returnDueAt) {
    const ms = new Date(input.returnDueAt).getTime();
    if (!Number.isNaN(ms)) return ms;
  }
  if (input.endDate) {
    const ms = new Date(`${input.endDate}T23:59:59.000Z`).getTime();
    if (!Number.isNaN(ms)) return ms;
  }
  return null;
}

export type LateReturnFeeAssessment = {
  pastDue: boolean;
  pastGrace: boolean;
  overdueMs: number;
  billableMs: number;
  billableHours: number;
  feeCents: number;
  graceEndsAt: string | null;
  dueAt: string | null;
};

/** Accrue flat once past grace + per-hour for each started hour after grace. */
export function assessLateReturnFee(input: {
  policy: LateReturnFeeSnapshot | LateReturnFeePolicy | null | undefined;
  returnDueAt?: string | null;
  endDate?: string | null;
  nowMs?: number;
}): LateReturnFeeAssessment {
  const now = input.nowMs ?? Date.now();
  const dueMs = resolveReturnDueMs(input);
  const empty: LateReturnFeeAssessment = {
    pastDue: false,
    pastGrace: false,
    overdueMs: 0,
    billableMs: 0,
    billableHours: 0,
    feeCents: 0,
    graceEndsAt: null,
    dueAt: dueMs != null ? new Date(dueMs).toISOString() : null,
  };
  if (dueMs == null) return empty;

  const overdueMs = Math.max(0, now - dueMs);
  const pastDue = overdueMs > 0;

  const snap =
    input.policy && "flatFeeCents" in input.policy
      ? (input.policy as LateReturnFeeSnapshot)
      : snapshotLateReturnFeePolicy(input.policy as LateReturnFeePolicy | null);

  const graceMinutes = snap?.graceMinutes ?? DEFAULT_LATE_RETURN_GRACE_MINUTES;
  const graceEndsMs = dueMs + graceMinutes * 60_000;
  const pastGrace = now > graceEndsMs;
  const billableMs = pastGrace ? Math.max(0, now - graceEndsMs) : 0;
  const billableHours = pastGrace ? Math.max(1, Math.ceil(billableMs / 3_600_000)) : 0;

  let feeCents = 0;
  if (pastGrace && snap?.enabled) {
    feeCents = Math.max(0, snap.flatFeeCents) + billableHours * Math.max(0, snap.perHourFeeCents);
  }

  return {
    pastDue,
    pastGrace,
    overdueMs,
    billableMs,
    billableHours,
    feeCents,
    graceEndsAt: new Date(graceEndsMs).toISOString(),
    dueAt: new Date(dueMs).toISOString(),
  };
}

export function formatLateReturnPolicySummary(
  policy: LateReturnFeeSnapshot | LateReturnFeePolicy | null | undefined,
  formatMoney: (usd: number) => string = (n) => `$${n.toFixed(2)}`,
): string | null {
  const snap =
    policy && "flatFeeCents" in policy
      ? (policy as LateReturnFeeSnapshot)
      : snapshotLateReturnFeePolicy(policy as LateReturnFeePolicy | null);
  if (!snap) return null;

  const parts: string[] = [];
  parts.push(
    snap.graceMinutes > 0
      ? `${snap.graceMinutes}-minute grace`
      : "no grace period",
  );
  if (snap.flatFeeCents > 0) {
    parts.push(`${formatMoney(snap.flatFeeCents / 100)} flat after grace`);
  }
  if (snap.perHourFeeCents > 0) {
    parts.push(`${formatMoney(snap.perHourFeeCents / 100)}/hour after grace`);
  }
  return parts.join(" · ");
}

export function formatMoneyCents(cents: number): string {
  return `$${(Math.max(0, cents) / 100).toFixed(2)}`;
}
