import { ArrowLeft } from "lucide-react";
import { useMemo, useState } from "react";
import { BRAND_AMBER, BRAND_GREEN } from "../../lib/brand";
import { useMessages } from "../../lib/i18n/react";
import { loadPublishedListings } from "../../lib/listingStorage";
import { parseSalePrice } from "../../lib/garageShopStorage";
import { setGarageSaleOfferPrefs } from "../../lib/garageSaleOfferStorage";
import {
  OPEN_SALE_LIVE_MINUTES,
  createOpenSaleEventAuthoritative,
  type OpenSaleLiveMinutes,
  type OpenSaleLot,
} from "../../lib/openSale";
import type { ListingDraft } from "../listing/types";

const GREEN = BRAND_GREEN;
const AMBER = BRAND_AMBER;
const BORDER = "#E8E6E0";

type CreateOpenSaleScreenProps = {
  hostId: string;
  /** Pre-check these listing ids (e.g. just published). */
  preselectedListingIds?: string[];
  onBack: () => void;
  onCreated: (eventId: string) => void;
  onSnapMore?: () => void;
};

function defaultMin(listing: ListingDraft): number {
  const sale = parseSalePrice(listing);
  return sale > 0 ? Math.max(1, Math.round(sale * 0.55 * 100) / 100) : 5;
}

function defaultStep(minBid: number): number {
  if (minBid >= 50) return 5;
  if (minBid >= 20) return 2;
  return 1;
}

export function CreateOpenSaleScreen({
  hostId,
  preselectedListingIds = [],
  onBack,
  onCreated,
  onSnapMore,
}: CreateOpenSaleScreenProps) {
  const { openSaleCreate: copy, common } = useMessages();
  const sellListings = useMemo(
    () =>
      loadPublishedListings().filter(
        (l) =>
          (l.hostId === hostId || !l.hostId) &&
          l.listingStatus === "active" &&
          !l.paused &&
          l.modes.sell &&
          parseSalePrice(l) > 0,
      ),
    [hostId],
  );

  const [selected, setSelected] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const id of preselectedListingIds) init[id] = true;
    if (preselectedListingIds.length === 0 && sellListings[0]) {
      init[sellListings[0].id] = true;
    }
    return init;
  });
  const [liveMinutes, setLiveMinutes] = useState<OpenSaleLiveMinutes>(30);
  const [startMode, setStartMode] = useState<"soon" | "in1h" | "tomorrow">("soon");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const selectedListings = sellListings.filter((l) => selected[l.id]);

  const startsAt = useMemo(() => {
    const d = new Date();
    if (startMode === "soon") {
      d.setMinutes(d.getMinutes() + 10);
    } else if (startMode === "in1h") {
      d.setHours(d.getHours() + 1);
    } else {
      d.setDate(d.getDate() + 1);
      d.setHours(9, 0, 0, 0);
    }
    return d;
  }, [startMode]);

  const toggle = (id: string) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreate = () => {
    setError(null);
    if (selectedListings.length === 0) {
      setError(copy.pickOneError);
      return;
    }
    setBusy(true);
    const lots: OpenSaleLot[] = selectedListings.map((listing) => {
      const minBidUsd = defaultMin(listing);
      return {
        listingId: listing.id,
        minBidUsd,
        bidStepUsd: defaultStep(minBidUsd),
        origin: "garage_mirror",
      };
    });

    void createOpenSaleEventAuthoritative({
      hostId,
      startsAt,
      liveMinutes,
      lots,
    }).then((result) => {
      if ("error" in result) {
        setBusy(false);
        setError(result.error);
        return;
      }

      for (const lot of lots) {
        setGarageSaleOfferPrefs(
          lot.listingId,
          {
            saleMode: "open",
            kind: "auction",
            startingBidUsd: lot.minBidUsd,
            startsAt: result.startsAt,
            endsAt: result.endsAt,
            negotiationPhase: "multi_auction",
          },
          hostId,
        );
      }

      setBusy(false);
      onCreated(result.id);
    });
  };

  return (
    <div className="screen flex flex-col overflow-hidden bg-[#FFF9F0]">
      <div
        className="shrink-0 border-b px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top,0px))]"
        style={{ borderColor: `${AMBER}44` }}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full border bg-white"
            style={{ borderColor: BORDER }}
            aria-label={common.back}
          >
            <ArrowLeft className="h-5 w-5" style={{ color: GREEN }} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold" style={{ color: GREEN }}>
              {copy.title}
            </h1>
            <p className="text-[13px] text-gray-600">{copy.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="screen-scroll flex flex-1 flex-col gap-4 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
        <section>
          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">{copy.whenStarts}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(
              [
                ["soon", copy.startSoon],
                ["in1h", copy.startIn1h],
                ["tomorrow", copy.startTomorrow],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setStartMode(id)}
                className="rounded-full border px-3 py-1.5 text-sm font-semibold"
                style={{
                  borderColor: startMode === id ? GREEN : BORDER,
                  backgroundColor: startMode === id ? "#ECFDF5" : "white",
                  color: GREEN,
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        <section>
          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">{copy.liveWindow}</p>
          <div className="mt-2 flex gap-2">
            {OPEN_SALE_LIVE_MINUTES.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setLiveMinutes(m)}
                className="rounded-full border px-3 py-1.5 text-sm font-semibold"
                style={{
                  borderColor: liveMinutes === m ? GREEN : BORDER,
                  backgroundColor: liveMinutes === m ? "#ECFDF5" : "white",
                  color: GREEN,
                }}
              >
                {copy.minutes(m)}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[12px] text-gray-500">{copy.liveHint}</p>
        </section>

        <section>
          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
            {copy.mirrorTitle(selectedListings.length)}
          </p>
          <p className="mt-1 text-[12px] text-gray-500">{copy.mirrorBody}</p>
          <ul className="mt-2 flex flex-col gap-2">
            {sellListings.length === 0 ? (
              <p className="rounded-xl border bg-white px-3 py-4 text-sm text-gray-500" style={{ borderColor: BORDER }}>
                {copy.emptyListings}
              </p>
            ) : (
              sellListings.map((listing) => {
                const on = Boolean(selected[listing.id]);
                const min = defaultMin(listing);
                return (
                  <label
                    key={listing.id}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border bg-white px-3 py-2.5"
                    style={{ borderColor: on ? GREEN : BORDER }}
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => toggle(listing.id)}
                      className="h-4 w-4"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-gray-900">
                        {listing.title || copy.saleItemFallback}
                      </p>
                      <p className="text-[12px] text-gray-500">
                        {copy.minStep(String(min), String(defaultStep(min)))}
                      </p>
                    </div>
                  </label>
                );
              })
            )}
          </ul>
        </section>

        {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}

        <button
          type="button"
          disabled={busy}
          onClick={handleCreate}
          className="w-full rounded-xl px-3 py-3.5 text-base font-bold leading-snug text-white disabled:opacity-60"
          style={{ backgroundColor: GREEN }}
        >
          {busy ? copy.creating : copy.publishCta}
        </button>

        {onSnapMore ? (
          <button
            type="button"
            onClick={onSnapMore}
            className="w-full rounded-xl border-2 px-3 py-3 text-sm font-bold leading-snug"
            style={{ borderColor: AMBER, color: GREEN }}
          >
            {copy.snapMoreCta}
          </button>
        ) : null}
      </div>
    </div>
  );
}
