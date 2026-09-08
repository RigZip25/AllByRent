import { useEffect, useState } from "react";
import { ChevronRight, Search } from "lucide-react";
import { useAuth } from "../../hooks/AuthProvider";
import {
  fetchMyRequests,
  isRequestExpired,
  type WantedRequest,
} from "../../lib/requestsStorage";
import { localizeCategoryLabel } from "../../lib/i18n/categoryLabels";
import { useMessages } from "../../lib/i18n/react";

const GREEN = "#1A9E6E";
const GREEN_DARK = "#0D5C3A";
const BORDER = "#E8E6E0";

/**
 * The asks side of "listings, requests, and earnings".
 *
 * The garage promised a requests section in copy and never had one, so an ask
 * was unreachable the moment its share sheet was closed.
 */
export function MyRequestsSection({
  onOpenRequest,
  onPostRequest,
  limit = 3,
}: {
  onOpenRequest: (requestId: string) => void;
  onPostRequest: () => void;
  limit?: number;
}) {
  const auth = useAuth();
  const t = useMessages();
  const copy = t.garageUi;
  const detail = t.requestDetail;
  const [requests, setRequests] = useState<WantedRequest[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!auth.userId) {
      setRequests([]);
      return;
    }
    let cancelled = false;
    void fetchMyRequests(auth.userId).then((rows) => {
      if (!cancelled) setRequests(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [auth.userId]);

  const openCount = requests.filter(
    (request) => request.status === "open" && !isRequestExpired(request),
  ).length;
  const visible = showAll ? requests : requests.slice(0, limit);

  const statusLabel = (request: WantedRequest): string => {
    if (request.status === "fulfilled") return detail.statusFulfilled;
    if (request.status === "cancelled") return detail.statusCancelled;
    return isRequestExpired(request) ? detail.statusExpired : detail.statusOpen;
  };

  return (
    <section className="rounded-2xl border bg-white p-4" style={{ borderColor: BORDER }}>
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-bold" style={{ color: GREEN_DARK }}>
            {copy.asksTitle}
          </h2>
          <p className="mt-0.5 text-[12px] text-gray-500">{copy.asksHint}</p>
        </div>
        {openCount > 0 ? (
          <span
            className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold"
            style={{ backgroundColor: `${GREEN}18`, color: GREEN_DARK }}
          >
            {copy.asksOpenCount(openCount)}
          </span>
        ) : null}
      </div>

      {requests.length === 0 ? (
        <div className="mt-3">
          <p className="text-[13px] text-gray-500">{copy.asksEmpty}</p>
          <button
            type="button"
            onClick={onPostRequest}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-semibold text-white"
            style={{ backgroundColor: GREEN_DARK }}
          >
            <Search className="h-4 w-4" />
            {copy.asksEmptyCta}
          </button>
        </div>
      ) : (
        <>
          <ul className="mt-3 space-y-2">
            {visible.map((request) => (
              <li key={request.id}>
                <button
                  type="button"
                  onClick={() => onOpenRequest(request.id)}
                  className="flex w-full items-start gap-2 rounded-xl border px-3 py-2.5 text-left active:bg-gray-50"
                  style={{ borderColor: BORDER }}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-semibold" style={{ color: GREEN_DARK }}>
                      {localizeCategoryLabel(request.subcategory) ||
                        localizeCategoryLabel(request.category)}
                    </span>
                    <span className="mt-0.5 line-clamp-1 block text-[12px] text-gray-500">
                      {request.description}
                    </span>
                  </span>
                  <span className="shrink-0 text-[11px] font-semibold text-gray-500">
                    {statusLabel(request)}
                  </span>
                  <ChevronRight className="mt-0.5 h-4 w-4 shrink-0" style={{ color: GREEN }} />
                </button>
              </li>
            ))}
          </ul>
          {requests.length > limit && !showAll ? (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="mt-3 w-full rounded-xl border py-2 text-[13px] font-semibold"
              style={{ borderColor: BORDER, color: GREEN_DARK }}
            >
              {copy.asksSeeAll}
            </button>
          ) : null}
        </>
      )}
    </section>
  );
}
