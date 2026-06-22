/** Manual booking request stats for host response rate. */

const REQUESTS_KEY = "allbyrent_manual_booking_requests";

export type ManualRequestRecord = {
  id: string;
  hostId: string;
  createdAt: string;
  /** approved or declined within 24h of createdAt */
  respondedWithin24h: boolean;
  outcome: "approved" | "declined" | "pending" | "expired";
};

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
