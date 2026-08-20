import { loadPublishedListings } from "./listingStorage";
import { getListingDisplayTitle } from "./listingQr";
import {
  loadRentalBookings,
  type RentalBooking,
} from "./rentalsStorage";
import {
  loadUserProfile,
  refreshProfileStats,
} from "./userProfileStorage";
import { formatMoney } from "./regionalDisplay";
import { bookingGross, bookingHostNet, bookingPlatformFee } from "./earnStatement";

function formatActiveListingsCount(count: number): string {
  if (count === 1) return "1 active listing";
  return `${count} active listings`;
}

export type EarningsTrend = "up" | "down" | "flat";

export type DailyEarningPoint = {
  date: string;
  label: string;
  amountUsd: number;
};

export type ListingEarnBreakdown = {
  listingId: string;
  title: string;
  earnedTotal: number;
  earnedThisMonth: number;
  trend: EarningsTrend;
  activeRentals: number;
  completedRentals: number;
};

export type GrowthTip = {
  title: string;
  body: string;
};

export type EarnBusinessStats = {
  totalEarnedAllTime: number;
  earnedThisMonth: number;
  earnedLastMonth: number;
  growthPercentMonthOverMonth: number | null;
  earnedLast7Days: DailyEarningPoint[];
  projectedThisMonth: number;
  activeEarningNowUsd: number;
  activeItemsOut: number;
  listingsCount: number;
  liveCount: number;
  draftCount: number;
  completedRentals: number;
  planUsageLabel: string;
  perListing: ListingEarnBreakdown[];
  growthTips: GrowthTip[];
  /** @deprecated use totalEarnedAllTime */
  totalEarnedUsd: number;
};

const ITEMS_OUT_STATUSES = ["active", "overdue"] as const;

function hostBookings(bookings: RentalBooking[]): RentalBooking[] {
  return bookings.filter((b) => b.role === "host");
}

function hostCompleted(bookings: RentalBooking[]): RentalBooking[] {
  return hostBookings(bookings).filter((b) => b.status === "completed");
}

function bookingEarnedAt(booking: RentalBooking): Date {
  const raw = booking.completedAt ?? `${booking.endDate}T12:00:00.000Z`;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? new Date(booking.endDate) : parsed;
}

function sameCalendarMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function previousCalendarMonth(ref: Date): { year: number; month: number } {
  const d = new Date(ref.getFullYear(), ref.getMonth() - 1, 1);
  return { year: d.getFullYear(), month: d.getMonth() };
}

function isInCalendarMonth(date: Date, year: number, month: number): boolean {
  return date.getFullYear() === year && date.getMonth() === month;
}

/** Expected host net for in-progress bookings (same fee model as completed). */
function expectedHostNet(booking: RentalBooking): number {
  return Math.max(0, bookingGross(booking) - bookingPlatformFee(booking));
}

function sumEarningsInMonth(bookings: RentalBooking[], year: number, month: number): number {
  return hostCompleted(bookings)
    .filter((b) => isInCalendarMonth(bookingEarnedAt(b), year, month))
    .reduce((sum, b) => sum + bookingHostNet(b), 0);
}

function matchListingTitle(bookingTitle: string, listingTitle: string): boolean {
  const a = bookingTitle.trim().toLowerCase();
  const b = listingTitle.trim().toLowerCase();
  return a === b || a.includes(b) || b.includes(a);
}

function computeTrend(thisMonth: number, lastMonth: number): EarningsTrend {
  if (thisMonth > lastMonth) return "up";
  if (thisMonth < lastMonth) return "down";
  return "flat";
}

function buildLast7Days(completed: RentalBooking[], now: Date): DailyEarningPoint[] {
  const points: DailyEarningPoint[] = [];
  for (let offset = 6; offset >= 0; offset -= 1) {
    const day = new Date(now);
    day.setHours(12, 0, 0, 0);
    day.setDate(day.getDate() - offset);
    const date = day.toISOString().slice(0, 10);
    const amountUsd = completed
      .filter((b) => bookingEarnedAt(b).toISOString().slice(0, 10) === date)
      .reduce((sum, b) => sum + bookingHostNet(b), 0);
    points.push({
      date,
      label: day.toLocaleDateString(undefined, { weekday: "narrow" }),
      amountUsd,
    });
  }
  return points;
}

