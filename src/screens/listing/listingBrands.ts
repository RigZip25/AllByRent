/**
 * Regional brand picks — shelf leaders differ by market (US ≠ Europe ≠ LatAm).
 * Always ends with `other` + `unbranded`.
 */

import { getSearchCountryCode, type CountryCode } from "../../lib/locationCountry";

export const BRAND_OTHER = "other";
export const BRAND_UNBRANDED = "unbranded";

export type BrandListId =
  | "tools"
  | "photo"
  | "electronics"
  | "kitchen"
  | "gardenEquip"
  | "music"
  | "baby"
  | "office"
  | "heavy"
  | "construction";

export type BrandRegion = "na" | "eu" | "latam";

/** Europe / EEA / UK / CH / Balkans / UA — matches locationCountry Europe group. */
const EUROPE_CODES = new Set([
  "AL", "AD", "AT", "BE", "BA", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE",
  "GR", "HU", "IS", "IE", "IT", "XK", "LV", "LI", "LT", "LU", "MT", "MD", "MC", "ME",
  "NL", "MK", "NO", "PL", "PT", "RO", "SM", "RS", "SK", "SI", "ES", "SE", "CH", "UA",
  "GB", "VA",
]);

/** US + Canada only — Mexico / Central / South America use LatAm shelf order. */
const NA_CODES = new Set(["US", "CA"]);

export function brandRegionForCountry(country: CountryCode = getSearchCountryCode()): BrandRegion {
  const cc = country.toUpperCase();
  if (NA_CODES.has(cc)) return "na";
  if (EUROPE_CODES.has(cc)) return "eu";
  return "latam";
}

const withFallback = (brands: readonly string[]): string[] => [
  ...brands,
  BRAND_OTHER,
  BRAND_UNBRANDED,
];

/** Prefer region-first order, then fill gaps from other lists (deduped). */
function mergeRegional(
  primary: readonly string[],
  ...rest: readonly (readonly string[])[]
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const brand of [...primary, ...rest.flat()]) {
    if (seen.has(brand)) continue;
    seen.add(brand);
    out.push(brand);
  }
  return withFallback(out);
}

const TOOLS_NA = [
  "Milwaukee", "DeWalt", "Makita", "Bosch", "Ryobi", "Hilti", "Festool", "Metabo",
  "Craftsman", "Ridgid", "Black+Decker",
] as const;
const TOOLS_EU = [
  "Bosch", "Makita", "Metabo", "Festool", "Hilti", "DeWalt", "Milwaukee", "Einhell",
  "Parkside", "Ryobi", "Black+Decker",
] as const;
const TOOLS_LATAM = [
  "Black+Decker", "Bosch", "Makita", "DeWalt", "Tramontina", "Stanley", "Milwaukee",
  "Ryobi", "Hilti", "Pretul",
] as const;

const PHOTO_GLOBAL = [
  "Sony", "Canon", "Nikon", "Fujifilm", "Panasonic", "DJI", "GoPro", "Blackmagic",
  "OM System", "Leica", "Godox",
] as const;

const ELECTRONICS_NA = [
  "Apple", "Samsung", "Sony", "Dell", "HP", "Lenovo", "ASUS", "Microsoft", "Google", "LG", "Acer",
] as const;
const ELECTRONICS_EU = [
  "Samsung", "Apple", "Sony", "Xiaomi", "Huawei", "Lenovo", "ASUS", "HP", "Dell", "LG", "Nokia",
] as const;
const ELECTRONICS_LATAM = [
  "Samsung", "Xiaomi", "Apple", "Motorola", "LG", "Sony", "Lenovo", "HP", "Huawei", "Dell", "ASUS",
] as const;

const KITCHEN_NA = [
  "KitchenAid", "Breville", "Cuisinart", "Ninja", "Instant Pot", "Vitamix", "Philips", "Bosch", "GE", "Samsung",
] as const;
const KITCHEN_EU = [
  "Bosch", "Siemens", "Philips", "Electrolux", "KitchenAid", "Tefal", "Kenwood", "Miele", "Gorenje", "Samsung",
] as const;
const KITCHEN_LATAM = [
  "Tramontina", "Oster", "Philips", "Mondial", "Britânia", "Electrolux", "Bosch", "KitchenAid",
  "T-fal", "Samsung",
] as const;

const GARDEN_NA = [
  "Honda", "Stihl", "Husqvarna", "Ego", "Greenworks", "Toro", "Makita", "DeWalt", "Ryobi", "Craftsman",
] as const;
const GARDEN_EU = [
  "Stihl", "Husqvarna", "Bosch", "Makita", "Honda", "Gardena", "Einhell", "Al-Ko", "Ryobi", "Ego",
] as const;
const GARDEN_LATAM = [
  "Stihl", "Husqvarna", "Honda", "Tramontina", "Black+Decker", "Bosch", "Makita", "Toyama", "Garthen",
] as const;

const MUSIC_GLOBAL = [
  "Fender", "Gibson", "Yamaha", "Roland", "Shure", "Bose", "JBL", "Sony", "Audio-Technica", "Pioneer",
] as const;

