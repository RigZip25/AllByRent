import { describe, expect, it } from "vitest";
import { SERVER_LISTING_TAXONOMY } from "../../server/lib/listingAi/taxonomy.generated";
import { LISTING_TAXONOMY } from "../../src/screens/listing/taxonomyCatalog";

/**
 * The server validates model output against its own copy of the taxonomy, so a
 * stale mirror would let the classifier return ids the wizard cannot resolve.
 * Regenerate with `npm run taxonomy:sync` when this fails.
 */
describe("server taxonomy mirror", () => {
  it("matches the client catalog", () => {
    const client = LISTING_TAXONOMY.map((category) => ({
      id: category.id,
      name: category.name,
      subcategories: category.subcategories.map((sub) => ({ id: sub.id, label: sub.label })),
    }));

    expect(SERVER_LISTING_TAXONOMY).toEqual(client);
  });

  it("has unique ids and no empty shelves", () => {
    const ids = new Set<string>();
    for (const category of LISTING_TAXONOMY) {
      expect(category.id).not.toBe("");
      expect(ids.has(category.id)).toBe(false);
      ids.add(category.id);
      expect(category.subcategories.length).toBeGreaterThan(0);

      const subIds = new Set<string>();
      for (const sub of category.subcategories) {
        expect(sub.id).not.toBe("");
        expect(subIds.has(sub.id)).toBe(false);
        subIds.add(sub.id);
      }
    }
  });
});
