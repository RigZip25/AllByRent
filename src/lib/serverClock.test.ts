import { afterEach, describe, expect, it } from "vitest";
import {
  __setServerClockOffsetForTests,
  clockOffsetFromReading,
  serverClockOffsetMs,
  serverNow,
} from "./serverClock";

afterEach(() => {
  __setServerClockOffsetForTests(0);
});

describe("clockOffsetFromReading", () => {
  it("measures a device that runs behind the server", () => {
    const sentAt = 1_000_000;
    const offset = clockOffsetFromReading({
      sentAt,
      receivedAt: sentAt + 200,
      serverDateHeader: new Date(sentAt + 100 + 5 * 60_000).toUTCString(),
    });
    // Header seconds resolution, so allow a second of slack.
    expect(offset).toBeGreaterThan(5 * 60_000 - 1000);
    expect(offset).toBeLessThan(5 * 60_000 + 1000);
  });

  it("measures a device that runs ahead", () => {
    const sentAt = 2_000_000;
    const offset = clockOffsetFromReading({
      sentAt,
      receivedAt: sentAt + 50,
      serverDateHeader: new Date(sentAt - 60 * 60_000).toUTCString(),
    })!;
    expect(offset).toBeLessThan(0);
    expect(Math.abs(offset + 60 * 60_000)).toBeLessThan(1000);
  });

  it("treats sub-second drift as no drift", () => {
    const sentAt = 3_000_000;
    expect(
      clockOffsetFromReading({
        sentAt,
        receivedAt: sentAt + 10,
        serverDateHeader: new Date(sentAt).toUTCString(),
      }),
    ).toBe(0);
  });

  it("ignores a missing or unparseable header", () => {
    expect(
      clockOffsetFromReading({ sentAt: 1, receivedAt: 2, serverDateHeader: null }),
    ).toBeNull();
    expect(
      clockOffsetFromReading({ sentAt: 1, receivedAt: 2, serverDateHeader: "not a date" }),
    ).toBeNull();
  });
});

describe("serverNow", () => {
  it("is the device clock until an offset is known", () => {
    expect(serverClockOffsetMs()).toBe(0);
    expect(Math.abs(serverNow() - Date.now())).toBeLessThan(50);
  });

  it("applies the learned offset, so moving the device clock changes nothing", () => {
    __setServerClockOffsetForTests(-90 * 60_000);
    const skew = serverNow() - Date.now();
    expect(Math.abs(skew + 90 * 60_000)).toBeLessThan(50);
  });
});
