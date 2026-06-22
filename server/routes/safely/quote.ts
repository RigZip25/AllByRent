import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleOptions, applyCors } from "../../lib/cors";
import { withApiErrorHandling } from "../../lib/safeHandler";

function roundCents(value: number): number {
  return Math.max(0, Math.round(value));
}

function estimateInsuranceFeeCents(input: {
  replacementValueCents: number;
  rentalDays: number;
}): number {
  const value = Math.max(0, input.replacementValueCents);
  const rentalDays = Math.max(1, Math.round(input.rentalDays));
  const base = Math.max(300, Math.round(value * 0.015));
  const durationMultiplier = Math.min(1.8, 1 + (rentalDays - 1) * 0.15);
  return roundCents(base * durationMultiplier);
}

type QuoteRequestBody = {
  replacementValueCents: number;
  rentalDays: number;
  startDateISO: string;
  endDateISO: string;
};

export default withApiErrorHandling(async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  applyCors(res, typeof req.headers.origin === "string" ? req.headers.origin : undefined);

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = (req.body ?? {}) as Partial<QuoteRequestBody>;
  const replacementValueCents = Number(body.replacementValueCents ?? 0);
  const rentalDays = Number(body.rentalDays ?? 1);

  const feeCents = estimateInsuranceFeeCents({
    replacementValueCents: Number.isFinite(replacementValueCents) ? replacementValueCents : 0,
    rentalDays: Number.isFinite(rentalDays) ? rentalDays : 1,
  });

  // Note: Safely's public docs can be unavailable from CI/agent environments.
  // We return an estimate unless the team provides a concrete API contract.
  res.status(200).json({
    provider: "estimate",
    feeCents,
    currency: "USD",
    policyId: null,
    isEstimate: true,
  });
});