function computeProjectedThisMonth(earnedThisMonth: number, now: Date): number {
  const dayOfMonth = now.getDate();
  if (dayOfMonth <= 0) return earnedThisMonth;
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return Math.round((earnedThisMonth / dayOfMonth) * daysInMonth);
}

function computeGrowthPercent(thisMonth: number, lastMonth: number): number | null {
  if (lastMonth === 0 && thisMonth === 0) return 0;
  if (lastMonth === 0) return null;
  return Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
}

function buildGrowthTips(stats: {
  earnedThisMonth: number;
  earnedLastMonth: number;
  growthPercentMonthOverMonth: number | null;
  listingsCount: number;
  liveCount: number;
  draftCount: number;
  activeEarningNowUsd: number;
  activeItemsOut: number;
  perListing: ListingEarnBreakdown[];
}): GrowthTip[] {
  const tips: GrowthTip[] = [];
  const hasRealPace = stats.perListing.some((row) => row.earnedThisMonth > 0);

  if (stats.earnedThisMonth === 0 && stats.earnedLastMonth === 0) {
    tips.push({
      title: "Get your first booking",
      body: "Share your garage with neighbors nearby — visibility beats guessing a monthly dollar target.",
    });
    if (stats.draftCount > 0) {
      tips.push({
        title: "Finish a draft",
        body: "Unfinished drafts never earn. Publish one clear photo + price today.",
      });
    } else if (stats.liveCount > 0) {
      tips.push({
        title: "Make listings easy to book",
        body: "Fresh cover photo, weekend availability, and a fair day rate beat inventing a $80 goal.",
      });
    } else {
      tips.push({
        title: "Stock your first item",
        body: "One solid listing on the block beats ten empty projections.",
      });
    }
    return tips.slice(0, 2);
  }

  if (hasRealPace && stats.liveCount > 0) {
    const earners = stats.perListing.filter((row) => row.earnedThisMonth > 0);
    const avg = Math.round(
      earners.reduce((sum, row) => sum + row.earnedThisMonth, 0) / earners.length,
    );
    tips.push({
      title: "Expand your catalog",
      body: `Your live items averaged ~$${avg}/mo this month. Another similar listing can compound that pace.`,
    });
  }

  if (stats.growthPercentMonthOverMonth !== null && stats.growthPercentMonthOverMonth > 0) {
    tips.push({
      title: "Momentum is building",
      body: `You're up ${stats.growthPercentMonthOverMonth}% vs last month ($${stats.earnedLastMonth} → $${stats.earnedThisMonth}). Keep pricing aligned with your top earner.`,
    });
  } else if (stats.earnedThisMonth < stats.earnedLastMonth && stats.earnedLastMonth > 0) {
    tips.push({
      title: "Recover last month's pace",
      body: `You earned $${stats.earnedLastMonth} last month. Refresh photos and availability on listings that were active then.`,
    });
  }

  if (stats.activeItemsOut > 0) {
    tips.push({
      title: "Money out in the field",
      body: `$${stats.activeEarningNowUsd} is tied up in ${stats.activeItemsOut} active rental${stats.activeItemsOut === 1 ? "" : "s"} right now — fast responses protect those payouts.`,
    });
  }

  if (tips.length === 0 && stats.draftCount > 0) {
    tips.push({
      title: "Finish a draft",
      body: "Unfinished drafts never earn. Publish one clear photo + price today.",
    });
  }

  return tips.slice(0, 3);
}

export function formatUsd(amount: number): string {
  // Name kept for call sites; formats in the active country currency.
  return formatMoney(Math.round(amount));
}

