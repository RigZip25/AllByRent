import type { ListingDraft } from "../screens/listing/types";
import {
  garageTrustLine,
  groupListingsByGarage,
  type GarageSummary,
  type HostGarageMeta,
} from "./garageDisplay";
import type { GarageSaleSchedule } from "./garageSaleStorage";
import { garageSaleOpenLabel } from "./garageSaleStorage";
import { getMessages } from "./i18n";

export type YardSaleOpenStatus = "now" | "today" | "weekend" | "scheduled" | "unset";

export type YardSaleEvent = {
  hostId: string;
  name: string;
  /** Average review rating; null when the host has no reviews yet. */
  rating: number | null;
  distance: string;
  neighborhood: string;
  saleItemCount: number;
  openLabel: string;
  openStatus: YardSaleOpenStatus;
  categories: string[];
};

const STATUS_RANK: Record<YardSaleOpenStatus, number> = {
  now: 0,
  today: 1,
  weekend: 2,
  scheduled: 3,
  unset: 4,
};

function parseHm(value: string): number {
  const [h, m] = value.split(":").map((part) => Number.parseInt(part, 10));
  if (!Number.isFinite(h) || !Number.isFinite(m)) return 0;
  return h * 60 + m;
}

/**
 * Open-now / today badges require the store to be live.
 * Schedule-open but paused → scheduled with a paused label.
 */
export function openStatusFromSchedule(
  schedule: GarageSaleSchedule | null | undefined,
  now = new Date(),
  storeLive = true,
): { openLabel: string; openStatus: YardSaleOpenStatus } {
  const copy = getMessages().garageSale.openGarageSale;
  if (!schedule || schedule.daysOfWeek.length === 0) {
    return { openLabel: copy.hoursNotSet, openStatus: "unset" };
  }

  const summary = garageSaleOpenLabel(schedule);
  const day = now.getDay();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const start = parseHm(schedule.startTime);
  const end = parseHm(schedule.endTime);
  const isOpenDay = schedule.daysOfWeek.includes(day);
  const inWindow = end > start ? minutes >= start && minutes < end : minutes >= start || minutes < end;

  if (!storeLive) {
    return { openLabel: copy.storePausedWithSummary(summary), openStatus: "scheduled" };
  }

  if (isOpenDay && inWindow) {
    return { openLabel: copy.openNowWithSummary(summary), openStatus: "now" };
  }
  if (isOpenDay) {
    return { openLabel: copy.todayWithSummary(summary), openStatus: "today" };
  }
  const weekendDays = schedule.daysOfWeek.filter((d) => d === 0 || d === 6);
  if (weekendDays.length > 0 && (day === 5 || day === 6 || day === 0)) {
    return { openLabel: summary, openStatus: "weekend" };
  }
  return { openLabel: summary, openStatus: "scheduled" };
}

export function garageHasSaleItems(garage: GarageSummary): boolean {
  return garage.listings.some((listing) => listing.modes.sell);
}

export function buildYardSaleEvents(
  listings: ListingDraft[],
  schedulesByHostId: Record<string, GarageSaleSchedule | null | undefined> = {},
  hostMeta?: Record<string, HostGarageMeta>,
  storeLiveByHostId: Record<string, boolean> = {},
): YardSaleEvent[] {
  const garages = groupListingsByGarage(listings, hostMeta).filter(garageHasSaleItems);

  return garages
    .map((garage) => {
      const trust = garageTrustLine(garage.hostId, hostMeta);
      const saleItems = garage.listings.filter((listing) => listing.modes.sell);
      const categories = [
        ...new Set(saleItems.map((listing) => listing.category).filter(Boolean)),
      ].slice(0, 3);
      const schedule = schedulesByHostId[garage.hostId];
      const storeLive = storeLiveByHostId[garage.hostId] !== false;
      const open = openStatusFromSchedule(schedule ?? null, new Date(), storeLive);
      const rating =
        typeof trust.rating === "number" && trust.rating > 0 ? trust.rating : null;

      return {
        hostId: garage.hostId,
        name: trust.name,
        rating,
        distance: trust.distance,
        neighborhood: trust.neighborhood || garage.neighborhood || "",
        saleItemCount: saleItems.length,
        categories,
        ...open,
      };
    })
    .sort((a, b) => {
      const rank = STATUS_RANK[a.openStatus] - STATUS_RANK[b.openStatus];
      if (rank !== 0) return rank;
      return a.name.localeCompare(b.name);
    });
}
