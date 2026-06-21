import type { ListingDraft } from "../screens/listing/types";
import {
  garageTrustLine,
  groupListingsByGarage,
  type GarageSummary,
} from "./garageDisplay";

export type YardSaleOpenStatus = "now" | "today" | "weekend";

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

const OPEN_SCHEDULES: Array<{ status: YardSaleOpenStatus; label: string }> = [
  { status: "now", label: "Open now · 8am–2pm" },
  { status: "today", label: "Today · 9am–1pm" },
  { status: "weekend", label: "Sat · 8am–12pm" },
  { status: "weekend", label: "This weekend · 7am–3pm" },
];

function mockOpenSchedule(hostId: string): { openLabel: string; openStatus: YardSaleOpenStatus } {
  const hash = hostId.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const pick = OPEN_SCHEDULES[hash % OPEN_SCHEDULES.length];
  return { openLabel: pick.label, openStatus: pick.status };
}

const STATUS_RANK: Record<YardSaleOpenStatus, number> = {
  now: 0,
  today: 1,
  weekend: 2,
};

export function garageHasSaleItems(garage: GarageSummary): boolean {
  return garage.listings.some((listing) => listing.modes.sell);
}

export function buildYardSaleEvents(listings: ListingDraft[]): YardSaleEvent[] {
  const garages = groupListingsByGarage(listings).filter(garageHasSaleItems);

  return garages
    .map((garage) => {
      const trust = garageTrustLine(garage.hostId);
      const saleItems = garage.listings.filter((listing) => listing.modes.sell);
      const categories = [
        ...new Set(saleItems.map((listing) => listing.category).filter(Boolean)),
      ].slice(0, 3);
      const schedule = mockOpenSchedule(garage.hostId);

      return {
        hostId: garage.hostId,
        name: trust.name,
        rating: trust.rating,
        distance: trust.distance,
        saleItemCount: saleItems.length,
        categories,
        ...schedule,
      };
    })
    .sort((a, b) => {
      const rank = STATUS_RANK[a.openStatus] - STATUS_RANK[b.openStatus];
      if (rank !== 0) return rank;
      return a.name.localeCompare(b.name);
    });
}
