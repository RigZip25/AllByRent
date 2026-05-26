import { motion } from "motion/react";
import { RentanoTip } from "../../../components/RentanoTip";
import { createDeliveryPriceRows, type StepProps } from "../types";

const GREEN = "#0D5C3A";

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div>
        <p className="font-semibold text-gray-900">{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
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

export function Step4PickupDelivery({ draft, setDraft }: StepProps) {
  const { handoff } = draft;
  const deliveryRows = createDeliveryPriceRows(handoff.deliveryPrices);

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
          How renters get the item. Hours &amp; days are set in Profile Setup.
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
          <textarea
            value={handoff.contactlessInstructions}
            onChange={(e) =>
              setDraft((c) => ({
                ...c,
                handoff: { ...c.handoff, contactlessInstructions: e.target.value },
              }))
            }
            placeholder="Instructions for contactless pickup"
            rows={3}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-green-700"
          />
        ) : null}
        <ToggleRow
          label="Delivery by distance"
          description="You deliver — set price per mile tier"
          checked={handoff.delivery}
          onChange={(delivery) =>
            setDraft((c) => ({
              ...c,
              handoff: {
                ...c.handoff,
                delivery,
                deliveryPrices: delivery
                  ? createDeliveryPriceRows(c.handoff.deliveryPrices)
                  : [],
              },
            }))
          }
        />
      </div>

      {handoff.delivery ? (
        <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-gray-800">Delivery fee by distance</p>
          <ul className="space-y-2">
            {deliveryRows.map((row, index) => (
              <li key={row.miles} className="flex items-center gap-3">
                <span className="w-20 shrink-0 text-sm text-gray-600">≤ {row.miles} mi</span>
                <span className="text-gray-400">$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={row.price}
                  onChange={(e) => {
                    const price = e.target.value;
                    setDraft((c) => {
                      const next = createDeliveryPriceRows(c.handoff.deliveryPrices);
                      next[index] = { ...next[index], price };
                      return { ...c, handoff: { ...c.handoff, deliveryPrices: next } };
                    });
                  }}
                  placeholder="0"
                  className="min-w-0 flex-1 rounded-lg border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-green-700"
                />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <RentanoTip message="Pick at least one handoff option. Most hosts offer in-person pickup." />
    </motion.div>
  );
}
