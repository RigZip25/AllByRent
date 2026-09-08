export type InsuranceQuote = {
  /** Live partner is not connected; only `unavailable` until policies exist. */
  provider: "unavailable" | "safely" | "estimate";
  feeCents: number;
  currency: "USD";
  policyId?: string | null;
  isEstimate: boolean;
  available?: boolean;
};

function roundCents(value: number): number {
  return Math.max(0, Math.round(value));
}

export function parseUsdToCents(raw: string): number {
  const trimmed = raw.trim().replace(/^\$/, "");
  const value = Number.parseFloat(trimmed);
  if (!Number.isFinite(value) || value <= 0) return 0;
  return roundCents(value * 100);
}

/**
 * Local fee model kept for future partner wiring / tests only.
 * Booking must not charge this until a real policy is issued.
 */
export function estimateInsuranceFeeCents(input: {
  replacementValueCents: number;
  rentalDays: number;
}): number {
  const value = Math.max(0, input.replacementValueCents);
  const rentalDays = Math.max(1, Math.round(input.rentalDays));

  const base = Math.max(300, Math.round(value * 0.015)); // 1.5% of value, min $3
  const durationMultiplier = Math.min(1.8, 1 + (rentalDays - 1) * 0.15);
  return roundCents(base * durationMultiplier);
}

/** Quote endpoint is a stub until a real insurance partner is connected. */
export async function fetchSafelyInsuranceQuote(_input: {
  replacementValueCents: number;
  rentalDays: number;
  startDateISO: string;
  endDateISO: string;
}): Promise<InsuranceQuote> {
  try {
    const res = await fetch("/api/safely/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        replacementValueCents: _input.replacementValueCents,
        rentalDays: _input.rentalDays,
        startDateISO: _input.startDateISO,
        endDateISO: _input.endDateISO,
      }),
    });
    if (!res.ok) throw new Error(`Insurance quote unavailable: ${res.status}`);
    const data = (await res.json()) as Partial<InsuranceQuote>;
    if (data.provider === "safely" && typeof data.feeCents === "number" && data.feeCents >= 0) {
      return {
        provider: "safely",
        feeCents: roundCents(data.feeCents),
        currency: "USD",
        policyId: typeof data.policyId === "string" ? data.policyId : null,
        isEstimate: Boolean(data.isEstimate),
        available: true,
      };
    }
  } catch {
    /* fall through — treat as unavailable */
  }

  return {
    provider: "unavailable",
    feeCents: 0,
    currency: "USD",
    policyId: null,
    isEstimate: false,
    available: false,
  };
}
