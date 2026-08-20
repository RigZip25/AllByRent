import { useEffect, useState } from "react";
import { ArrowLeft, MapPin, PackagePlus } from "lucide-react";
import { MrRentano } from "./MrRentano";
import {
  fetchRequestByIdRemote,
  type WantedRequest,
} from "../../lib/requestsStorage";
import { localizeCategoryLabel } from "../../lib/i18n/categoryLabels";
import { SocialShareButtons } from "../../components/share/SocialShareButtons";
import { buildRequestSharePayload, requestShareUrl } from "../../lib/socialShare";
import { useMessages } from "../../lib/i18n/react";
import { MASCOT_NAME } from "../../lib/brand";
import type { ShelfPrefill } from "../../lib/shelfListings";

const GREEN = "#0D5C3A";
const GREEN_LIGHT = "#1A9E6E";
const BORDER = "#E8E6E0";

interface RequestDetailProps {
  requestId: string;
  onBack: () => void;
  onFulfill: (prefill: ShelfPrefill) => void;
  onHome: () => void;
}

export function RequestDetail({ requestId, onBack, onFulfill, onHome }: RequestDetailProps) {
  const t = useMessages();
  const copy = t.postRequest;
  const [request, setRequest] = useState<WantedRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setMissing(false);
    void fetchRequestByIdRemote(requestId).then((row) => {
      if (cancelled) return;
      if (!row) {
        setRequest(null);
        setMissing(true);
      } else {
        setRequest(row);
        setMissing(false);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [requestId]);

  const handleFulfill = () => {
    if (!request) return;
    onFulfill({
      category: request.category,
      subcategory: request.subcategory,
      city: request.locationLabel,
      query: request.description.slice(0, 120),
    });
  };

  return (
    <div className="screen flex flex-col bg-background">
      <div className="z-10 flex shrink-0 items-center gap-3 border-b border-border bg-card/80 px-3 py-3 backdrop-blur-sm sm:px-4">
        <button
          type="button"
          onClick={onBack}
          className="rounded-full p-2 hover:bg-muted"
          aria-label={t.common?.back ?? "Back"}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 font-semibold">{copy.wantedBadge}</h1>
      </div>

      <div className="screen-scroll min-h-0 flex-1 space-y-5 p-4 pb-24">
        {loading ? (
          <p className="text-sm text-muted-foreground">{t.common?.loading ?? "Loading…"}</p>
        ) : missing || !request ? (
          <div className="space-y-4 rounded-3xl border bg-white p-5" style={{ borderColor: BORDER }}>
            <p className="text-[15px] font-semibold text-gray-900">
              {copy.shareDefaultText("Evórios", copy.yourArea).replace(/\.$/, "")} — not found
            </p>
            <p className="text-sm text-muted-foreground">
              This looking-for request may have expired or been removed.
            </p>
            <button
              type="button"
              onClick={onHome}
              className="w-full rounded-2xl py-3 text-sm font-semibold text-white"
              style={{ backgroundColor: GREEN }}
            >
              {t.nav?.home ?? "Home"}
            </button>
          </div>
        ) : (
          <>
            <div
              className="relative overflow-hidden rounded-3xl border"
              style={{
                borderColor: `${GREEN_LIGHT}44`,
                background:
                  "linear-gradient(165deg, rgba(26,158,110,0.14) 0%, rgba(255,255,255,0.95) 42%, #fff 100%)",
              }}
            >
              <div
                className="absolute -right-6 -top-8 h-28 w-28 rounded-full opacity-30"
                style={{ background: GREEN_LIGHT }}
              />
              <div className="relative space-y-4 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <MrRentano size={56} className="shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-[11px] font-semibold uppercase tracking-wide"
                      style={{ color: GREEN_LIGHT }}
                    >
                      {copy.wantedBadge} · {MASCOT_NAME}
                    </p>
                    <h2 className="mt-1 text-[17px] font-bold leading-snug text-gray-900">
                      {localizeCategoryLabel(request.subcategory)}
                    </h2>
                    <p className="mt-0.5 text-[13px] text-muted-foreground">
                      {localizeCategoryLabel(request.category)}
                      {request.locationLabel ? ` · ${request.locationLabel}` : null}
                    </p>
                  </div>
                </div>

                <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-gray-800">
                  {request.description}
                </p>

                {request.locationLabel ? (
                  <p className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {request.locationLabel}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-4" style={{ borderColor: BORDER }}>
              <p className="mb-3 text-[13px] font-semibold text-gray-800">{copy.shareNowTitle}</p>
              <SocialShareButtons
                payload={buildRequestSharePayload({
                  need: request.description.trim() || undefined,
                  url: requestShareUrl(request.id),
                  subcategory: localizeCategoryLabel(request.subcategory),
                  category: localizeCategoryLabel(request.category),
                  locationLabel: request.locationLabel,
                  startDate: request.startDate,
                  endDate: request.endDate,
                })}
                shareKind="request"
                targetId={request.id}
                compact
              />
            </div>

            <button
              type="button"
              onClick={handleFulfill}
              className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-semibold text-white"
              style={{ backgroundColor: GREEN }}
            >
              <PackagePlus className="h-5 w-5" />
              {t.shelf?.empty?.listFirstCta ?? "List this item"}
            </button>

            <button
              type="button"
              onClick={onHome}
              className="w-full rounded-2xl border py-3 text-sm font-semibold"
              style={{ borderColor: BORDER, color: GREEN }}
            >
              {t.nav?.home ?? "Browse nearby"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
