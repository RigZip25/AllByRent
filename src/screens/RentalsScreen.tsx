import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  ChevronRight,
  History,
  Package,
  ScanLine,
  Search,
} from "lucide-react";
import { BottomNav } from "../app/components/BottomNav";
import { BookingRequestCard } from "../components/rentals/BookingRequestCard";
import { PendingApprovalCard } from "../components/rentals/PendingApprovalCard";
import { RentalCard } from "../components/rentals/RentalCard";
import { RentanoChatSheet } from "../components/RentanoChat";
import { getAppMode } from "../lib/appMode";
import { pushInAppNotification } from "../lib/inAppNotifications";
import {
  getActiveBookings,
  getHistoryBookings,
  getPendingApprovalRequests,
  getPendingApprovalWaiting,
  getUpcomingBookings,
  loadRentalBookings,
  type RentalBooking,
  type RentalRole,
} from "../lib/rentalsStorage";

const GREEN = "#0D5C3A";
const GREEN_LIGHT = "#1A9E6E";
const AMBER = "#F0B429";
const BORDER = "#E8E6E0";

const HISTORY_PAGE_SIZE = 5;
const REQUEST_PUSH_KEY = "allbyrent_demo_request_push_sent";

type RentalsTab = "active" | "upcoming" | "history";
type RoleFilter = "all" | RentalRole;
type HistorySort = "recent" | "oldest" | "amount";

const TABS: { id: RentalsTab; label: string }[] = [
  { id: "active", label: "Active" },
  { id: "upcoming", label: "Upcoming" },
  { id: "history", label: "History" },
];

const ROLE_FILTERS: { id: RoleFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "renter", label: "Renting" },
  { id: "host", label: "Hosting" },
];

const SORT_OPTIONS: { id: HistorySort; label: string }[] = [
  { id: "recent", label: "Recent" },
  { id: "oldest", label: "Oldest" },
  { id: "amount", label: "Highest amount" },
];

