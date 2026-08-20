import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Bell, MessageCircle } from "lucide-react";
import {
  PwaUpdateConfirmSheet,
  PwaUpdateNotificationCard,
  PwaUpdateSuccessCard,
} from "../components/PwaUpdateNotificationFlow";
import { usePwaUpdate } from "../hooks/PwaUpdateProvider";
import { getAppMode, type AppMode } from "../lib/appMode";
import { isStandalonePwa } from "../lib/pwaInstall";
import { useAuth } from "../hooks/AuthProvider";
import { loadInAppNotifications, markInAppNotificationRead, type InAppNotification } from "../lib/inAppNotifications";
import { fetchNotificationsRemote, markNotificationReadRemote, mergeWithLocalNotifications, type Notification } from "../lib/notificationsStorage";
import {
  canOfferWebPush,
  savePushSubscriptionRemote,
  subscribeToPush,
} from "../lib/pushNotifications";
import { NotificationPreferencesPanel } from "../components/notifications/NotificationPreferencesPanel";
import { MrRentano } from "../app/components/MrRentano";
import { useMessages } from "../lib/i18n/react";

const GREEN = "#0D5C3A";
const GREEN_LIGHT = "#1A9E6E";
const AMBER = "#F0B429";
const BORDER = "#E8E6E0";
const SURFACE = "#F0F4F2";

type NotificationTab = "all" | "bookings" | "messages";

