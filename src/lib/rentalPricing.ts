import {

  computeHeavySurchargeUsd,

  computeRoundTripMilesFeeUsd,

  formatDeliveryFee,

  parseDeliveryFee,

  sanitizeDeliveryMiles,

} from "./deliveryPricing";

import type { ListingDraft } from "../screens/listing/types";



/** Demo platform service fee (12% of rental + delivery + heavy surcharge). */

export const DEMO_SERVICE_FEE_RATE = 0.12;



export type RentalPriceBreakdown = {

  rentalDays: number;

  dailyRateUsd: number;
  monthlyRateUsd?: number;
  pricingBasis?: "daily" | "monthly";
  monthsEquivalent?: number;

  rentalSubtotalUsd: number;

  deliveryRequested: boolean;

  /** Host round-trip miles fee (excludes heavy surcharge). */

  deliveryRoundTripUsd: number;

  /** Weight-based surcharge when heavy item + delivery. */

  heavySurchargeUsd: number;

  poundsOverThreshold: number;

  itemWeightLbs?: number | null;

  /** Round trip + heavy surcharge (when delivery requested). */

  deliveryFeeUsd: number;

  /** Guest-paid protection / insurance fee (e.g. Safely). */
  insuranceFeeUsd: number;

  serviceFeeUsd: number;

  totalUsd: number;

};



export function parseListingDailyRate(dailyRate: string): number {

  const trimmed = dailyRate.trim().replace(/^\$/, "");

  const parsed = Number.parseFloat(trimmed);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;

}



export function resolveListingDeliveryRoundTripUsd(listing: ListingDraft): number {

  const fromField = parseDeliveryFee(listing.handoff.deliveryRoundTripFee ?? "");

  if (fromField !== null && fromField > 0) return fromField;

  const rows = Array.isArray(listing.handoff.deliveryPrices)

    ? listing.handoff.deliveryPrices

    : [];

  const tier = rows

    .filter(

      (row) =>

        typeof row?.price === "string" && row.price.trim() !== "" && row.price !== "0",

    )

    .sort((a, b) => (b.miles ?? 0) - (a.miles ?? 0))[0];

  if (tier) {

    const parsed = parseDeliveryFee(tier.price);

    if (parsed !== null && parsed > 0) return parsed;

  }

  const miles = listing.handoff.deliveryMaxMiles ?? 20;

  return computeRoundTripMilesFeeUsd(sanitizeDeliveryMiles(miles));

}



/** @deprecated Use resolveListingDeliveryRoundTripUsd */

export function resolveListingDeliveryFeeUsd(listing: ListingDraft): number {

  return resolveListingDeliveryRoundTripUsd(listing);

}



export function listingOffersDelivery(listing: ListingDraft): boolean {

  return Boolean(listing.handoff.delivery);

}



export function renterCanRequestDelivery(listing: ListingDraft): boolean {

  return listingOffersDelivery(listing);

}



