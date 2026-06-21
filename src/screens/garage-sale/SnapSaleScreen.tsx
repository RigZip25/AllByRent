import { useCallback, useRef, useState } from "react";
import { ArrowLeft, Camera, Gavel, Loader2, ShoppingBag, Tag } from "lucide-react";
import { BRAND_AMBER, BRAND_GREEN, MASCOT_NAME, ONBOARDING } from "../../lib/brand";
import { useAuth } from "../../hooks/AuthProvider";
import { resolveHostAccountId } from "../../lib/hostIdentity";
import { deleteMedia, putMediaBlob, type MediaRef } from "../../lib/mediaStore";
import { useMediaUrl } from "../../lib/useMediaUrl";
import { savePublishedListing, savePublishedListingRemote } from "../../lib/listingStorage";
import { notifyGarageFollowersOfNewListing } from "../../lib/garageFollowNotify";
import { loadUserProfile } from "../../lib/userProfileStorage";
import { applyFrictionlessDefaults } from "../listing/frictionlessDefaults";
import { createInitialListingDraft } from "../listing/types";
import { applyYardSaleListingDefaults } from "../../lib/yardSaleListing";
import {
  defaultAuctionEndsAt,
  defaultStartingBid,
  setGarageSaleOfferPrefs,
  type GarageSaleOfferPrefs,
} from "../../lib/garageSaleOfferStorage";
import type { ShopOfferKind } from "../../lib/garageShopStorage";
import { garageSaleOpenLabel, getGarageSaleSchedule } from "../../lib/garageSaleStorage";

const GREEN = BRAND_GREEN;
const AMBER = BRAND_AMBER;
const BORDER = "#E8E6E0";

const { snapSale: copy } = ONBOARDING;

type SnapSaleScreenProps = {
  onBack: () => void;
  onViewShop: () => void;
};

type PricingMode = ShopOfferKind;

async function createThumbnail(blob: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(blob);
  const maxSize = 420;
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return blob;
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return new Promise((resolve, reject) => {
    canvas.toBlob((thumb) => {
      if (!thumb) reject(new Error("Thumbnail failed"));
      else resolve(thumb);
    }, "image/jpeg", 0.82);
  });
}

function PhotoPreview({ photo }: { photo: MediaRef }) {
  const thumb = photo.thumbId ? { ...photo, id: photo.thumbId } : photo;
  const { url } = useMediaUrl(thumb);
  if (!url) {
    return <div className="flex h-full w-full items-center justify-center text-4xl text-amber-200">📷</div>;
  }
  return <img src={url} alt="" className="h-full w-full object-cover" draggable={false} />;
}

