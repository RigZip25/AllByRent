import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Pause, Pencil, Play, QrCode, Trash2 } from "lucide-react";
import QRCode from "qrcode";
import { useAuth } from "../../hooks/AuthProvider";
import { canManageListing } from "../../lib/hostAccess";
import {
  addListingToQrBulkQueue,
  clearQrBulkQueue,
  claimListingOwnershipIfUnassigned,
  fetchListingByIdRemote,
  getProfileCity,
  getPublishedListingById,
  isListingQueuedForBulk,
  loadQrBulkQueueListingIds,
  removeListingFromQrBulkQueue,
  removePublishedListing,
  removePublishedListingRemote,
  updatePublishedListingRemote,
  type PublishedListingPatch,
} from "../../lib/listingStorage";
import { resolveHostAccountId } from "../../lib/hostIdentity";
import type { ListingDraft } from "./types";
import { QR_PDF_FILENAMES } from "../../lib/brand";
import { generateQRStickerPdf, presentGeneratedPdf } from "../../lib/generateQRSticker";
import { getListingDisplayTitle, getListingPublicUrl, listingDraftToStickerRow, listingRequiresQrSticker } from "../../lib/listingQr";
import { ShowListingQrOverlay } from "../../components/listings/ShowListingQrOverlay";
import {
  deliverySummaryForListing,
  listingOffersDelivery,
} from "../../lib/rentalPricing";
import {
  distanceInputFromMiles,
  formatDistanceFromMiles,
  formatWeightFromLbs,
  milesFromDistanceInput,
} from "../../lib/regionalDisplay";
import type { MinimumRentalPeriod } from "./types";
import { localizeCategoryLabel } from "../../lib/i18n/categoryLabels";
import { useMessages } from "../../lib/i18n/react";
import type { AppMessages } from "../../lib/i18n/types";
import { AvailabilityCalendar } from "../../components/availability/AvailabilityCalendar";
import { CategoryFactCard } from "../../components/CategoryFactCard";
import {
  fetchListingBusyIntervals,
  type BusyInterval,
} from "../../lib/availabilityBusy";
import {
  listingProRentersOnly,
  listingRequiresCdl,
  listingRequiresPhysicalDamage,
  listingIsCommercialTransport,
  listingIsCommercialTransportShelf,
} from "../../lib/listingRentRules";
import {
  listingIsCarSeat,
  listingRequiresBoaterLicense,
  listingRequiresGuestStartId,
  listingRequiresOperatorCredential,
  listingRequiresDroneCert,
  listingRequiresDriverRecordAttestation,
} from "../../lib/categoryTrustRules";
import { listingRequiresCoiHostConfirm } from "../../lib/listingInsurance";

const GREEN = "#0D5C3A";
const BORDER = "#E8E6E0";

