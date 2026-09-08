import { describe, expect, it } from "vitest";
import {
  hostPickupTimeForDate,
  resolvePickupInstantIso,
  resolvePickupWindowIso,
  resolveReturnDeadlineIso,
} from "./rentalPickupTime";

const HOST_HOURS = {
  inPersonTimeStart: "08:30",
  inPersonTimeEnd: "17:00",
  inPersonWeekendTimeStart: "10:00",
  inPersonWeekendTimeEnd: "14:00",
};

describe("hostPickupTimeForDate", () => {
  it("uses weekday hours on weekdays and weekend hours on weekends", () => {
    // 2026-03-12 is a Thursday, 2026-03-14 a Saturday.
    expect(hostPickupTimeForDate(HOST_HOURS, "2026-03-12")).toEqual({
      hour: 8,
      minute: 30,
      second: 0,
    });
    expect(hostPickupTimeForDate(HOST_HOURS, "2026-03-14")).toEqual({
      hour: 10,
      minute: 0,
      second: 0,
    });
  });

  it("falls back to 2pm when the host published no hours", () => {
    expect(hostPickupTimeForDate(undefined, "2026-03-12")).toEqual({ hour: 14, minute: 0 });
    expect(hostPickupTimeForDate({ ...HOST_HOURS, inPersonTimeStart: "" }, "2026-03-12")).toEqual({
      hour: 14,
      minute: 0,
    });
  });
});

describe("resolvePickupInstantIso", () => {
  it("puts the host's opening hour in the item's zone", () => {
    expect(resolvePickupInstantIso("2026-03-12", HOST_HOURS, "America/Chicago")).toBe(
      "2026-03-12T13:30:00.000Z",
    );
    expect(resolvePickupInstantIso("2026-03-14", HOST_HOURS, "Europe/Prague")).toBe(
      "2026-03-14T09:00:00.000Z",
    );
  });
});

describe("resolvePickupWindowIso", () => {
  it("runs from the host's opening to closing hour", () => {
    expect(resolvePickupWindowIso("2026-03-12", HOST_HOURS, "America/Chicago")).toEqual({
      start: "2026-03-12T13:30:00.000Z",
      end: "2026-03-12T22:00:00.000Z",
    });
  });

  it("gives a two-hour window when the host published no closing hour", () => {
    const window = resolvePickupWindowIso(
      "2026-03-12",
      { ...HOST_HOURS, inPersonTimeEnd: "" },
      "America/Chicago",
    )!;
    expect(new Date(window.end).getTime() - new Date(window.start).getTime()).toBe(
      2 * 60 * 60 * 1000,
    );
  });
});

describe("resolveReturnDeadlineIso", () => {
  it("is the end of the last rented day where the item lives", () => {
    expect(resolveReturnDeadlineIso("2026-03-15", "America/Chicago")).toBe(
      "2026-03-16T04:59:59.999Z",
    );
  });

  it("gives the renter the whole day, unlike the old UTC reading", () => {
    const zoned = new Date(resolveReturnDeadlineIso("2026-03-15", "America/Chicago")!).getTime();
    const utcReading = new Date("2026-03-15T23:59:59.000Z").getTime();
    expect(zoned).toBeGreaterThan(utcReading);
  });
});
