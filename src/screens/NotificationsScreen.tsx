import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  Bell,
  CalendarClock,
  ClipboardList,
  MapPin,
  MessageCircle,
  PackageCheck,
  Search,
  Wallet,
} from "lucide-react";
import {
  PwaUpdateConfirmSheet,
  PwaUpdateNotificationCard,
  PwaUpdateSuccessCard,
} from "../components/PwaUpdateNotificationFlow";
import { usePwaUpdate } from "../hooks/PwaUpdateProvider";
import { getAppMode, type AppMode } from "../lib/appMode";
import { isStandalonePwa } from "../lib/pwaInstall";
import { useAuth } from "../hooks/AuthProvider";
import { loadInAppNotifications, type InAppNotification } from "../lib/inAppNotifications";
import { fetchNotificationsRemote, markNotificationReadRemote, type Notification } from "../lib/notificationsStorage";
import { savePushSubscriptionRemote, subscribeToPush } from "../lib/pushNotifications";
import { NotificationPreferencesPanel } from "../components/notifications/NotificationPreferencesPanel";
import { MrRentano } from "../app/components/MrRentano";

const GREEN = "#0D5C3A";
const GREEN_LIGHT = "#1A9E6E";
const AMBER = "#F0B429";
const BORDER = "#E8E6E0";
const SURFACE = "#F0F4F2";

type NotificationTab = "all" | "bookings" | "messages";
type PreviewCategory = "bookings" | "messages" | "updates";

type PreviewItem = {
  icon: LucideIcon;
  title: string;
  description: string;
  category: PreviewCategory;
};

const RENT_PREVIEWS: PreviewItem[] = [
  {
    icon: PackageCheck,
    title: "Your bookings",
    description: "Confirmed, declined, or changed — for items you rent from neighbors.",
    category: "bookings",
  },
  {
    icon: CalendarClock,
    title: "Pickup & return",
    description: "Reminders before pickup, during the rental, and when it's time to return.",
    category: "bookings",
  },
  {
    icon: MessageCircle,
    title: "Owner messages",
    description: "Questions, directions, and chat about the item you're borrowing.",
    category: "messages",
  },
  {
    icon: Search,
    title: "Your requests",
    description: "When someone offers gear that matches what you posted looking for.",
    category: "bookings",
  },
];

const EARN_PREVIEWS: PreviewItem[] = [
  {
    icon: ClipboardList,
    title: "Booking requests",
    description: "Someone wants to rent your item — approve, decline, or message them.",
    category: "bookings",
  },
  {
    icon: MapPin,
    title: "Pickup & return",
    description: "When a renter is coming, when gear is out, and when return is due.",
    category: "bookings",
  },
  {
    icon: MessageCircle,
    title: "Renter messages",
    description: "Chat about timing, condition, and handoff for your listings.",
    category: "messages",
  },
  {
    icon: Wallet,
    title: "Listing & earnings",
    description: "Listing status, views, pauses, and payout updates (when connected).",
    category: "updates",
  },
];

const MODE_BADGE: Record<AppMode, string> = {
  rent: "Renting",
  earn: "Hosting",
};

const EMPTY_BY_TAB: Record<
  AppMode,
  Record<NotificationTab, { title: string; body: string; hint?: string }>
> = {
  rent: {
    all: {
      title: "Nothing new for your rentals",
      body: "Bookings, pickup reminders, and owner messages will show up here.",
    },
    bookings: {
      title: "No booking updates",
      body: "Confirmations, pickup and return times, and responses to your requests.",
      hint: "Book something from Browse by Category to get started.",
    },
    messages: {
      title: "No messages yet",
      body: "When an owner replies about an item you're renting, the chat lands here.",
    },
  },
  earn: {
    all: {
      title: "No requests on your listings",
      body: "Booking requests, handoffs, renter chats, and listing updates appear here.",
    },
    bookings: {
      title: "No booking requests",
      body: "New rentals, pickup and return windows, and schedule changes for your items.",
      hint: "List gear from Home (Earn mode) to start receiving requests.",
    },
    messages: {
      title: "No renter messages",
      body: "Questions before pickup, during a rental, or at return — all in one thread per booking.",
    },
  },
};

const SECTION_LABEL: Record<NotificationTab, string> = {
  all: "What appears in this inbox",
  bookings: "Booking notifications include",
  messages: "Message notifications include",
};

