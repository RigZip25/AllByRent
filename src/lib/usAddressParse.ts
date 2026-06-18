import { detectUsStateFromQuery, detectUsStateFromZip } from "./usStates";

export type ParsedUsAddress = {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
};

const STREET_SUFFIX =
  /\b(street|st|lane|ln|drive|dr|road|rd|avenue|ave|boulevard|blvd|court|ct|place|pl|way|circle|cir|trail|trl|parkway|pkwy|highway|hwy|loop|lp)\b\.?/i;

const SUFFIX_CANONICAL: Record<string, string> = {
  street: "ST",
  st: "ST",
  lane: "LN",
  ln: "LN",
  drive: "DR",
  dr: "DR",
  road: "RD",
  rd: "RD",
  avenue: "AVE",
  ave: "AVE",
  boulevard: "BLVD",
  blvd: "BLVD",
  court: "CT",
  ct: "CT",
  place: "PL",
  pl: "PL",
  way: "WAY",
  circle: "CIR",
  cir: "CIR",
  trail: "TRL",
  trl: "TRL",
  parkway: "PKWY",
  pkwy: "PKWY",
  highway: "HWY",
  hwy: "HWY",
  loop: "LOOP",
  lp: "LOOP",
};

function extractZip(text: string): { zip?: string; rest: string } {
  const match = text.match(/\b(\d{5})(?:-\d{4})?\b/);
  if (!match) return { rest: text };
  return {
    zip: match[1],
    rest: text.replace(match[0], " ").replace(/\s+/g, " ").trim(),
  };
}

function normalizeStateCode(state: string): string {
  const trimmed = state.trim();
  if (trimmed.length === 2) return trimmed.toUpperCase();
  return detectUsStateFromQuery(trimmed) ?? trimmed.toUpperCase();
}

function stripState(text: string, state?: string | null): string {
  if (!state) return text;
  let rest = text;
  const code = state.toUpperCase();
  rest = rest.replace(new RegExp(`\\b${code}\\b`, "i"), " ").trim();
  for (const part of text.split(/\s+/)) {
    if (normalizeStateCode(part).toUpperCase() === code) {
      rest = rest.replace(new RegExp(`\\b${part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i"), " ");
    }
  }
  return rest.replace(/\s+/g, " ").trim();
}

/** Split "19 Gozar Ln Hot Springs Village" into street + city when commas are missing. */
function splitStreetAndCity(text: string): { street?: string; city?: string } {
  const trimmed = text.trim();
  if (!trimmed) return {};

  const suffixMatch = trimmed.match(
    new RegExp(
      `^(.+?\\b(?:${Object.keys(SUFFIX_CANONICAL).join("|")})\\.?)\\s+(.+)$`,
      "i",
    ),
  );
  if (suffixMatch) {
    return { street: suffixMatch[1].trim(), city: suffixMatch[2].trim() };
  }

  if (/^\d+\s/.test(trimmed)) {
    const tokens = trimmed.split(/\s+/);
    if (tokens.length >= 4) {
      const mid = Math.max(2, Math.min(4, tokens.length - 2));
      return {
        street: tokens.slice(0, mid).join(" "),
        city: tokens.slice(mid).join(" "),
      };
    }
  }

  return { city: trimmed };
}

/** Parse free-form US address text into Census-friendly parts. */
export function parseUsAddressQuery(
  query: string,
  preferredState?: string | null,
): ParsedUsAddress | null {
  const trimmed = query.trim();
  if (trimmed.length < 3) return null;

  const { zip, rest: withoutZip } = extractZip(trimmed);
  const state =
    detectUsStateFromQuery(trimmed) ??
    detectUsStateFromZip(trimmed) ??
    (preferredState ? normalizeStateCode(preferredState) : undefined);
  const withoutState = stripState(withoutZip, state);

  if (withoutState.includes(",")) {
    const parts = withoutState
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length >= 3) {
      return {
        street: parts[0],
        city: parts[1],
        state: normalizeStateCode(parts[2]) || state,
        zip,
      };
    }
    if (parts.length === 2) {
      const [first, second] = parts;
      if (/^\d/.test(first) || STREET_SUFFIX.test(first)) {
        return { street: first, city: second, state, zip };
      }
      return { city: first, state: normalizeStateCode(second) || state, zip };
    }
    if (parts.length === 1) {
      const split = splitStreetAndCity(parts[0]);
      return { ...split, state, zip };
    }
  }

  const split = splitStreetAndCity(withoutState);
  if (!split.street && !split.city) return { state, zip };
  return { ...split, state, zip };
}

function canonicalizeSuffixToken(token: string): string {
  const key = token.toLowerCase().replace(/\.$/, "");
  return SUFFIX_CANONICAL[key] ?? token.toUpperCase();
}

/** USPS/Census-style street line with normalized suffix (LN, ST, …). */
export function normalizeUsStreetLine(street: string): string {
  return street
    .trim()
    .replace(STREET_SUFFIX, (match) => canonicalizeSuffixToken(match))
    .replace(/\s+/g, " ");
}

/** Alternate spellings to retry when the geocoder misses (Lane vs Ln). */
export function usStreetVariants(street: string): string[] {
  const normalized = normalizeUsStreetLine(street);
  const variants = new Set<string>([street.trim(), normalized]);

  const expand: Record<string, string[]> = {
    LN: ["LANE"],
    LANE: ["LN"],
    ST: ["STREET"],
    STREET: ["ST"],
    DR: ["DRIVE"],
    DRIVE: ["DR"],
    RD: ["ROAD"],
    ROAD: ["RD"],
    AVE: ["AVENUE"],
    AVENUE: ["AVE"],
    BLVD: ["BOULEVARD"],
    BOULEVARD: ["BLVD"],
    CT: ["COURT"],
    COURT: ["CT"],
    CIR: ["CIRCLE"],
    CIRCLE: ["CIR"],
  };

  for (const [from, toList] of Object.entries(expand)) {
    const re = new RegExp(`\\b${from}\\b`, "i");
    if (!re.test(normalized)) continue;
    for (const to of toList) {
      variants.add(normalized.replace(re, to));
    }
  }

  return [...variants].filter(Boolean);
}

export function formatParsedUsAddress(parsed: ParsedUsAddress): string {
  const street = parsed.street ? normalizeUsStreetLine(parsed.street) : "";
  const cityStateZip = [
    parsed.city,
    [parsed.state, parsed.zip].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(", ");
  return [street, cityStateZip].filter(Boolean).join(", ");
}
