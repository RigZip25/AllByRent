import {
  markAuctionCheckoutComplete,
  markBuyNowSold,
  mergeLotStatesFromRemote,
} from "../garageAuctionState";
import {
  followGarage,
  loadGarageFollows,
  saveGarageFollowsFromRemote,
  unfollowGarage,
  updateGarageFollow,
  type GarageFollow,
} from "../garageFollowStorage";
import { mergeNeighborOffersFromRemote, type GarageNeighborOffer } from "../garageOfferStorage";
import {
  mergeOfferPrefsFromRemote,
  setGarageSaleOfferPrefs,
  type GarageSaleOfferPrefs,
} from "../garageSaleOfferStorage";
import {
  mergeSaleScheduleFromRemote,
  setGarageSaleSchedule,
  type GarageSaleSchedule,
} from "../garageSaleStorage";
import { mergeBidsFromRemote, placeGarageBid } from "../garageShopStorage";
import {
  fetchGarageBidsRemote,
  fetchGarageFollowsRemote,
  fetchLotStatesRemote,
  fetchNeighborOffersRemote,
  fetchOfferPrefsRemote,
  fetchSaleScheduleRemote,
  followGarageRemote,
  pushGarageBidRemote,
  pushNeighborOfferRemote,
  pushOfferPrefsRemote,
  pushSaleScheduleRemote,
  unfollowGarageRemote,
  updateGarageFollowRemote,
} from "../garage/garageSupabaseSync";
import { isSupabaseConfigured } from "../supabaseClient";

export type GarageSyncParams = {
  hostId: string;
  userId: string | null;
  listingIds: string[];
};

export async function syncGarageFromRemote(params: GarageSyncParams): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const { hostId, userId, listingIds } = params;

  const [bids, offers, lotStates, prefs, schedule, follows] = await Promise.all([
    fetchGarageBidsRemote(listingIds),
    fetchNeighborOffersRemote({ hostId, listingIds }),
    fetchLotStatesRemote(hostId),
    fetchOfferPrefsRemote(listingIds),
    fetchSaleScheduleRemote(hostId),
    userId ? fetchGarageFollowsRemote(userId) : Promise.resolve([]),
  ]);

  if (bids.length > 0) mergeBidsFromRemote(bids);
  if (offers.length > 0) mergeNeighborOffersFromRemote(offers);
  if (Object.keys(lotStates).length > 0) mergeLotStatesFromRemote(lotStates);
  if (Object.keys(prefs).length > 0) mergeOfferPrefsFromRemote(prefs);
  if (schedule) mergeSaleScheduleFromRemote(schedule);
  if (follows.length > 0 && userId) saveGarageFollowsFromRemote(follows);
}

export async function completeBuyNowSale(params: {
  listingId: string;
  hostId: string;
  priceUsd: number;
  listingTitle?: string;
}): Promise<void> {
  // Local UX only. Stripe webhook stamps garage_lot_states after
  // payment_intent.succeeded — the client must not mark the lot sold first.
  void params.hostId;
  markBuyNowSold(params.listingId, params.priceUsd, params.listingTitle);
}

export async function completeAuctionPayment(params: {
  listingId: string;
  hostId: string;
  priceUsd: number;
  listingTitle?: string;
}): Promise<void> {
  void params.hostId;
  markAuctionCheckoutComplete(params.listingId, params.priceUsd, params.listingTitle);
}

export async function placeBidWithSync(input: Parameters<typeof placeGarageBid>[0]) {
  const result = placeGarageBid(input);
  if (result.ok) {
    void pushGarageBidRemote(result.bid);
  }
  return result;
}

export async function persistNeighborOffer(offer: GarageNeighborOffer): Promise<void> {
  await pushNeighborOfferRemote(offer);
}

export async function persistOfferPrefs(
  listingId: string,
  hostId: string,
  prefs: GarageSaleOfferPrefs,
): Promise<void> {
  setGarageSaleOfferPrefs(listingId, prefs);
  await pushOfferPrefsRemote(listingId, hostId, prefs);
}

export async function persistSaleSchedule(hostId: string, schedule: GarageSaleSchedule): Promise<void> {
  setGarageSaleSchedule(schedule);
  await pushSaleScheduleRemote(hostId, schedule);
}

export async function persistFollow(entry: GarageFollow, followerId: string): Promise<void> {
  followGarage(entry);
  await followGarageRemote(entry, followerId);
}

export async function persistUnfollow(hostId: string, followerId: string): Promise<void> {
  unfollowGarage(hostId);
  await unfollowGarageRemote(hostId, followerId);
}

export async function persistFollowPatch(
  hostId: string,
  followerId: string,
  patch: Partial<Pick<GarageFollow, "notifyNewListings" | "notifyOpenHouse">>,
): Promise<void> {
  updateGarageFollow(hostId, patch);
  await updateGarageFollowRemote(hostId, followerId, patch);
}

export { loadGarageFollows };