const TABS: { id: NotificationTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "bookings", label: "Bookings" },
  { id: "messages", label: "Messages" },
];

function filterPreviews(items: PreviewItem[], tab: NotificationTab): PreviewItem[] {
  if (tab === "all") return items;
  if (tab === "bookings") return items.filter((i) => i.category === "bookings");
  return items.filter((i) => i.category === "messages");
}

function NotificationTabs({
  active,
  onChange,
}: {
  active: NotificationTab;
  onChange: (tab: NotificationTab) => void;
}) {
  return (
    <div
      className="flex gap-1 rounded-full border bg-white p-1"
      style={{ borderColor: BORDER }}
      role="tablist"
      aria-label="Notification filters"
    >
      {TABS.map(({ id, label }) => {
        const selected = active === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(id)}
            className="flex-1 rounded-full px-3 py-2 text-sm font-bold transition-colors"
            style={{
              backgroundColor: selected ? GREEN : "transparent",
              color: selected ? "white" : "#888",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

type NotificationsScreenProps = {
  onBack: () => void;
  mode?: AppMode;
  onOpenRentals?: () => void;
};

export function NotificationsScreen({ onBack, mode: modeProp, onOpenRentals }: NotificationsScreenProps) {
  const mode = modeProp ?? getAppMode();
  const auth = useAuth();
  const [tab, setTab] = useState<NotificationTab>("all");
  const [pushBusy, setPushBusy] = useState(false);
  const [pushError, setPushError] = useState<string | null>(null);
  const canOfferPush =
    typeof window !== "undefined" && "serviceWorker" in navigator && "Notification" in window;
  const [updateSheetOpen, setUpdateSheetOpen] = useState(false);
  const {
    updateAvailable,
    updateJustCompleted,
    dismissUpdateSuccess,
    checkForUpdates,
    checkStatus,
    simulateUpdateNotification,
  } = usePwaUpdate();
  const [checkMessage, setCheckMessage] = useState<string | null>(null);
  const isPwa = isStandalonePwa();

  const allPreviews = mode === "earn" ? EARN_PREVIEWS : RENT_PREVIEWS;
  const visiblePreviews = filterPreviews(allPreviews, tab);
  const empty = EMPTY_BY_TAB[mode][tab];
  const showUpdateInTab = tab === "all";
  const [items, setItems] = useState<Notification[]>([]);
  const [localMessages, setLocalMessages] = useState<InAppNotification[]>(() => loadInAppNotifications());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!auth.userId) {
      const local = loadInAppNotifications().map((n) => ({
        id: n.id,
        recipientId: "local",
        actorId: null,
        type: n.type === "booking_request" ? "booking_request" : "general",
        title: n.title,
        body: n.body,
        readAt: n.read ? n.createdAt : null,
        createdAt: n.createdAt,
      }));
      setItems(local);
      return;
    }
    let mounted = true;
    setLoading(true);
    void fetchNotificationsRemote(auth.userId)
      .then((data) => {
        if (!mounted) return;
        setItems(data);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [auth.userId]);

  const messageItems = useMemo(() => {
    if (tab !== "messages") return [];
    return localMessages.filter((n) => n.type === "running_late" || n.type === "return");
  }, [localMessages, tab]);

  const filteredItems = useMemo(() => {
    if (tab === "messages") return [];
    if (tab === "bookings") return items.filter((n) => n.type === "booking_request");
    return items;
  }, [items, tab]);

  const handleNotificationTap = (n: Notification) => {
    if (!auth.userId) return;
    if (!n.readAt) {
      void markNotificationReadRemote(auth.userId, n.id).then(() => {
        setItems((prev) =>
          prev.map((p) => (p.id === n.id ? { ...p, readAt: new Date().toISOString() } : p)),
        );
      });
    }
    if (n.type === "booking_request") onOpenRentals?.();
  };

  const hasInboxItems =
    filteredItems.length > 0 ||
    messageItems.length > 0 ||
    (showUpdateInTab && (updateAvailable || updateJustCompleted)) ||
    visiblePreviews.length > 0;
  const showEmptyState = !hasInboxItems;

  return (
    <div className="screen flex flex-col overflow-hidden bg-[#F0F4F2]">
      <header
        className="shrink-0 border-b bg-white px-4 pb-3 pt-3"
        style={{ borderColor: BORDER }}
      >
        <div className="mb-3 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors active:bg-gray-100"
            aria-label="Back to home"
          >
            <ArrowLeft className="h-5 w-5" style={{ color: GREEN }} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-[20px] font-bold leading-tight" style={{ color: GREEN }}>
              Notifications
            </h1>
            <span
              className="mt-0.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide"
              style={{
                backgroundColor: mode === "earn" ? `${AMBER}33` : `${GREEN_LIGHT}22`,
                color: GREEN,
              }}
            >
              {MODE_BADGE[mode]}
            </span>
          </div>
        </div>
        <NotificationTabs active={tab} onChange={setTab} />
        {tab === "all" ? (
          <div className="mt-3 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                setCheckMessage(null);
                void checkForUpdates().then((result) => {
                  if (result === "available") {
                    setCheckMessage("Update found — see the card below.");
                    return;
                  }
                  if (result === "current") {
                    setCheckMessage(
                      isPwa
                        ? "You're on the latest version installed on this device."
                        : "No update waiting. Install the PWA from the same URL after a new build.",
                    );
                    return;
                  }
                  setCheckMessage("Updates are not available in this browser.");
                });
              }}
              className="w-full rounded-2xl border py-2.5 text-[14px] font-semibold"
              style={{ borderColor: BORDER, color: GREEN }}
            >
              {checkStatus === "checking" ? "Checking…" : "Check for updates"}
            </button>
            {checkMessage ? (
              <p className="text-center text-[12px] leading-snug text-gray-500">{checkMessage}</p>
            ) : null}
            {import.meta.env.DEV ? (
              <button
                type="button"
                onClick={() => {
                  simulateUpdateNotification();
                  setCheckMessage("Demo update notification added.");
                }}
                className="w-full rounded-2xl border border-dashed py-2 text-[12px] font-medium text-gray-500"
                style={{ borderColor: BORDER }}
              >
                Demo: show update notification
              </button>
            ) : null}
          </div>
        ) : null}
      </header>

      <div className="screen-scroll flex-1 px-4 py-6" role="tabpanel">
        {auth.userId && canOfferPush ? (
          <div className="mx-auto mb-4 max-w-[390px] rounded-2xl border bg-white p-4" style={{ borderColor: BORDER }}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">Push notifications</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  Booking updates, reminders, and messages — even when the app is closed.
                </p>
              </div>
              <button
                type="button"
                disabled={pushBusy}
                onClick={() => {
                  if (!auth.userId) return;
                  setPushBusy(true);
                  setPushError(null);
                  void subscribeToPush()
                    .then((sub) => {
                      if (!sub) throw new Error("Push not available or permission denied.");
                      return savePushSubscriptionRemote(auth.userId, sub);
                    })
                    .catch((e) => {
                      const msg = e instanceof Error ? e.message : "Push setup failed.";
                      setPushError(msg);
                    })
                    .finally(() => setPushBusy(false));
                }}
                className="shrink-0 rounded-xl px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
                style={{ backgroundColor: GREEN }}
              >
                {pushBusy ? "Enabling…" : "Enable"}
              </button>
            </div>
            {pushError ? <p className="mt-2 text-xs text-red-600">{pushError}</p> : null}
          </div>
        ) : null}

        <div className="mx-auto mb-4 max-w-[390px]">
          <NotificationPreferencesPanel />
        </div>

        {messageItems.length > 0 ? (
          <div className="mx-auto mb-6 max-w-[390px]">
            <p className="mb-3 px-1 text-[13px] font-semibold uppercase tracking-wide text-gray-400">
              Messages
            </p>
            <ul className="flex flex-col gap-3">
              {messageItems.map((n) => (
                <li key={n.id}>
                  <div
                    className="flex w-full items-start gap-3 rounded-2xl border bg-white p-4 text-left"
                    style={{ borderColor: BORDER }}
                  >
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: SURFACE }}
                    >
                      <MessageCircle className="h-5 w-5" style={{ color: GREEN }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-bold" style={{ color: GREEN }}>
                        {n.title}
                      </p>
                      <p className="mt-0.5 text-[14px] leading-snug text-gray-500">{n.body}</p>
                      <p className="mt-2 text-[11px] text-gray-400">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {filteredItems.length > 0 ? (
          <div className="mx-auto mb-6 max-w-[390px]">
            <p className="mb-3 px-1 text-[13px] font-semibold uppercase tracking-wide text-gray-400">
              Inbox
            </p>
            <ul className="flex flex-col gap-3">
              {filteredItems.map((n) => {
                const unread = !n.readAt;
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => handleNotificationTap(n)}
                      className="flex w-full items-start gap-3 rounded-2xl border bg-white p-4 text-left active:bg-[#F9FAFB]"
                      style={{ borderColor: BORDER }}
                      aria-label={unread ? "Mark as read" : "Notification"}
                    >
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                        style={{ backgroundColor: SURFACE }}
                      >
                        <MrRentano size={28} className="opacity-95" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="truncate text-[15px] font-bold" style={{ color: GREEN }}>
                            {n.title}
                          </p>
                          {unread ? (
                            <span
                              className="mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                              style={{ backgroundColor: GREEN_LIGHT }}
                              aria-hidden
                            />
                          ) : null}
                        </div>
                        <p className="mt-0.5 text-[14px] leading-snug text-gray-500">{n.body}</p>
                        <p className="mt-2 text-[11px] text-gray-400">
                          {new Date(n.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
            {loading ? (
              <p className="mt-3 px-1 text-[12px] text-gray-500">Loading…</p>
            ) : null}
          </div>
        ) : null}
        {showUpdateInTab && (updateAvailable || updateJustCompleted) ? (
          <div className="mx-auto mb-6 max-w-[390px]">
            <p className="mb-3 px-1 text-[13px] font-semibold uppercase tracking-wide text-gray-400">
              App updates
            </p>
            <ul className="flex flex-col gap-3">
              {updateJustCompleted ? (
                <li>
                  <PwaUpdateSuccessCard onDismiss={dismissUpdateSuccess} />
                </li>
              ) : null}
              {updateAvailable ? (
                <li>
                  <PwaUpdateNotificationCard onOpenDetail={() => setUpdateSheetOpen(true)} />
                </li>
              ) : null}
            </ul>
          </div>
        ) : null}

        {showEmptyState ? (
          <div className="mx-auto flex max-w-[340px] flex-col items-center text-center">
            <div
              className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 bg-white"
              style={{ borderColor: `${GREEN_LIGHT}55` }}
            >
              <Bell className="h-8 w-8" style={{ color: GREEN_LIGHT }} strokeWidth={1.75} />
            </div>
            <h2 className="text-[20px] font-bold leading-tight" style={{ color: GREEN }}>
              {empty.title}
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-gray-500">{empty.body}</p>
            {empty.hint ? (
              <p className="mt-2 text-[13px] leading-relaxed text-gray-400">{empty.hint}</p>
            ) : null}
          </div>
        ) : null}

        {visiblePreviews.length > 0 ? (
          <div className="mx-auto max-w-[390px]">
            <p className="mb-3 px-1 text-[13px] font-semibold uppercase tracking-wide text-gray-400">
              {SECTION_LABEL[tab]}
            </p>
            <ul className="flex flex-col gap-3">
              {visiblePreviews.map(({ icon: Icon, title, description }) => (
                <li
                  key={title}
                  className="flex gap-3 rounded-2xl border bg-white p-4"
                  style={{ borderColor: BORDER }}
                >
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: SURFACE }}
                  >
                    <Icon className="h-5 w-5" style={{ color: GREEN }} strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-[15px] font-bold" style={{ color: GREEN }}>
                      {title}
                    </p>
                    <p className="mt-0.5 text-[14px] leading-snug text-gray-500">{description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {tab === "all" && !updateAvailable && !updateJustCompleted ? (
          <p className="mx-auto mt-6 max-w-[320px] text-center text-[13px] leading-relaxed text-gray-400">
            <strong className="text-gray-500">Rent</strong> and{" "}
            <strong className="text-gray-500">Earn</strong> keep separate inboxes on this device.
            App updates appear here for both modes.
          </p>
        ) : null}
      </div>

      <PwaUpdateConfirmSheet open={updateSheetOpen} onClose={() => setUpdateSheetOpen(false)} />
    </div>
  );
}
