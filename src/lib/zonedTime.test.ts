import { describe, expect, it } from "vitest";
import {
  isValidTimeZone,
  resolveTimeZone,
  zonedDateIso,
  zonedEndOfDay,
  zonedStartOfDay,
  zonedWallTime,
  zoneOffsetMinutes,
} from "./zonedTime";

describe("zoneOffsetMinutes", () => {
  it("reads standard and daylight offsets", () => {
    expect(zoneOffsetMinutes(new Date("2026-01-15T12:00:00Z"), "America/Chicago")).toBe(-360);
    expect(zoneOffsetMinutes(new Date("2026-07-15T12:00:00Z"), "America/Chicago")).toBe(-300);
    expect(zoneOffsetMinutes(new Date("2026-07-15T12:00:00Z"), "Europe/Prague")).toBe(120);
    expect(zoneOffsetMinutes(new Date("2026-07-15T12:00:00Z"), "UTC")).toBe(0);
  });
});

describe("zonedEndOfDay", () => {
  it("lands on the local end of day, not UTC midnight", () => {
    // 23:59:59.999 in Chicago on a summer day is 04:59:59.999Z the next day.
    expect(zonedEndOfDay("2026-07-15", "America/Chicago")?.toISOString()).toBe(
      "2026-07-16T04:59:59.999Z",
    );
    expect(zonedEndOfDay("2026-01-15", "America/Chicago")?.toISOString()).toBe(
      "2026-01-16T05:59:59.999Z",
    );
    expect(zonedEndOfDay("2026-07-15", "Europe/Prague")?.toISOString()).toBe(
      "2026-07-15T21:59:59.999Z",
    );
  });

  it("is always later than the UTC reading of the same date", () => {
    const zoned = zonedEndOfDay("2026-03-15", "America/Los_Angeles")!.getTime();
    const naiveUtc = new Date("2026-03-15T23:59:59.999Z").getTime();
    expect(zoned).toBeGreaterThan(naiveUtc);
    expect(zoned - naiveUtc).toBe(7 * 60 * 60 * 1000);
  });

  it("rejects values that are not plain dates", () => {
    expect(zonedEndOfDay("not-a-date", "UTC")).toBeNull();
    expect(zonedEndOfDay("2026-03-15T10:00:00Z", "UTC")).toBeNull();
  });
});

describe("zonedWallTime across a DST change", () => {
  it("uses the offset in force on the day itself", () => {
    // US spring-forward is 2026-03-08; the pickup hour keeps its local meaning.
    expect(zonedWallTime("2026-03-07", { hour: 9, minute: 0 }, "America/Chicago")?.toISOString()).toBe(
      "2026-03-07T15:00:00.000Z",
    );
    expect(zonedWallTime("2026-03-09", { hour: 9, minute: 0 }, "America/Chicago")?.toISOString()).toBe(
      "2026-03-09T14:00:00.000Z",
    );
  });

  it("keeps start of day at local midnight after the change", () => {
    expect(zonedStartOfDay("2026-03-09", "America/Chicago")?.toISOString()).toBe(
      "2026-03-09T05:00:00.000Z",
    );
  });
});

describe("zonedDateIso", () => {
  it("reports the local calendar day, which can differ from the UTC one", () => {
    const lateEvening = new Date("2026-03-16T02:30:00Z");
    expect(zonedDateIso(lateEvening, "UTC")).toBe("2026-03-16");
    expect(zonedDateIso(lateEvening, "America/Los_Angeles")).toBe("2026-03-15");
  });
});

describe("time zone resolution", () => {
  it("accepts real zones and rejects junk", () => {
    expect(isValidTimeZone("America/Chicago")).toBe(true);
    expect(isValidTimeZone("Mars/Olympus")).toBe(false);
    expect(isValidTimeZone("")).toBe(false);
    expect(isValidTimeZone(null)).toBe(false);
  });

  it("takes the first usable candidate", () => {
    expect(resolveTimeZone(null, "Mars/Olympus", "Europe/Prague")).toBe("Europe/Prague");
    expect(resolveTimeZone("America/Chicago", "Europe/Prague")).toBe("America/Chicago");
  });
});
