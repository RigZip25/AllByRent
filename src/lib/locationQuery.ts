/** True when the user typed a 5-digit US ZIP (optional +4). */
export function isUsZipQuery(query: string): boolean {
  return /^\d{5}(-\d{4})?$/.test(query.trim());
}

/** True when the query looks like a street address (house number + street). */
export function queryLooksLikeStreet(query: string): boolean {
  const t = query.trim();
  if (/^\d{1,6}\s+\S/.test(t)) return true;
  return /\b(street|st|lane|ln|drive|dr|road|rd|avenue|ave|boulevard|blvd|court|ct|place|pl|way|cir|circle)\b/i.test(
    t,
  );
}

export type LocationSearchGranularity = "area" | "any";

/**
 * Extra Photon/Open-Meteo query forms for local postal formats.
 * Czech/Slovak OSM stores postcodes as "269 01", not "26901" — without the
 * space Photon fuzzy-matches street names like "26.10.1918".
 */
export function postalQueryVariants(query: string, countryCode: string): string[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const variants: string[] = [trimmed];
  const digits = trimmed.replace(/\s+/g, "");
  const cc = countryCode.toUpperCase();

  // CZ / SK: NNNNN → "NNN NN"
  if ((cc === "CZ" || cc === "SK") && /^\d{5}$/.test(digits)) {
    variants.unshift(`${digits.slice(0, 3)} ${digits.slice(3)}`);
  }

  // PL: NNNNN → "NN-NNN"
  if (cc === "PL" && /^\d{5}$/.test(digits)) {
    variants.unshift(`${digits.slice(0, 2)}-${digits.slice(2)}`);
  }

  // NL: 4 digits + 2 letters, optional space
  const nl = digits.toUpperCase();
  if (cc === "NL" && /^\d{4}[A-Z]{2}$/.test(nl)) {
    variants.unshift(`${nl.slice(0, 4)} ${nl.slice(4)}`);
  }

  return [...new Set(variants)];
}

/** Digits-only postcode for match scoring (ignores spaces/hyphens). */
export function normalizePostcodeDigits(value: string): string {
  return value.replace(/[\s-]/g, "").toUpperCase();
}