function NotificationTabs({
  active,
  onChange,
}: {
  active: NotificationTab;
  onChange: (tab: NotificationTab) => void;
}) {
  const t = useMessages();
  const tabs: { id: NotificationTab; label: string }[] = [
    { id: "all", label: t.notifications.tabAll },
    { id: "bookings", label: t.notifications.tabBookings },
    { id: "messages", label: t.notifications.tabMessages },
  ];

  return (
    <div
      className="flex gap-1 rounded-full border bg-white p-1"
      style={{ borderColor: BORDER }}
      role="tablist"
      aria-label={t.notifications.filtersAria}
    >
      {tabs.map(({ id, label }) => {
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
  onOpenRental?: (bookingId: string) => void;
};

export function NotificationsScreen({
  onBack,
  mode: modeProp,
  onOpenRentals,
  onOpenRental,
}: NotificationsScreenProps) {
  const t = useMessages();
  const n = t.notifications;
  const mode = modeProp ?? getAppMode();
  const auth = useAuth();
  const [tab, setTab] = useState<NotificationTab>("all");
  const [pushBusy, setPushBusy] = useState(false);
  const [pushError, setPushError] = useState<string | null>(null);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushSendHint, setPushSendHint] = useState<string | null>(null);
  const canOfferPush = canOfferWebPush();
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

  const modeBadge = mode === "earn" ? n.modeHosting : n.modeRenting;
  const empty = n.empty[mode][tab];
  const showUpdateInTab = tab === "all";
  const [items, setItems] = useState<Notification[]>([]);
  const [localMessages, setLocalMessages] = useState<InAppNotification[]>(() => loadInAppNotifications());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userId = auth.userId;
    if (!userId) {
      const local: Notification[] = loadInAppNotifications().map((item) => ({
        id: item.id,
        recipientId: "local",
        actorId: null,
        type: item.type === "booking_request" ? "booking_request" : "general",
        title: item.title,
        body: item.body,
        readAt: item.read ? item.createdAt : null,
        createdAt: item.createdAt,
        rentalId: item.rentalId ?? null,
        listingId: item.listingId ?? null,
      }));
      setItems(local);
      return;
    }
    let mounted = true;
    setLoading(true);
    void fetchNotificationsRemote(userId)
      .then((data) => {
        if (!mounted) return;
        setItems(mergeWithLocalNotifications(data));
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
    return localMessages.filter((item) => item.type === "running_late" || item.type === "return");
  }, [localMessages, tab]);

  const filteredItems = useMemo(() => {
    if (tab === "messages") return [];
    if (tab === "bookings") return items.filter((item) => item.type === "booking_request");
    return items;
  }, [items, tab]);

  const handleMessageTap = (item: InAppNotification) => {
    if (!item.read) {
      markInAppNotificationRead(item.id);
      setLocalMessages((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, read: true } : p)),
      );
    }
    if (item.rentalId && onOpenRental) onOpenRental(item.rentalId);
    else onOpenRentals?.();
  };

  const handleNotificationTap = (item: Notification) => {
    if (!auth.userId) return;
    if (!item.readAt) {
      void markNotificationReadRemote(auth.userId, item.id).then(() => {
        setItems((prev) =>
          prev.map((p) => (p.id === item.id ? { ...p, readAt: new Date().toISOString() } : p)),
        );
      });
    }
    if (item.type === "booking_request") {
      if (item.rentalId && onOpenRental) onOpenRental(item.rentalId);
      else onOpenRentals?.();
    }
  };

  const hasInboxItems =
    filteredItems.length > 0 ||
    messageItems.length > 0 ||
    (showUpdateInTab && (updateAvailable || updateJustCompleted));
  const showEmptyState = !loading && !hasInboxItems;

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
            aria-label={n.backAria}
          >
            <ArrowLeft className="h-5 w-5" style={{ color: GREEN }} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-[20px] font-bold leading-tight" style={{ color: GREEN }}>
              {n.title}
            </h1>
            <span
              className="mt-0.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide"
              style={{
                backgroundColor: mode === "earn" ? `${AMBER}33` : `${GREEN_LIGHT}22`,
                color: GREEN,
              }}
            >
              {modeBadge}
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
                    setCheckMessage(n.updateFound);
                    return;
                  }
                  if (result === "current") {
                    setCheckMessage(isPwa ? n.latestVersionPwa : n.noUpdateWaiting);
                    return;
                  }
                  setCheckMessage(n.updatesUnavailable);
                });
              }}
              className="w-full rounded-2xl border py-2.5 text-[14px] font-semibold"
              style={{ borderColor: BORDER, color: GREEN }}
            >
              {checkStatus === "checking" ? n.checking : n.checkForUpdates}
            </button>
            {checkMessage ? (
              <p className="text-center text-[12px] leading-snug text-gray-500">{checkMessage}</p>
            ) : null}
            {import.meta.env.DEV ? (
              <button
                type="button"
                onClick={() => {
                  simulateUpdateNotification();
                  setCheckMessage(n.demoUpdateAdded);
                }}
                className="w-full rounded-2xl border border-dashed py-2 text-[12px] font-medium text-gray-500"
                style={{ borderColor: BORDER }}
              >
                {n.demoShowUpdate}
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
                <p className="text-sm font-semibold text-gray-900">{n.pushTitle}</p>
                <p className="mt-0.5 text-xs text-gray-500">{n.pushBody}</p>
              </div>
              <button
                type="button"
                disabled={pushBusy || pushEnabled}
                onClick={() => {
                  const userId = auth.userId;
                  if (!userId) return;
                  setPushBusy(true);
                  setPushError(null);
                  setPushSendHint(null);
                  void subscribeToPush()
                    .then(async (result) => {
                      if (!result.ok) {
                        throw new Error(result.message);
                      }
                      await savePushSubscriptionRemote(userId, result.subscription);
                      setPushEnabled(true);
                      if (!result.sendConfigured) {
                        setPushSendHint(
                          "This device is subscribed. Server delivery still needs VAPID_PRIVATE_KEY on Vercel.",
                        );
                      }
                    })
                    .catch((e) => {
                      const msg = e instanceof Error ? e.message : "Push setup failed.";
                      setPushError(msg);
                    })
                    .finally(() => setPushBusy(false));
                }}
                className="shrink-0 rounded-xl px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
                style={{ backgroundColor: pushEnabled ? GREEN_LIGHT : GREEN }}
              >
                {pushBusy ? n.enabling : pushEnabled ? n.enabled : n.enable}
              </button>
            </div>
            {pushError ? <p className="mt-2 text-xs text-red-600">{pushError}</p> : null}
            {pushSendHint ? <p className="mt-2 text-xs text-amber-700">{pushSendHint}</p> : null}
          </div>
        ) : null}

        <div className="mx-auto mb-4 max-w-[390px]">
          <NotificationPreferencesPanel />
        </div>

        {messageItems.length > 0 ? (
          <div className="mx-auto mb-6 max-w-[390px]">
            <p className="mb-3 px-1 text-[13px] font-semibold uppercase tracking-wide text-gray-400">
              {n.messagesSection}
            </p>
            <ul className="flex flex-col gap-3">
              {messageItems.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleMessageTap(item)}
                    className="flex w-full items-start gap-3 rounded-2xl border bg-white p-4 text-left"
                    style={{
                      borderColor: BORDER,
                      opacity: item.read ? 0.75 : 1,
                    }}
                  >
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: SURFACE }}
                    >
                      <MessageCircle className="h-5 w-5" style={{ color: GREEN }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-bold" style={{ color: GREEN }}>
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-[14px] leading-snug text-gray-500">{item.body}</p>
                      <p className="mt-2 text-[11px] text-gray-400">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {filteredItems.length > 0 ? (
          <div className="mx-auto mb-6 max-w-[390px]">
            <p className="mb-3 px-1 text-[13px] font-semibold uppercase tracking-wide text-gray-400">
              {n.inbox}
            </p>
            <ul className="flex flex-col gap-3">
              {filteredItems.map((item) => {
                const unread = !item.readAt;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleNotificationTap(item)}
                      className="flex w-full items-start gap-3 rounded-2xl border bg-white p-4 text-left active:bg-[#F9FAFB]"
                      style={{ borderColor: BORDER }}
                      aria-label={unread ? n.markAsRead : n.notification}
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
                            {item.title}
                          </p>
                          {unread ? (
                            <span
                              className="mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                              style={{ backgroundColor: GREEN_LIGHT }}
                              aria-hidden
                            />
                          ) : null}
                        </div>
                        <p className="mt-0.5 text-[14px] leading-snug text-gray-500">{item.body}</p>
                        <p className="mt-2 text-[11px] text-gray-400">
                          {new Date(item.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
            {loading ? (
              <p className="mt-3 px-1 text-[12px] text-gray-500">{n.loading}</p>
            ) : null}
          </div>
        ) : null}
        {showUpdateInTab && (updateAvailable || updateJustCompleted) ? (
          <div className="mx-auto mb-6 max-w-[390px]">
            <p className="mb-3 px-1 text-[13px] font-semibold uppercase tracking-wide text-gray-400">
              {n.appUpdates}
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
          <div className="mx-auto flex max-w-[340px] flex-col items-center py-8 text-center">
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
            {"hint" in empty && empty.hint ? (
              <p className="mt-2 text-[13px] leading-relaxed text-gray-400">{empty.hint}</p>
            ) : null}
          </div>
        ) : null}

        {loading && !hasInboxItems ? (
          <p className="mx-auto mt-6 max-w-[320px] text-center text-[13px] text-gray-500">{n.loading}</p>
        ) : null}

        {tab === "all" && !updateAvailable && !updateJustCompleted ? (
          <p className="mx-auto mt-6 max-w-[320px] text-center text-[13px] leading-relaxed text-gray-400">
            {n.modeFooter}
          </p>
        ) : null}
      </div>

      <PwaUpdateConfirmSheet open={updateSheetOpen} onClose={() => setUpdateSheetOpen(false)} />
    </div>
  );
}
