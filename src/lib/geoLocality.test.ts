import { describe, expect, it } from "vitest";
import {
  cityKeyFromLabel,
  localityLabelFromParts,
  milesBetween,
} from "./geoLocality";

describe("geoLocality (Stage 19)", () => {
  it("strips leading street segments from labels", () => {
    expect(
      localityLabelFromParts({ label: "123 Main St, Austin, TX" }),
    ).toBe("Austin, TX");
    expect(localityLabelFromParts({ city: "Austin", region: "TX" })).toBe("Austin, TX");
  });

  it("normalizes city keys", () => {
    expect(cityKeyFromLabel("Austin,  TX")).toBe("austin tx");
  });

  it("computes miles between two points", () => {
    const mi = milesBetween(
      { lat: 30.2672, lng: -97.7431 },
      { lat: 30.3072, lng: -97.7431 },
    );
    expect(mi).toBeGreaterThan(2);
    expect(mi).toBeLessThan(4);
  });
});
