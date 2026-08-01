import { loadPublishedListings } from "../listingStorage";
import { loadRentalBookings } from "../rentalsStorage";
import { isSupabaseConfigured } from "../supabaseClient";
import { isStripePaymentsEnabled } from "../stripeConfig";
import { getIndexableSeoLocations, SEO_LOCATIONS } from "../seo/seoLocations";
import { getClusterRadiusMi } from "../clusterConfig";
import { isFoundingHostPromoSeen } from "../foundingHostPromoStorage";
import { getEffectiveRentalFeeRate, getSellFeeRate, loadOpsSettings } from "./opsSettings";

export type OpsPulse = {
  listingsTotal: number;
  listingsActive: number;
  bookingsTotal: number;
  bookingsPending: number;
  bookingsActive: number;
  bookingsCompleted: number;
  serviceFeesCapturedUsd: number;
  rentalFeeRate: number;
  sellFeeRate: number;
  clusterRadiusMi: number;
  indexableCities: number;
  citiesTotal: number;
  foundingPromoSeen: boolean;
  supabaseConfigured: boolean;
  stripeConfigured: boolean;
  agentKeyConfigured: boolean;
  promoActive: boolean;
  promoLabel: string;
  updatedAt: string | null;
};

export function computeOpsPulse(): OpsPulse {
  const listings = loadPublishedListings();
  const bookings = loadRentalBookings();
  const settings = loadOpsSettings();

  const serviceFeesCapturedUsd = bookings.reduce((sum, b) => {
    const fee = typeof b.serviceFeeUsd === "number" ? b.serviceFeeUsd : 0;
    return sum + (Number.isFinite(fee) ? fee : 0);
  }, 0);

  return {
    listingsTotal: listings.length,
    listingsActive: listings.filter(
      (l) => !l.paused && (l.listingStatus === "active" || l.listingStatus === "published"),
    ).length,
    bookingsTotal: bookings.length,
    bookingsPending: bookings.filter(
      (b) => b.status === "pending_approval" || b.status === "pending_checkin",
    ).length,
    bookingsActive: bookings.filter((b) => b.status === "active" || b.status === "overdue").length,
    bookingsCompleted: bookings.filter((b) => b.status === "completed").length,
    serviceFeesCapturedUsd: Math.round(serviceFeesCapturedUsd * 100) / 100,
    rentalFeeRate: getEffectiveRentalFeeRate(),
    sellFeeRate: getSellFeeRate(),
    clusterRadiusMi: getClusterRadiusMi(),
    indexableCities: getIndexableSeoLocations().length,
    citiesTotal: SEO_LOCATIONS.length,
    foundingPromoSeen: isFoundingHostPromoSeen(),
    supabaseConfigured: isSupabaseConfigured(),
    stripeConfigured: isStripePaymentsEnabled(),
    agentKeyConfigured: Boolean(String(import.meta.env.VITE_AGENT_API_KEY ?? "").trim()),
    promoActive: settings.promoRentalFeeRate !== null,
    promoLabel: settings.promoLabel,
    updatedAt: settings.updatedAt,
  };
}
