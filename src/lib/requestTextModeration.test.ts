import { describe, expect, it } from "vitest";
import { moderateRequestText } from "./requestTextModeration";

describe("moderateRequestText", () => {
  it("lets an ordinary ask through", () => {
    const result = moderateRequestText("Looking for a 6ft ladder for a weekend project.");
    expect(result.ok).toBe(true);
    expect(result.reason).toBe("ok");
  });

  it("keeps contact details out of a publicly readable table", () => {
    expect(moderateRequestText("Need a drill, call me 415 555 2671").reason).toBe("phone");
    expect(moderateRequestText("Need a drill, mail me at bob@example.com").reason).toBe("email");
    expect(moderateRequestText("Drop it at 412 Oak Street, thanks").reason).toBe("address");
    expect(moderateRequestText("Need a tent, my zip is 60302").reason).toBe("address");
    expect(moderateRequestText("Need a tent, message me on WhatsApp").reason).toBe("off_platform");
  });

  it("rejects empty and one-word asks", () => {
    expect(moderateRequestText("   ").reason).toBe("empty");
    expect(moderateRequestText("ladder").reason).toBe("too_short");
  });

  it("does not mistake sizes and prices for phone numbers", () => {
    expect(moderateRequestText("Looking for a 24ft extension ladder, up to $75 a day").ok).toBe(
      true,
    );
    expect(moderateRequestText("Need a 2000 watt generator for Saturday").ok).toBe(true);
  });

  it("strips stealth characters before judging", () => {
    const result = moderateRequestText("Need a ladder\u200b for Saturday");
    expect(result.ok).toBe(true);
    expect(result.cleaned).toBe("Need a ladder for Saturday");
  });
});
