import { formatUsd, type RentalPriceBreakdown } from "../../lib/rentalPricing";

import { formatPoundsOverLabel } from "../../lib/deliveryPricing";



const GREEN = "#0D5C3A";



function Line({

  label,

  amount,

  muted,

}: {

  label: string;

  amount: number;

  muted?: boolean;

}) {

  return (

    <div className={`flex justify-between gap-3 text-sm ${muted ? "text-gray-500" : "text-gray-800"}`}>

      <span>{label}</span>

      <span className="font-medium tabular-nums">${formatUsd(amount)}</span>

    </div>

  );

}



export function RentalPriceBreakdownView({

  breakdown,

  compact,

}: {

  breakdown: RentalPriceBreakdown;

  compact?: boolean;

}) {

  const heavyLabel =

    breakdown.poundsOverThreshold > 0

      ? `Heavy item surcharge (${formatPoundsOverLabel(breakdown.poundsOverThreshold)})`

      : "Heavy item surcharge";



  return (

    <div

      className={`space-y-2 rounded-xl border border-gray-100 bg-white ${compact ? "p-3" : "p-4 shadow-sm"}`}

    >

      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Price breakdown</p>

      <Line

        label={
          breakdown.pricingBasis === "monthly" && breakdown.monthlyRateUsd
            ? `Rental (${breakdown.rentalDays} days ≈ ${(breakdown.monthsEquivalent ?? breakdown.rentalDays / 30).toFixed(1)} months × $${formatUsd(breakdown.monthlyRateUsd)}/mo)`
            : `Rental (${breakdown.rentalDays} day${breakdown.rentalDays === 1 ? "" : "s"} × $${formatUsd(breakdown.dailyRateUsd)})`
        }

        amount={breakdown.rentalSubtotalUsd}

      />

      {breakdown.deliveryRequested && breakdown.deliveryRoundTripUsd > 0 ? (

        <Line label="Round-trip delivery" amount={breakdown.deliveryRoundTripUsd} />

      ) : null}

      {breakdown.deliveryRequested && breakdown.heavySurchargeUsd > 0 ? (

        <Line label={heavyLabel} amount={breakdown.heavySurchargeUsd} />

      ) : null}

      <Line label="Service fee (demo)" amount={breakdown.serviceFeeUsd} muted />

      <div

        className={`flex justify-between gap-3 border-t border-gray-100 pt-2 font-bold ${compact ? "text-sm" : "text-base"}`}

        style={{ color: GREEN }}

      >

        <span>Total</span>

        <span className="tabular-nums">${formatUsd(breakdown.totalUsd)}</span>

      </div>

    </div>

  );

}


