import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  areCategorySpecsValid,
  getCategorySpecFields,
  isSpecFieldRequired,
  type SpecFieldDef,
  type SpecModeContext,
} from "./categorySpecs";
import { CATEGORIES, canonicalShelf } from "./listingItemCategories";

/**
 * Publish gates compare specs against literal tokens, and some name keys no
 * visible field provides. Reading the accepted tokens out of the source lets
 * this suite ask the only question that matters: can a host who fills the form
 * honestly ever satisfy the gate? Kitchen Equipment / Other once could not —
 * its gate expected values the picker never offered.
 */
const GATE_SOURCE = readFileSync(new URL("./categorySpecs.ts", import.meta.url), "utf8");

function addTokens(map: Map<string, string[]>, key: string, list: string): void {
  const tokens = [...list.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  if (tokens.length === 0) return;
  const existing = map.get(key) ?? [];
  map.set(key, [...new Set([...existing, ...tokens])]);
}

function parseGateTokens(): Map<string, string[]> {
  const map = new Map<string, string[]>();

  for (const m of GATE_SOURCE.matchAll(/reqSelect\(\s*"([A-Za-z0-9_]+)"\s*,\s*\[([^\]]*)\]/g)) {
    addTokens(map, m[1], m[2]);
  }
  for (const m of GATE_SOURCE.matchAll(/\[([^\]]*)\]\.includes\(\s*\(values\.([A-Za-z0-9_]+)/g)) {
    addTokens(map, m[2], m[1]);
  }
  for (const m of GATE_SOURCE.matchAll(
    /values\.([A-Za-z0-9_]+)\s*\?\?\s*""\)\.trim\(\)\s*!==\s*"([^"]+)"/g,
  )) {
    addTokens(map, m[1], `"${m[2]}"`);
  }

  // Some gates read the value into a local first, then test the local.
  const locals = new Map<string, string>();
  for (const m of GATE_SOURCE.matchAll(
    /const\s+([A-Za-z0-9_]+)\s*=\s*\(values\.([A-Za-z0-9_]+)\s*\?\?\s*""\)\.trim\(\)/g,
  )) {
    locals.set(m[1], m[2]);
  }
  for (const m of GATE_SOURCE.matchAll(/\[([^\]]*)\]\.includes\(\s*([A-Za-z0-9_]+)\s*\)/g)) {
    const key = locals.get(m[2]);
    if (key) addTokens(map, key, m[1]);
  }

  for (const m of GATE_SOURCE.matchAll(/req(?:Text|Num)\(\s*"([A-Za-z0-9_]+)"/g)) {
    if (!map.has(m[1])) map.set(m[1], ["filled_in_by_host"]);
  }
  return map;
}

const GATE_TOKENS = parseGateTokens();

/** Ranges the gates parse as numbers, which no option list can express. */
const NUMERIC_HINTS: Record<string, string> = {
  minRiderAge: "16",
  wheelCount: "4",
  year: "2018",
};

function futureDate(): string {
  const d = new Date();
  d.setUTCFullYear(d.getUTCFullYear() + 2);
  return d.toISOString().slice(0, 10);
}

/** Deterministic PRNG so a failure reproduces exactly. */
function makeRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function candidatesFor(field: SpecFieldDef): string[] {
  const gate = GATE_TOKENS.get(field.key);
  if (field.options && field.options.length > 0) {
    // Only values the picker offers count as something a host could choose.
    const offered = [...field.options];
    return gate ? [...offered.filter((o) => gate.includes(o)), ...offered] : offered;
  }
  if (NUMERIC_HINTS[field.key]) return [NUMERIC_HINTS[field.key]];
  if (field.type === "number") return ["1"];
  if (gate) return gate;
  if (field.key.toLowerCase().includes("expiry") || field.key.toLowerCase().includes("date")) {
    return [futureDate()];
  }
  return ["filled_in_by_host"];
}

function pick(values: string[], random: () => number, first: boolean): string {
  if (first || values.length === 1) return values[0];
  return values[Math.floor(random() * values.length)];
}

