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
  /** Optional storefront title override (empty → "{Name}'s Garage"). */
  shopName: string;
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
};

export function accentsForKind(kind: GarageShopKind): GarageAccent[] {
  return GARAGE_ACCENTS.filter((a) => a.kind === kind);
}

export function resolveGarageAccent(identity: Pick<GarageIdentity, "accentId" | "shopKind">): GarageAccent {
  const found = GARAGE_ACCENTS.find((a) => a.id === identity.accentId);
  if (found) return found;
  return accentsForKind(identity.shopKind)[0] ?? GARAGE_ACCENTS[0]!;
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
  return { shopKind, accentId, shopName };
}

/** Profile created within this window counts as a “new garage” on the block. */
export const NEW_GARAGE_DAYS = 14;

export function isNewGarageHost(createdAtIso: string | null | undefined, now = Date.now()): boolean {
  if (!createdAtIso) return false;
  const t = Date.parse(createdAtIso);
  if (!Number.isFinite(t)) return false;
  return now - t <= NEW_GARAGE_DAYS * 24 * 60 * 60 * 1000;
}
