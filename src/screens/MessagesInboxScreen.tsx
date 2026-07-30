import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { useAuth } from "../hooks/AuthProvider";
import {
  fetchRecentChatThreadsRemote,
  listChatThreadsLocal,
  type ChatThreadSummary,
} from "../lib/messagesStorage";
import { loadRentalBookings } from "../lib/rentalsStorage";
import { getPublishedListingById } from "../lib/listingStorage";
import { getListingDisplayTitle } from "../lib/listingQr";
import { BRAND_GREEN } from "../lib/brand";

const GREEN = BRAND_GREEN;
const BORDER = "#E8E6E0";

type Props = {
  onBack: () => void;
  onOpenRentalChat: (rentalId: string) => void;
  onOpenListingChat: (listingId: string, peerId: string) => void;
};

function threadTitle(thread: ChatThreadSummary): string {
  if (thread.kind === "rental" && thread.rentalId) {
    const booking = loadRentalBookings().find((b) => b.id === thread.rentalId);
    if (booking?.itemTitle) return booking.itemTitle;
    return "Rental chat";
  }
  if (thread.listingId) {
    const listing = getPublishedListingById(thread.listingId);
    if (listing) return getListingDisplayTitle(listing.title) || listing.title || "Listing chat";
    return "Listing chat";
  }
  return "Chat";
}

function mergeThreads(local: ChatThreadSummary[], remote: ChatThreadSummary[]): ChatThreadSummary[] {
  const map = new Map<string, ChatThreadSummary>();
  for (const t of [...remote, ...local]) {
    const prev = map.get(t.threadKey);
    if (!prev || t.updatedAt > prev.updatedAt) map.set(t.threadKey, t);
  }
  return [...map.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function MessagesInboxScreen({ onBack, onOpenRentalChat, onOpenListingChat }: Props) {
  const auth = useAuth();
  const [remote, setRemote] = useState<ChatThreadSummary[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setTick((n) => n + 1);
    if (!auth.userId) return;
    let cancelled = false;
    void fetchRecentChatThreadsRemote(auth.userId).then((rows) => {
      if (!cancelled) setRemote(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [auth.userId]);

  const threads = useMemo(() => {
    void tick;
    const local = listChatThreadsLocal(auth.userId);
    // Also surface active/upcoming rentals with no messages yet so chat is discoverable.
    const bookings = loadRentalBookings().filter(
      (b) =>
        b.status === "active" ||
        b.status === "upcoming" ||
        b.status === "pending_approval" ||
        b.status === "pending_checkin" ||
        b.status === "overdue",
    );
    const extras: ChatThreadSummary[] = [];
    for (const b of bookings) {
      const key = `rental:${b.id}`;
      if (local.some((t) => t.threadKey === key) || remote.some((t) => t.threadKey === key)) continue;
      extras.push({
        kind: "rental",
        threadKey: key,
        rentalId: b.id,
        peerId: b.counterpartyId || "local",
        preview: "Tap to discuss pickup details",
        updatedAt: b.startDate || new Date(0).toISOString(),
        messageCount: 0,
      });
    }
    return mergeThreads([...local, ...extras], remote);
  }, [auth.userId, remote, tick]);

  return (
    <div className="screen flex flex-col overflow-hidden bg-[#F0F4F2]">
      <header className="shrink-0 border-b bg-white px-4 pb-3 pt-3" style={{ borderColor: BORDER }}>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" style={{ color: GREEN }} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[18px] font-extrabold" style={{ color: GREEN }}>
              Messages
            </h1>
            <p className="text-[12px] text-gray-500">In-app chat for rentals and purchases</p>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {!auth.userId ? (
          <p className="rounded-2xl border bg-white p-4 text-[14px] text-gray-600" style={{ borderColor: BORDER }}>
            Sign in to sync chats across devices and get push when someone replies.
          </p>
        ) : null}

        {threads.length === 0 ? (
          <div
            className="mt-2 flex flex-col items-center rounded-2xl border bg-white px-4 py-10 text-center"
            style={{ borderColor: BORDER }}
          >
            <MessageCircle className="h-10 w-10 text-gray-300" />
            <p className="mt-3 text-[15px] font-semibold" style={{ color: GREEN }}>
              No conversations yet
            </p>
            <p className="mt-1 max-w-xs text-[13px] text-gray-500">
              Open an active rental and tap Message, or message a seller from a listing — threads
              show up here.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {threads.map((t) => (
              <li key={t.threadKey}>
                <button
                  type="button"
                  onClick={() => {
                    if (t.kind === "rental" && t.rentalId) onOpenRentalChat(t.rentalId);
                    else if (t.listingId) onOpenListingChat(t.listingId, t.peerId);
                  }}
                  className="flex w-full items-start gap-3 rounded-2xl border bg-white px-4 py-3.5 text-left active:bg-gray-50"
                  style={{ borderColor: BORDER }}
                >
                  <div
                    className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: "#F0F4F2" }}
                  >
                    <MessageCircle className="h-5 w-5" style={{ color: GREEN }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-[15px] font-semibold" style={{ color: GREEN }}>
                        {threadTitle(t)}
                      </p>
                      <span className="shrink-0 text-[11px] text-gray-400">
                        {new Date(t.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[12px] font-medium uppercase tracking-wide text-gray-400">
                      {t.kind === "rental" ? "Rental" : "Buy / gift"}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[13px] text-gray-600">{t.preview}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