export function formatGrowthBadge(percent: number | null): string {
  if (percent === null) return "New this month";
  const sign = percent > 0 ? "+" : "";
  return `${sign}${percent}% vs last month`;
}

export function computeEarnBusinessStats(now = new Date()): EarnBusinessStats {
  const profile = refreshProfileStats(loadUserProfile());
  const listings = loadPublishedListings();
  const bookings = hostBookings(loadRentalBookings());
  const completed = bookings.filter((b) => b.status === "completed");
  const itemsOut = bookings.filter((b) =>
    ITEMS_OUT_STATUSES.includes(b.status as (typeof ITEMS_OUT_STATUSES)[number]),
  );

  const totalEarnedAllTime = completed.reduce((sum, b) => sum + bookingHostNet(b), 0);
  const earnedThisMonth = sumEarningsInMonth(
    loadRentalBookings(),
    now.getFullYear(),
    now.getMonth(),
  );
  const prev = previousCalendarMonth(now);
  const earnedLastMonth = sumEarningsInMonth(
    loadRentalBookings(),
    prev.year,
    prev.month,
  );
  const growthPercentMonthOverMonth = computeGrowthPercent(
    earnedThisMonth,
    earnedLastMonth,
  );
  const earnedLast7Days = buildLast7Days(completed, now);
  const projectedThisMonth = computeProjectedThisMonth(earnedThisMonth, now);
  const activeEarningNowUsd = itemsOut.reduce((sum, b) => sum + expectedHostNet(b), 0);
  const activeItemsOut = itemsOut.length;

  const liveCount = listings.filter(
    (l) => l.listingStatus === "active" && !l.paused,
  ).length;
  const draftCount = listings.filter((l) => l.listingStatus === "draft").length;

  const perListing: ListingEarnBreakdown[] = listings
    .filter((l) => l.listingStatus !== "draft")
    .map((listing) => {
      const title = getListingDisplayTitle(listing.title);
      const related = bookings.filter((b) =>
        matchListingTitle(b.itemTitle, listing.title || title),
      );
      const listingCompleted = related.filter((b) => b.status === "completed");
      const listingActive = related.filter((b) =>
        ["active", "pending_checkin", "upcoming", "overdue"].includes(b.status),
      );

      const earnedTotal = listingCompleted.reduce((sum, b) => sum + bookingHostNet(b), 0);
      const earnedThisMonthForListing = listingCompleted
        .filter((b) => sameCalendarMonth(bookingEarnedAt(b), now))
        .reduce((sum, b) => sum + bookingHostNet(b), 0);
      const earnedLastMonthForListing = listingCompleted
        .filter((b) =>
          isInCalendarMonth(bookingEarnedAt(b), prev.year, prev.month),
        )
        .reduce((sum, b) => sum + bookingHostNet(b), 0);

      return {
        listingId: listing.id,
        title,
        earnedTotal,
        earnedThisMonth: earnedThisMonthForListing,
        trend: computeTrend(earnedThisMonthForListing, earnedLastMonthForListing),
        activeRentals: listingActive.length,
        completedRentals: listingCompleted.length,
      };
    })
    .sort((a, b) => b.earnedThisMonth - a.earnedThisMonth || b.earnedTotal - a.earnedTotal);

  const growthTips = buildGrowthTips({
    earnedThisMonth,
    earnedLastMonth,
    growthPercentMonthOverMonth,
    listingsCount: listings.length,
    liveCount,
    draftCount,
    activeEarningNowUsd,
    activeItemsOut,
    perListing,
  });

  return {
    totalEarnedAllTime,
    earnedThisMonth,
    earnedLastMonth,
    growthPercentMonthOverMonth,
    earnedLast7Days,
    projectedThisMonth,
    activeEarningNowUsd,
    activeItemsOut,
    listingsCount: liveCount,
    liveCount,
    draftCount,
    completedRentals: completed.length,
    planUsageLabel: formatActiveListingsCount(profile.host.listingsCount),
    perListing,
    growthTips,
    totalEarnedUsd: totalEarnedAllTime,
  };
}
