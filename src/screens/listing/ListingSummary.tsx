import { useMemo, useState } from "react";
import { ArrowLeft, Pencil } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ListingDraft, MinimumRentalPeriod } from "./types";
import { getPublishedListingById, updatePublishedListing } from "../../lib/listingStorage";
import { getListingDisplayTitle } from "../../lib/listingQr";

const PRIMARY_GREEN = "#0D5C3A";
const BORDER = "#E8E6E0";
const BACKGROUND = "#F9FAFB";

type QuickEditKey =
  | "title"
  | "description"
  | "dailyRate"
  | "minimumPeriod"
  | "weight"
  | "deliveryMaxMiles"
  | "deliveryRoundTripFee"
  | "availabilityTimes";

type QuickEditConfig = {
  key: QuickEditKey;
  label: string;
  value: (listing: ListingDraft) => string;
  renderEditor: (args: {
    listing: ListingDraft;
    value: string;
    setValue: (next: string) => void;
  }) => JSX.Element;
  save: (args: { listingId: string; value: string; listing: ListingDraft }) => string | null;
};

function formatMoney(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "—";
  return trimmed.startsWith("$") ? trimmed : `$${trimmed}`;
}

function parseNonNegativeNumber(raw: string): { ok: true; value: number } | { ok: false; message: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: false, message: "Enter a number." };
  const next = Number(trimmed);
  if (!Number.isFinite(next)) return { ok: false, message: "Enter a valid number." };
  if (next < 0) return { ok: false, message: "Must be 0 or more." };
  return { ok: true, value: next };
}

function Row({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: string;
  onEdit?: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border bg-white p-4" style={{ borderColor: BORDER }}>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-500">{label}</p>
        <p className="mt-1 break-words text-sm font-semibold text-gray-900">{value || "—"}</p>
      </div>
      {onEdit ? (
        <button
          type="button"
          onClick={onEdit}
          className="shrink-0 rounded-full p-2 transition-colors hover:bg-[#F3F4F6]"
          aria-label={`Edit ${label}`}
        >
          <Pencil className="h-4 w-4" style={{ color: PRIMARY_GREEN }} />
        </button>
      ) : null}
    </div>
  );
}

