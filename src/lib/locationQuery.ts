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
