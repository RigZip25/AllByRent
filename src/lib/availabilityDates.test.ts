import { describe, expect, it } from "vitest";
import {
  addDaysIso,
  addMonthsIso,
  calendarMonthDays,
  daysInclusive,
  isRangeBusy,
  parseIsoDateLocal,
} from "./availabilityBusy";

describe("addMonthsIso", () => {
  it("clamps to the length of the target month", () => {
    expect(addMonthsIso("2026-01-31", 1)).toBe("2026-02-28");
    expect(addMonthsIso("2024-01-31", 1)).toBe("2024-02-29");
    expect(addMonthsIso("2026-03-31", 1)).toBe("2026-04-30");
  });

  it("keeps the day of month when the target month is long enough", () => {
    expect(addMonthsIso("2026-03-15", 1)).toBe("2026-04-15");
    expect(addMonthsIso("2026-03-15", 6)).toBe("2026-09-15");
    expect(addMonthsIso("2026-12-15", 1)).toBe("2027-01-15");
  });
});

describe("calendarMonthDays", () => {
  it("is the real month length, not a flat thirty", () => {
    expect(calendarMonthDays("2026-03-15")).toBe(31);
    expect(calendarMonthDays("2026-02-01")).toBe(28);
    expect(calendarMonthDays("2024-02-01")).toBe(29);
    expect(calendarMonthDays("2026-04-10")).toBe(30);
  });
});

describe("daysInclusive", () => {
  it("counts calendar days", () => {
    expect(daysInclusive("2026-03-15", "2026-03-15")).toBe(1);
    expect(daysInclusive("2026-03-15", "2026-03-17")).toBe(3);
    expect(daysInclusive("2026-02-27", "2026-03-02")).toBe(4);
  });

  it("is not thrown off by a clock change inside the range", () => {
    // US spring-forward (2026-03-08) makes this span 47 hours, not 48.
    expect(daysInclusive("2026-03-07", "2026-03-09")).toBe(3);
    // Fall-back (2026-11-01) makes it 49 hours.
    expect(daysInclusive("2026-10-31", "2026-11-02")).toBe(3);
  });
});

describe("parseIsoDateLocal", () => {
  it("reads a plain date as a local calendar day", () => {
    const parsed = parseIsoDateLocal("2026-03-15")!;
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(2);
    expect(parsed.getDate()).toBe(15);
  });

  it("rejects impossible and malformed dates", () => {
    expect(parseIsoDateLocal("2026-02-30")).toBeNull();
    expect(parseIsoDateLocal("15-03-2026")).toBeNull();
  });
});

describe("isRangeBusy", () => {
  const busy = [{ start: "2026-03-10", end: "2026-03-12" }];

  it("treats shared endpoint days as busy", () => {
    expect(isRangeBusy("2026-03-12", "2026-03-14", busy)).toBe(true);
    expect(isRangeBusy("2026-03-08", "2026-03-10", busy)).toBe(true);
  });

  it("allows ranges that clear the busy block", () => {
    expect(isRangeBusy("2026-03-13", "2026-03-15", busy)).toBe(false);
  });

  it("refuses reversed ranges", () => {
    expect(isRangeBusy("2026-03-15", "2026-03-13", busy)).toBe(true);
  });
});

describe("addDaysIso", () => {
  it("moves across month and clock-change boundaries", () => {
    expect(addDaysIso("2026-02-27", 3)).toBe("2026-03-02");
    expect(addDaysIso("2026-03-07", 2)).toBe("2026-03-09");
    expect(addDaysIso("2026-03-01", -1)).toBe("2026-02-28");
  });
});