const BABY_NA = [
  "Graco", "Britax", "Chicco", "Uppababy", "Bugaboo", "Maxi-Cosi", "Evenflo", "BabyBjörn", "Ergobaby", "Nuna",
] as const;
const BABY_EU = [
  "Cybex", "Maxi-Cosi", "Britax", "Chicco", "Bugaboo", "BabyBjörn", "Nuna", "Joie", "Stokke", "Uppababy",
] as const;
const BABY_LATAM = [
  "Chicco", "Safety 1st", "Graco", "Infanti", "Maxi-Cosi", "Britax", "BabyBjörn", "Cosco", "Evenflo", "Nuna",
] as const;

const OFFICE_GLOBAL = [
  "HP", "Brother", "Epson", "Canon", "Dell", "Lenovo", "Apple", "Logitech", "Microsoft",
] as const;

const HEAVY_NA = [
  "Honda", "Generac", "Caterpillar", "John Deere", "Bobcat", "Kubota", "Makita", "DeWalt", "Milwaukee", "Wacker Neuson",
] as const;
const HEAVY_EU = [
  "Honda", "Wacker Neuson", "Atlas Copco", "Caterpillar", "Kubota", "Bosch", "Makita", "Hilti", "Stihl", "Husqvarna",
] as const;
const HEAVY_LATAM = [
  "Honda", "Toyama", "Caterpillar", "Kubota", "Stihl", "Husqvarna", "Bosch", "Makita", "DeWalt", "Wacker Neuson",
] as const;

const CONSTRUCTION_NA = [
  "Milwaukee", "DeWalt", "Makita", "Hilti", "Bosch", "Caterpillar", "Honda", "Generac",
] as const;
const CONSTRUCTION_EU = [
  "Bosch", "Hilti", "Makita", "Metabo", "Festool", "DeWalt", "Milwaukee", "Wacker Neuson", "Honda",
] as const;
const CONSTRUCTION_LATAM = [
  "Bosch", "Makita", "DeWalt", "Black+Decker", "Hilti", "Milwaukee", "Tramontina", "Stanley", "Honda",
] as const;

function listFor(id: BrandListId, region: BrandRegion): string[] {
  switch (id) {
    case "tools":
      if (region === "eu") return mergeRegional(TOOLS_EU, TOOLS_NA, TOOLS_LATAM);
      if (region === "latam") return mergeRegional(TOOLS_LATAM, TOOLS_NA, TOOLS_EU);
      return mergeRegional(TOOLS_NA, TOOLS_EU, TOOLS_LATAM);
    case "photo":
      return withFallback(PHOTO_GLOBAL);
    case "electronics":
      if (region === "eu") return mergeRegional(ELECTRONICS_EU, ELECTRONICS_NA, ELECTRONICS_LATAM);
      if (region === "latam") return mergeRegional(ELECTRONICS_LATAM, ELECTRONICS_NA, ELECTRONICS_EU);
      return mergeRegional(ELECTRONICS_NA, ELECTRONICS_EU, ELECTRONICS_LATAM);
    case "kitchen":
      if (region === "eu") return mergeRegional(KITCHEN_EU, KITCHEN_NA, KITCHEN_LATAM);
      if (region === "latam") return mergeRegional(KITCHEN_LATAM, KITCHEN_NA, KITCHEN_EU);
      return mergeRegional(KITCHEN_NA, KITCHEN_EU, KITCHEN_LATAM);
    case "gardenEquip":
      if (region === "eu") return mergeRegional(GARDEN_EU, GARDEN_NA, GARDEN_LATAM);
      if (region === "latam") return mergeRegional(GARDEN_LATAM, GARDEN_NA, GARDEN_EU);
      return mergeRegional(GARDEN_NA, GARDEN_EU, GARDEN_LATAM);
    case "music":
      return withFallback(MUSIC_GLOBAL);
    case "baby":
      if (region === "eu") return mergeRegional(BABY_EU, BABY_NA, BABY_LATAM);
      if (region === "latam") return mergeRegional(BABY_LATAM, BABY_NA, BABY_EU);
      return mergeRegional(BABY_NA, BABY_EU, BABY_LATAM);
    case "office":
      return withFallback(OFFICE_GLOBAL);
    case "heavy":
      if (region === "eu") return mergeRegional(HEAVY_EU, HEAVY_NA, HEAVY_LATAM);
      if (region === "latam") return mergeRegional(HEAVY_LATAM, HEAVY_NA, HEAVY_EU);
      return mergeRegional(HEAVY_NA, HEAVY_EU, HEAVY_LATAM);
    case "construction":
      if (region === "eu") return mergeRegional(CONSTRUCTION_EU, CONSTRUCTION_NA, CONSTRUCTION_LATAM);
      if (region === "latam") return mergeRegional(CONSTRUCTION_LATAM, CONSTRUCTION_NA, CONSTRUCTION_EU);
      return mergeRegional(CONSTRUCTION_NA, CONSTRUCTION_EU, CONSTRUCTION_LATAM);
    default:
      return withFallback([]);
  }
}

export function brandsForList(
  listId: BrandListId,
  country: CountryCode = getSearchCountryCode(),
): string[] {
  const list = listFor(listId, brandRegionForCountry(country));
  const core = list.filter((b) => b !== BRAND_OTHER && b !== BRAND_UNBRANDED);
  core.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  return [...core, BRAND_OTHER, BRAND_UNBRANDED];
}
