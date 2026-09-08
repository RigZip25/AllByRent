import { describe, expect, it } from "vitest";
import { openStatusFromSchedule } from "./yardSaleDisplay";
import type { GarageSaleSchedule } from "./garageSaleStorage";

const schedule: GarageSaleSchedule = {
  daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
  startTime: "00:00",
  endTime: "23:59",
};

describe("openStatusFromSchedule", () => {
  it("requires storeLive for open-now", () => {
    const now = new Date("2026-03-01T12:00:00");
    expect(openStatusFromSchedule(schedule, now, true).openStatus).toBe("now");
    const paused = openStatusFromSchedule(schedule, now, false);
    expect(paused.openStatus).toBe("scheduled");
    expect(paused.openLabel.toLowerCase()).toMatch(/paus/);
  });
});
