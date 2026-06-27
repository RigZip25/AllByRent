/** Manual booking request stats for host response rate. */

const REQUESTS_KEY = "allbyrent_manual_booking_requests";
const MS_DAY = 24 * 60 * 60 * 1000;

export type ManualRequestRecord = {
  id: string;
  hostId: string;
  createdAt: string;
  /** approved or declined within 24h of createdAt */
  respondedWithin24h: boolean;
  outcome: "approved" | "declined" | "pending" | "expired";
};

function saveManualBookingRequests(records: ManualRequestRecord[]): void {
  try {
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(records.slice(0, 200)));
  } catch {
    /* ignore */
  }
}

export function loadManualBookingRequests(): ManualRequestRecord[] {
  try {
    const raw = localStorage.getItem(REQUESTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ManualRequestRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function trackManualBookingRequest(bookingId: string, hostId: string): void {
  const records = loadManualBookingRequests();
  if (records.some((r) => r.id === bookingId)) return;
  records.unshift({
    id: bookingId,
    hostId,
    createdAt: new Date().toISOString(),
    respondedWithin24h: false,
    outcome: "pending",
  });
  saveManualBookingRequests(records);
}

export function recordManualBookingResponse(
  bookingId: string,
  hostId: string,
  outcome: "approved" | "declined",
): void {
  const records = loadManualBookingRequests();
  const idx = records.findIndex((r) => r.id === bookingId);
  const createdAt = idx >= 0 ? records[idx].createdAt : new Date().toISOString();
  const respondedWithin24h = Date.now() - new Date(createdAt).getTime() <= MS_DAY;
  const record: ManualRequestRecord = {
    id: bookingId,
    hostId,
    createdAt,
    respondedWithin24h,
    outcome,
  };
  if (idx >= 0) records[idx] = record;
  else records.unshift(record);
  saveManualBookingRequests(records);
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
