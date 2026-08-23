/** Local garage storefront identity — how the host wants their shop to stand out. */

export type GarageShopKind = "personal" | "pro";

export type GarageAccentId =
  | "forest"
  | "amber"
  | "terracotta"
  | "navy"
  | "steel"
  | "charcoal";

export type GarageIdentity = {
  shopKind: GarageShopKind;
  accentId: GarageAccentId;
  /** Public storefront title (required for a clear garage on the block). */
  shopName: string;
  /** URL-safe unique handle derived from shopName (or host override). */
  shopSlug: string;
  /** Optional public area label (neighborhood) — never a street address. */
  neighborhood: string;
};

export type GarageAccent = {
  id: GarageAccentId;
  kind: GarageShopKind;
  /** Primary brand color for header / card chrome */
  color: string;
  /** Soft fill behind avatar / badge */
  soft: string;
};

export const GARAGE_ACCENTS: GarageAccent[] = [
  { id: "forest", kind: "personal", color: "#0D5C3A", soft: "#E8F5EE" },
  { id: "amber", kind: "personal", color: "#B45309", soft: "#FEF3C7" },
  { id: "terracotta", kind: "personal", color: "#C45C26", soft: "#FDE8DC" },
  { id: "navy", kind: "pro", color: "#1E3A5F", soft: "#E8EEF5" },
  { id: "steel", kind: "pro", color: "#334155", soft: "#E8ECF0" },
  { id: "charcoal", kind: "pro", color: "#1F2937", soft: "#E5E7EB" },
];

export const DEFAULT_GARAGE_IDENTITY: GarageIdentity = {
  shopKind: "personal",
  accentId: "forest",
  shopName: "",
  shopSlug: "",
  neighborhood: "",
};

export function accentsForKind(kind: GarageShopKind): GarageAccent[] {
  return GARAGE_ACCENTS.filter((a) => a.kind === kind);
}

export function resolveGarageAccent(identity: Pick<GarageIdentity, "accentId" | "shopKind">): GarageAccent {
  const found = GARAGE_ACCENTS.find((a) => a.id === identity.accentId);
  if (found) return found;
  return accentsForKind(identity.shopKind)[0] ?? GARAGE_ACCENTS[0]!;
}

/** Lowercase URL-safe slug from a shop name. */
export function slugifyGarageName(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function normalizeGarageIdentity(raw: unknown): GarageIdentity {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_GARAGE_IDENTITY };
  const o = raw as Record<string, unknown>;
  const shopKind: GarageShopKind = o.shopKind === "pro" ? "pro" : "personal";
  const accentRaw = typeof o.accentId === "string" ? o.accentId : "";
  const allowed = accentsForKind(shopKind).map((a) => a.id);
  const accentId = (allowed.includes(accentRaw as GarageAccentId)
    ? accentRaw
    : accentsForKind(shopKind)[0]!.id) as GarageAccentId;
  const shopName = typeof o.shopName === "string" ? o.shopName.trim().slice(0, 40) : "";
  const slugRaw = typeof o.shopSlug === "string" ? o.shopSlug : "";
  const shopSlug = slugifyGarageName(slugRaw) || (shopName ? slugifyGarageName(shopName) : "");
  const neighborhood =
    typeof o.neighborhood === "string" ? o.neighborhood.trim().slice(0, 40) : "";
  return { shopKind, accentId, shopName, shopSlug, neighborhood };
}

/** Profile created within this window counts as a “new garage” on the block. */
export const NEW_GARAGE_DAYS = 14;

export function isNewGarageHost(createdAtIso: string | null | undefined, now = Date.now()): boolean {
  if (!createdAtIso) return false;
  const t = Date.parse(createdAtIso);
  if (!Number.isFinite(t)) return false;
  return now - t <= NEW_GARAGE_DAYS * 24 * 60 * 60 * 1000;
}

/** Deterministic jitter 0..1 from a string (for map pins in the same ZIP blob). */
export function hashUnitInterval(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10_000) / 10_000;
}

function titleCaseWord(word: string): string {
  if (!word) return "";
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function twoDigitTag(seed: string): string {
  const n = Math.floor(hashUnitInterval(seed) * 90) + 10;
  return String(n);
}

/**
 * Soft name ideas for a household garage (shared account — not “only John’s”).
 * Prefer last name / family tone + short digits for uniqueness on the block.
 */
export function suggestHouseholdGarageNames(
  displayName: string | null | undefined,
  seedExtra = "",
): string[] {
  const cleaned = (displayName ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 60);
  const parts = cleaned.split(" ").filter(Boolean);
  const first = parts[0] ? titleCaseWord(parts[0]) : "";
  const last =
    parts.length >= 2 ? titleCaseWord(parts[parts.length - 1]!) : first;
  const family = last || "Home";
  const tag = twoDigitTag(`${cleaned}|${seedExtra}|garage`);
  const tag2 = twoDigitTag(`${cleaned}|${seedExtra}|alt`);

  const out: string[] = [];
  const push = (name: string) => {
    const n = name.trim().slice(0, 40);
    if (!n) return;
    if (!out.includes(n)) out.push(n);
  };

  // Household / family first (shared shelf: John tools + Barbara mixer).
  push(`The ${family} Garage`);
  push(`${family} Home Garage`);
  push(`${family} Garage ${tag}`);
  if (first && first !== family) {
    push(`${first} & family Garage`);
  }
  push(`Household Garage ${tag2}`);

  return out.slice(0, 4);
}

export function garageNeedsPublicName(identity: Pick<GarageIdentity, "shopName">): boolean {
  return !identity.shopName?.trim();
}

