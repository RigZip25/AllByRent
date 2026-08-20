/** Host-configured toll hold — combined into the Stripe deposit auth at booking. */

export const DEFAULT_TOLL_HOLD_USD = 50;

export type TollHoldConfig = {
  enabled: boolean;
  amountUsd: string;
};

export function emptyTollHoldConfig(): TollHoldConfig {
  return { enabled: false, amountUsd: String(DEFAULT_TOLL_HOLD_USD) };
}

export function normalizeTollHoldConfig(raw: unknown): TollHoldConfig {
  const base = emptyTollHoldConfig();
  if (!raw || typeof raw !== "object") return base;
  const obj = raw as Record<string, unknown>;
  const amountRaw =
    typeof obj.amountUsd === "string"
      ? obj.amountUsd
      : typeof obj.amountUsd === "number"
        ? String(obj.amountUsd)
        : base.amountUsd;
  return {
    enabled: Boolean(obj.enabled),
    amountUsd: amountRaw.trim() || base.amountUsd,
  };
}

export function parseTollHoldAmountCents(config: TollHoldConfig | null | undefined): number {
  if (!config?.enabled) return 0;
  const n = Number.parseFloat(String(config.amountUsd ?? "").replace(/^\$/, "").trim());
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.round(n * 100);
}

export function formatTollHoldUsd(cents: number): string {
  return `$${(Math.max(0, cents) / 100).toFixed(2)}`;
}
