import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, MapPin, MessageCircle, PackagePlus } from "lucide-react";
import { MrRentano } from "./MrRentano";
import {
  cancelRequest,
  deleteRequest,
  editRequestDescription,
  fetchRequestByIdRemote,
  isRequestExpired,
  markRequestFulfilled,
  reopenRequest,
  type WantedRequest,
} from "../../lib/requestsStorage";
import {
  messageForRequestText,
  moderateRequestText,
} from "../../lib/requestTextModeration";
import { localizeCategoryLabel } from "../../lib/i18n/categoryLabels";
import { SocialShareButtons } from "../../components/share/SocialShareButtons";
import { buildRequestSharePayload, requestShareUrl } from "../../lib/socialShare";
import { useMessages } from "../../lib/i18n/react";
import { useAuth } from "../../hooks/AuthProvider";
import { MASCOT_NAME } from "../../lib/brand";
import { formatDistanceFromMiles, formatMoney } from "../../lib/regionalDisplay";
import { ModerationMenu } from "../../components/moderation/ModerationMenu";
import type { ShelfPrefill } from "../../lib/shelfListings";

const GREEN = "#0D5C3A";
const GREEN_LIGHT = "#1A9E6E";
const BORDER = "#E8E6E0";

interface RequestDetailProps {
  requestId: string;
  onBack: () => void;
  onFulfill: (prefill: ShelfPrefill) => void;
  onHome: () => void;
  onMessageAuthor?: (requestId: string, authorId: string) => void;
}

