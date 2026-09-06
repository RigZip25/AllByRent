import {
  SERVER_LISTING_TAXONOMY,
  type ServerTaxonomyCategory,
  type ServerTaxonomySubcategory,
} from "./taxonomy.generated";

/**
 * Curated classification hints.
 *
 * These exist because the taxonomy names alone mislead the model: a TV is
 * "Display Systems" rather than anything containing "TV", and a framed painting
 * belongs to "Unique & Other" instead of "Home & Kitchen". Keep the wording
 * short — every character ships in the prompt.
 */
const CATEGORY_HINTS: Record<string, { aliases?: string[]; hint?: string }> = {
  "electronics-tech": {
    aliases: ["tv", "television", "projector", "laptop", "console", "monitor"],
    hint: "Screens, TVs, projectors, computers, gaming, smart home",
  },
  "photo-video": {
    aliases: ["camera", "lens", "dslr", "mirrorless", "gimbal", "drone"],
    hint: "Cameras, lenses, lighting, drones, capture rigs",
  },
  "unique-other": {
    aliases: ["painting", "artwork", "sculpture", "collectible", "prop"],
    hint: "Art, collectibles, props, and anything with no better shelf",
  },
  "home-kitchen": {
    aliases: ["appliance", "cookware", "furniture", "vacuum"],
    hint: "Household appliances, cookware, cleaning, furnishings",
  },
  "tools-diy": {
    aliases: ["drill", "saw", "ladder", "welder"],
    hint: "Hand and power tools, ladders, workshop gear",
  },
  "music-audio": {
    aliases: ["guitar", "speaker", "mixer", "microphone", "dj"],
    hint: "Instruments, speakers, mixers, stage audio",
  },
  "gym-fitness": {
    aliases: ["treadmill", "dumbbell", "bike trainer", "yoga"],
    hint: "Training equipment and recovery gear",
  },
  "outdoor-camping": {
    aliases: ["tent", "sleeping bag", "cooler", "backpack"],
    hint: "Camping, hiking, and outdoor sleeping gear",
  },
  "bikes-scooters": {
    aliases: ["bicycle", "e-bike", "scooter", "helmet"],
    hint: "Bikes, e-bikes, scooters, and riding accessories",
  },
  vehicles: {
    aliases: ["car", "truck", "van", "trailer", "motorcycle"],
    hint: "Road vehicles and towables with a VIN",
  },
};

const SUBCATEGORY_HINTS: Record<string, string> = {
  "display-systems": "Televisions and large screens",
  projectors: "Projectors and home-theater beamers",
  "art-sculpture": "Paintings, prints, framed art, sculpture",
};

export type TaxonomyPair = {
  category: ServerTaxonomyCategory;
  subcategory: ServerTaxonomySubcategory;
};

const BY_ID = new Map(SERVER_LISTING_TAXONOMY.map((entry) => [entry.id, entry]));

export function listTaxonomyCategories(): ServerTaxonomyCategory[] {
  return SERVER_LISTING_TAXONOMY;
}

export function findCategory(categoryId: unknown): ServerTaxonomyCategory | null {
  if (typeof categoryId !== "string") return null;
  return BY_ID.get(categoryId.trim()) ?? null;
}

export function findTaxonomyPair(
  categoryId: unknown,
  subcategoryId: unknown,
): TaxonomyPair | null {
  const category = findCategory(categoryId);
  if (!category || typeof subcategoryId !== "string") return null;
  const id = subcategoryId.trim();
  const subcategory = category.subcategories.find((sub) => sub.id === id);
  return subcategory ? { category, subcategory } : null;
}

/**
 * Compact allow-list for the prompt.
 *
 * One line per category keeps the payload near 8 KB for 20 categories and
 * ~230 subcategories, which is small enough to send with every vision call.
 */
export function renderTaxonomyAllowList(): string {
  return SERVER_LISTING_TAXONOMY.map((category) => {
    const meta = CATEGORY_HINTS[category.id];
    const head = [`${category.id} = ${category.name}`];
    if (meta?.aliases?.length) head.push(`also: ${meta.aliases.join(", ")}`);
    if (meta?.hint) head.push(meta.hint);

    const subs = category.subcategories
      .map((sub) => {
        const hint = SUBCATEGORY_HINTS[sub.id];
        return hint ? `${sub.id} (${sub.label} — ${hint})` : `${sub.id} (${sub.label})`;
      })
      .join("; ");

    return `- ${head.join(" | ")}\n  subcategories: ${subs}`;
  }).join("\n");
}
