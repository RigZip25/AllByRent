import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Lock, Shield } from "lucide-react";
import { RentanoHint } from "../../../components/RentanoHint";
import {
  DEFAULT_DELIVERY_MAX_MILES,
  deliveryPriceRowForHandoff,
  DELIVERY_FEE_BASE_USD,
  DELIVERY_FEE_PER_MILE_ROUND_TRIP_USD,
  formatDeliveryFee,
  formatPoundsOverLabel,
  MAX_DELIVERY_RADIUS_MILES,
  parseDeliveryFee,
  ROUND_TRIP_DELIVERY_POLICY_NOTE,
  sanitizeDeliveryMiles,
  suggestDeliveryFeeMiles,
} from "../../../lib/deliveryPricing";
import type { ListingDraft, StepProps } from "../types";

const GREEN = "#0D5C3A";

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div>
        <p className="font-semibold text-gray-900">{label}</p>
        {description ? <p className="text-sm text-gray-500">{description}</p> : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative h-7 w-12 shrink-0 rounded-full transition-colors"
        style={{ backgroundColor: checked ? GREEN : "#D1D5DB" }}
      >
        <span
          className="absolute top-0.5 block h-6 w-6 rounded-full bg-white shadow transition-[left]"
          style={{ left: checked ? "22px" : "2px" }}
        />
      </button>
    </div>
  );
}

function ContactlessPrivacyNotice({ compact }: { compact?: boolean }) {
  return (
    <div
      className={`flex gap-2 rounded-xl border border-amber-200 bg-amber-50 ${
        compact ? "p-2.5" : "p-3"
      }`}
    >
      <Shield
        className={`shrink-0 text-amber-800 ${compact ? "h-4 w-4 mt-0.5" : "h-5 w-5"}`}
        aria-hidden
      />
      <div className={compact ? "text-xs text-amber-950" : "text-sm text-amber-950"}>
        <p className="font-semibold">Two layers of privacy</p>
        <ul className="mt-1 list-disc space-y-1 pl-4 leading-relaxed text-amber-900/90">
          <li>
            Exact address is shared only with your confirmed renter — not on the public
            listing.
          </li>
          <li>
            Step-by-step access instructions and codes unlock at check-in with PIN — not
            before.
          </li>
        </ul>
      </div>
    </div>
  );
}

function normalizeHandoff(handoff: ListingDraft["handoff"]): ListingDraft["handoff"] {
  const weight =
    typeof handoff.itemWeightLbs === "number" &&
    Number.isFinite(handoff.itemWeightLbs) &&
    handoff.itemWeightLbs > 0
      ? Math.round(handoff.itemWeightLbs)
      : undefined;
  return {
    ...handoff,
    itemHeavy: Boolean(handoff.itemHeavy),
    itemWeightLbs: weight,
    delivery: Boolean(handoff.delivery),
    deliveryPrices: Array.isArray(handoff.deliveryPrices) ? handoff.deliveryPrices : [],
    deliveryRoundTripFee:
      typeof handoff.deliveryRoundTripFee === "string" ? handoff.deliveryRoundTripFee : "",
  };
}

function resolveMaxMiles(handoff: ListingDraft["handoff"]): number {
  const normalized = normalizeHandoff(handoff);
  const raw = normalized.deliveryMaxMiles;
  if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) {
    return sanitizeDeliveryMiles(raw);
  }
  const tierMiles = normalized.deliveryPrices
    .map((row) => row?.miles)
    .filter((m): m is number => typeof m === "number" && Number.isFinite(m) && m > 0);
  if (tierMiles.length > 0) {
    return sanitizeDeliveryMiles(Math.max(...tierMiles));
  }
  return DEFAULT_DELIVERY_MAX_MILES;
}

function resolveRoundTripFee(handoff: ListingDraft["handoff"]): string {
  const normalized = normalizeHandoff(handoff);
  const storedFee = normalized.deliveryRoundTripFee?.trim();
  if (storedFee) return storedFee;
  const priced = normalized.deliveryPrices
    .filter(
      (row) =>
        typeof row?.price === "string" && row.price.trim() !== "" && row.price !== "0",
    )
    .sort((a, b) => (b.miles ?? 0) - (a.miles ?? 0));
  return priced[0]?.price?.trim() ?? "";
}

