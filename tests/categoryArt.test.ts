import { describe, expect, it } from "vitest";
import { categoryArtSrc } from "../src/components/CategoryIcon";
import { CATEGORY_NAMES } from "../src/screens/listing/listingItemCategories";

/** Coverage itself is a typecheck failure — these are the checks types miss. */
describe("category artwork", () => {
  it("gives each category its own icon", () => {
    const sources = CATEGORY_NAMES.map((name) => categoryArtSrc(name));
    expect(new Set(sources).size).toBe(CATEGORY_NAMES.length);
  });

  it("has nothing to show for a name outside the taxonomy", () => {
    expect(categoryArtSrc("Spaceships")).toBeNull();
    expect(categoryArtSrc("")).toBeNull();
    expect(categoryArtSrc(null)).toBeNull();
  });
});
