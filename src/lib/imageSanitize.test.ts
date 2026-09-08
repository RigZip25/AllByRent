import { describe, expect, it } from "vitest";

import { sanitizeImageBlob } from "./imageSanitize";

/**
 * Callers decide whether to keep a photo based on `stripped`, so the contract
 * that matters here is: never claim a blob was cleaned when it was not.
 * Canvas work itself needs a browser and is covered by the flows that use it.
 */
describe("sanitizeImageBlob", () => {
  it("leaves a non-image alone and says so", async () => {
    const pdf = new Blob([new Uint8Array([0x25, 0x50, 0x44, 0x46])], {
      type: "application/pdf",
    });
    const result = await sanitizeImageBlob(pdf);

    expect(result.blob).toBe(pdf);
    expect(result.stripped).toBe(false);
  });

  it("reports failure instead of pretending, when there is no canvas", async () => {
    const jpeg = new Blob([new Uint8Array([0xff, 0xd8, 0xff])], { type: "image/jpeg" });
    const result = await sanitizeImageBlob(jpeg);

    expect(result.stripped).toBe(false);
    expect(result.blob).toBe(jpeg);
  });

  it("treats a blob with no type as something it cannot clean", async () => {
    const unknown = new Blob([new Uint8Array([1, 2, 3])]);
    const result = await sanitizeImageBlob(unknown);

    expect(result.stripped).toBe(false);
  });
});
