import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Pencil, QrCode, Truck } from "lucide-react";
import QRCode from "qrcode";
import { useAuth } from "../../hooks/AuthProvider";
import { canManageListing } from "../../lib/hostAccess";
import {
  addListingToQrBulkQueue,
  clearQrBulkQueue,
  fetchListingByIdRemote,
  getProfileCity,
  getPublishedListingById,
  isListingQueuedForBulk,
  loadQrBulkQueueListingIds,
  removeListingFromQrBulkQueue,
  updatePublishedListingRemote,
  type PublishedListingPatch,
} from "../../lib/listingStorage";
import { resolveHostAccountId } from "../../lib/hostIdentity";
import type { ListingDraft } from "./types";
import { QR_PDF_FILENAMES } from "../../lib/brand";
import { generateQRStickerPdf } from "../../lib/generateQRSticker";
import { getListingDisplayTitle, getListingQrUrl, listingDraftToStickerRow } from "../../lib/listingQr";
import {
  deliverySummaryForListing,
  listingOffersDelivery,
} from "../../lib/rentalPricing";
import type { MinimumRentalPeriod } from "./types";

const GREEN = "#0D5C3A";
const BORDER = "#E8E6E0";

type QuickEditKey =
  | "title"
  | "description"
  | "dailyRate"
  | "minimumPeriod"
  | "weight"
  | "deliveryMaxMiles"
  | "deliveryRoundTripFee"
  | "availabilityTimes";

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

function DetailRow({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: string;
  onEdit?: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-gray-500">{label}</dt>
      <dd className="flex items-start gap-2 text-right font-semibold text-gray-900">
        <span>{value || "—"}</span>
        {onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            className="rounded-full p-1 transition-colors hover:bg-[#F3F4F6]"
            aria-label={`Edit ${label}`}
          >
            <Pencil className="h-4 w-4" style={{ color: GREEN }} />
          </button>
        ) : null}
      </dd>
    </div>
  );
}