/** One plausible way a host could fill this shelf. */
function fillShelf(
  category: string,
  subcategory: string,
  modes: SpecModeContext,
  random: () => number,
  first: boolean,
): Record<string, string> {
  const specs: Record<string, string> = {};
  const fields = getCategorySpecFields(category, subcategory, modes);
  for (const field of fields) {
    specs[field.key] = pick(candidatesFor(field), random, first);
  }

  const offered = new Set(fields.map((f) => f.key));
  for (const [key, tokens] of GATE_TOKENS) {
    if (offered.has(key)) continue;
    specs[key] = NUMERIC_HINTS[key] ?? pick(tokens, random, first);
  }
  for (const key of Object.keys(specs)) {
    if (key.toLowerCase().includes("expiry")) specs[key] = futureDate();
  }
  return specs;
}

/** Publishable = some host-choosable combination clears every gate. */
function isPublishable(category: string, subcategory: string, modes: SpecModeContext): boolean {
  const random = makeRandom(0x5eed);
  for (let attempt = 0; attempt < 300; attempt += 1) {
    const specs = fillShelf(category, subcategory, modes, random, attempt === 0);
    if (areCategorySpecsValid(category, subcategory, specs, modes)) return true;
  }
  return false;
}

const MODES: { label: string; modes: SpecModeContext }[] = [
  { label: "rent", modes: { rent: true } },
  { label: "sell", modes: { sell: true } },
  { label: "rent+sell", modes: { rent: true, sell: true } },
];

const SHELVES = Object.entries(CATEGORIES).flatMap(([category, data]) =>
  [...data.personal, ...data.professional].map((shelf) => ({
    category,
    subcategory: shelf.label,
  })),
);

describe("category specs", () => {
  it("covers every shelf in the taxonomy", () => {
    expect(SHELVES.length).toBeGreaterThan(100);
  });

  it.each(MODES)("lets a host publish any shelf in $label mode", ({ modes }) => {
    const blocked = SHELVES.filter(
      ({ category, subcategory }) => !isPublishable(category, subcategory, modes),
    ).map(({ category, subcategory }) => `${category} / ${subcategory}`);
    expect(blocked).toEqual([]);
  });

  it("rejects an empty spec sheet where fields are required", () => {
    const withRequired = SHELVES.filter(({ category, subcategory }) =>
      getCategorySpecFields(category, subcategory, { rent: true }).some((f) =>
        isSpecFieldRequired(f, { rent: true }),
      ),
    );
    expect(withRequired.length).toBeGreaterThan(0);
    for (const { category, subcategory } of withRequired) {
      expect(areCategorySpecsValid(category, subcategory, {}, { rent: true })).toBe(false);
    }
  });

  it("rejects a manufacture year outside 1950…currentYear+1", () => {
    const modes = { rent: true } as SpecModeContext;
    const base = {
      make: "Toyota",
      model: "Camry",
      color: "black",
      transmission: "automatic",
      fuelType: "gasoline",
      vehicleWeightLbs: "3200",
      insuranceMinLiability: "liability_25_50",
      insuranceMaxDeductible: "deductible_500",
    };
    expect(areCategorySpecsValid("Vehicles", "Cars", { ...base, year: "1" }, modes)).toBe(false);
    expect(areCategorySpecsValid("Vehicles", "Cars", { ...base, year: "1899" }, modes)).toBe(false);
    expect(
      areCategorySpecsValid(
        "Vehicles",
        "Cars",
        { ...base, year: String(new Date().getFullYear() + 2) },
        modes,
      ),
    ).toBe(false);
    expect(areCategorySpecsValid("Vehicles", "Cars", { ...base, year: "2018" }, modes)).toBe(true);
  });

  it("keeps listings saved under the old category names editable", () => {
    const legacy = [
      { category: "Home & Kitchen", subcategory: "Coffee Makers" },
      { category: "Home & Kitchen", subcategory: "Commercial Coffee Equipment" },
      { category: "Office & Business", subcategory: "Office Furniture" },
    ];
    for (const shelf of legacy) {
      const canonical = canonicalShelf(shelf.category, shelf.subcategory);
      const target = CATEGORIES[canonical.category];
      expect(target).toBeDefined();
      const labels = [...target.personal, ...target.professional].map((s) => s.label);
      expect(labels).toContain(canonical.subcategory);
      expect(
        getCategorySpecFields(shelf.category, shelf.subcategory, { rent: true }).length,
      ).toBeGreaterThan(0);
    }
  });
});
