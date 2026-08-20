import type { ListingDraft } from "../screens/listing/types";

/** Make / model / year we already believe from specs or photo AI. */
export type VehicleIdentity = {
  make: string;
  model: string;
  year: string;
};

export type VinIdentityComparison =
  | { kind: "empty" }
  | { kind: "compatible" }
  | {
      kind: "mismatch";
      prior: VehicleIdentity;
      decoded: VehicleIdentity;
      priorLabel: string;
      decodedLabel: string;
    };

/** Collapse case, punctuation, and spacing for fuzzy make/model compare. */
export function normalizeVehicleToken(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function significantTokens(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3);
}

/** True when makes are the same brand (FREIGHTLINER ≈ Freightliner). Empty either side is not a make clash. */
export function vehicleMakesMatch(a: string, b: string): boolean {
  const na = normalizeVehicleToken(a);
  const nb = normalizeVehicleToken(b);
  if (!na || !nb) return true;
  if (na === nb) return true;
  return na.includes(nb) || nb.includes(na);
}

/**
 * True when both models are present and clearly different lines
 * (Altima vs Cascadia). Shared tokens or containment count as compatible.
 */
export function vehicleModelsClearlyDifferent(a: string, b: string): boolean {
  const na = normalizeVehicleToken(a);
  const nb = normalizeVehicleToken(b);
  if (!na || !nb) return false;
  if (na === nb) return false;
  if (na.includes(nb) || nb.includes(na)) return false;
  const tokensA = significantTokens(a);
  const tokensB = significantTokens(b);
  if (tokensA.length === 0 || tokensB.length === 0) return true;
  if (tokensA.some((token) => tokensB.includes(token))) return false;
  return true;
}

export function formatVehicleIdentityLabel(identity: VehicleIdentity): string {
  const parts = [identity.year, identity.make, identity.model]
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length === 0) return "";
  // Title-ish make for copy (Nissan, Freightliner) without shouting VIN decode casing.
  return parts
    .map((part, index) => {
      if (index === 0 && /^\d{4}$/.test(part)) return part;
      if (part === part.toUpperCase() && /[A-Z]/.test(part) && part.length > 1) {
        return part.charAt(0) + part.slice(1).toLowerCase();
      }
      return part;
    })
    .join(" ");
}

/** Prefer filled categorySpecs; fall back to photo AI brand/model/year. */
export function resolvePriorVehicleIdentity(draft: ListingDraft): VehicleIdentity {
  const specs = draft.categorySpecs ?? {};
  const ai = draft.aiSuggestions;
  const make = (specs.make ?? "").trim() || (ai?.brand ?? "").trim() || "";
  const model = (specs.model ?? "").trim() || (ai?.model ?? "").trim() || "";
  const yearFromSpecs = (specs.year ?? "").trim();
  const yearFromAi =
    ai?.year != null && Number.isFinite(ai.year) ? String(Math.round(ai.year)) : "";
  const year = yearFromSpecs || yearFromAi || "";
  return { make, model, year };
}

export function identityFromVinDecode(decoded: {
  make?: string;
  model?: string;
  modelYear?: string;
}): VehicleIdentity {
  return {
    make: (decoded.make ?? "").trim(),
    model: (decoded.model ?? "").trim(),
    year: (decoded.modelYear ?? "").trim(),
  };
}

/**
 * Clear mismatch = different make, or same/unknown make with clearly different model.
 * Year alone never triggers a hard mismatch (photo AI year is approximate).
 */
export function compareVinToKnownIdentity(
  prior: VehicleIdentity,
  decoded: VehicleIdentity,
): VinIdentityComparison {
  const priorHasIdentity = Boolean(prior.make || prior.model);
  const decodedHasIdentity = Boolean(decoded.make || decoded.model);
  if (!priorHasIdentity || !decodedHasIdentity) {
    return priorHasIdentity || decodedHasIdentity ? { kind: "compatible" } : { kind: "empty" };
  }

  const makeClash =
    Boolean(prior.make && decoded.make) && !vehicleMakesMatch(prior.make, decoded.make);
  const modelClash = vehicleModelsClearlyDifferent(prior.model, decoded.model);

  if (!makeClash && !modelClash) {
    return { kind: "compatible" };
  }

  return {
    kind: "mismatch",
    prior,
    decoded,
    priorLabel: formatVehicleIdentityLabel({
      make: prior.make,
      model: prior.model,
      // Prefer make(+model) in warning; year on prior is optional noise.
      year: "",
    }) || formatVehicleIdentityLabel(prior),
    decodedLabel: formatVehicleIdentityLabel(decoded),
  };
}