export function HostListingDetailScreen({
  listingId,
  onBack,
  onEdit,
}: {
  listingId: string;
  onBack: () => void;
  onEdit: (listingId: string) => void;
}) {
  const auth = useAuth();
  const [version, setVersion] = useState(0);
  const [listing, setListing] = useState<ListingDraft | null>(() => getPublishedListingById(listingId));
  const [loading, setLoading] = useState(() => !getPublishedListingById(listingId));
  const [saveBusy, setSaveBusy] = useState(false);
  const canManage = listing
    ? canManageListing(listing, auth.userId, auth.userEmail)
    : false;
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [bulkCount, setBulkCount] = useState(() => loadQrBulkQueueListingIds().length);
  const [activeEdit, setActiveEdit] = useState<QuickEditKey | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  const queuedForBulk = useMemo(() => isListingQueuedForBulk(listingId), [listingId]);

  useEffect(() => {
    let mounted = true;
    setLoading((current) => current || !getPublishedListingById(listingId));
    void fetchListingByIdRemote(listingId).then((next) => {
      if (!mounted) return;
      setListing(next);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [listingId, version]);

  useEffect(() => {
    if (!listing) return;
    void QRCode.toDataURL(getListingQrUrl(listing.qrToken ?? listing.id), {
      width: 128,
      margin: 1,
      color: { dark: "#0D5C3A", light: "#FFFFFF" },
    }).then(setQrDataUrl);
  }, [listing]);

  const city = getProfileCity();
  const deliverySummary = listing ? deliverySummaryForListing(listing) : null;
  const hasDelivery = listing ? listingOffersDelivery(listing) : false;

  const openEditor = (key: QuickEditKey) => {
    if (!listing) return;
    setEditError(null);
    setActiveEdit(key);
    if (key === "title") setEditValue(listing.title);
    else if (key === "description") setEditValue(listing.description ?? "");
    else if (key === "dailyRate") setEditValue(listing.pricing.dailyRate ?? "");
    else if (key === "minimumPeriod") setEditValue(listing.pricing.minimumPeriod);
    else if (key === "weight") setEditValue(typeof listing.handoff.itemWeightLbs === "number" ? String(listing.handoff.itemWeightLbs) : "");
    else if (key === "deliveryMaxMiles") setEditValue(String(listing.handoff.deliveryMaxMiles ?? 0));
    else if (key === "deliveryRoundTripFee") setEditValue(listing.handoff.deliveryRoundTripFee ?? "");
    else if (key === "availabilityTimes") {
      setEditValue(
        `${listing.handoff.inPersonTimeStart},${listing.handoff.inPersonTimeEnd},${listing.handoff.inPersonWeekendTimeStart},${listing.handoff.inPersonWeekendTimeEnd}`,
      );
    }
  };

  const saveEditor = async () => {
    if (!listing || !activeEdit || saveBusy) return;
    setEditError(null);

    let patch: PublishedListingPatch | null = null;

    if (activeEdit === "title") {
      const next = editValue.trim();
      if (!next) {
        setEditError("Title is required.");
        return;
      }
      patch = { title: next };
    } else if (activeEdit === "description") {
      patch = { description: editValue.trim() };
    } else if (activeEdit === "dailyRate") {
      const raw = editValue.replace(/^\$/, "").trim();
      if (!raw) {
        setEditError("Daily price is required.");
        return;
      }
      const parsed = parseNonNegativeNumber(raw);
      if (!parsed.ok) {
        setEditError(parsed.message);
        return;
      }
      patch = { pricing: { dailyRate: String(parsed.value) } };
    } else if (activeEdit === "minimumPeriod") {
      const allowed: MinimumRentalPeriod[] = ["1 day", "3 days", "1 week", "2 weeks", "1 month"];
      const next = allowed.includes(editValue as MinimumRentalPeriod)
        ? (editValue as MinimumRentalPeriod)
        : listing.pricing.minimumPeriod;
      patch = { pricing: { minimumPeriod: next } };
    } else if (activeEdit === "weight") {
      const trimmed = editValue.trim();
      if (!trimmed) {
        patch = { handoff: { itemWeightLbs: undefined } };
      } else {
        const parsed = parseNonNegativeNumber(trimmed);
        if (!parsed.ok) {
          setEditError(parsed.message);
          return;
        }
        patch = { handoff: { itemWeightLbs: Math.round(parsed.value) } };
      }
    } else if (activeEdit === "deliveryMaxMiles") {
      const parsed = parseNonNegativeNumber(editValue);
      if (!parsed.ok) {
        setEditError(parsed.message);
        return;
      }
      patch = { handoff: { deliveryMaxMiles: Math.round(parsed.value) } };
    } else if (activeEdit === "deliveryRoundTripFee") {
      const raw = editValue.replace(/^\$/, "").trim();
      if (!raw) {
        patch = { handoff: { deliveryRoundTripFee: "" } };
      } else {
        const parsed = parseNonNegativeNumber(raw);
        if (!parsed.ok) {
          setEditError(parsed.message);
          return;
        }
        patch = { handoff: { deliveryRoundTripFee: String(parsed.value) } };
      }
    } else if (activeEdit === "availabilityTimes") {
      const parts = editValue.split(",").map((p) => p.trim());
      if (parts.length !== 4) {
        setEditError("Enter 4 comma-separated times.");
        return;
      }
      const timeRegex = /^\d{2}:\d{2}$/;
      if (!parts.every((p) => timeRegex.test(p))) {
        setEditError("Times must be in HH:MM format (e.g. 09:00).");
        return;
      }
      const [wdStart, wdEnd, weStart, weEnd] = parts;
      patch = {
        handoff: {
          inPersonTimeStart: wdStart,
          inPersonTimeEnd: wdEnd,
          inPersonWeekendTimeStart: weStart,
          inPersonWeekendTimeEnd: weEnd,
        },
      };
    }

    if (!patch) return;

    setSaveBusy(true);
    const ownerId = resolveHostAccountId(auth.userId);
    const result = await updatePublishedListingRemote(listing.id, patch, ownerId);
    setSaveBusy(false);

    if (!result.ok) {
      setEditError(result.reason);
      return;
    }

    setListing(result.listing);
    setActiveEdit(null);
    setEditError(null);
    setVersion((v) => v + 1);
  };

  const runPrintSingle = async () => {
    if (!listing) return;
    setPdfLoading(true);
    setPdfError(null);
    try {
      const row = listingDraftToStickerRow(listing);
      const generated = await generateQRStickerPdf([row], { filename: QR_PDF_FILENAMES.sticker });
      if (!generated) throw new Error("No PDF generated");
      window.open(generated.objectUrl, "_blank", "noopener,noreferrer");
    } catch {
      setPdfError("Could not generate PDF. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  };

  const runPrintBulk = async () => {
    setPdfLoading(true);
    setPdfError(null);
    try {
      const queued = loadQrBulkQueueListingIds();
      if (queued.length === 0) {
        setPdfError("No items in bulk queue yet.");
        return;
      }
      const rows = queued
        .map((id) => getPublishedListingById(id))
        .filter((l): l is NonNullable<typeof l> => Boolean(l))
        .map(listingDraftToStickerRow);
      const generated = await generateQRStickerPdf(rows, { filename: QR_PDF_FILENAMES.stickersBulk });
      if (!generated) throw new Error("No PDF generated");
      window.open(generated.objectUrl, "_blank", "noopener,noreferrer");
    } catch {
      setPdfError("Could not generate PDF. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="screen flex flex-col bg-[#F0F4F2]">
        <header className="shrink-0 bg-white px-4 pb-3 pt-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
          <button type="button" onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-gray-600">
            <ArrowLeft className="h-4 w-4" style={{ color: GREEN }} />
            Back
          </button>
          <h1 className="mt-2 text-[18px] font-extrabold" style={{ color: GREEN }}>
            Listing
          </h1>
        </header>
        <div className="screen-scroll flex-1 px-4 py-6">
          <p className="text-sm text-gray-600">Loading listing…</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="screen flex flex-col bg-[#F0F4F2]">
        <header className="shrink-0 bg-white px-4 pb-3 pt-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
          <button type="button" onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-gray-600">
            <ArrowLeft className="h-4 w-4" style={{ color: GREEN }} />
            Back
          </button>
          <h1 className="mt-2 text-[18px] font-extrabold" style={{ color: GREEN }}>
            Listing
          </h1>
        </header>
        <div className="screen-scroll flex-1 px-4 py-6">
          <p className="text-sm text-gray-600">Listing not found.</p>
        </div>
      </div>
    );
  }

  if (!canManage) {
    return (
      <div className="screen flex flex-col bg-[#F0F4F2]">
        <header className="shrink-0 bg-white px-4 pb-3 pt-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
          <button type="button" onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-gray-600">
            <ArrowLeft className="h-4 w-4" style={{ color: GREEN }} />
            Back
          </button>
          <h1 className="mt-2 text-[18px] font-extrabold" style={{ color: GREEN }}>
            Listing
          </h1>
        </header>
        <div className="screen-scroll flex-1 px-4 py-6">
          <p className="text-sm text-gray-600">
            You do not have permission to manage this listing.
          </p>
        </div>
      </div>
    );
  }

  const availabilityDays =
    listing.handoff.inPersonDays?.length ? listing.handoff.inPersonDays.join(", ") : "Not set";
  const availabilityHours =
    listing.handoff.inPersonTimeStart && listing.handoff.inPersonTimeEnd
      ? `${listing.handoff.inPersonTimeStart}–${listing.handoff.inPersonTimeEnd}`
      : "Not set";
  const weekendHours =
    listing.handoff.inPersonWeekendTimeStart && listing.handoff.inPersonWeekendTimeEnd
      ? `${listing.handoff.inPersonWeekendTimeStart}–${listing.handoff.inPersonWeekendTimeEnd}`
      : "Not set";

  return (
    <div className="screen flex flex-col overflow-hidden bg-[#F0F4F2]">
      <header className="shrink-0 bg-white px-4 pb-3 pt-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div className="flex items-center justify-between gap-2">
          <button type="button" onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-gray-600">
            <ArrowLeft className="h-4 w-4" style={{ color: GREEN }} />
            Back
          </button>
          <button
            type="button"
            onClick={() => onEdit(listing.id)}
            className="inline-flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm font-bold"
            style={{ borderColor: BORDER, color: GREEN }}
          >
            <Pencil className="h-4 w-4" />
            Full edit
          </button>
        </div>
        <h1 className="mt-3 text-[20px] font-extrabold" style={{ color: GREEN }}>
          {getListingDisplayTitle(listing.title)}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          #{listing.id.substring(0, 8).toUpperCase()} · {listing.listingStatus}
        </p>
      </header>

      <div className="screen-scroll flex-1 min-h-0 px-4 pb-6 pt-4">
        <section
          className="sticky top-0 z-10 mb-4 rounded-3xl border bg-white p-4 shadow-sm"
          style={{ borderColor: BORDER }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F9FAFB]">
              {qrDataUrl ? <img src={qrDataUrl} alt="QR code" className="h-14 w-14" /> : <QrCode className="h-10 w-10 text-gray-400" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900">QR for this listing</p>
              <p className="mt-0.5 truncate text-xs text-gray-500">{getListingQrUrl(listing.qrToken ?? listing.id)}</p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => void runPrintSingle()}
              disabled={pdfLoading}
              className="w-full rounded-xl py-3 text-sm font-bold text-white disabled:opacity-50"
              style={{ backgroundColor: GREEN }}
            >
              🖨️ Print this QR
            </button>
            <button
              type="button"
              onClick={() => {
                const next = queuedForBulk ? removeListingFromQrBulkQueue(listing.id) : addListingToQrBulkQueue(listing.id);
                setBulkCount(next);
              }}
              className="w-full rounded-xl border-2 py-3 text-sm font-bold"
              style={{ borderColor: GREEN, color: GREEN }}
            >
              {queuedForBulk ? "Remove from bulk" : "Add to bulk"}
            </button>
            <button
              type="button"
              onClick={() => void runPrintBulk()}
              disabled={pdfLoading || bulkCount === 0}
              className="col-span-2 w-full rounded-xl border-2 py-3 text-sm font-bold disabled:opacity-50"
              style={{ borderColor: GREEN, color: GREEN }}
            >
              🖨️ Bulk print ({bulkCount})
            </button>
          </div>

          {bulkCount > 0 ? (
            <button
              type="button"
              onClick={() => {
                clearQrBulkQueue();
                setBulkCount(0);
              }}
              className="mt-2 w-full text-center text-xs font-semibold underline"
              style={{ color: "#6B7280" }}
            >
              Clear bulk queue
            </button>
          ) : null}

          {pdfError ? <p className="mt-2 text-center text-xs text-red-600">{pdfError}</p> : null}
        </section>

        <section className="rounded-3xl border bg-white p-5" style={{ borderColor: BORDER }}>
          <h2 className="text-[13px] font-bold uppercase tracking-wide text-gray-400">Details</h2>
          <dl className="mt-3 space-y-3 text-sm">
            <DetailRow
              label="Title"
              value={getListingDisplayTitle(listing.title)}
              onEdit={() => openEditor("title")}
            />
            <DetailRow
              label="Terms"
              value={
                listing.description?.trim()
                  ? listing.description.trim().length > 80
                    ? `${listing.description.trim().slice(0, 80)}…`
                    : listing.description.trim()
                  : "—"
              }
              onEdit={() => openEditor("description")}
            />
            <DetailRow
              label="Daily price"
              value={formatMoney(listing.pricing.dailyRate)}
              onEdit={() => openEditor("dailyRate")}
            />
            <DetailRow
              label="Minimum rental"
              value={listing.pricing.minimumPeriod}
              onEdit={() => openEditor("minimumPeriod")}
            />
            {listing.pricing.longTermEnabled ? (
              <DetailRow
                label="Long-term (30+ days)"
                value={
                  listing.pricing.longTermMonthlyRate?.trim()
                    ? `$${listing.pricing.longTermMonthlyRate.trim()}/mo`
                    : "Enabled"
                }
              />
            ) : null}
            <DetailRow label="Category" value={`${listing.category || "—"}${listing.subcategory ? ` · ${listing.subcategory}` : ""}`} />
            <DetailRow label="City" value={city || "—"} />
            <DetailRow label="Availability days" value={availabilityDays} />
            <DetailRow
              label="Availability times"
              value={`Weekdays ${availabilityHours} · Weekend ${weekendHours}`}
              onEdit={() => openEditor("availabilityTimes")}
            />
            <DetailRow
              label="Weight (lbs)"
              value={typeof listing.handoff.itemWeightLbs === "number" ? String(listing.handoff.itemWeightLbs) : "—"}
              onEdit={() => openEditor("weight")}
            />
            <DetailRow
              label="Delivery max miles"
              value={String(listing.handoff.deliveryMaxMiles)}
              onEdit={() => openEditor("deliveryMaxMiles")}
            />
            <DetailRow
              label="Delivery fee"
              value={formatMoney(listing.handoff.deliveryRoundTripFee)}
              onEdit={() => openEditor("deliveryRoundTripFee")}
            />
            <DetailRow
              label="Delivery (summary)"
              value={
                hasDelivery
                  ? `${deliverySummary ?? "Available"}`
                  : "None"
              }
            />
          </dl>
        </section>
      </div>

      {activeEdit ? (
        <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-4 pt-10">
          <div className="w-full max-w-[390px] overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="border-b px-5 pb-4 pt-5" style={{ borderColor: BORDER }}>
              <p className="text-[15px] font-extrabold" style={{ color: GREEN }}>
                Edit {activeEdit === "dailyRate" ? "Daily price" : activeEdit === "minimumPeriod" ? "Minimum rental" : activeEdit}
              </p>
            </div>
            <div className="px-5 py-4">
              {activeEdit === "minimumPeriod" ? (
                <select
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-[#0D5C3A]/20"
                  autoFocus
                >
                  {(["1 day", "3 days", "1 week", "2 weeks", "1 month"] as MinimumRentalPeriod[]).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : activeEdit === "description" ? (
                <textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="min-h-[120px] w-full resize-none rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-[#0D5C3A]/20"
                  placeholder="Describe the item, what's included, and any rules."
                  autoFocus
                />
              ) : (
                <input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  inputMode={activeEdit === "availabilityTimes" ? "text" : "decimal"}
                  className="w-full rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-[#0D5C3A]/20"
                  placeholder={
                    activeEdit === "availabilityTimes"
                      ? "09:00,17:00,10:00,14:00"
                      : activeEdit === "title"
                        ? "Listing title"
                        : "Enter a value"
                  }
                  autoFocus
                />
              )}
              {activeEdit === "availabilityTimes" ? (
                <p className="mt-2 text-xs text-gray-500">
                  Format: weekdayStart,weekdayEnd,weekendStart,weekendEnd (HH:MM).
                </p>
              ) : null}
              {editError ? <p className="mt-2 text-xs font-semibold text-red-600">{editError}</p> : null}
            </div>
            <div className="flex gap-3 border-t px-5 py-4" style={{ borderColor: BORDER }}>
              <button
                type="button"
                onClick={() => {
                  setActiveEdit(null);
                  setEditError(null);
                }}
                className="flex-1 rounded-xl border border-[#E5E7EB] py-3 text-sm font-semibold text-[#374151]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void saveEditor()}
                disabled={saveBusy}
                className="flex-1 rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-60"
                style={{ backgroundColor: GREEN }}
              >
                {saveBusy ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