function RentalsTabs({
  active,
  onChange,
}: {
  active: RentalsTab;
  onChange: (tab: RentalsTab) => void;
}) {
  return (
    <div
      className="flex gap-1 rounded-full border bg-white p-1"
      style={{ borderColor: BORDER }}
      role="tablist"
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
            className="flex-1 rounded-full px-2 py-2 text-[13px] font-bold transition-colors"
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

function RoleChips({
  active,
  onChange,
}: {
  active: RoleFilter;
  onChange: (role: RoleFilter) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {ROLE_FILTERS.map(({ id, label }) => {
        const selected = active === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className="shrink-0 rounded-full border px-3 py-1.5 text-[13px] font-semibold"
            style={{
              borderColor: selected ? GREEN : BORDER,
              backgroundColor: selected ? `${GREEN_LIGHT}18` : "white",
              color: selected ? GREEN : "#666",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function EmptyState({ tab }: { tab: RentalsTab }) {
  const copy: Record<RentalsTab, { title: string; body: string }> = {
    active: {
      title: "No active rentals",
      body: "When you pick up an item or host a booking, it shows here with live timers and trust badges.",
    },
    upcoming: {
      title: "Nothing scheduled",
      body: "Upcoming rentals and hosting handoffs appear here before start date.",
    },
    history: {
      title: "No history yet",
      body: "Completed, cancelled, and resolved no-show bookings are kept here.",
    },
  };
  const { title, body } = copy[tab];
  return (
    <div className="mx-auto flex max-w-[300px] flex-col items-center py-10 text-center">
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 bg-white"
        style={{ borderColor: `${GREEN_LIGHT}55` }}
      >
        {tab === "history" ? (
          <History className="h-7 w-7" style={{ color: GREEN_LIGHT }} />
        ) : tab === "upcoming" ? (
          <CalendarClock className="h-7 w-7" style={{ color: GREEN_LIGHT }} />
        ) : (
          <Package className="h-7 w-7" style={{ color: GREEN_LIGHT }} />
        )}
      </div>
      <h2 className="text-[18px] font-bold" style={{ color: GREEN }}>
        {title}
      </h2>
      <p className="mt-2 text-[14px] leading-relaxed text-gray-500">{body}</p>
    </div>
  );
}

function sortHistory(list: RentalBooking[], sort: HistorySort): RentalBooking[] {
  const copy = [...list];
  if (sort === "amount") {
    return copy.sort((a, b) => b.totalUsd - a.totalUsd);
  }
  const dateKey = (b: RentalBooking) =>
    new Date(b.completedAt ?? b.endDate).getTime();
  if (sort === "oldest") {
    return copy.sort((a, b) => dateKey(a) - dateKey(b));
  }
  return copy.sort((a, b) => dateKey(b) - dateKey(a));
}

export function RentalsScreen({
  onHome,
  onPostRequest,
  onRentano,
  onProfile,
  onOpenRental,
  onViewProfile,
}: {
  onHome: () => void;
  onPostRequest: () => void;
  onRentano: () => void;
  onProfile: () => void;
  onOpenRental: (bookingId: string) => void;
  onViewProfile: (userId: string) => void;
}) {
  const [tab, setTab] = useState<RentalsTab>("active");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [historySort, setHistorySort] = useState<HistorySort>("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const [historyVisible, setHistoryVisible] = useState(HISTORY_PAGE_SIZE);
  const [rentanoOpen, setRentanoOpen] = useState(false);
  const [bookings, setBookings] = useState<RentalBooking[]>(() => loadRentalBookings());
  const mode = getAppMode();

  const refresh = useCallback(() => setBookings(loadRentalBookings()), []);

  useEffect(() => {
    if (localStorage.getItem(REQUEST_PUSH_KEY)) return;
    const requests = getPendingApprovalRequests(loadRentalBookings());
    if (requests.length === 0) return;
    pushInAppNotification({
      type: "booking_request",
      title: "New booking request",
      body: `${requests[0].counterpartyName} wants to rent your ${requests[0].itemTitle}.`,
    });
    localStorage.setItem(REQUEST_PUSH_KEY, "1");
  }, []);

  const hostRequests = useMemo(
    () => getPendingApprovalRequests(bookings),
    [bookings],
  );
  const renterWaiting = useMemo(
    () => getPendingApprovalWaiting(bookings),
    [bookings],
  );

  const filtered = useMemo(() => {
    let list: RentalBooking[];
    if (tab === "active") list = getActiveBookings(bookings);
    else if (tab === "upcoming") list = getUpcomingBookings(bookings);
    else list = getHistoryBookings(bookings);

    if (roleFilter !== "all") {
      list = list.filter((b) => b.role === roleFilter);
    }

    if (tab === "history") {
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        list = list.filter((b) => b.itemTitle.toLowerCase().includes(q));
      }
      list = sortHistory(list, historySort);
    }

    return list;
  }, [bookings, tab, roleFilter, historySort, searchQuery]);

  const historyPage = tab === "history" ? filtered.slice(0, historyVisible) : filtered;
  const hasMoreHistory = tab === "history" && historyVisible < filtered.length;

  const pendingCheckin = filtered.find((b) => b.status === "pending_checkin");

  useEffect(() => {
    setHistoryVisible(HISTORY_PAGE_SIZE);
  }, [tab, roleFilter, historySort, searchQuery]);

  return (
    <div className="screen flex flex-col overflow-hidden bg-[#F0F4F2]">
      <header className="shrink-0 px-4 pb-3 pt-3">
        <h1 className="mb-1 text-[22px] font-bold" style={{ color: GREEN }}>
          Rentals
        </h1>
        <p className="mb-3 text-[14px] text-gray-500">
          {mode === "earn"
            ? "Hosting and renting — one place for every booking."
            : "Your bookings as a renter and host."}
        </p>
        <RentalsTabs active={tab} onChange={setTab} />
        <div className="mt-3">
          <RoleChips active={roleFilter} onChange={setRoleFilter} />
        </div>
        {tab === "history" ? (
          <div className="mt-3 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by item name"
                className="w-full rounded-xl border bg-white py-2.5 pl-9 pr-3 text-[14px]"
                style={{ borderColor: BORDER }}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {SORT_OPTIONS.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setHistorySort(id)}
                  className="shrink-0 rounded-full border px-3 py-1 text-[12px] font-semibold"
                  style={{
                    borderColor: historySort === id ? GREEN : BORDER,
                    color: historySort === id ? GREEN : "#666",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </header>

      <div className="screen-scroll flex-1 px-4 pb-4" role="tabpanel">
        {tab === "active" && hostRequests.length > 0 ? (
          <section className="mb-4">
            <div className="mb-2 flex items-center gap-2">
              <h2 className="text-[15px] font-bold" style={{ color: GREEN }}>
                Requests
              </h2>
              <span
                className="rounded-full px-2 py-0.5 text-[12px] font-bold text-white"
                style={{ backgroundColor: "#2563EB" }}
              >
                {hostRequests.length}
              </span>
            </div>
            <ul className="flex flex-col gap-3">
              {hostRequests.map((b) => (
                <li key={b.id}>
                  <BookingRequestCard
                    booking={b}
                    onRefresh={refresh}
                    onViewProfile={onViewProfile}
                  />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {tab === "active" && renterWaiting.length > 0 ? (
          <ul className="mb-4 flex flex-col gap-3">
            {renterWaiting.map((b) => (
              <li key={b.id}>
                <PendingApprovalCard
                  booking={b}
                  onRefresh={refresh}
                  onViewProfile={onViewProfile}
                />
              </li>
            ))}
          </ul>
        ) : null}

        {pendingCheckin && tab === "active" ? (
          <button
            type="button"
            onClick={() => onOpenRental(pendingCheckin.id)}
            className="mb-4 flex w-full items-center gap-3 rounded-2xl border p-4 text-left"
            style={{ borderColor: `${AMBER}88`, backgroundColor: `${AMBER}15` }}
          >
            <ScanLine className="h-8 w-8 shrink-0" style={{ color: AMBER }} />
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-bold" style={{ color: GREEN }}>
                Scan QR to check in
              </p>
              <p className="text-[13px] text-gray-600">{pendingCheckin.itemTitle}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
        ) : null}

        {historyPage.length > 0 ? (
          <>
            <ul className="flex flex-col gap-3">
              {historyPage.map((booking) => (
                <li key={booking.id}>
                  <RentalCard
                    booking={booking}
                    tab={tab}
                    onOpen={() => onOpenRental(booking.id)}
                    onRefresh={refresh}
                    onViewProfile={onViewProfile}
                  />
                </li>
              ))}
            </ul>
            {hasMoreHistory ? (
              <button
                type="button"
                onClick={() => setHistoryVisible((n) => n + HISTORY_PAGE_SIZE)}
                className="mt-4 w-full rounded-xl border py-3 text-[14px] font-semibold"
                style={{ borderColor: BORDER, color: GREEN }}
              >
                Load more ({filtered.length - historyVisible} remaining)
              </button>
            ) : null}
          </>
        ) : (
          <EmptyState tab={tab} />
        )}
      </div>

      <div className="shrink-0">
        <BottomNav
          activeTab="rentals"
          onHome={onHome}
          onPostRequest={onPostRequest}
          onRentano={() => setRentanoOpen(true)}
          onProfile={onProfile}
        />
      </div>

      <RentanoChatSheet
        open={rentanoOpen}
        onClose={() => setRentanoOpen(false)}
        context={{ screen: "rentals", appMode: mode }}
      />
    </div>
  );
}
