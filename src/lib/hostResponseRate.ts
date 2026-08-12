import { getManualRequestStats } from "./bookingRequestsStorage";

export type HostResponseDisplay =
  | { kind: "rate"; percent: number }
  | { kind: "new_host" }
  | { kind: "na" };

/**
 * Response rate for Manual booking owners only.
 * (approved + declined within 24h) / total requests — shown when total ≥ 3.
 * UI maps `kind` to locale strings (e.g. Spanish "Nuevo anfitrión").
 */
export function getHostResponseDisplay(
  hostId: string,
  usesManualBooking: boolean,
): HostResponseDisplay {
  if (!usesManualBooking) {
    return { kind: "na" };
  }

  const { totalRequests, respondedWithin24h } = getManualRequestStats(hostId);

  if (totalRequests < 3) {
    return { kind: "new_host" };
  }

  const percent = Math.round((respondedWithin24h / totalRequests) * 100);
  return { kind: "rate", percent };
}
