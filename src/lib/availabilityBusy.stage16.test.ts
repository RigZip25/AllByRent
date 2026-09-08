import { describe, expect, it } from "vitest";
import {
  addDaysIso,
  addMonthsIso,
  approvalDeadlineFromCreatedAt,
  daysInclusive,
  endOfUtcDayIso,
  formatIsoDateLabel,
  localHmOnDateToIso,
  parseIsoDateLocal,
  todayIsoLocal,
} from "./availabilityBusy";

describe("Stage 16 calendar helpers", () => {
  it("clamps addMonthsIso on short months (W14)", () => {
    expect(addMonthsIso("2026-01-31", 1)).toBe("2026-02-28");
    expect(addMonthsIso("2024-01-31", 1)).toBe("2024-02-29");
    expect(addMonthsIso("2026-01-31", 2)).toBe("2026-03-31");
  });

  it("builds UTC end-of-day for due_at (W1)", () => {
    expect(endOfUtcDayIso("2026-03-15")).toBe("2026-03-15T23:59:59.000Z");
  });

  it("formats date-only ISO without UTC day shift (W5)", () => {
    const label = formatIsoDateLabel("2026-03-15");
    expect(label).toMatch(/Mar/);
    expect(label).toMatch(/15/);
  });

  it("maps host HH:mm onto a local calendar day (W7)", () => {
    const iso = localHmOnDateToIso("2026-06-01", "09:30");
    const d = new Date(iso);
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(5);
    expect(d.getDate()).toBe(1);
    expect(d.getHours()).toBe(9);
    expect(d.getMinutes()).toBe(30);
  });

  it("derives approval deadline from created_at (W12)", () => {
    expect(approvalDeadlineFromCreatedAt("2026-01-01T00:00:00.000Z")).toBe(
      "2026-01-02T00:00:00.000Z",
    );
  });

  it("counts inclusive days", () => {
    expect(daysInclusive("2026-03-15", "2026-03-15")).toBe(1);
    expect(daysInclusive("2026-03-15", "2026-03-16")).toBe(2);
  });

  it("parses and advances local ISO dates", () => {
    expect(parseIsoDateLocal("2026-03-15")?.getDate()).toBe(15);
    const today = todayIsoLocal();
    expect(addDaysIso(today, 2) > today).toBe(true);
  });
});
