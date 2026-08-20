/**
 * Neighbor-scale Turo-like add-ons for vehicle listings.
 * Keep flat + optional — hosts enable only what they offer.
 */

export type VehicleExtraKey =
  | "unlimitedMiles"
  | "childSeat"
  | "roofRack"
  | "vehicleDelivery";

export type VehicleExtraOffer = {
  enabled: boolean;
  /** Per-day fee (unlimited miles) or flat fee (seat / rack / delivery). */
  price: string;
  /** Delivery only — max radius in miles. */
  maxMiles?: number;
};

export type VehicleExtrasConfig = Partial<Record<VehicleExtraKey, VehicleExtraOffer>>;

export type SelectedVehicleExtras = Partial<Record<VehicleExtraKey, boolean>>;

export function emptyVehicleExtras(): VehicleExtrasConfig {
  return {
    unlimitedMiles: { enabled: false, price: "" },
    childSeat: { enabled: false, price: "" },
    roofRack: { enabled: false, price: "" },
    vehicleDelivery: { enabled: false, price: "", maxMiles: 10 },
  };
}

export function normalizeVehicleExtras(raw: unknown): VehicleExtrasConfig {
  const base = emptyVehicleExtras();
  if (!raw || typeof raw !== "object") return base;
  const obj = raw as Record<string, unknown>;
  for (const key of Object.keys(base) as VehicleExtraKey[]) {
    const row = obj[key];
    if (!row || typeof row !== "object") continue;
    const offer = row as Record<string, unknown>;
    base[key] = {
      enabled: Boolean(offer.enabled),
      price: typeof offer.price === "string" ? offer.price : String(offer.price ?? ""),
      maxMiles:
        typeof offer.maxMiles === "number" && Number.isFinite(offer.maxMiles)
          ? Math.max(1, Math.round(offer.maxMiles))
          : key === "vehicleDelivery"
            ? 10
            : undefined,
    };
  }
  return base;
}

function parsePrice(raw: string | undefined): number {
  if (!raw) return 0;
  const n = Number.parseFloat(raw.trim().replace(/^\$/, ""));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Sum selected extras for a rental length (days inclusive). */
export function computeVehicleExtrasFeeUsd(params: {
  extras: VehicleExtrasConfig | undefined | null;
  selected: SelectedVehicleExtras | undefined | null;
  rentalDays: number;
}): number {
  const extras = params.extras ?? {};
  const selected = params.selected ?? {};
  const days = Math.max(1, params.rentalDays);
  let total = 0;

  if (selected.unlimitedMiles && extras.unlimitedMiles?.enabled) {
    total += parsePrice(extras.unlimitedMiles.price) * days;
  }
  if (selected.childSeat && extras.childSeat?.enabled) {
    total += parsePrice(extras.childSeat.price);
  }
  if (selected.roofRack && extras.roofRack?.enabled) {
    total += parsePrice(extras.roofRack.price);
  }
  if (selected.vehicleDelivery && extras.vehicleDelivery?.enabled) {
    total += parsePrice(extras.vehicleDelivery.price);
  }

  return Math.round(total * 100) / 100;
}

export function enabledVehicleExtraKeys(
  extras: VehicleExtrasConfig | undefined | null,
): VehicleExtraKey[] {
  if (!extras) return [];
  return (Object.keys(extras) as VehicleExtraKey[]).filter((k) => extras[k]?.enabled);
}
