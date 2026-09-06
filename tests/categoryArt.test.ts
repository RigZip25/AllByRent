import { describe, expect, it } from "vitest";
import { categoryArtSrc } from "../src/components/CategoryIcon";
import { CATEGORY_NAMES } from "../src/screens/listing/listingItemCategories";

describe("category artwork", () => {
  it("covers every category in the taxonomy", () => {
    const missing = CATEGORY_NAMES.filter((name) => !categoryArtSrc(name));
    expect(missing).toEqual([]);
  });

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
