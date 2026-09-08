import { describe, expect, it } from "vitest";
import { assessLateFeeFromHandoff } from "./rentalLateFee";

const MIN = 60_000;
const DUE = new Date("2026-03-05T18:00:00.000Z").getTime();

const policy = {
  lateReturnFeeEnabled: true,
  lateReturnGraceMinutes: 30,
  lateReturnFlatFeeUsd: "20",
  lateReturnPerHourFeeUsd: "15",
};

describe("assessLateFeeFromHandoff", () => {
  it("charges nothing while the host's grace period runs", () => {
    const late = assessLateFeeFromHandoff(policy, DUE, DUE + 29 * MIN);
    expect(late.pastGrace).toBe(false);
    expect(late.feeCents).toBe(0);
  });

  it("charges the flat fee plus the first started hour once grace ends", () => {
    const late = assessLateFeeFromHandoff(policy, DUE, DUE + 31 * MIN);
    expect(late.pastGrace).toBe(true);
    expect(late.billableHours).toBe(1);
    expect(late.feeCents).toBe(3500);
  });

  it("counts every started hour after grace", () => {
    const late = assessLateFeeFromHandoff(policy, DUE, DUE + 30 * MIN + 121 * MIN);
    expect(late.billableHours).toBe(3);
    expect(late.feeCents).toBe(2000 + 3 * 1500);
  });

  it("charges nothing when the host set no late-return fee", () => {
    const late = assessLateFeeFromHandoff({ lateReturnFeeEnabled: false }, DUE, DUE + 5 * 60 * MIN);
    expect(late.pastGrace).toBe(true);
    expect(late.feeCents).toBe(0);
    expect(late.summary).toBeNull();
  });

  it("falls back to the default amounts when the host left them blank", () => {
    const late = assessLateFeeFromHandoff({ lateReturnFeeEnabled: true }, DUE, DUE + 31 * MIN);
    expect(late.feeCents).toBe(3500);
    expect(late.summary).toContain("30m grace");
  });
});
