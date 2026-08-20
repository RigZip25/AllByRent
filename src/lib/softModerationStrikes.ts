/**
 * Soft moderation friction — never bans accounts.
 * Short calm cooldowns after repeated refusals (listing + peer chat).
 */

const STORAGE_KEY = "evorios:moderation-strikes:v3";
const WINDOW_MS = 30 * 60 * 1000; // 30 minutes

export type SoftStrikeRecord = {
  at: number;
  severe: boolean;
};

type SoftStrikeStore = {
  byKey: Record<string, SoftStrikeRecord[]>;
  cooldownUntilByKey: Record<string, number>;
};

export type SoftStrikeResult = {
  count: number;
  cooldownMs: number;
  cooldownUntil: number;
  hasCooldown: boolean;
};

function storageKeyForUser(userId?: string | null): string {
  const id = (userId ?? "").trim();
  return id || "session";
}

function readStore(): SoftStrikeStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { byKey: {}, cooldownUntilByKey: {} };
    const parsed = JSON.parse(raw) as SoftStrikeStore;
    return {
      byKey: parsed?.byKey && typeof parsed.byKey === "object" ? parsed.byKey : {},
      cooldownUntilByKey:
        parsed?.cooldownUntilByKey && typeof parsed.cooldownUntilByKey === "object"
          ? parsed.cooldownUntilByKey
          : {},
    };
  } catch {
    return { byKey: {}, cooldownUntilByKey: {} };
  }
}

function writeStore(store: SoftStrikeStore) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore
  }
}

function prune(records: SoftStrikeRecord[], now: number): SoftStrikeRecord[] {
  return records.filter((r) => typeof r.at === "number" && now - r.at < WINDOW_MS);
}

/** 15–60s soft waits; severe repeats slightly longer. Never a ban. */
function cooldownForCount(count: number, severeRepeat: boolean): number {
  if (count < 3) return 0;
  if (severeRepeat) {
    if (count >= 5) return 60_000;
    if (count >= 4) return 45_000;
    return 30_000;
  }
  if (count >= 5) return 45_000;
  if (count >= 4) return 30_000;
  return 15_000;
}

export function getModerationCooldownRemaining(userId?: string | null): number {
  const key = storageKeyForUser(userId);
  const store = readStore();
  const until = store.cooldownUntilByKey[key] ?? 0;
  return Math.max(0, until - Date.now());
}

export function isInModerationCooldown(userId?: string | null): boolean {
  return getModerationCooldownRemaining(userId) > 0;
}

export function formatCooldownSeconds(ms: number): number {
  return Math.max(1, Math.ceil(ms / 1000));
}

/** @deprecated Alias — UI uses seconds, not hour-long locks. */
export function formatCooldownHours(ms: number): number {
  return formatCooldownSeconds(ms);
}

export function getModerationLockLevel(_userId?: string | null): number {
  return 0;
}

/**
 * Record a soft refusal. Hard-block the payload separately; never ban.
 * After 3+ strikes in the window → short calm cooldown (15–60s).
 */
export function recordModerationStrike(opts?: {
  userId?: string | null;
  severe?: boolean;
}): SoftStrikeResult {
  const now = Date.now();
  const key = storageKeyForUser(opts?.userId);
  const severe = Boolean(opts?.severe);
  const store = readStore();
  const nextRecords = prune(store.byKey[key] ?? [], now);
  nextRecords.push({ at: now, severe });
  store.byKey[key] = nextRecords;

  const count = nextRecords.length;
  const severeRepeat = nextRecords.filter((r) => r.severe).length >= 2 || severe;
  const cooldownMs = cooldownForCount(count, severeRepeat);
  const existingUntil = store.cooldownUntilByKey[key] ?? 0;
  const cooldownUntil = cooldownMs > 0 ? Math.max(existingUntil, now + cooldownMs) : existingUntil;
  if (cooldownMs > 0) {
    store.cooldownUntilByKey[key] = cooldownUntil;
  }
  writeStore(store);

  const remaining = Math.max(0, cooldownUntil - now);
  return {
    count,
    cooldownMs: remaining,
    cooldownUntil,
    hasCooldown: remaining > 0,
  };
}
