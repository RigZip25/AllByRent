import type { GarageLotState } from "../garageAuctionState";
import type { GarageNeighborOffer } from "../garageOfferStorage";
import type { GarageSaleOfferPrefs } from "../garageSaleOfferStorage";
import type { GarageSaleSchedule } from "../garageSaleStorage";
import type { GarageFollow } from "../garageFollowStorage";
import type { GarageBid } from "../garageShopStorage";
import { getSupabaseClient, isSupabaseConfigured } from "../supabaseClient";

function supabaseReady(): boolean {
  return isSupabaseConfigured() && Boolean(getSupabaseClient());
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function pushGarageBidRemote(bid: GarageBid): Promise<void> {
  if (!supabaseReady() || !isUuid(bid.listingId) || !isUuid(bid.hostId)) return;
  const supabase = getSupabaseClient()!;
  await supabase.from("garage_bids").insert({
    listing_id: bid.listingId,
    host_id: bid.hostId,
    bidder_id: bid.bidderId,
    amount_cents: Math.round(bid.amountUsd * 100),
    placed_at: bid.placedAt,
  });
}

export async function fetchGarageBidsRemote(listingIds: string[]): Promise<GarageBid[]> {
  if (!supabaseReady()) return [];
  const ids = listingIds.filter(isUuid);
  if (ids.length === 0) return [];
  const supabase = getSupabaseClient()!;
  const { data, error } = await supabase
    .from("garage_bids")
    .select("listing_id, host_id, bidder_id, amount_cents, placed_at")
    .in("listing_id", ids)
    .order("placed_at", { ascending: false });
  if (error || !data) return [];
  return data.map((row) => ({
    listingId: row.listing_id as string,
    hostId: row.host_id as string,
    bidderId: row.bidder_id as string,
    amountUsd: (row.amount_cents as number) / 100,
    placedAt: row.placed_at as string,
  }));
}

export async function pushNeighborOfferRemote(offer: GarageNeighborOffer): Promise<void> {
  if (!supabaseReady() || !isUuid(offer.listingId) || !isUuid(offer.hostId)) return;
  if (!isUuid(offer.buyerId)) return;
  const supabase = getSupabaseClient()!;
  await supabase.from("garage_neighbor_offers").upsert({
    id: isUuid(offer.id) ? offer.id : undefined,
    listing_id: offer.listingId,
    host_id: offer.hostId,
    buyer_id: offer.buyerId,
    amount_cents: Math.round(offer.amountUsd * 100),
    status: offer.status,
    listing_title: offer.listingTitle,
    created_at: offer.createdAt,
    updated_at: offer.updatedAt,
  });
}

export async function fetchNeighborOffersRemote(params: {
  hostId?: string;
  listingIds?: string[];
}): Promise<GarageNeighborOffer[]> {
  if (!supabaseReady()) return [];
  const supabase = getSupabaseClient()!;
  let query = supabase
    .from("garage_neighbor_offers")
    .select("id, listing_id, host_id, buyer_id, amount_cents, status, listing_title, created_at, updated_at");
  if (params.hostId && isUuid(params.hostId)) {
    query = query.eq("host_id", params.hostId);
  }
  if (params.listingIds?.length) {
    const ids = params.listingIds.filter(isUuid);
    if (ids.length === 0) return [];
    query = query.in("listing_id", ids);
  }
  const { data, error } = await query.order("updated_at", { ascending: false });
  if (error || !data) return [];
  return data.map((row) => ({
    id: row.id as string,
    listingId: row.listing_id as string,
    hostId: row.host_id as string,
    buyerId: row.buyer_id as string,
    amountUsd: (row.amount_cents as number) / 100,
    status: row.status as GarageNeighborOffer["status"],
    listingTitle: (row.listing_title as string) ?? "",
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }));
}

export async function pushLotStateRemote(
  listingId: string,
  hostId: string,
  state: GarageLotState,
): Promise<void> {
  if (!supabaseReady() || !isUuid(listingId) || !isUuid(hostId)) return;
  const supabase = getSupabaseClient()!;
  await supabase.from("garage_lot_states").upsert({
    listing_id: listingId,
    host_id: hostId,
    state,
    updated_at: new Date().toISOString(),
  });
}

export async function fetchLotStatesRemote(hostId: string): Promise<Record<string, GarageLotState>> {
  if (!supabaseReady() || !isUuid(hostId)) return {};
  const supabase = getSupabaseClient()!;
  const { data, error } = await supabase
    .from("garage_lot_states")
    .select("listing_id, state")
    .eq("host_id", hostId);
  if (error || !data) return {};
  const map: Record<string, GarageLotState> = {};
  for (const row of data) {
    map[row.listing_id as string] = row.state as GarageLotState;
  }
  return map;
}

export async function pushSaleScheduleRemote(hostId: string, schedule: GarageSaleSchedule): Promise<void> {
  if (!supabaseReady() || !isUuid(hostId)) return;
  const supabase = getSupabaseClient()!;
  await supabase.from("garage_sale_schedules").upsert({
    host_id: hostId,
    days_of_week: schedule.daysOfWeek,
    start_time: schedule.startTime,
    end_time: schedule.endTime,
    updated_at: new Date().toISOString(),
  });
}

export async function fetchSaleScheduleRemote(hostId: string): Promise<GarageSaleSchedule | null> {
  if (!supabaseReady() || !isUuid(hostId)) return null;
  const supabase = getSupabaseClient()!;
  const { data, error } = await supabase
    .from("garage_sale_schedules")
    .select("days_of_week, start_time, end_time")
    .eq("host_id", hostId)
    .maybeSingle();
  if (error || !data) return null;
  return {
    daysOfWeek: (data.days_of_week as number[]) ?? [6],
    startTime: (data.start_time as string) ?? "09:00",
    endTime: (data.end_time as string) ?? "13:00",
  };
}

export async function pushOfferPrefsRemote(
  listingId: string,
  hostId: string,
  prefs: GarageSaleOfferPrefs,
): Promise<void> {
  if (!supabaseReady() || !isUuid(listingId) || !isUuid(hostId)) return;
  const supabase = getSupabaseClient()!;
  await supabase.from("garage_sale_offer_prefs").upsert({
    listing_id: listingId,
    host_id: hostId,
    prefs,
    updated_at: new Date().toISOString(),
  });
}

export async function fetchOfferPrefsRemote(listingIds: string[]): Promise<Record<string, GarageSaleOfferPrefs>> {
  if (!supabaseReady()) return {};
  const ids = listingIds.filter(isUuid);
  if (ids.length === 0) return {};
  const supabase = getSupabaseClient()!;
  const { data, error } = await supabase
    .from("garage_sale_offer_prefs")
    .select("listing_id, prefs")
    .in("listing_id", ids);
  if (error || !data) return {};
  const map: Record<string, GarageSaleOfferPrefs> = {};
  for (const row of data) {
    map[row.listing_id as string] = row.prefs as GarageSaleOfferPrefs;
  }
  return map;
}

export async function followGarageRemote(follow: GarageFollow, followerId: string): Promise<void> {
  if (!supabaseReady() || !isUuid(follow.hostId) || !isUuid(followerId)) return;
  const supabase = getSupabaseClient()!;
  await supabase.from("garage_follows").upsert({
    follower_id: followerId,
    host_id: follow.hostId,
    notify_new_listings: follow.notifyNewListings,
    notify_open_house: follow.notifyOpenHouse,
  });
}

export async function unfollowGarageRemote(hostId: string, followerId: string): Promise<void> {
  if (!supabaseReady() || !isUuid(hostId) || !isUuid(followerId)) return;
  const supabase = getSupabaseClient()!;
  await supabase.from("garage_follows").delete().eq("follower_id", followerId).eq("host_id", hostId);
}

export async function updateGarageFollowRemote(
  hostId: string,
  followerId: string,
  patch: Partial<Pick<GarageFollow, "notifyNewListings" | "notifyOpenHouse">>,
): Promise<void> {
  if (!supabaseReady() || !isUuid(hostId) || !isUuid(followerId)) return;
  const supabase = getSupabaseClient()!;
  await supabase
    .from("garage_follows")
    .update({
      notify_new_listings: patch.notifyNewListings,
      notify_open_house: patch.notifyOpenHouse,
    })
    .eq("follower_id", followerId)
    .eq("host_id", hostId);
}

export async function fetchGarageFollowsRemote(followerId: string): Promise<GarageFollow[]> {
  if (!supabaseReady() || !isUuid(followerId)) return [];
  const supabase = getSupabaseClient()!;
  const { data, error } = await supabase
    .from("garage_follows")
    .select("host_id, notify_new_listings, notify_open_house, created_at")
    .eq("follower_id", followerId);
  if (error || !data) return [];
  return data.map((row) => ({
    hostId: row.host_id as string,
    displayName: "",
    followedAt: row.created_at as string,
    notifyNewListings: Boolean(row.notify_new_listings),
    notifyOpenHouse: Boolean(row.notify_open_house ?? true),
  }));
}