export function SnapSaleScreen({ onBack, onViewShop }: SnapSaleScreenProps) {
  const auth = useAuth();
  const cameraRef = useRef<HTMLInputElement>(null);
  const libraryRef = useRef<HTMLInputElement>(null);

  const [photo, setPhoto] = useState<MediaRef | null>(null);
  const [note, setNote] = useState("");
  const [pricingMode, setPricingMode] = useState<PricingMode>("buy_now");
  const [price, setPrice] = useState("");
  const [startingBid, setStartingBid] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justPublished, setJustPublished] = useState(false);
  const [shelfCount, setShelfCount] = useState(0);

  const openHours = garageSaleOpenLabel(getGarageSaleSchedule());
  const hasPhoto = Boolean(photo);
  const priceUsd = Number.parseFloat(price.replace(/[^0-9.]/g, ""));
  const bidUsd = Number.parseFloat(startingBid.replace(/[^0-9.]/g, ""));

  const canPublish =
    hasPhoto &&
    !busy &&
    (pricingMode === "buy_now"
      ? Number.isFinite(priceUsd) && priceUsd > 0
      : pricingMode === "auction"
        ? Number.isFinite(bidUsd) && bidUsd > 0
        : Number.isFinite(priceUsd) && priceUsd > 0 && Number.isFinite(bidUsd) && bidUsd > 0);

  const ingestFile = useCallback(async (file: File) => {
    setError(null);
    setBusy(true);
    try {
      if (photo) {
        await deleteMedia(photo.id);
        if (photo.thumbId) await deleteMedia(photo.thumbId);
      }
      const main = await putMediaBlob(file, { kind: "image" });
      if (!main.ok) {
        setError(main.message);
        return;
      }
      const thumbBlob = await createThumbnail(file);
      const thumb = await putMediaBlob(thumbBlob, { kind: "image", thumbForId: main.ref.id });
      const ref: MediaRef = {
        ...main.ref,
        thumbId: thumb.ok ? thumb.ref.id : undefined,
      };
      setPhoto(ref);
    } catch {
      setError("Could not load photo — try again.");
    } finally {
      setBusy(false);
    }
  }, [photo]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) void ingestFile(file);
  };

  const publishToShelf = () => {
    if (!canPublish || !photo) return;
    setBusy(true);
    setError(null);

    window.setTimeout(() => {
      const hostId = resolveHostAccountId(auth.userId);
      const title = note.trim().slice(0, 60) || copy.defaultTitle;
      const buyNow =
        pricingMode === "auction" ? bidUsd : priceUsd;
      const draft = applyYardSaleListingDefaults(
        applyFrictionlessDefaults({
          ...createInitialListingDraft(),
          hostId,
          photos: [photo],
          title,
          description: note.trim(),
          pricing: {
            ...createInitialListingDraft().pricing,
            salePrice: String(buyNow),
          },
          listingStatus: "active",
          generateQR: false,
        }),
      );

      const offerPrefs: GarageSaleOfferPrefs = {
        kind: pricingMode,
        startingBidUsd:
          pricingMode === "buy_now"
            ? defaultStartingBid(priceUsd)
            : pricingMode === "both"
              ? bidUsd
              : bidUsd,
        endsAt: defaultAuctionEndsAt(),
      };
      setGarageSaleOfferPrefs(draft.id, offerPrefs);

      if (auth.userId) {
        void savePublishedListingRemote(draft, auth.userId);
      } else {
        savePublishedListing(draft);
      }

      const profile = loadUserProfile();
      notifyGarageFollowersOfNewListing({
        hostId,
        hostName: profile.displayName,
        listingTitle: title,
      });

      setShelfCount((count) => count + 1);
      setJustPublished(true);
      setPhoto(null);
      setNote("");
      setPrice("");
      setStartingBid("");
      setBusy(false);
    }, 400);
  };

  const snapAnother = () => {
    setJustPublished(false);
    setError(null);
  };

  if (justPublished) {
    return (
      <div className="screen snap-sale-screen flex flex-col overflow-hidden bg-[#FFF9F0]">
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <div
            className="mb-4 flex h-16 w-16 items-center justify-center rounded-full text-2xl"
            style={{ backgroundColor: `${AMBER}33` }}
          >
            ✓
          </div>
          <h1 className="text-xl font-bold" style={{ color: GREEN }}>
            {copy.publishedTitle}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {shelfCount === 1 ? copy.publishedHintFirst : copy.publishedHintMore}
          </p>
          <p className="mt-1 text-xs font-medium" style={{ color: "#92400E" }}>
            {openHours}
          </p>
        </div>
        <div className="shrink-0 space-y-2 px-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
          <button
            type="button"
            onClick={snapAnother}
            className="w-full rounded-xl py-3.5 text-base font-bold"
            style={{ backgroundColor: AMBER, color: GREEN }}
          >
            {copy.snapAnotherCta}
          </button>
          <button
            type="button"
            onClick={onViewShop}
            className="w-full rounded-xl border-2 py-3 text-base font-bold"
            style={{ borderColor: GREEN, color: GREEN }}
          >
            {copy.viewShopCta}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen snap-sale-screen flex flex-col overflow-hidden bg-[#FFF9F0]">
      <header
        className="shrink-0 border-b px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top,0px))]"
        style={{ borderColor: `${AMBER}44` }}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full border bg-white"
            style={{ borderColor: BORDER }}
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" style={{ color: GREEN }} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: AMBER }}>
              {copy.eyebrow}
            </p>
            <h1 className="text-lg font-bold" style={{ color: GREEN }}>
              {copy.title}
            </h1>
          </div>
        </div>
        <p className="mt-2 text-[13px] leading-snug text-gray-600">{copy.subtitle}</p>
        <div
          className="mt-2 rounded-lg px-2.5 py-1.5 text-[12px] font-medium"
          style={{ backgroundColor: `${GREEN}10`, color: GREEN }}
        >
          {openHours}
        </div>
      </header>

      <div className="screen-scroll min-h-0 flex-1 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
        <section>
          <h2 className="snap-sale-step-label">{copy.stepPhoto}</h2>
          <button
            type="button"
            disabled={busy}
            onClick={() => cameraRef.current?.click()}
            className="snap-sale-photo-slot relative mt-2 w-full overflow-hidden rounded-2xl border-2 border-dashed bg-white active:opacity-95 disabled:opacity-60"
            style={{ borderColor: hasPhoto ? AMBER : `${AMBER}88` }}
          >
            {hasPhoto && photo ? (
              <PhotoPreview photo={photo} />
            ) : (
              <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 px-4">
                {busy ? (
                  <Loader2 className="h-8 w-8 animate-spin" style={{ color: AMBER }} />
                ) : (
                  <Camera className="h-10 w-10" style={{ color: AMBER }} strokeWidth={1.75} />
                )}
                <span className="text-base font-bold" style={{ color: GREEN }}>
                  {copy.photoCta}
                </span>
                <span className="text-center text-xs text-gray-500">{copy.photoHint}</span>
              </div>
            )}
          </button>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => cameraRef.current?.click()}
              className="flex-1 rounded-xl border py-2 text-sm font-semibold"
              style={{ borderColor: BORDER, color: GREEN }}
            >
              {copy.cameraBtn}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => libraryRef.current?.click()}
              className="flex-1 rounded-xl border py-2 text-sm font-semibold"
              style={{ borderColor: BORDER, color: GREEN }}
            >
              {copy.libraryBtn}
            </button>
          </div>
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />
          <input
            ref={libraryRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </section>

        <section className={`mt-5 transition-opacity ${hasPhoto ? "opacity-100" : "pointer-events-none opacity-40"}`}>
          <h2 className="snap-sale-step-label">{copy.stepTag}</h2>
          <label className="mt-2 block">
            <span className="text-xs font-medium text-gray-500">{copy.noteLabel}</span>
            <input
              type="text"
              maxLength={80}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={copy.notePlaceholder}
              className="mt-1 w-full rounded-xl border bg-white px-3 py-3 text-base"
              style={{ borderColor: BORDER }}
            />
          </label>

          <p className="mt-4 text-xs font-semibold text-gray-700">{copy.pricingLabel}</p>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {(
              [
                { id: "buy_now" as const, label: copy.modeBuy, icon: ShoppingBag },
                { id: "auction" as const, label: copy.modeBid, icon: Gavel },
                { id: "both" as const, label: copy.modeBoth, icon: Tag },
              ] as const
            ).map((mode) => {
              const selected = pricingMode === mode.id;
              const Icon = mode.icon;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setPricingMode(mode.id)}
                  className="flex flex-col items-center gap-1 rounded-xl border px-1 py-2.5 text-center"
                  style={{
                    borderColor: selected ? AMBER : BORDER,
                    backgroundColor: selected ? `${AMBER}18` : "#fff",
                  }}
                >
                  <Icon className="h-4 w-4" style={{ color: selected ? "#92400E" : "#6B7280" }} />
                  <span className="text-[11px] font-bold leading-tight text-gray-800">{mode.label}</span>
                </button>
              );
            })}
          </div>

          {pricingMode !== "auction" ? (
            <label className="mt-3 block">
              <span className="text-xs font-medium text-gray-500">
                {pricingMode === "both" ? copy.buyNowLabel : copy.priceLabel}
              </span>
              <div className="relative mt-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  placeholder="12"
                  className="w-full rounded-xl border bg-white py-3 pl-7 pr-3 text-lg font-bold"
                  style={{ borderColor: BORDER, color: GREEN }}
                />
              </div>
            </label>
          ) : null}

          {pricingMode === "auction" || pricingMode === "both" ? (
            <label className="mt-3 block">
              <span className="text-xs font-medium text-gray-500">{copy.startingBidLabel}</span>
              <div className="relative mt-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={startingBid}
                  onChange={(event) => setStartingBid(event.target.value)}
                  placeholder={pricingMode === "both" && priceUsd > 0 ? String(defaultStartingBid(priceUsd)) : "5"}
                  className="w-full rounded-xl border bg-white py-3 pl-7 pr-3 text-lg font-bold"
                  style={{ borderColor: BORDER, color: GREEN }}
                />
              </div>
            </label>
          ) : null}

          {pricingMode === "both" ? (
            <p className="mt-2 text-xs text-gray-500">{copy.bothHint}</p>
          ) : null}

          {pricingMode === "auction" || pricingMode === "both" ? (
            <div
              className="mt-3 rounded-xl border bg-white p-3 text-xs leading-relaxed text-gray-600"
              style={{ borderColor: BORDER }}
            >
              <p className="font-bold text-gray-800">{copy.auctionTermsTitle}</p>
              <p className="mt-1.5">{copy.auctionTermsBody}</p>
            </div>
          ) : null}
        </section>

        {error ? <p className="mt-3 text-sm font-medium text-red-600">{error}</p> : null}

        <button
          type="button"
          disabled={!canPublish}
          onClick={publishToShelf}
          className="mt-5 w-full rounded-xl py-3.5 text-base font-bold disabled:opacity-50"
          style={{ backgroundColor: AMBER, color: GREEN }}
        >
          {busy ? copy.publishing : copy.publishCta}
        </button>

        <p className="mt-3 text-center text-xs text-gray-500">
          {MASCOT_NAME} {copy.mascotHint}
        </p>
      </div>
    </div>
  );
}
