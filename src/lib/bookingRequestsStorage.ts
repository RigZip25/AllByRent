/** Manual booking request stats for host response rate (demo). */

const REQUESTS_KEY = "allbyrent_manual_booking_requests";

export type ManualRequestRecord = {
  id: string;
  hostId: string;
  createdAt: string;
  /** approved or declined within 24h of createdAt */
  respondedWithin24h: boolean;
  outcome: "approved" | "declined" | "pending" | "expired";
};

const DEMO_REQUESTS: ManualRequestRecord[] = [
  {
    id: "req-1",
    hostId: "demo-user",
    createdAt: "2026-05-01T10:00:00.000Z",
    respondedWithin24h: true,
    outcome: "approved",
  },
  {
    id: "req-2",
    hostId: "demo-user",
    createdAt: "2026-05-05T14:00:00.000Z",
    respondedWithin24h: true,
    outcome: "declined",
  },
  {
    id: "req-3",
    hostId: "demo-user",
    createdAt: "2026-05-10T09:00:00.000Z",
    respondedWithin24h: true,
    outcome: "approved",
  },
  {
    id: "req-4",
    hostId: "demo-user",
    createdAt: "2026-05-15T11:00:00.000Z",
    respondedWithin24h: false,
    outcome: "expired",
  },
  {
    id: "req-5",
    hostId: "demo-user",
    createdAt: "2026-05-20T16:00:00.000Z",
    respondedWithin24h: true,
    outcome: "approved",
  },
];

export function loadManualBookingRequests(): ManualRequestRecord[] {
  try {
    const raw = localStorage.getItem(REQUESTS_KEY);
    if (!raw) {
      localStorage.setItem(REQUESTS_KEY, JSON.stringify(DEMO_REQUESTS));
      return DEMO_REQUESTS;
    }
    return JSON.parse(raw) as ManualRequestRecord[];
  } catch {
    return DEMO_REQUESTS;
  }
}

export function getManualRequestStats(hostId: string): {
  totalRequests: number;
  respondedWithin24h: number;
} {
  const records = loadManualBookingRequests().filter((r) => r.hostId === hostId);
  const respondedWithin24h = records.filter(
    (r) =>
      (r.outcome === "approved" || r.outcome === "declined") && r.respondedWithin24h,
  ).length;
  return {
    totalRequests: records.length,
    respondedWithin24h,
  };
}