function HostListingOccupancyCalendar({ listing }: { listing: ListingDraft }) {
  const [busy, setBusy] = useState<BusyInterval[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    void fetchListingBusyIntervals(listing.id, listing.blockedDates).then((result) => {
      if (!mounted) return;
      setBusy(result.intervals);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [listing.id, listing.blockedDates]);

  return <AvailabilityCalendar busyIntervals={busy} readOnly loading={loading} />;
}

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

function parseNonNegativeNumber(
  raw: string,
  copy: AppMessages["hostListing"],
): { ok: true; value: number } | { ok: false; message: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: false, message: copy.enterNumber };
  const next = Number(trimmed);
  if (!Number.isFinite(next)) return { ok: false, message: copy.enterValidNumber };
  if (next < 0) return { ok: false, message: copy.mustBeZeroOrMore };
  return { ok: true, value: next };
}

function DetailRow({
  label,
  value,
  onEdit,
  editAria,
}: {
  label: string;
  value: string;
  onEdit?: () => void;
  editAria: (label: string) => string;
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
            aria-label={editAria(label)}
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
  onDeleted,
}: {
  listingId: string;
  onBack: () => void;
  onEdit: (listingId: string) => void;
  /** Called after a successful delete so the host returns to My Garage. */
  onDeleted?: () => void;
}) {
  const { hostListing: t, booking } = useMessages();
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
  const [showOnScreenOpen, setShowOnScreenOpen] = useState(false);
  const [activeEdit, setActiveEdit] = useState<QuickEditKey | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const queuedForBulk = useMemo(() => isListingQueuedForBulk(listingId), [listingId]);

  useEffect(() => {
    let mounted = true;
    setLoading((current) => current || !getPublishedListingById(listingId));
    void fetchListingByIdRemote(listingId).then(async (next) => {
      if (!mounted) return;
      if (next && !next.hostId?.trim() && auth.userId) {
        const claimed = await claimListingOwnershipIfUnassigned(
          listingId,
          resolveHostAccountId(auth.userId),
        );
        setListing(claimed ?? next);
      } else {
        setListing(next);
      }
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [auth.userId, listingId, version]);

  useEffect(() => {
    if (!listing) return;
    void QRCode.toDataURL(getListingPublicUrl(listing), {
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
    else if (key === "deliveryMaxMiles")
      setEditValue(String(distanceInputFromMiles(listing.handoff.deliveryMaxMiles ?? 0)));
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
        setEditError(t.titleRequired);
        return;
      }
      patch = { title: next };
    } else if (activeEdit === "description") {
      patch = { description: editValue.trim() };
    } else if (activeEdit === "dailyRate") {
      const raw = editValue.replace(/^\$/, "").trim();
      if (!raw) {
        setEditError(t.dailyPriceRequired);
        return;
      }
      const parsed = parseNonNegativeNumber(raw, t);
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
        const parsed = parseNonNegativeNumber(trimmed, t);
        if (!parsed.ok) {
          setEditError(parsed.message);
          return;
        }
        patch = { handoff: { itemWeightLbs: Math.round(parsed.value) } };
      }
    } else if (activeEdit === "deliveryMaxMiles") {
      const parsed = parseNonNegativeNumber(editValue, t);
      if (!parsed.ok) {
        setEditError(parsed.message);
        return;
      }
      patch = { handoff: { deliveryMaxMiles: milesFromDistanceInput(parsed.value) } };
    } else if (activeEdit === "deliveryRoundTripFee") {
      const raw = editValue.replace(/^\$/, "").trim();
      if (!raw) {
        patch = { handoff: { deliveryRoundTripFee: "" } };
      } else {
        const parsed = parseNonNegativeNumber(raw, t);
        if (!parsed.ok) {
          setEditError(parsed.message);
          return;
        }
        patch = { handoff: { deliveryRoundTripFee: String(parsed.value) } };
      }
    } else if (activeEdit === "availabilityTimes") {
      const parts = editValue.split(",").map((p) => p.trim());
      if (parts.length !== 4) {
        setEditError(t.timesFormatError);
        return;
      }
      const timeRegex = /^\d{2}:\d{2}$/;
      if (!parts.every((p) => timeRegex.test(p))) {
        setEditError(t.timesHhMmError);
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
      await presentGeneratedPdf(generated, { preferOpen: true });
    } catch {
      setPdfError(t.errorPdfGenerate);
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
        setPdfError(t.errorNoBulkItems);
        return;
      }
      const rows = queued
        .map((id) => getPublishedListingById(id))
        .filter((l): l is NonNullable<typeof l> => Boolean(l))
        .map(listingDraftToStickerRow);
      const generated = await generateQRStickerPdf(rows, { filename: QR_PDF_FILENAMES.stickersBulk });
      if (!generated) throw new Error("No PDF generated");
      await presentGeneratedPdf(generated, { preferOpen: true });
    } catch {
      setPdfError(t.errorPdfGenerate);
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
            {t.back}
          </button>
          <h1 className="mt-2 text-[18px] font-extrabold" style={{ color: GREEN }}>
            {t.listingTitle}
          </h1>
        </header>
        <div className="screen-scroll flex-1 px-4 py-6">
          <p className="text-sm text-gray-600">{t.loading}</p>
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
            {t.back}
          </button>
          <h1 className="mt-2 text-[18px] font-extrabold" style={{ color: GREEN }}>
            {t.listingTitle}
          </h1>
        </header>
        <div className="screen-scroll flex-1 px-4 py-6">
          <p className="text-sm text-gray-600">{t.notFound}</p>
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
            {t.back}
          </button>
          <h1 className="mt-2 text-[18px] font-extrabold" style={{ color: GREEN }}>
            {t.listingTitle}
          </h1>
        </header>
        <div className="screen-scroll flex-1 px-4 py-6">
          <p className="text-sm text-gray-600">
            {t.noPermission}
          </p>
        </div>
      </div>
    );
  }

  const runDelete = () => {
    const ownerId = resolveHostAccountId(auth.userId);
    if (saveBusy) return;
    setSaveBusy(true);
    setActionError(null);
    const finish = () => {
      onDeleted?.();
      if (!onDeleted) onBack();
    };
    if (ownerId) {
      void removePublishedListingRemote(listing!.id, ownerId)
        .then(finish)
        .catch(() => {
          setActionError(t.deleteFailed);
          setConfirmDelete(false);
        })
        .finally(() => setSaveBusy(false));
      return;
    }
    removePublishedListing(listing!.id);
    setSaveBusy(false);
    finish();
  };

  const availabilityDays =
    listing.handoff.inPersonDays?.length ? listing.handoff.inPersonDays.join(", ") : t.notSet;
  const availabilityHours =
    listing.handoff.inPersonTimeStart && listing.handoff.inPersonTimeEnd
      ? `${listing.handoff.inPersonTimeStart}–${listing.handoff.inPersonTimeEnd}`
      : t.notSet;
  const weekendHours =
    listing.handoff.inPersonWeekendTimeStart && listing.handoff.inPersonWeekendTimeEnd
      ? `${listing.handoff.inPersonWeekendTimeStart}–${listing.handoff.inPersonWeekendTimeEnd}`
      : t.notSet;

  const editFieldLabel =
    activeEdit === "dailyRate"
      ? t.editDailyPrice
      : activeEdit === "minimumPeriod"
        ? t.editMinimumRental
        : activeEdit === "description"
          ? t.labelDescription
          : activeEdit === "title"
            ? t.labelTitle
            : activeEdit ?? "";

  return (
    <div className="screen flex flex-col overflow-hidden bg-[#F0F4F2]">
      <header className="shrink-0 bg-white px-4 pb-3 pt-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div className="flex items-center justify-between gap-2">
          <button type="button" onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-gray-600">
            <ArrowLeft className="h-4 w-4" style={{ color: GREEN }} />
            {t.back}
          </button>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              disabled={saveBusy}
              onClick={() => {
                setActionError(null);
                setConfirmDelete(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-bold text-red-700 disabled:opacity-50"
              style={{ borderColor: "#FECACA", backgroundColor: "#FEF2F2" }}
              aria-label={t.deleteListing}
            >
              <Trash2 className="h-4 w-4" />
              {t.deleteListing}
            </button>
            <button
              type="button"
              onClick={() => onEdit(listing.id)}
              className="inline-flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm font-bold"
              style={{ borderColor: BORDER, color: GREEN }}
            >
              <Pencil className="h-4 w-4" />
              {t.fullEdit}
            </button>
          </div>
        </div>
        {confirmDelete ? (
          <div
            className="mt-3 rounded-2xl border p-3"
            style={{ borderColor: "#FECACA", backgroundColor: "#FEF2F2" }}
          >
            <p className="text-[13px] font-semibold text-red-800">{t.deleteConfirm}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={saveBusy}
                onClick={() => setConfirmDelete(false)}
                className="rounded-xl border bg-white py-2.5 text-sm font-bold text-gray-700"
                style={{ borderColor: BORDER }}
              >
                {t.cancel}
              </button>
              <button
                type="button"
                disabled={saveBusy}
                onClick={runDelete}
                className="rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white disabled:opacity-50"
              >
                {saveBusy ? t.deleting : t.yesDelete}
              </button>
            </div>
            {actionError ? <p className="mt-2 text-center text-xs text-red-600">{actionError}</p> : null}
          </div>
        ) : null}
        <h1 className="mt-3 text-[20px] font-extrabold" style={{ color: GREEN }}>
          {getListingDisplayTitle(listing.title)}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          #{listing.id.substring(0, 8).toUpperCase()} ·{" "}
          {listing.paused ? t.statusPaused : listing.listingStatus}
        </p>
      </header>

      <div className="screen-scroll flex-1 min-h-0 px-4 pb-6 pt-4">
        {listing.category.trim() === "Vehicles" ? (
          <CategoryFactCard
            category="Vehicles"
            subcategory={listing.subcategory}
            commercialTransport={listingIsCommercialTransportShelf(listing)}
            className="mb-4"
          />
        ) : null}
        {listing.category.trim() === "Heavy Equipment" ||
        listing.category.trim() === "Construction" ? (
          <CategoryFactCard
            category={listing.category.trim()}
            subcategory={listing.subcategory}
            className="mb-4"
          />
        ) : null}
        {listing.category.trim() === "Boats & Water" ? (
          <CategoryFactCard category="Boats & Water" className="mb-4" />
        ) : null}
        {listing.category.trim() === "Real Estate" ? (
          <CategoryFactCard
            category="Real Estate"
            subcategory={listing.subcategory}
            className="mb-4"
          />
        ) : null}
        {listing.category.trim() === "Photo & Video" ||
        listing.category.trim() === "Drones" ||
        listing.subcategory.trim() === "Drones" ? (
          <CategoryFactCard
            category="Photo & Video"
            subcategory={
              listing.subcategory.trim() === "Drones" || listing.category.trim() === "Drones"
                ? "Drones"
                : listing.subcategory
            }
            className="mb-4"
          />
        ) : null}
        {listing.category.trim() === "Baby & Kids" ? (
          <CategoryFactCard
            category="Baby & Kids"
            subcategory={listing.subcategory}
            className="mb-4"
          />
        ) : null}
        {listing.category.trim() === "Electronics & Tech" ? (
          <CategoryFactCard
            category="Electronics & Tech"
            subcategory={listing.subcategory}
            className="mb-4"
          />
        ) : null}
        {listing.category.trim() === "Gym & Fitness" ? (
          <CategoryFactCard
            category="Gym & Fitness"
            subcategory={listing.subcategory}
            className="mb-4"
          />
        ) : null}
        {listing.category.trim() === "Sports & Recreation" ? (
          <CategoryFactCard category="Sports & Recreation" className="mb-4" />
        ) : null}
        {listing.category.trim() === "Outdoor & Camping" ? (
          <CategoryFactCard
            category="Outdoor & Camping"
            subcategory={listing.subcategory}
            className="mb-4"
          />
        ) : null}
        {listing.category.trim() === "Bikes & Scooters" ? (
          <CategoryFactCard category="Bikes & Scooters" className="mb-4" />
        ) : null}
        {listing.category.trim() === "Party & Events" ? (
          <CategoryFactCard
            category="Party & Events"
            subcategory={listing.subcategory}
            className="mb-4"
          />
        ) : null}
        {listing.category.trim() === "Office & Business" ? (
          <CategoryFactCard
            category="Office & Business"
            subcategory={listing.subcategory}
            className="mb-4"
          />
        ) : null}
        {listing.category.trim() === "Music & Audio" ? (
          <CategoryFactCard
            category="Music & Audio"
            subcategory={listing.subcategory}
            className="mb-4"
          />
        ) : null}
        {listing.category.trim() === "Tools & DIY" ? (
          <CategoryFactCard category="Tools & DIY" className="mb-4" />
        ) : null}
        {listing.category.trim() === "Garden & Yard" ? (
          <CategoryFactCard
            category="Garden & Yard"
            subcategory={listing.subcategory}
            className="mb-4"
          />
        ) : null}
        {listing.category.trim() === "Home & Kitchen" ? (
          <CategoryFactCard
            category="Home & Kitchen"
            subcategory={listing.subcategory}
            className="mb-4"
          />
        ) : null}
        {listing.category.trim() === "Costume & Cosplay" ? (
          <CategoryFactCard
            category="Costume & Cosplay"
            subcategory={listing.subcategory}
            className="mb-4"
          />
        ) : null}
        {listing.modes.rent &&
        (listingProRentersOnly(listing) ||
          listingRequiresPhysicalDamage(listing) ||
          listingRequiresCdl(listing) ||
          listingRequiresOperatorCredential(listing) ||
          listingRequiresBoaterLicense(listing) ||
          listingRequiresDroneCert(listing) ||
          listingIsCarSeat(listing) ||
          listingRequiresGuestStartId(listing) ||
          listingIsCommercialTransport(listing) ||
          listingRequiresDriverRecordAttestation(listing) ||
          listingRequiresCoiHostConfirm(listing)) ? (
          <div className="mb-4 flex flex-wrap gap-2">
            {listingProRentersOnly(listing) ? (
              <span className="rounded-md border border-sky-200 bg-sky-50 px-2 py-1 text-[11px] font-semibold text-sky-950">
                {booking.proBadge}
              </span>
            ) : null}
            {listingRequiresPhysicalDamage(listing) ? (
              <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-950">
                {booking.physicalDamageBadge}
              </span>
            ) : null}
            {listingRequiresCdl(listing) ? (
              <span className="rounded-md border border-indigo-200 bg-indigo-50 px-2 py-1 text-[11px] font-semibold text-indigo-950">
                {booking.cdlBadge}
              </span>
            ) : null}
            {listingRequiresOperatorCredential(listing) ? (
              <span className="rounded-md border border-orange-200 bg-orange-50 px-2 py-1 text-[11px] font-semibold text-orange-950">
                {booking.operatorCertBadge}
              </span>
            ) : null}
            {listingRequiresBoaterLicense(listing) ? (
              <span className="rounded-md border border-cyan-200 bg-cyan-50 px-2 py-1 text-[11px] font-semibold text-cyan-950">
                {booking.boaterLicenseBadge}
              </span>
            ) : null}
            {listingRequiresDroneCert(listing) ? (
              <span className="rounded-md border border-violet-200 bg-violet-50 px-2 py-1 text-[11px] font-semibold text-violet-950">
                {booking.droneCertBadge}
              </span>
            ) : null}
            {listingIsCarSeat(listing) ? (
              <span className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-950">
                {booking.carSeatSafetyBadge}
              </span>
            ) : null}
            {listingRequiresGuestStartId(listing) ? (
              <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-950">
                {booking.guestIdBadge}
              </span>
            ) : null}
            {listingIsCommercialTransport(listing) ? (
              <span className="rounded-md border border-violet-200 bg-violet-50 px-2 py-1 text-[11px] font-semibold text-violet-950">
                {booking.commercialTransportBadge}
              </span>
            ) : null}
            {listingRequiresDriverRecordAttestation(listing) ? (
              <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-950">
                {booking.driverRecordBadge}
              </span>
            ) : null}
            {listingRequiresCoiHostConfirm(listing) ? (
              <span className="rounded-md border border-orange-200 bg-orange-50 px-2 py-1 text-[11px] font-semibold text-orange-950">
                {booking.coiStructuredBadge}
              </span>
            ) : null}
          </div>
        ) : null}
        {listingRequiresQrSticker(listing.modes) ? (
        <section
          className="mb-4 rounded-3xl border bg-white p-4 shadow-sm"
          style={{ borderColor: BORDER }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F9FAFB]">
              {qrDataUrl ? <img src={qrDataUrl} alt={t.qrAlt} className="h-14 w-14" /> : <QrCode className="h-10 w-10 text-gray-400" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900">{t.qrForListing}</p>
              <p className="mt-0.5 text-xs text-gray-500">{t.showOnScreenHint}</p>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            <button
              type="button"
              onClick={() => setShowOnScreenOpen(true)}
              className="w-full rounded-xl py-3 text-sm font-bold text-white"
              style={{ backgroundColor: GREEN }}
            >
              {t.showOnScreen}
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => void runPrintSingle()}
                disabled={pdfLoading}
                className="w-full rounded-xl border-2 py-3 text-sm font-bold disabled:opacity-50"
                style={{ borderColor: GREEN, color: GREEN }}
              >
                {t.printThisQr}
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
                {queuedForBulk ? t.removeFromBulk : t.addToBulk}
              </button>
              <button
                type="button"
                onClick={() => void runPrintBulk()}
                disabled={pdfLoading || bulkCount === 0}
                className="col-span-2 w-full rounded-xl border-2 py-3 text-sm font-bold disabled:opacity-50"
                style={{ borderColor: GREEN, color: GREEN }}
              >
                {t.bulkPrint(bulkCount)}
              </button>
            </div>
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
              {t.clearBulkQueue}
            </button>
          ) : null}

          {pdfError ? <p className="mt-2 text-center text-xs text-red-600">{pdfError}</p> : null}
        </section>
        ) : null}

        <section className="rounded-3xl border bg-white p-5" style={{ borderColor: BORDER }}>
          <h2 className="text-[13px] font-bold uppercase tracking-wide text-gray-400">{t.details}</h2>
          <dl className="mt-3 space-y-3 text-sm">
            <DetailRow
              label={t.labelTitle}
              value={getListingDisplayTitle(listing.title)}
              onEdit={() => openEditor("title")}
              editAria={t.editAria}
            />
            <DetailRow
              label={t.labelDescription}
              value={
                listing.description?.trim()
                  ? listing.description.trim().length > 80
                    ? `${listing.description.trim().slice(0, 80)}…`
                    : listing.description.trim()
                  : "—"
              }
              onEdit={() => openEditor("description")}
              editAria={t.editAria}
            />
            <DetailRow
              label={t.labelDailyPrice}
              value={formatMoney(listing.pricing.dailyRate)}
              onEdit={() => openEditor("dailyRate")}
              editAria={t.editAria}
            />
            <DetailRow
              label={t.labelMinimumRental}
              value={listing.pricing.minimumPeriod}
              onEdit={() => openEditor("minimumPeriod")}
              editAria={t.editAria}
            />
            {listing.pricing.longTermEnabled ? (
              <DetailRow
                label={t.labelLongTerm}
                value={
                  listing.pricing.longTermMonthlyRate?.trim()
                    ? t.longTermMonthly(listing.pricing.longTermMonthlyRate.trim())
                    : t.longTermEnabled
                }
                editAria={t.editAria}
              />
            ) : null}
            <DetailRow
              label={t.labelCategory}
              value={`${listing.category ? localizeCategoryLabel(listing.category) : "—"}${
                listing.subcategory ? ` · ${localizeCategoryLabel(listing.subcategory)}` : ""
              }`}
              editAria={t.editAria}
            />
            <DetailRow label={t.labelCity} value={city || "—"} editAria={t.editAria} />
            <DetailRow label={t.labelAvailabilityDays} value={availabilityDays} editAria={t.editAria} />
            <DetailRow
              label={t.labelAvailabilityTimes}
              value={t.availabilityTimesValue(availabilityHours, weekendHours)}
              onEdit={() => openEditor("availabilityTimes")}
              editAria={t.editAria}
            />
            <DetailRow
              label={t.labelWeight}
              value={
                typeof listing.handoff.itemWeightLbs === "number"
                  ? formatWeightFromLbs(listing.handoff.itemWeightLbs)
                  : "—"
              }
              onEdit={() => openEditor("weight")}
              editAria={t.editAria}
            />
            <DetailRow
              label={t.labelDeliveryMaxMiles}
              value={formatDistanceFromMiles(listing.handoff.deliveryMaxMiles, undefined, {
                plus: false,
              })}
              onEdit={() => openEditor("deliveryMaxMiles")}
              editAria={t.editAria}
            />
            <DetailRow
              label={t.labelDeliveryFee}
              value={formatMoney(listing.handoff.deliveryRoundTripFee)}
              onEdit={() => openEditor("deliveryRoundTripFee")}
              editAria={t.editAria}
            />
            <DetailRow
              label={t.labelDeliverySummary}
              value={
                hasDelivery
                  ? `${deliverySummary ?? t.deliveryAvailable}`
                  : t.deliveryNone
              }
              editAria={t.editAria}
            />
          </dl>
        </section>

        <section className="mt-4 rounded-3xl border bg-white p-5" style={{ borderColor: BORDER }}>
          <h2 className="text-[13px] font-bold uppercase tracking-wide text-gray-400">
            {t.bookingCalendarTitle}
          </h2>
          <p className="mt-1 text-[13px] text-gray-500">{t.bookingCalendarHint}</p>
          <div className="mt-3">
            <HostListingOccupancyCalendar listing={listing} />
          </div>
        </section>

        <section className="mt-4 rounded-3xl border bg-white p-5" style={{ borderColor: BORDER }}>
          <h2 className="text-[13px] font-bold uppercase tracking-wide text-gray-400">{t.manage}</h2>
          <p className="mt-1 text-[13px] text-gray-500">
            {t.manageHint}
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <button
              type="button"
              disabled={saveBusy}
              onClick={() => {
                if (!auth.userId || saveBusy) return;
                setActionError(null);
                setSaveBusy(true);
                const nextPaused = !listing.paused;
                void updatePublishedListingRemote(listing.id, { paused: nextPaused }, auth.userId)
                  .then((result) => {
                    if (!result.ok) {
                      setActionError(result.reason);
                      return;
                    }
                    setListing(result.listing);
                    setVersion((v) => v + 1);
                  })
                  .finally(() => setSaveBusy(false));
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-bold disabled:opacity-50"
              style={{ borderColor: GREEN, color: GREEN }}
            >
              {listing.paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              {listing.paused ? t.unpauseListing : t.pauseListing}
            </button>
            {!confirmDelete ? (
              <button
                type="button"
                disabled={saveBusy}
                onClick={() => {
                  setActionError(null);
                  setConfirmDelete(true);
                }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-bold text-red-700 disabled:opacity-50"
                style={{ borderColor: "#FECACA", backgroundColor: "#FEF2F2" }}
              >
                <Trash2 className="h-4 w-4" />
                {t.deleteListing}
              </button>
            ) : (
              <div className="rounded-2xl border p-3" style={{ borderColor: "#FECACA", backgroundColor: "#FEF2F2" }}>
                <p className="text-[13px] font-semibold text-red-800">
                  {t.deleteConfirm}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={saveBusy}
                    onClick={() => setConfirmDelete(false)}
                    className="rounded-xl border bg-white py-2.5 text-sm font-bold text-gray-700"
                    style={{ borderColor: BORDER }}
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="button"
                    disabled={saveBusy}
                    onClick={runDelete}
                    className="rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                  >
                    {saveBusy ? t.deleting : t.yesDelete}
                  </button>
                </div>
              </div>
            )}
            {actionError && !confirmDelete ? (
              <p className="text-center text-xs text-red-600">{actionError}</p>
            ) : null}
          </div>
        </section>
      </div>

      {activeEdit ? (
        <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-4 pt-10">
          <div className="w-full max-w-[390px] overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="border-b px-5 pb-4 pt-5" style={{ borderColor: BORDER }}>
              <p className="text-[15px] font-extrabold" style={{ color: GREEN }}>
                {t.editTitle(editFieldLabel)}
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
                  placeholder={t.descriptionPlaceholder}
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
                      ? t.placeholderAvailabilityTimes
                      : activeEdit === "title"
                        ? t.placeholderTitle
                        : t.placeholderValue
                  }
                  autoFocus
                />
              )}
              {activeEdit === "availabilityTimes" ? (
                <p className="mt-2 text-xs text-gray-500">
                  {t.availabilityTimesHint}
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
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={() => void saveEditor()}
                disabled={saveBusy}
                className="flex-1 rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-60"
                style={{ backgroundColor: GREEN }}
              >
                {saveBusy ? t.saving : t.save}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {listingRequiresQrSticker(listing.modes) ? (
        <ShowListingQrOverlay
          open={showOnScreenOpen}
          listing={listing}
          onClose={() => setShowOnScreenOpen(false)}
          hint={t.showOnScreenHint}
        />
      ) : null}
    </div>
  );
}
