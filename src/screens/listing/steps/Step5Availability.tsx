import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { RentanoTip } from "../../../components/RentanoTip";
import type { StepProps } from "../types";

const GREEN = "#0D5C3A";
const AMBER = "#F0B429";

const dateInputClassName =
  "box-border min-w-0 w-full max-w-full rounded-xl border border-gray-200 bg-white px-1.5 py-2 text-center text-sm font-medium text-gray-800 outline-none focus:border-green-700";

function formatBlockedRange(start: string, end: string): string {
  const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const startDate = new Date(`${start}T12:00:00`);
  const endDate = new Date(`${end}T12:00:00`);
  return `${startDate.toLocaleDateString("en-US", options)} – ${endDate.toLocaleDateString("en-US", options)}`;
}

function DateRangeFields({
  start,
  end,
  onStartChange,
  onEndChange,
}: {
  start: string;
  end: string;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
}) {
  return (
    <div className="mx-auto w-full max-w-[260px]">
      <div className="grid grid-cols-2 gap-3">
        <div className="min-w-0">
          <p className="mb-1 text-center text-xs font-medium text-gray-600">Start</p>
          <input
            type="date"
            value={start}
            onChange={(event) => onStartChange(event.target.value)}
            className={dateInputClassName}
          />
        </div>
        <div className="min-w-0">
          <p className="mb-1 text-center text-xs font-medium text-gray-600">End</p>
          <input
            type="date"
            value={end}
            onChange={(event) => onEndChange(event.target.value)}
            className={dateInputClassName}
          />
        </div>
      </div>
    </div>
  );
}

export function Step5Availability({ draft, setDraft }: StepProps) {
  const [showBlockPicker, setShowBlockPicker] = useState(false);
  const [blockStart, setBlockStart] = useState("");
  const [blockEnd, setBlockEnd] = useState("");

  const addBlockedPeriod = () => {
    if (!blockStart || !blockEnd) return;
    setDraft((current) => ({
      ...current,
      blockedDates: [...current.blockedDates, { start: blockStart, end: blockEnd }],
    }));
    setBlockStart("");
    setBlockEnd("");
    setShowBlockPicker(false);
  };

  const removeBlockedPeriod = (index: number) => {
    setDraft((current) => ({
      ...current,
      blockedDates: current.blockedDates.filter((_, i) => i !== index),
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
          Availability
        </h2>
        <p className="mt-1 text-base text-gray-500">
          Pause or block dates when item is unavailable
        </p>
      </div>

      <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-gray-900">Pause listing</p>
            <p className="text-sm text-gray-500">Hide from search instantly</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={draft.paused}
            onClick={() =>
              setDraft((current) => ({ ...current, paused: !current.paused }))
            }
            className="relative h-7 w-12 shrink-0 rounded-full transition-colors"
            style={{ backgroundColor: draft.paused ? AMBER : "#D1D5DB" }}
          >
            <motion.span
              layout
              className="absolute top-0.5 block h-6 w-6 rounded-full bg-white shadow"
              style={{ left: draft.paused ? "22px" : "2px" }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
        </div>
        <AnimatePresence>
          {draft.paused ? (
            <motion.p
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 12 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="rounded-xl px-3 py-2 text-center text-sm font-semibold text-[#0D5C3A]"
              style={{ backgroundColor: `${AMBER}33` }}
            >
              Listing is paused
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="mb-6">
        <h3 className="text-base font-bold text-gray-900">Block specific dates</h3>
        <p className="mt-0.5 text-sm text-gray-500">Going away? Block those dates.</p>

        {!showBlockPicker ? (
          <button
            type="button"
            onClick={() => setShowBlockPicker(true)}
            className="mt-3 w-full rounded-xl border-2 py-3 text-sm font-semibold transition-colors"
            style={{ borderColor: GREEN, color: GREEN }}
          >
            + Add blocked period
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <DateRangeFields
              start={blockStart}
              end={blockEnd}
              onStartChange={setBlockStart}
              onEndChange={setBlockEnd}
            />
            <button
              type="button"
              onClick={addBlockedPeriod}
              disabled={!blockStart || !blockEnd}
              className="mx-auto mt-3 block w-full max-w-[260px] rounded-xl py-2.5 text-sm font-bold text-white transition-opacity disabled:opacity-50"
              style={{ backgroundColor: GREEN }}
            >
              Block this period
            </button>
            <button
              type="button"
              onClick={() => {
                setShowBlockPicker(false);
                setBlockStart("");
                setBlockEnd("");
              }}
              className="mt-2 w-full text-center text-sm font-medium text-gray-500 underline"
            >
              Cancel
            </button>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {draft.blockedDates.length > 0 ? (
            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 space-y-2"
            >
              {draft.blockedDates.map((period, index) => (
                <motion.li
                  key={`${period.start}-${period.end}-${index}`}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 8, height: 0 }}
                  className="flex items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5"
                >
                  <span className="text-sm font-medium text-gray-800">
                    {formatBlockedRange(period.start, period.end)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeBlockedPeriod(index)}
                    className="shrink-0 text-sm font-semibold text-red-600"
                  >
                    Remove
                  </button>
                </motion.li>
              ))}
            </motion.ul>
          ) : null}
        </AnimatePresence>
      </div>

      <RentanoTip
        message="Block dates you're away — everything else stays open for bookings."
      />
    </motion.div>
  );
}
