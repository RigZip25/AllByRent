import { getManualRequestStats } from "./bookingRequestsStorage";

export type HostResponseDisplay =
  | { kind: "rate"; label: string; percent: number }
  | { kind: "new_host"; label: "New host" }
  | { kind: "na"; label: "—" };

/**
 * Response rate for Manual booking owners only.
 * (approved + declined within 24h) / total requests — shown when total ≥ 3.
 */
export function getHostResponseDisplay(
  hostId: string,
  usesManualBooking: boolean,
): HostResponseDisplay {
  if (!usesManualBooking) {
    return { kind: "na", label: "—" };
  }

  const { totalRequests, respondedWithin24h } = getManualRequestStats(hostId);

  if (totalRequests < 3) {
    return { kind: "new_host", label: "New host" };
  }

  const percent = Math.round((respondedWithin24h / totalRequests) * 100);
  return { kind: "rate", label: `${percent}%`, percent };
}
