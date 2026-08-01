/**
 * Owner ops settings — local to this browser (survives ?resetApp=1).
 * Fee rates feed rental / sell pricing; geo overrides affect rent-page robots.
 */

export const OPS_SETTINGS_KEY = "evorios_ops_settings_v1";
export const OPS_SETTINGS_CHANGED_EVENT = "evorios-ops-settings-changed";

const DEFAULT_RENTAL_FEE = 0.12;
const DEFAULT_SELL_FEE = 0.1;
const DEFAULT_CLUSTER_MI = 25;

export type OpsMarketingLocation = {
  id: string;
  /** City or area name, e.g. "Kladno" / "Vinohrady" */
  name: string;
  /** Optional district / neighborhood */
  district: string;
  /** ISO country, e.g. CZ */
  country: string;
  /** Campaign notes */
  notes: string;
  active: boolean;
  createdAt: string;
};

export type OpsSettings = {
  rentalFeeRate: number;
  sellFeeRate: number;
  /** Optional temporary rental fee override (promo). null = use rentalFeeRate */
  promoRentalFeeRate: number | null;
  promoLabel: string;
  foundingPromoEnabled: boolean;
  /** Notes for the owner (campaign copy, FB/TikTok ideas) */
  ownerNotes: string;
  /** Default browse cluster radius when user has not chosen one */
  clusterDefaultMi: number;
  /** Override SEO location indexable flags by slug */
  indexableOverrides: Record<string, boolean>;
  /** Cities to highlight as launch focus */
  geoFocusSlugs: string[];
  /** Manually entered marketing cities / districts */
  marketingLocations: OpsMarketingLocation[];
  updatedAt: string | null;
};

const DEFAULTS: OpsSettings = {
  rentalFeeRate: DEFAULT_RENTAL_FEE,
  sellFeeRate: DEFAULT_SELL_FEE,
  promoRentalFeeRate: null,
  promoLabel: "",
  foundingPromoEnabled: true,
  ownerNotes: "",
  clusterDefaultMi: DEFAULT_CLUSTER_MI,
  indexableOverrides: {},
  geoFocusSlugs: ["praha", "brno", "bratislava"],
  marketingLocations: [],
  updatedAt: null,
};

export function slugifyMarketingLocation(name: string, district = ""): string {
  const base = [name, district].filter(Boolean).join(" ");
  return base
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

function clampRate(n: number, fallback: number): number {
  if (!Number.isFinite(n)) return fallback;
  return Math.min(0.5, Math.max(0, Math.round(n * 1000) / 1000));
}

function clampMiles(n: number): number {
  if (!Number.isFinite(n)) return DEFAULT_CLUSTER_MI;
  return Math.min(100, Math.max(5, Math.round(n)));
}

function normalize(raw: Partial<OpsSettings> | null | undefined): OpsSettings {
  if (!raw || typeof raw !== "object") return { ...DEFAULTS };
  const overrides =
    raw.indexableOverrides && typeof raw.indexableOverrides === "object"
      ? Object.fromEntries(
          Object.entries(raw.indexableOverrides).filter(
            (entry): entry is [string, boolean] => typeof entry[1] === "boolean",
          ),
        )
      : {};
  const focus = Array.isArray(raw.geoFocusSlugs)
    ? raw.geoFocusSlugs.filter((s): s is string => typeof s === "string" && s.trim().length > 0)
    : DEFAULTS.geoFocusSlugs;
  const marketingLocations = Array.isArray(raw.marketingLocations)
    ? raw.marketingLocations
        .filter((row): row is OpsMarketingLocation => Boolean(row && typeof row.name === "string"))
        .map((row) => ({
          id: typeof row.id === "string" && row.id ? row.id : `ml_${Date.now()}`,
          name: String(row.name).trim().slice(0, 80),
          district: typeof row.district === "string" ? row.district.trim().slice(0, 80) : "",
          country: typeof row.country === "string" ? row.country.trim().toUpperCase().slice(0, 8) : "CZ",
          notes: typeof row.notes === "string" ? row.notes.trim().slice(0, 500) : "",
          active: row.active !== false,
          createdAt:
            typeof row.createdAt === "string" ? row.createdAt : new Date().toISOString(),
        }))
        .filter((row) => row.name.length > 0)
    : [];
  return {
    rentalFeeRate: clampRate(Number(raw.rentalFeeRate), DEFAULT_RENTAL_FEE),
    sellFeeRate: clampRate(Number(raw.sellFeeRate), DEFAULT_SELL_FEE),
    promoRentalFeeRate:
      raw.promoRentalFeeRate === null || raw.promoRentalFeeRate === undefined
        ? null
        : clampRate(Number(raw.promoRentalFeeRate), DEFAULT_RENTAL_FEE),
    promoLabel: typeof raw.promoLabel === "string" ? raw.promoLabel.slice(0, 120) : "",
    foundingPromoEnabled: raw.foundingPromoEnabled !== false,
    ownerNotes: typeof raw.ownerNotes === "string" ? raw.ownerNotes.slice(0, 4000) : "",
    clusterDefaultMi: clampMiles(Number(raw.clusterDefaultMi ?? DEFAULT_CLUSTER_MI)),
    indexableOverrides: overrides,
    geoFocusSlugs: focus,
    marketingLocations,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : null,
  };
}

export function loadOpsSettings(): OpsSettings {
  if (typeof window === "undefined") return { ...DEFAULTS };
  try {
    const raw = localStorage.getItem(OPS_SETTINGS_KEY);
    if (!raw) return { ...DEFAULTS };
    return normalize(JSON.parse(raw) as Partial<OpsSettings>);
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveOpsSettings(patch: Partial<OpsSettings>): OpsSettings {
  const next = normalize({ ...loadOpsSettings(), ...patch, updatedAt: new Date().toISOString() });
  try {
    localStorage.setItem(OPS_SETTINGS_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(OPS_SETTINGS_CHANGED_EVENT));
  } catch {
    /* ignore */
  }
  return next;
}

export function resetOpsSettings(): OpsSettings {
  try {
    localStorage.removeItem(OPS_SETTINGS_KEY);
    window.dispatchEvent(new CustomEvent(OPS_SETTINGS_CHANGED_EVENT));
  } catch {
    /* ignore */
  }
  return { ...DEFAULTS };
}

/** Effective rental platform fee (promo wins when set). */
export function getEffectiveRentalFeeRate(): number {
  const s = loadOpsSettings();
  if (s.promoRentalFeeRate !== null) return s.promoRentalFeeRate;
  return s.rentalFeeRate;
}

export function getSellFeeRate(): number {
  return loadOpsSettings().sellFeeRate;
}

export function getOpsClusterDefaultMi(): number {
  return loadOpsSettings().clusterDefaultMi;
}

export function isOpsLocationIndexable(slug: string, baseIndexable: boolean): boolean {
  const override = loadOpsSettings().indexableOverrides[slug];
  if (typeof override === "boolean") return override;
  return baseIndexable;
}