function ModalShell({
  title,
  children,
  onCancel,
  onSave,
  saveDisabled,
}: {
  title: string;
  children: React.ReactNode;
  onCancel: () => void;
  onSave: () => void;
  saveDisabled?: boolean;
}) {
  return (
    <AnimatePresence>
      <motion.div
        className="absolute inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-4 pt-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          role="dialog"
          aria-modal="true"
          className="w-full max-w-[390px] overflow-hidden rounded-3xl bg-white shadow-2xl"
          initial={{ y: 18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 18, opacity: 0 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="border-b px-5 pb-4 pt-5" style={{ borderColor: BORDER }}>
            <p className="text-[15px] font-extrabold" style={{ color: PRIMARY_GREEN }}>
              {title}
            </p>
          </div>
          <div className="px-5 py-4">{children}</div>
          <div className="flex gap-3 border-t px-5 py-4" style={{ borderColor: BORDER }}>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-xl border border-[#E5E7EB] py-3 text-sm font-semibold text-[#374151]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={saveDisabled}
              className="flex-1 rounded-xl py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              style={{ backgroundColor: PRIMARY_GREEN }}
            >
              Save
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function ListingSummary({
  listingId,
  onBack,
}: {
  listingId: string;
  onBack: () => void;
}) {
  const [version, setVersion] = useState(0);
  const listing = useMemo(() => getPublishedListingById(listingId), [listingId, version]);
  const [activeEdit, setActiveEdit] = useState<QuickEditKey | null>(null);
  const [draftValue, setDraftValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const quickEdits: QuickEditConfig[] = useMemo(
    () => [
      {
        key: "title",
        label: "Title",
        value: (l) => getListingDisplayTitle(l.title),
        renderEditor: ({ value, setValue }) => (
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-[#0D5C3A]/20"
            placeholder="e.g. Snowboard, Camera, Ladder"
            autoFocus
          />
        ),
        save: ({ listingId, value }) => {
          const next = value.trim();
          if (!next) return "Title is required.";
          updatePublishedListing(listingId, { title: next });
          return null;
        },
      },
      {
        key: "description",
        label: "Description",
        value: (l) => l.description.trim(),
        renderEditor: ({ value, setValue }) => (
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="min-h-[120px] w-full resize-none rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-[#0D5C3A]/20"
            placeholder="What should a renter know? What's included? Any tips?"
            autoFocus
          />
        ),
        save: ({ listingId, value }) => {
          updatePublishedListing(listingId, { description: value.trim() });
          return null;
        },
      },
      {
        key: "dailyRate",
        label: "Daily price",
        value: (l) => formatMoney(l.pricing.dailyRate),
        renderEditor: ({ value, setValue }) => (
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            inputMode="decimal"
            className="w-full rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-[#0D5C3A]/20"
            placeholder="e.g. 25"
            autoFocus
          />
        ),
        save: ({ listingId, value }) => {
          const raw = value.replace(/^\$/, "").trim();
          if (!raw) return "Daily price is required.";
          const parsed = parseNonNegativeNumber(raw);
          if (!parsed.ok) return parsed.message;
          updatePublishedListing(listingId, { pricing: { dailyRate: String(parsed.value) } });
          return null;
        },
      },
      {
        key: "minimumPeriod",
        label: "Minimum rental duration",
        value: (l) => l.pricing.minimumPeriod,
        renderEditor: ({ listing, value, setValue }) => {
          const options: MinimumRentalPeriod[] = ["1 day", "3 days", "1 week", "2 weeks", "1 month"];
          const current = options.includes(value as MinimumRentalPeriod)
            ? (value as MinimumRentalPeriod)
            : listing.pricing.minimumPeriod;
          return (
            <select
              value={current}
              onChange={(e) => setValue(e.target.value)}
              className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-[#0D5C3A]/20"
              autoFocus
            >
              {options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          );
        },
        save: ({ listingId, value, listing }) => {
          const options: MinimumRentalPeriod[] = ["1 day", "3 days", "1 week", "2 weeks", "1 month"];
          const next = options.includes(value as MinimumRentalPeriod)
            ? (value as MinimumRentalPeriod)
            : listing.pricing.minimumPeriod;
          updatePublishedListing(listingId, { pricing: { minimumPeriod: next } });
          return null;
        },
      },
      {
        key: "weight",
        label: "Weight (lbs)",
        value: (l) => (typeof l.handoff.itemWeightLbs === "number" ? `${l.handoff.itemWeightLbs} lbs` : "—"),
        renderEditor: ({ value, setValue }) => (
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            inputMode="decimal"
            className="w-full rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-[#0D5C3A]/20"
            placeholder="e.g. 35"
            autoFocus
          />
        ),
        save: ({ listingId, value }) => {
          const trimmed = value.trim();
          if (!trimmed) {
            updatePublishedListing(listingId, { handoff: { itemWeightLbs: undefined } });
            return null;
          }
          const parsed = parseNonNegativeNumber(trimmed);
          if (!parsed.ok) return parsed.message;
          updatePublishedListing(listingId, { handoff: { itemWeightLbs: Math.round(parsed.value) } });
          return null;
        },
      },
      {
        key: "deliveryMaxMiles",
        label: "Delivery max miles",
        value: (l) => `${l.handoff.deliveryMaxMiles} miles`,
        renderEditor: ({ value, setValue }) => (
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            inputMode="numeric"
            className="w-full rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-[#0D5C3A]/20"
            placeholder="e.g. 20"
            autoFocus
          />
        ),
        save: ({ listingId, value }) => {
          const parsed = parseNonNegativeNumber(value);
          if (!parsed.ok) return parsed.message;
          updatePublishedListing(listingId, { handoff: { deliveryMaxMiles: Math.round(parsed.value) } });
          return null;
        },
      },
      {
        key: "deliveryRoundTripFee",
        label: "Delivery round-trip fee",
        value: (l) => formatMoney(l.handoff.deliveryRoundTripFee),
        renderEditor: ({ value, setValue }) => (
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            inputMode="decimal"
            className="w-full rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-[#0D5C3A]/20"
            placeholder="e.g. 10"
            autoFocus
          />
        ),
        save: ({ listingId, value }) => {
          const raw = value.replace(/^\$/, "").trim();
          if (!raw) {
            updatePublishedListing(listingId, { handoff: { deliveryRoundTripFee: "" } });
            return null;
          }
          const parsed = parseNonNegativeNumber(raw);
          if (!parsed.ok) return parsed.message;
          updatePublishedListing(listingId, { handoff: { deliveryRoundTripFee: String(parsed.value) } });
          return null;
        },
      },
      {
        key: "availabilityTimes",
        label: "Availability times",
        value: (l) => {
          const weekday = `${l.handoff.inPersonTimeStart}–${l.handoff.inPersonTimeEnd}`;
          const weekend = `${l.handoff.inPersonWeekendTimeStart}–${l.handoff.inPersonWeekendTimeEnd}`;
          return `Weekdays: ${weekday} · Weekend: ${weekend}`;
        },
        renderEditor: ({ listing, value, setValue }) => (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-500">
              Enter as: weekdayStart,weekdayEnd,weekendStart,weekendEnd
            </p>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-[#0D5C3A]/20"
              placeholder="09:00,17:00,10:00,14:00"
              autoFocus
            />
            <p className="text-xs text-gray-500">
              Current: {listing.handoff.inPersonTimeStart},{listing.handoff.inPersonTimeEnd},{
                listing.handoff.inPersonWeekendTimeStart
              }
              ,{listing.handoff.inPersonWeekendTimeEnd}
            </p>
          </div>
        ),
        save: ({ listingId, value, listing }) => {
          const parts = value.split(",").map((p) => p.trim());
          if (parts.length !== 4) return "Enter 4 comma-separated times.";
          const [wdStart, wdEnd, weStart, weEnd] = parts;
          const timeRegex = /^\d{2}:\d{2}$/;
          if (![wdStart, wdEnd, weStart, weEnd].every((t) => timeRegex.test(t))) {
            return "Times must be in HH:MM format (e.g. 09:00).";
          }
          if (
            wdStart === listing.handoff.inPersonTimeStart &&
            wdEnd === listing.handoff.inPersonTimeEnd &&
            weStart === listing.handoff.inPersonWeekendTimeStart &&
            weEnd === listing.handoff.inPersonWeekendTimeEnd
          ) {
            return null;
          }
          updatePublishedListing(listingId, {
            handoff: {
              inPersonTimeStart: wdStart,
              inPersonTimeEnd: wdEnd,
              inPersonWeekendTimeStart: weStart,
              inPersonWeekendTimeEnd: weEnd,
            },
          });
          return null;
        },
      },
    ],
    [],
  );

  if (!listing) {
    return (
      <div className="relative mx-auto flex h-full min-h-0 w-full max-w-[390px] flex-col overflow-hidden" style={{ backgroundColor: BACKGROUND }}>
        <header className="shrink-0 bg-white px-4 pb-3 pt-4">
          <div className="relative flex items-center justify-center">
            <button
              type="button"
              onClick={onBack}
              className="absolute left-0 rounded-full p-2 transition-colors hover:bg-[#F3F4F6]"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" style={{ color: PRIMARY_GREEN }} />
            </button>
            <p className="text-sm font-extrabold" style={{ color: PRIMARY_GREEN }}>
              Listing
            </p>
          </div>
        </header>
        <main className="flex-1 px-4 pt-4">
          <div className="rounded-2xl border bg-white p-5" style={{ borderColor: BORDER }}>
            <p className="text-sm font-semibold text-gray-900">Listing not found.</p>
            <p className="mt-1 text-xs text-gray-500">It may have been removed from local storage.</p>
          </div>
        </main>
      </div>
    );
  }

  const startEdit = (key: QuickEditKey) => {
    const config = quickEdits.find((q) => q.key === key);
    if (!config) return;
    setError(null);
    setActiveEdit(key);
    setDraftValue(config.key === "availabilityTimes"
      ? `${listing.handoff.inPersonTimeStart},${listing.handoff.inPersonTimeEnd},${listing.handoff.inPersonWeekendTimeStart},${listing.handoff.inPersonWeekendTimeEnd}`
      : config.key === "dailyRate"
        ? listing.pricing.dailyRate
        : config.key === "minimumPeriod"
          ? listing.pricing.minimumPeriod
          : config.key === "weight"
            ? (typeof listing.handoff.itemWeightLbs === "number" ? String(listing.handoff.itemWeightLbs) : "")
            : config.key === "deliveryMaxMiles"
              ? String(listing.handoff.deliveryMaxMiles)
              : config.key === "deliveryRoundTripFee"
                ? listing.handoff.deliveryRoundTripFee
                : config.value(listing),
    );
  };

  const activeConfig = activeEdit ? quickEdits.find((q) => q.key === activeEdit) ?? null : null;

  const handleSave = () => {
    if (!activeConfig) return;
    const message = activeConfig.save({ listingId, value: draftValue, listing });
    if (message) {
      setError(message);
      return;
    }
    setActiveEdit(null);
    setError(null);
    setVersion((v) => v + 1);
  };

  return (
    <div className="relative mx-auto flex h-full min-h-0 w-full max-w-[390px] flex-col overflow-hidden" style={{ backgroundColor: BACKGROUND }}>
      <header className="shrink-0 bg-white px-4 pb-3 pt-4">
        <div className="relative flex items-center justify-center">
          <button
            type="button"
            onClick={onBack}
            className="absolute left-0 rounded-full p-2 transition-colors hover:bg-[#F3F4F6]"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" style={{ color: PRIMARY_GREEN }} />
          </button>
          <div className="text-center">
            <p className="text-[12px] font-semibold text-gray-500">Listing summary</p>
            <p className="text-[15px] font-extrabold text-gray-900">{getListingDisplayTitle(listing.title)}</p>
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-4">
        <div className="space-y-2">
          {quickEdits.map((field) => (
            <Row
              key={field.key}
              label={field.label}
              value={field.value(listing)}
              onEdit={() => startEdit(field.key)}
            />
          ))}
          {listing.pricing.longTermEnabled ? (
            <Row
              label="Long-term (30+ days)"
              value={
                listing.pricing.longTermMonthlyRate?.trim()
                  ? `$${listing.pricing.longTermMonthlyRate.trim()}/mo`
                  : "Enabled (rate not set)"
              }
            />
          ) : null}
        </div>
      </main>

      {activeConfig ? (
        <ModalShell
          title={`Edit ${activeConfig.label}`}
          onCancel={() => {
            setActiveEdit(null);
            setError(null);
          }}
          onSave={handleSave}
        >
          {activeConfig.renderEditor({
            listing,
            value: draftValue,
            setValue: setDraftValue,
          })}
          {error ? <p className="mt-2 text-xs font-semibold text-red-600">{error}</p> : null}
        </ModalShell>
      ) : null}
    </div>
  );
}

