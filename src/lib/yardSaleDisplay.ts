import type { ListingDraft } from "../screens/listing/types";
import {
  garageTrustLine,
  groupListingsByGarage,
  type GarageSummary,
} from "./garageDisplay";
import type { GarageSaleSchedule } from "./garageSaleStorage";
import { garageSaleOpenLabel } from "./garageSaleStorage";

export type YardSaleOpenStatus = "now" | "today" | "weekend" | "scheduled" | "unset";

export type YardSaleEvent = {
  hostId: string;
  name: string;
  rating: number;
  distance: string;
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

function openStatusFromSchedule(
  schedule: GarageSaleSchedule | null | undefined,
  now = new Date(),
): { openLabel: string; openStatus: YardSaleOpenStatus } {
  if (!schedule || schedule.daysOfWeek.length === 0) {
    return { openLabel: "Hours not set", openStatus: "unset" };
  }

  const summary = garageSaleOpenLabel(schedule);
  const day = now.getDay();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const start = parseHm(schedule.startTime);
  const end = parseHm(schedule.endTime);
  const isOpenDay = schedule.daysOfWeek.includes(day);
  const inWindow = end > start ? minutes >= start && minutes < end : minutes >= start || minutes < end;

  if (isOpenDay && inWindow) {
    return { openLabel: `Open now · ${summary}`, openStatus: "now" };
  }
  if (isOpenDay) {
    return { openLabel: `Today · ${summary}`, openStatus: "today" };
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
): YardSaleEvent[] {
  const garages = groupListingsByGarage(listings).filter(garageHasSaleItems);

  return garages
    .map((garage) => {
      const trust = garageTrustLine(garage.hostId);
      const saleItems = garage.listings.filter((listing) => listing.modes.sell);
      const categories = [
        ...new Set(saleItems.map((listing) => listing.category).filter(Boolean)),
      ].slice(0, 3);
      const schedule = schedulesByHostId[garage.hostId];
      const open = openStatusFromSchedule(schedule ?? null);

      return {
        hostId: garage.hostId,
        name: trust.name,
        rating: trust.rating,
        distance: trust.distance,
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
