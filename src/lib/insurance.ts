export type InsuranceQuote = {
  provider: "safely" | "estimate";
  feeCents: number;
  currency: "USD";
  policyId?: string | null;
  isEstimate: boolean;
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
 * Fallback fee model used when Safely isn't configured.
 * Tuned to be:
 * - monotonic with replacement value
 * - gently increasing with duration
 * - with a small minimum to avoid $0 bookings
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

export async function fetchSafelyInsuranceQuote(input: {
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
        replacementValueCents: input.replacementValueCents,
        rentalDays: input.rentalDays,
        startDateISO: input.startDateISO,
        endDateISO: input.endDateISO,
      }),
    });
    if (!res.ok) throw new Error(`Safely quote failed: ${res.status}`);
    const data = (await res.json()) as Partial<InsuranceQuote>;
    if (typeof data.feeCents !== "number" || data.feeCents < 0) {
      throw new Error("Safely quote: invalid fee");
    }
    return {
      provider: data.provider === "safely" ? "safely" : "estimate",
      feeCents: roundCents(data.feeCents),
      currency: "USD",
      policyId: typeof data.policyId === "string" ? data.policyId : null,
      isEstimate: Boolean(data.isEstimate),
    };
  } catch {
    const feeCents = estimateInsuranceFeeCents({
      replacementValueCents: input.replacementValueCents,
      rentalDays: input.rentalDays,
    });
    return {
      provider: "estimate",
      feeCents,
      currency: "USD",
      policyId: null,
      isEstimate: true,
    };
  }
}