export function computeRentalPriceBreakdown(input: {

  dailyRateUsd: number;
  monthlyRateUsd?: number;
  pricingBasis?: "daily" | "monthly";

  rentalDays: number;

  deliveryRequested: boolean;

  deliveryRoundTripUsd: number;

  insuranceFeeUsd?: number;

  heavySurchargeUsd?: number;

  poundsOverThreshold?: number;

  itemWeightLbs?: number | null;

}): RentalPriceBreakdown {

  const rentalDays = Math.max(1, Math.round(input.rentalDays));

  const dailyRateUsd = Math.max(0, input.dailyRateUsd);
  const monthlyRateUsd = Math.max(0, input.monthlyRateUsd ?? 0);
  const pricingBasis: "daily" | "monthly" = input.pricingBasis ?? "daily";
  const monthsEquivalent =
    pricingBasis === "monthly" ? Math.max(1, rentalDays / 30) : undefined;

  const rentalSubtotalUsd =
    pricingBasis === "monthly" && monthlyRateUsd > 0
      ? roundUsd(monthlyRateUsd * (monthsEquivalent ?? rentalDays / 30))
      : roundUsd(dailyRateUsd * rentalDays);

  const deliveryRoundTripUsd =

    input.deliveryRequested && input.deliveryRoundTripUsd > 0

      ? roundUsd(input.deliveryRoundTripUsd)

      : 0;

  const heavySurchargeUsd =

    input.deliveryRequested && (input.heavySurchargeUsd ?? 0) > 0

      ? roundUsd(input.heavySurchargeUsd ?? 0)

      : 0;

  const deliveryFeeUsd =

    deliveryRoundTripUsd > 0 || heavySurchargeUsd > 0

      ? roundUsd(deliveryRoundTripUsd + heavySurchargeUsd)

      : 0;

  const insuranceFeeUsd = roundUsd(Math.max(0, input.insuranceFeeUsd ?? 0));

  const taxable = rentalSubtotalUsd + deliveryFeeUsd + insuranceFeeUsd;

  const serviceFeeUsd = roundUsd(taxable * DEMO_SERVICE_FEE_RATE);

  const totalUsd = roundUsd(taxable + serviceFeeUsd);



  return {

    rentalDays,

    dailyRateUsd,
    monthlyRateUsd: pricingBasis === "monthly" ? monthlyRateUsd : undefined,
    pricingBasis,
    monthsEquivalent: pricingBasis === "monthly" ? monthsEquivalent : undefined,

    rentalSubtotalUsd,

    deliveryRequested: deliveryFeeUsd > 0,

    deliveryRoundTripUsd,

    heavySurchargeUsd,

    poundsOverThreshold: input.poundsOverThreshold ?? 0,

    itemWeightLbs: input.itemWeightLbs,

    deliveryFeeUsd,

    insuranceFeeUsd,

    serviceFeeUsd,

    totalUsd,

  };

}



export function breakdownForListingBooking(

  listing: ListingDraft,

  options: {

    rentalDays?: number;

    deliveryRequested: boolean;

    insuranceFeeUsd?: number;

  },

): RentalPriceBreakdown {
  const rentalDays = options.rentalDays ?? 2;
  const dailyRateUsd = parseListingDailyRate(listing.pricing.dailyRate);

  const longTermEnabled = Boolean(listing.pricing.longTermEnabled);
  const longTermMonthlyRateRaw = (listing.pricing.longTermMonthlyRate ?? "").trim().replace(/^\$/, "");
  const longTermMonthlyRateUsd = Number.parseFloat(longTermMonthlyRateRaw);
  const hasLongTermMonthlyRate = Number.isFinite(longTermMonthlyRateUsd) && longTermMonthlyRateUsd > 0;

  const useMonthly =
    longTermEnabled &&
    hasLongTermMonthlyRate &&
    rentalDays >= 30;

  const deliveryRoundTripUsd = options.deliveryRequested

    ? resolveListingDeliveryRoundTripUsd(listing)

    : 0;

  const heavy =

    options.deliveryRequested && listing.handoff.itemHeavy

      ? computeHeavySurchargeUsd({

          itemHeavy: true,

          itemWeightLbs: listing.handoff.itemWeightLbs,

        })

      : {

          surchargeUsd: 0,

          poundsOverThreshold: 0,

          weightLbs: null as number | null,

        };



  return computeRentalPriceBreakdown({

    dailyRateUsd: dailyRateUsd > 0 ? dailyRateUsd : 35,
    monthlyRateUsd: useMonthly ? longTermMonthlyRateUsd : undefined,
    pricingBasis: useMonthly ? "monthly" : "daily",

    rentalDays,

    deliveryRequested: options.deliveryRequested,

    deliveryRoundTripUsd,

    insuranceFeeUsd: options.insuranceFeeUsd,

    heavySurchargeUsd: heavy.surchargeUsd,

    poundsOverThreshold: heavy.poundsOverThreshold,

    itemWeightLbs: listing.handoff.itemHeavy ? heavy.weightLbs : null,

  });

}



function roundUsd(value: number): number {

  return Math.round(value * 100) / 100;

}



export function formatUsd(amount: number): string {

  return Number.isInteger(amount) ? String(amount) : amount.toFixed(2);

}



export function deliverySummaryForListing(listing: ListingDraft): string | null {

  if (!listingOffersDelivery(listing)) return null;

  const miles = listing.handoff.deliveryMaxMiles ?? 20;

  const fee = formatDeliveryFee(resolveListingDeliveryRoundTripUsd(listing));

  return `Round-trip delivery up to ${miles} mi · $${fee}`;

}


