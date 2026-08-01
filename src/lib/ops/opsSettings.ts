/**
 * Owner ops settings — local to this browser (survives ?resetApp=1).
 * Fee rates feed rental / sell pricing; geo overrides affect rent-page robots.
 */

export const OPS_SETTINGS_KEY = "evorios_ops_settings_v1";
export const OPS_SETTINGS_CHANGED_EVENT = "evorios-ops-settings-changed";

const DEFAULT_RENTAL_FEE = 0.12;
const DEFAULT_SELL_FEE = 0.1;
const DEFAULT_CLUSTER_MI = 25;

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
  updatedAt: null,
};

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