function formatDay(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Whole days left, rounded up, so "expires in 1 day" means today or tomorrow. */
function daysUntil(iso: string, now = Date.now()): number {
  const target = new Date(iso).getTime();
  if (!Number.isFinite(target)) return 0;
  return Math.ceil((target - now) / 86_400_000);
}

export function RequestDetail({
  requestId,
  onBack,
  onFulfill,
  onHome,
  onMessageAuthor,
}: RequestDetailProps) {
  const t = useMessages();
  const auth = useAuth();
  const copy = t.postRequest;
  const detail = t.requestDetail;
  const [request, setRequest] = useState<WantedRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editDraft, setEditDraft] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setMissing(false);
    void fetchRequestByIdRemote(requestId)
      .then((row) => {
        if (cancelled) return;
        if (!row) {
          setRequest(null);
          setMissing(true);
        } else {
          setRequest(row);
          setMissing(false);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setRequest(null);
        setMissing(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [requestId]);

  const isAuthor = Boolean(
    request && auth.userId && request.renterId === auth.userId,
  );
  const expired = Boolean(request && request.status === "open" && isRequestExpired(request));

  const statusLabel = useMemo(() => {
    if (!request) return "";
    if (request.status === "fulfilled") return detail.statusFulfilled;
    if (request.status === "cancelled") return detail.statusCancelled;
    return expired ? detail.statusExpired : detail.statusOpen;
  }, [request, expired, detail]);

  const expiryLine = useMemo(() => {
    if (!request || request.status !== "open" || !request.expiresAt) return null;
    if (expired) return detail.expiredBody;
    const days = daysUntil(request.expiresAt);
    return days <= 0 ? detail.expiresToday : detail.expiresInDays(days);
  }, [request, expired, detail]);

  const chips = useMemo(() => {
    if (!request) return [] as string[];
    const out: string[] = [];
    if (request.intent) {
      out.push(
        request.intent === "buy"
          ? copy.intentBuy
          : request.intent === "either"
            ? copy.intentEither
            : copy.intentRent,
      );
    }
    if (request.budgetCents != null) {
      const label = formatMoney(Math.round(request.budgetCents / 100));
      out.push(request.intent === "buy" ? detail.budgetBuy(label) : detail.budgetRent(label));
    }
    if (request.radiusMiles != null) {
      out.push(
        detail.withinRadius(
          formatDistanceFromMiles(request.radiusMiles, undefined, { plus: false }),
        ),
      );
    }
    if (request.startDate) {
      out.push(
        detail.needBy(
          request.endDate
            ? copy.whenRange(formatDay(request.startDate), formatDay(request.endDate))
            : copy.whenFrom(formatDay(request.startDate)),
        ),
      );
    }
    return out;
  }, [request, copy, detail]);

  const handleFulfill = () => {
    if (!request) return;
    onFulfill({
      category: request.category,
      subcategory: request.subcategory,
      city: request.locationLabel,
      // The renter's own words: the wizard used to drop them on the floor.
      query: request.description.slice(0, 200),
      requestId: request.id,
    });
  };

  const runAction = (action: () => Promise<{ ok: boolean; reason?: string }>) => {
    if (busy) return;
    setBusy(true);
    setActionError(null);
    void action()
      .then((result) => {
        if (!result.ok) {
          setActionError(detail.updateFailed);
          return;
        }
        return fetchRequestByIdRemote(requestId).then((row) => {
          if (row) setRequest(row);
        });
      })
      .catch(() => setActionError(detail.updateFailed))
      .finally(() => setBusy(false));
  };

  const handleSaveEdit = () => {
    if (!request) return;
    const checked = moderateRequestText(editDraft);
    if (!checked.ok) {
      setActionError(messageForRequestText(checked.reason, copy));
      return;
    }
    setEditing(false);
    // Remote round-trips can lag; show the renter their own words right away.
    setRequest({ ...request, description: checked.cleaned });
    runAction(() => editRequestDescription(request.id, checked.cleaned));
  };

  const handleDelete = () => {
    if (!request) return;
    if (typeof window !== "undefined" && !window.confirm(detail.deleteConfirm)) return;
    setBusy(true);
    void deleteRequest(request.id)
      .then(() => onHome())
      .finally(() => setBusy(false));
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
        <h1 className="flex-1 font-semibold">
          {isAuthor ? detail.yourAsk : copy.wantedBadge}
        </h1>
        {request && !isAuthor ? (
          <ModerationMenu
            targetKind="profile"
            targetId={request.renterId}
            reportedUserId={request.renterId}
          />
        ) : null}
      </div>

      <div className="screen-scroll min-h-0 flex-1 space-y-5 p-4 pb-24">
        {loading ? (
          <p className="text-sm text-muted-foreground">{t.common?.loading ?? "Loading…"}</p>
        ) : missing || !request ? (
          <div className="space-y-4 rounded-3xl border bg-white p-5" style={{ borderColor: BORDER }}>
            <p className="text-[15px] font-semibold text-gray-900">{detail.notFoundTitle}</p>
            <p className="text-sm text-muted-foreground">{detail.notFoundBody}</p>
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
                  <span
                    className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                    style={{
                      backgroundColor:
                        request.status === "open" && !expired ? `${GREEN_LIGHT}22` : "#F3F4F6",
                      color: request.status === "open" && !expired ? GREEN : "#6B7280",
                    }}
                  >
                    {statusLabel}
                  </span>
                </div>

                {editing ? (
                  <div className="space-y-2">
                    <textarea
                      value={editDraft}
                      onChange={(event) => setEditDraft(event.target.value)}
                      rows={4}
                      className="w-full resize-none rounded-xl border bg-white px-3 py-2 text-[14px] outline-none focus:ring-2 focus:ring-primary/20"
                      style={{ borderColor: BORDER }}
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSaveEdit}
                        className="flex-1 rounded-xl py-2.5 text-[13px] font-semibold text-white"
                        style={{ backgroundColor: GREEN }}
                      >
                        {detail.saveText}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(false)}
                        className="flex-1 rounded-xl border py-2.5 text-[13px] font-semibold"
                        style={{ borderColor: BORDER, color: GREEN }}
                      >
                        {detail.cancelEdit}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-gray-800">
                    {request.description}
                  </p>
                )}

                {chips.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {chips.map((chip) => (
                      <span
                        key={chip}
                        className="inline-flex items-center rounded-full border bg-white/80 px-3 py-1.5 text-[12px] font-medium leading-none"
                        style={{ borderColor: BORDER, color: GREEN }}
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                ) : null}

                {request.locationLabel ? (
                  <p className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {request.locationLabel}
                  </p>
                ) : null}

                <p className="text-[12px] text-muted-foreground">
                  {detail.postedAgo(formatDay(request.createdAt))}
                  {expiryLine ? ` · ${expiryLine}` : null}
                </p>

                {request.status === "fulfilled" ? (
                  <p className="text-[12px] text-muted-foreground">{detail.fulfilledBody}</p>
                ) : request.status === "cancelled" ? (
                  <p className="text-[12px] text-muted-foreground">{detail.cancelledBody}</p>
                ) : null}
              </div>
            </div>

            {isAuthor ? (
              <div className="rounded-2xl border bg-white p-4" style={{ borderColor: BORDER }}>
                <p className="mb-3 text-[13px] font-semibold text-gray-800">{detail.manageTitle}</p>
                <div className="grid grid-cols-2 gap-2">
                  {request.status === "open" ? (
                    <>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => runAction(() => markRequestFulfilled(request.id))}
                        className="rounded-xl py-2.5 text-[13px] font-semibold text-white disabled:opacity-60"
                        style={{ backgroundColor: GREEN }}
                      >
                        {detail.markFulfilled}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => runAction(() => cancelRequest(request.id))}
                        className="rounded-xl border py-2.5 text-[13px] font-semibold disabled:opacity-60"
                        style={{ borderColor: BORDER, color: GREEN }}
                      >
                        {detail.cancelAsk}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => runAction(() => reopenRequest(request.id))}
                      className="rounded-xl py-2.5 text-[13px] font-semibold text-white disabled:opacity-60"
                      style={{ backgroundColor: GREEN }}
                    >
                      {detail.reopen}
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={busy || editing}
                    onClick={() => {
                      setEditDraft(request.description);
                      setEditing(true);
                    }}
                    className="rounded-xl border py-2.5 text-[13px] font-semibold disabled:opacity-60"
                    style={{ borderColor: BORDER, color: GREEN }}
                  >
                    {detail.editText}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={handleDelete}
                    className="rounded-xl border border-red-200 py-2.5 text-[13px] font-semibold text-red-700 disabled:opacity-60"
                  >
                    {detail.deleteAsk}
                  </button>
                </div>
                {actionError ? (
                  <p className="mt-3 text-[12px] font-medium text-red-600">{actionError}</p>
                ) : null}
              </div>
            ) : null}

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

            {!isAuthor && request.status === "open" && !expired ? (
              <>
                {onMessageAuthor ? (
                  <div>
                    <button
                      type="button"
                      onClick={() => onMessageAuthor(request.id, request.renterId)}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border py-3 text-[15px] font-semibold"
                      style={{ borderColor: BORDER, color: GREEN }}
                    >
                      <MessageCircle className="h-5 w-5" />
                      {detail.messageAuthor}
                    </button>
                    <p className="mt-1.5 text-center text-[12px] text-muted-foreground">
                      {detail.messageAuthorHint}
                    </p>
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={handleFulfill}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-semibold text-white"
                  style={{ backgroundColor: GREEN }}
                >
                  <PackagePlus className="h-5 w-5" />
                  {detail.haveThisCta}
                </button>
              </>
            ) : null}

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