export function Step4PickupDelivery({ draft, setDraft }: StepProps) {
  const handoff = normalizeHandoff(draft.handoff);
  const maxMiles = resolveMaxMiles(handoff);
  const roundTripFee = resolveRoundTripFee(handoff);
  const [estimateOpen, setEstimateOpen] = useState(false);

  const estimate = useMemo(() => {
    return suggestDeliveryFeeMiles(maxMiles, {
      heavyItem: handoff.itemHeavy,
      itemWeightLbs: handoff.itemWeightLbs,
    });
  }, [handoff.itemHeavy, handoff.itemWeightLbs, maxMiles]);

  const parsedFee = useMemo(() => parseDeliveryFee(roundTripFee), [roundTripFee]);

  const applyDeliveryHandoff = (
    nextMaxMiles: number,
    nextFee: string,
    deliveryOn: boolean = handoff.delivery,
  ) => {
    const miles = sanitizeDeliveryMiles(nextMaxMiles);
    const fee = nextFee.trim();
    setDraft((c) => ({
      ...c,
      handoff: {
        ...c.handoff,
        delivery: deliveryOn,
        deliveryMaxMiles: miles,
        deliveryRoundTripFee: fee,
        deliveryPrices: deliveryOn ? deliveryPriceRowForHandoff(miles, fee) : [],
      },
    }));
  };

  return (
    <motion.div
      className="mx-auto w-full max-w-[390px] bg-[#F9FAFB] px-4 pb-8 pt-5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold" style={{ color: GREEN }}>
          Pickup &amp; delivery
        </h2>
        <p className="mt-1 text-base text-gray-500">
          How renters get the item. Set your usual availability in the next step.
        </p>
      </div>

      <div className="space-y-3">
        <ToggleRow
          label="In-person pickup"
          description="Meet renter at your location"
          checked={handoff.inPerson}
          onChange={(inPerson) =>
            setDraft((c) => ({ ...c, handoff: { ...c.handoff, inPerson } }))
          }
        />
        <ToggleRow
          label="Contactless pickup"
          description="Lockbox, porch, garage code, etc."
          checked={handoff.contactless}
          onChange={(contactless) =>
            setDraft((c) => ({ ...c, handoff: { ...c.handoff, contactless } }))
          }
        />
        {handoff.contactless ? (
          <div className="space-y-2">
            <ContactlessPrivacyNotice />
            <textarea
              value={handoff.contactlessInstructions}
              onChange={(e) =>
                setDraft((c) => ({
                  ...c,
                  handoff: { ...c.handoff, contactlessInstructions: e.target.value },
                }))
              }
              placeholder="Access details: lockbox code, gate code, unit #, key location…"
              rows={3}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-green-700"
            />
            <p className="flex items-start gap-1.5 text-xs text-gray-500">
              <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              These access details are not on your public listing. They unlock for your
              confirmed renter at check-in with the pickup PIN — after they already have the
              pickup address.
            </p>
          </div>
        ) : null}
        <ToggleRow
          label="Heavy item (over 50 lb)"
          checked={handoff.itemHeavy}
          onChange={(itemHeavy) =>
            setDraft((c) => ({
              ...c,
              handoff: { ...normalizeHandoff(c.handoff), itemHeavy },
            }))
          }
        />
        {handoff.itemHeavy ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <label className="mb-1 block text-sm font-medium text-gray-800">
              Weight (lbs)
              {handoff.delivery ? (
                <span className="font-normal text-gray-500"> — required for delivery</span>
              ) : null}
            </label>
            <input
              type="number"
              min={1}
              max={2000}
              value={handoff.itemWeightLbs ?? ""}
              onChange={(e) => {
                const raw = e.target.value;
                const parsed = Number.parseInt(raw, 10);
                const itemWeightLbs =
                  raw === "" || !Number.isFinite(parsed) || parsed <= 0
                    ? undefined
                    : parsed;
                setDraft((c) => ({
                  ...c,
                  handoff: { ...normalizeHandoff(c.handoff), itemWeightLbs },
                }));
              }}
              placeholder="e.g. 85"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-green-700"
            />
          </div>
        ) : null}
        <ToggleRow
          label="I can deliver"
          description="Round-trip delivery before start & after end"
          checked={handoff.delivery}
          onChange={(delivery) => {
            if (!delivery) {
              setDraft((c) => ({
                ...c,
                handoff: {
                  ...c.handoff,
                  delivery: false,
                  deliveryPrices: [],
                },
              }));
              return;
            }
            const miles = resolveMaxMiles(handoff);
            const fee = handoff.deliveryRoundTripFee?.trim() || resolveRoundTripFee(handoff);
            applyDeliveryHandoff(miles, fee, true);
          }}
        />
      </div>

      {handoff.delivery ? (
        <div className="mt-4 space-y-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-800">Delivery</p>
          <p className="text-xs leading-relaxed text-gray-500">
            {ROUND_TRIP_DELIVERY_POLICY_NOTE}
          </p>

          <label className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
            <span>Max distance</span>
            <input
              type="number"
              min={1}
              max={MAX_DELIVERY_RADIUS_MILES}
              value={maxMiles}
              onChange={(e) => {
                const miles = Number(e.target.value);
                if (!Number.isFinite(miles)) return;
                applyDeliveryHandoff(miles, roundTripFee, true);
              }}
              className="w-16 rounded-lg border border-gray-200 px-2 py-1.5 text-center text-sm font-semibold outline-none focus:border-green-700"
            />
            <span>miles (round trip)</span>
          </label>

          <div>
            <div className="mb-1 flex items-center justify-between gap-2">
              <label className="block text-sm font-medium text-gray-800">
                Round-trip delivery fee
              </label>
              <button
                type="button"
                onClick={() => setEstimateOpen(true)}
                className="text-xs font-semibold underline"
                style={{ color: GREEN }}
              >
                Estimate
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">$</span>
              <input
                type="text"
                inputMode="decimal"
                value={roundTripFee}
                onChange={(e) => applyDeliveryHandoff(maxMiles, e.target.value, true)}
                placeholder="0"
                className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-green-700"
              />
            </div>
            {parsedFee !== null && parsedFee > 0 ? (
              <p className="mt-1 text-[11px] text-gray-400">
                Using your entered fee (estimate is optional).
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {estimateOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-6 pt-10"
          onClick={() => setEstimateOpen(false)}
        >
          <div
            className="w-full max-w-[390px] rounded-2xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold" style={{ color: GREEN }}>
              Delivery estimate (optional)
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-gray-500">
              This is a demo calculator. Only use it if it matches what you want to charge.
            </p>

            <div className="mt-4 space-y-2 rounded-xl border border-gray-100 bg-[#F9FAFB] p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Base</span>
                <span className="font-semibold text-gray-900">
                  ${formatDeliveryFee(DELIVERY_FEE_BASE_USD)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Per-mile (round trip){" "}
                  <span className="text-gray-400">
                    ${formatDeliveryFee(DELIVERY_FEE_PER_MILE_ROUND_TRIP_USD)} × {maxMiles} mi
                  </span>
                </span>
                <span className="font-semibold text-gray-900">
                  ${formatDeliveryFee(estimate.roundTripUsd - DELIVERY_FEE_BASE_USD)}
                </span>
              </div>
              {handoff.itemHeavy ? (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Heavy item surcharge{" "}
                    {estimate.poundsOverThreshold > 0 ? (
                      <span className="text-gray-400">
                        ({formatPoundsOverLabel(estimate.poundsOverThreshold)})
                      </span>
                    ) : (
                      <span className="text-gray-400">(no surcharge)</span>
                    )}
                  </span>
                  <span className="font-semibold text-gray-900">
                    ${formatDeliveryFee(estimate.heavySurchargeUsd)}
                  </span>
                </div>
              ) : null}
              <div className="mt-1 flex items-center justify-between border-t border-gray-200 pt-2 text-sm">
                <span className="text-gray-700">Suggested total</span>
                <span className="text-lg font-extrabold" style={{ color: GREEN }}>
                  ${formatDeliveryFee(estimate.suggested)}
                </span>
              </div>
              <p className="text-[11px] text-gray-400">{estimate.roundTripNote}</p>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setEstimateOpen(false)}
                className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  applyDeliveryHandoff(maxMiles, formatDeliveryFee(estimate.suggested), true);
                  setEstimateOpen(false);
                }}
                className="flex-1 rounded-xl py-3 text-sm font-bold text-white"
                style={{ backgroundColor: GREEN }}
              >
                Use this price
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <RentanoHint className="mt-5" hint="Pick at least one handoff option." showTapLabel />
    </motion.div>
  );
}
