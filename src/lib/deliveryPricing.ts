/**

 * Demo US round-trip delivery pricing (no live Uber API).

 *

 * Round trip = host delivers before rental start + host picks up after rental ends.

 * One charge covers both legs (not split 50/50, not one-way host + renter return).

 *

 * Miles formula: base + (perMile × miles), evaluated at the host's max delivery distance.

 * Heavy items: surcharge per pound over HEAVY_WEIGHT_THRESHOLD_LBS (added to round-trip fee).

 */

export const DELIVERY_FEE_BASE_USD = 5;

export const DELIVERY_FEE_PER_MILE_ROUND_TRIP_USD = 1.5;

export const DEFAULT_DELIVERY_MAX_MILES = 20;

export const MAX_DELIVERY_RADIUS_MILES = 50;



/** Weight at and below this threshold has no heavy delivery surcharge. */

export const HEAVY_WEIGHT_THRESHOLD_LBS = 50;

/** Demo rate: USD charged per pound over HEAVY_WEIGHT_THRESHOLD_LBS. */

export const HEAVY_SURCHARGE_PER_LB_OVER_THRESHOLD_USD = 0.75;

/** Factual round-trip delivery policy (not a fee suggestion). */
export const ROUND_TRIP_DELIVERY_POLICY_NOTE =
  "Delivery before rental start and pickup after rental end count as one round-trip fee — not split 50/50, and not one-way host delivery with renter return.";

/** Used when item is heavy but host has not entered weight yet (estimate only). */

export const DEFAULT_HEAVY_ITEM_WEIGHT_LBS = 75;



export type HeavySurchargeResult = {

  surchargeUsd: number;

  weightLbs: number;

  poundsOverThreshold: number;

  usedDefaultWeight: boolean;

};



export type DeliveryFeeSuggestion = {

  min: number;

  max: number;

  /** Total suggested delivery (round trip + heavy surcharge when applicable). */

  suggested: number;

  roundTripUsd: number;

  heavySurchargeUsd: number;

  poundsOverThreshold: number;

  estimatedWeightLbs: number | null;

  roundTripNote: string;

};



/** Clamp miles for pricing; falls back when value is missing or non-finite. */

export function sanitizeDeliveryMiles(miles: number): number {

  if (!Number.isFinite(miles)) {

    return DEFAULT_DELIVERY_MAX_MILES;

  }

  return Math.min(Math.max(1, Math.round(miles)), MAX_DELIVERY_RADIUS_MILES);

}



export function computeRoundTripMilesFeeUsd(miles: number): number {

  const capped = sanitizeDeliveryMiles(miles);

  return roundUsd(

    DELIVERY_FEE_BASE_USD + DELIVERY_FEE_PER_MILE_ROUND_TRIP_USD * capped,

  );

}



export function resolveHeavyItemWeightLbs(

  itemWeightLbs: number | null | undefined,

): { weightLbs: number; usedDefaultWeight: boolean } {

  if (

    typeof itemWeightLbs === "number" &&

    Number.isFinite(itemWeightLbs) &&

    itemWeightLbs > 0

  ) {

    return { weightLbs: Math.round(itemWeightLbs), usedDefaultWeight: false };

  }

  return { weightLbs: DEFAULT_HEAVY_ITEM_WEIGHT_LBS, usedDefaultWeight: true };

}



export function computeHeavySurchargeUsd(options: {

  itemHeavy: boolean;

  itemWeightLbs?: number | null;

}): HeavySurchargeResult {

  if (!options.itemHeavy) {

    return {

      surchargeUsd: 0,

      weightLbs: 0,

      poundsOverThreshold: 0,

      usedDefaultWeight: false,

    };

  }

  const { weightLbs, usedDefaultWeight } = resolveHeavyItemWeightLbs(

    options.itemWeightLbs,

  );

  const poundsOverThreshold = Math.max(0, weightLbs - HEAVY_WEIGHT_THRESHOLD_LBS);

  const surchargeUsd = roundUsd(

    poundsOverThreshold * HEAVY_SURCHARGE_PER_LB_OVER_THRESHOLD_USD,

  );

  return {

    surchargeUsd,

    weightLbs,

    poundsOverThreshold,

    usedDefaultWeight,

  };

}



export function formatPoundsOverLabel(poundsOver: number): string {

  const n = Math.round(poundsOver);

  return `${n} lb over ${HEAVY_WEIGHT_THRESHOLD_LBS}`;

}



export function suggestDeliveryFeeMiles(

  miles: number,

  options?: { heavyItem?: boolean; itemWeightLbs?: number | null },

): DeliveryFeeSuggestion {

  const capped = sanitizeDeliveryMiles(miles);

  const roundTripUsd = computeRoundTripMilesFeeUsd(capped);

  const heavy = options?.heavyItem

    ? computeHeavySurchargeUsd({

        itemHeavy: true,

        itemWeightLbs: options.itemWeightLbs,

      })

    : {

        surchargeUsd: 0,

        weightLbs: null as number | null,

        poundsOverThreshold: 0,

        usedDefaultWeight: false,

      };

  const heavySurchargeUsd = heavy.surchargeUsd;

  const suggested = roundUsd(roundTripUsd + heavySurchargeUsd);

  const min = roundUsd(suggested * 0.85);

  const max = roundUsd(suggested * 1.15);



  return {

    min,

    max,

    suggested,

    roundTripUsd,

    heavySurchargeUsd,

    poundsOverThreshold: heavy.poundsOverThreshold,

    estimatedWeightLbs: options?.heavyItem ? heavy.weightLbs : null,

    roundTripNote: ROUND_TRIP_DELIVERY_POLICY_NOTE,

  };

}



function roundUsd(value: number): number {

  if (!Number.isFinite(value)) return 0;

  return Math.round(value * 100) / 100;

}



export function formatDeliveryFee(amount: number): string {

  if (!Number.isFinite(amount)) return "0";

  return Number.isInteger(amount) ? String(amount) : amount.toFixed(2);

}



export function parseDeliveryFee(value: string): number | null {

  const trimmed = value.trim().replace(/^\$/, "");

  if (!trimmed) return null;

  const parsed = Number.parseFloat(trimmed);

  return Number.isFinite(parsed) ? parsed : null;

}



/** Sync legacy tier storage used by review/export paths. */

export function deliveryPriceRowForHandoff(

  maxMiles: number,

  roundTripFee: string,

): { miles: number; price: string }[] {

  const miles = sanitizeDeliveryMiles(maxMiles);

  const price = typeof roundTripFee === "string" ? roundTripFee.trim() : "";

  return [{ miles, price }];

}


