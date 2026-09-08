import { ChevronRight } from "lucide-react";
import type { WantedRequest } from "../../lib/requestsStorage";
import { localizeCategoryLabel } from "../../lib/i18n/categoryLabels";
import { useMessages } from "../../lib/i18n/react";

const GREEN = "#1A9E6E";
const GREEN_DARK = "#0D5C3A";
const BORDER = "#E8E6E0";

/**
 * Open asks on a shelf.
 *
 * Used on the empty shelf, on a shelf that already has listings, and on the
 * guest wall — an ask is the one thing on a shelf worth showing before sign-in,
 * and it used to disappear the moment a single listing appeared.
 */
export function ShelfRequestsCard({
  requests,
  cityName,
  showFulfillCta,
  hint,
  onOpenRequest,
  onFulfillRequest,
  limit = 3,
}: {
  requests: WantedRequest[];
  cityName: string;
  /** Earn mode: offer to list the item that answers the ask. */
  showFulfillCta?: boolean;
  hint?: string;
  onOpenRequest?: (request: WantedRequest) => void;
  onFulfillRequest?: (request: WantedRequest) => void;
  limit?: number;
}) {
  const t = useMessages();
  if (requests.length === 0) return null;

  return (
    <div className="rounded-3xl border bg-white p-4" style={{ borderColor: BORDER }}>
      <p className="text-[12px] font-semibold uppercase tracking-wide text-gray-400">
        {t.shelf.asksTitle}
      </p>
      <p className="mt-0.5 text-[12px] text-gray-500">{hint ?? t.shelf.asksHint(cityName)}</p>
      <ul className="mt-3 space-y-2">
        {requests.slice(0, limit).map((request) => (
          <li key={request.id} className="rounded-2xl border p-3" style={{ borderColor: BORDER }}>
            <button
              type="button"
              onClick={() => onOpenRequest?.(request)}
              disabled={!onOpenRequest}
              className="flex w-full items-start gap-2 text-left disabled:cursor-default"
              aria-label={t.shelf.empty.openAsk}
            >
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold" style={{ color: GREEN_DARK }}>
                  {localizeCategoryLabel(request.subcategory) ||
                    localizeCategoryLabel(request.category) ||
                    t.shelf.empty.wanted}
                </span>
                <span className="mt-1 line-clamp-2 block text-sm text-gray-600">
                  {request.description}
                </span>
              </span>
              {onOpenRequest ? (
                <ChevronRight className="mt-0.5 h-4 w-4 shrink-0" style={{ color: GREEN }} />
              ) : null}
            </button>
            {showFulfillCta && onFulfillRequest ? (
              <button
                type="button"
                onClick={() => onFulfillRequest(request)}
                className="mt-2 text-[13px] font-bold"
                style={{ color: GREEN }}
              >
                {t.shelf.empty.listToFulfill}
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
