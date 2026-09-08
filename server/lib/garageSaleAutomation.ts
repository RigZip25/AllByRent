import type { SupabaseClient } from "@supabase/supabase-js";
import { insertNotification } from "./notifications";

/** Align with client GARAGE_AUCTION_PAY_MINUTES / OPEN_SALE_PAY_MINUTES. */
export const GARAGE_SALE_PAY_MINUTES = 30;
/** Accepted neighbor offers get a slightly longer pay window. */
export const OFFER_PAY_MINUTES = 45;

export type BidRow = {
  listing_id: string;
  bidder_id: string;
  amount_cents: number;
  placed_at: string;
};

export type LotStateRow = {
  listing_id: string;
  host_id: string;
  state: unknown;
};

export type OfferPrefsRow = {
  listing_id: string;
  host_id: string;
  prefs: unknown;
};

export type OpenSaleEventRow = {
  id: string;
  host_id: string;
  starts_at: string;
  ends_at: string;
  hard_ends_at: string;
  status: string;
};

export type OpenSaleLotRow = {
  event_id: string;
  listing_id: string;
};

export type OpenSaleLotResultRow = {
  event_id: string;
  listing_id: string;
  status: string;
  winner_bidder_id: string | null;
  amount_cents: number | null;
  pay_by: string | null;
  forfeited_bidder_ids: unknown;
};

export type NeighborOfferRow = {
  id: string;
  listing_id: string;
  host_id: string;
  buyer_id: string;
  amount_cents: number;
  status: string;
  pay_by: string | null;
  listing_title: string | null;
};

export function payByIsoFrom(nowMs: number, minutes = GARAGE_SALE_PAY_MINUTES): string {
  return new Date(nowMs + minutes * 60_000).toISOString();
}

function prefsIsAuction(prefs: unknown): boolean {
  if (!prefs || typeof prefs !== "object") return false;
  const record = prefs as Record<string, unknown>;
  if (record.kind === "auction") return true;
  if (record.negotiationPhase === "multi_auction") return true;
  return false;
}

function prefsEndsAtMs(prefs: unknown): number {
  if (!prefs || typeof prefs !== "object") return Number.NaN;
  const endsAt = (prefs as { endsAt?: unknown }).endsAt;
  if (typeof endsAt !== "string") return Number.NaN;
  return new Date(endsAt).getTime();
}

export function lotStatus(state: unknown): string {
  if (!state || typeof state !== "object") return "active";
  const status = (state as { status?: unknown }).status;
  return typeof status === "string" ? status : "active";
}

/**
 * Highest bid wins; equal amounts → earliest `placed_at` (first highest).
 */
export function pickWinningBid(bids: BidRow[]): BidRow | null {
  let best: BidRow | null = null;
  for (const bid of bids) {
    if (!bid.bidder_id || !(bid.amount_cents > 0)) continue;
    if (!best) {
      best = bid;
      continue;
    }
    if (bid.amount_cents > best.amount_cents) {
      best = bid;
      continue;
    }
    if (bid.amount_cents === best.amount_cents && bid.placed_at < best.placed_at) {
      best = bid;
    }
  }
  return best;
}

export function pickNextBid(bids: BidRow[], forfeitedBidderIds: string[]): BidRow | null {
  const excluded = new Set(forfeitedBidderIds);
  return pickWinningBid(bids.filter((bid) => !excluded.has(bid.bidder_id)));
}

export function shouldCloseClassicAuction(input: {
  prefs: unknown;
  lotStatus: string;
  nowMs: number;
}): boolean {
  if (input.lotStatus !== "active") return false;
  if (!prefsIsAuction(input.prefs)) return false;
  const endsMs = prefsEndsAtMs(input.prefs);
  if (Number.isNaN(endsMs)) return false;
  return endsMs <= input.nowMs;
}

export function buildAwaitingCheckoutState(input: {
  winnerBidderId: string;
  winningBidUsd: number;
  endedAt: string;
  payByIso: string;
  forfeitedBidderIds: string[];
  runnerUpAttempt: number;
}): Record<string, unknown> {
  return {
    status: "awaiting_checkout",
    winnerBidderId: input.winnerBidderId,
    winningBidUsd: input.winningBidUsd,
    endedAt: input.endedAt,
    payByIso: input.payByIso,
    forfeitedBidderIds: input.forfeitedBidderIds,
    runnerUpAttempt: input.runnerUpAttempt,
  };
}

export function buildExpiredNoBidsState(endedAt: string): Record<string, unknown> {
  return { status: "expired_no_bids", endedAt };
}

function readAwaiting(state: unknown): {
  winnerBidderId: string;
  winningBidUsd: number;
  endedAt: string;
  payByIso: string;
  forfeitedBidderIds: string[];
  runnerUpAttempt: number;
} | null {
  if (!state || typeof state !== "object") return null;
  const record = state as Record<string, unknown>;
  if (record.status !== "awaiting_checkout") return null;
  const payByIso = typeof record.payByIso === "string" ? record.payByIso : "";
  if (!payByIso) return null;
  const forfeited = Array.isArray(record.forfeitedBidderIds)
    ? record.forfeitedBidderIds.filter((id): id is string => typeof id === "string")
    : [];
  const attempt = Number(record.runnerUpAttempt);
  return {
    winnerBidderId: typeof record.winnerBidderId === "string" ? record.winnerBidderId : "",
    winningBidUsd: Number(record.winningBidUsd) || 0,
    endedAt: typeof record.endedAt === "string" ? record.endedAt : new Date().toISOString(),
    payByIso,
    forfeitedBidderIds: forfeited,
    runnerUpAttempt: Number.isFinite(attempt) ? Math.max(1, Math.round(attempt)) : 1,
  };
}

function parseForfeited(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((id): id is string => typeof id === "string");
}

async function upsertLotState(
  admin: SupabaseClient,
  listingId: string,
  hostId: string,
  state: Record<string, unknown>,
): Promise<void> {
  await admin.from("garage_lot_states").upsert({
    listing_id: listingId,
    host_id: hostId,
    state,
    updated_at: new Date().toISOString(),
  });
}

async function upsertOpenSaleLotResult(
  admin: SupabaseClient,
  row: {
    event_id: string;
    listing_id: string;
    status: string;
    winner_bidder_id?: string | null;
    amount_cents?: number | null;
    pay_by?: string | null;
    forfeited_bidder_ids?: string[];
    reason?: string | null;
  },
): Promise<void> {
  await admin.from("open_sale_lot_results").upsert(
    {
      event_id: row.event_id,
      listing_id: row.listing_id,
      status: row.status,
      winner_bidder_id: row.winner_bidder_id ?? null,
      amount_cents: row.amount_cents ?? null,
      pay_by: row.pay_by ?? null,
      forfeited_bidder_ids: row.forfeited_bidder_ids ?? [],
      reason: row.reason ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "event_id,listing_id" },
  );
}

/**
 * Close classic auctions, cascade unpaid winners, end open sales, write lot results,
 * and expire accepted offers past their pay window.
 */
export async function runGarageSaleAutomation(admin: SupabaseClient): Promise<{
  auctionsClosed: number;
  cascades: number;
  openSalesEnded: number;
  openSaleLotsResolved: number;
  openSaleCascades: number;
  offersExpired: number;
}> {
  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();
  let auctionsClosed = 0;
  let cascades = 0;
  let openSalesEnded = 0;
  let openSaleLotsResolved = 0;
  let openSaleCascades = 0;
  let offersExpired = 0;

  const { data: prefsRows } = await admin
    .from("garage_sale_offer_prefs")
    .select("listing_id, host_id, prefs");
  const prefs = (prefsRows ?? []) as OfferPrefsRow[];

  const auctionListingIds = prefs
    .filter((row) => prefsIsAuction(row.prefs))
    .map((row) => row.listing_id);
  const prefsByListing = new Map(prefs.map((row) => [row.listing_id, row]));

  const listingIdsForLots = [...new Set(auctionListingIds)];
  const { data: lotRows } =
    listingIdsForLots.length > 0
      ? await admin
          .from("garage_lot_states")
          .select("listing_id, host_id, state")
          .in("listing_id", listingIdsForLots)
      : { data: [] as LotStateRow[] };
  const lotByListing = new Map(
    ((lotRows ?? []) as LotStateRow[]).map((row) => [row.listing_id, row]),
  );

  const { data: bidRows } =
    listingIdsForLots.length > 0
      ? await admin
          .from("garage_bids")
          .select("listing_id, bidder_id, amount_cents, placed_at")
          .in("listing_id", listingIdsForLots)
      : { data: [] as BidRow[] };
  const bidsByListing = new Map<string, BidRow[]>();
  for (const bid of (bidRows ?? []) as BidRow[]) {
    const list = bidsByListing.get(bid.listing_id) ?? [];
    list.push(bid);
    bidsByListing.set(bid.listing_id, list);
  }

  for (const listingId of listingIdsForLots) {
    const prefsRow = prefsByListing.get(listingId);
    if (!prefsRow) continue;
    const existing = lotByListing.get(listingId);
    const status = lotStatus(existing?.state);
    if (
      !shouldCloseClassicAuction({
        prefs: prefsRow.prefs,
        lotStatus: status,
        nowMs,
      })
    ) {
      continue;
    }

    const bids = bidsByListing.get(listingId) ?? [];
    const winner = pickWinningBid(bids);
    const endedAt = nowIso;
    if (winner) {
      const state = buildAwaitingCheckoutState({
        winnerBidderId: winner.bidder_id,
        winningBidUsd: winner.amount_cents / 100,
        endedAt,
        payByIso: payByIsoFrom(nowMs),
        forfeitedBidderIds: [],
        runnerUpAttempt: 1,
      });
      await upsertLotState(admin, listingId, prefsRow.host_id, state);
      if (/^[0-9a-f-]{36}$/i.test(winner.bidder_id)) {
        await insertNotification(admin, {
          recipientId: winner.bidder_id,
          actorId: prefsRow.host_id,
          type: "general",
          title: "You won the auction!",
          body: `Pay $${(winner.amount_cents / 100).toFixed(2)} within ${GARAGE_SALE_PAY_MINUTES} minutes before the lot goes to the next bidder.`,
        });
      }
    } else {
      await upsertLotState(
        admin,
        listingId,
        prefsRow.host_id,
        buildExpiredNoBidsState(endedAt),
      );
    }
    auctionsClosed += 1;
  }

  // Cascade classic awaiting_checkout past pay_by.
  const { data: awaitingLots } = await admin
    .from("garage_lot_states")
    .select("listing_id, host_id, state");
  for (const row of (awaitingLots ?? []) as LotStateRow[]) {
    const awaiting = readAwaiting(row.state);
    if (!awaiting) continue;
    if (new Date(awaiting.payByIso).getTime() > nowMs) continue;

    const { data: listingBids } = await admin
      .from("garage_bids")
      .select("listing_id, bidder_id, amount_cents, placed_at")
      .eq("listing_id", row.listing_id);
    const forfeited = [...awaiting.forfeitedBidderIds, awaiting.winnerBidderId].filter(Boolean);
    const next = pickNextBid((listingBids ?? []) as BidRow[], forfeited);

    if (awaiting.winnerBidderId && /^[0-9a-f-]{36}$/i.test(awaiting.winnerBidderId)) {
      await insertNotification(admin, {
        recipientId: awaiting.winnerBidderId,
        actorId: row.host_id,
        type: "general",
        title: "Payment window expired",
        body: "You didn't pay in time — this lot goes to the next-highest bidder.",
      });
    }

    if (next) {
      const state = buildAwaitingCheckoutState({
        winnerBidderId: next.bidder_id,
        winningBidUsd: next.amount_cents / 100,
        endedAt: awaiting.endedAt,
        payByIso: payByIsoFrom(nowMs),
        forfeitedBidderIds: forfeited,
        runnerUpAttempt: awaiting.runnerUpAttempt + 1,
      });
      await upsertLotState(admin, row.listing_id, row.host_id, state);
      if (/^[0-9a-f-]{36}$/i.test(next.bidder_id)) {
        await insertNotification(admin, {
          recipientId: next.bidder_id,
          actorId: row.host_id,
          type: "general",
          title: "You're the next bidder",
          body: `Pay $${(next.amount_cents / 100).toFixed(2)} within ${GARAGE_SALE_PAY_MINUTES} minutes to claim this lot.`,
        });
      }
    } else {
      await upsertLotState(
        admin,
        row.listing_id,
        row.host_id,
        buildExpiredNoBidsState(nowIso),
      );
    }
    cascades += 1;
  }

  // End open sale events past soft/hard close.
  const { data: openEvents } = await admin
    .from("open_sale_events")
    .select("id, host_id, starts_at, ends_at, hard_ends_at, status")
    .in("status", ["presale", "live"]);
  const eventsToClose = ((openEvents ?? []) as OpenSaleEventRow[]).filter((event) => {
    const endsMs = new Date(event.ends_at).getTime();
    const hardMs = new Date(event.hard_ends_at).getTime();
    return nowMs >= Math.min(endsMs, hardMs) || nowMs >= hardMs;
  });

  for (const event of eventsToClose) {
    await admin
      .from("open_sale_events")
      .update({ status: "ended", updated_at: nowIso })
      .eq("id", event.id);
    openSalesEnded += 1;
  }

  const { data: recentlyEnded } = await admin
    .from("open_sale_events")
    .select("id, host_id, starts_at, ends_at, hard_ends_at, status")
    .eq("status", "ended")
    .order("updated_at", { ascending: false })
    .limit(200);
  const endedEvents = (recentlyEnded ?? []) as OpenSaleEventRow[];
  const endedIds = endedEvents.map((e) => e.id);
  if (endedIds.length > 0) {
    const { data: lots } = await admin
      .from("open_sale_lots")
      .select("event_id, listing_id")
      .in("event_id", endedIds);
    const { data: existingResults } = await admin
      .from("open_sale_lot_results")
      .select(
        "event_id, listing_id, status, winner_bidder_id, amount_cents, pay_by, forfeited_bidder_ids",
      )
      .in("event_id", endedIds);
    const resultKey = (eventId: string, listingId: string) => `${eventId}:${listingId}`;
    const resultsByKey = new Map(
      ((existingResults ?? []) as OpenSaleLotResultRow[]).map((row) => [
        resultKey(row.event_id, row.listing_id),
        row,
      ]),
    );

    const openListingIds = [
      ...new Set(((lots ?? []) as OpenSaleLotRow[]).map((lot) => lot.listing_id)),
    ];
    const { data: openBids } =
      openListingIds.length > 0
        ? await admin
            .from("garage_bids")
            .select("listing_id, bidder_id, amount_cents, placed_at")
            .in("listing_id", openListingIds)
        : { data: [] as BidRow[] };
    const openBidsByListing = new Map<string, BidRow[]>();
    for (const bid of (openBids ?? []) as BidRow[]) {
      const list = openBidsByListing.get(bid.listing_id) ?? [];
      list.push(bid);
      openBidsByListing.set(bid.listing_id, list);
    }

    for (const lot of (lots ?? []) as OpenSaleLotRow[]) {
      const key = resultKey(lot.event_id, lot.listing_id);
      if (resultsByKey.has(key)) continue;
      const winner = pickWinningBid(openBidsByListing.get(lot.listing_id) ?? []);
      if (winner) {
        await upsertOpenSaleLotResult(admin, {
          event_id: lot.event_id,
          listing_id: lot.listing_id,
          status: "awaiting_checkout",
          winner_bidder_id: winner.bidder_id,
          amount_cents: winner.amount_cents,
          pay_by: payByIsoFrom(nowMs),
          forfeited_bidder_ids: [],
        });
        if (/^[0-9a-f-]{36}$/i.test(winner.bidder_id)) {
          const event = endedEvents.find((e) => e.id === lot.event_id);
          await insertNotification(admin, {
            recipientId: winner.bidder_id,
            actorId: event?.host_id ?? winner.bidder_id,
            type: "general",
            title: "You won — pay now",
            body: `Pay $${(winner.amount_cents / 100).toFixed(2)} within ${GARAGE_SALE_PAY_MINUTES} min or the lot goes to the next bid.`,
          });
        }
      } else {
        await upsertOpenSaleLotResult(admin, {
          event_id: lot.event_id,
          listing_id: lot.listing_id,
          status: "returned",
          reason: "no_bids",
        });
        const event = endedEvents.find((e) => e.id === lot.event_id);
        if (event) {
          await upsertLotState(
            admin,
            lot.listing_id,
            event.host_id,
            buildExpiredNoBidsState(nowIso),
          );
        }
      }
      openSaleLotsResolved += 1;
    }

    // Cascade unpaid open-sale winners.
    for (const row of (existingResults ?? []) as OpenSaleLotResultRow[]) {
      if (row.status !== "awaiting_checkout" || !row.pay_by) continue;
      if (new Date(row.pay_by).getTime() > nowMs) continue;

      const forfeited = [
        ...parseForfeited(row.forfeited_bidder_ids),
        ...(row.winner_bidder_id ? [row.winner_bidder_id] : []),
      ];
      if (row.winner_bidder_id && /^[0-9a-f-]{36}$/i.test(row.winner_bidder_id)) {
        try {
          await admin.rpc("ban_open_sale_bidder", {
            p_bidder_id: row.winner_bidder_id,
            p_days: 30,
            p_reason: "missed_payment",
          });
        } catch {
          /* ban helper may be unavailable in older DBs */
        }
      }

      const next = pickNextBid(openBidsByListing.get(row.listing_id) ?? [], forfeited);
      if (next) {
        await upsertOpenSaleLotResult(admin, {
          event_id: row.event_id,
          listing_id: row.listing_id,
          status: "awaiting_checkout",
          winner_bidder_id: next.bidder_id,
          amount_cents: next.amount_cents,
          pay_by: payByIsoFrom(nowMs),
          forfeited_bidder_ids: forfeited,
        });
        if (/^[0-9a-f-]{36}$/i.test(next.bidder_id)) {
          const event = endedEvents.find((e) => e.id === row.event_id);
          await insertNotification(admin, {
            recipientId: next.bidder_id,
            actorId: event?.host_id ?? next.bidder_id,
            type: "general",
            title: "You're next — pay now",
            body: `Previous winner missed payment. Pay $${(next.amount_cents / 100).toFixed(2)} within ${GARAGE_SALE_PAY_MINUTES} min.`,
          });
        }
      } else {
        await upsertOpenSaleLotResult(admin, {
          event_id: row.event_id,
          listing_id: row.listing_id,
          status: "returned",
          reason: "cascade_exhausted",
          forfeited_bidder_ids: forfeited,
        });
        const event = endedEvents.find((e) => e.id === row.event_id);
        if (event) {
          await upsertLotState(
            admin,
            row.listing_id,
            event.host_id,
            buildExpiredNoBidsState(nowIso),
          );
        }
      }
      openSaleCascades += 1;
    }
  }

  // Expire accepted offers past pay_by (column added in 061; tolerate missing).
  try {
    const { data: acceptedOffers, error } = await admin
      .from("garage_neighbor_offers")
      .select("id, listing_id, host_id, buyer_id, amount_cents, status, pay_by, listing_title")
      .eq("status", "accepted");
    if (!error) {
      for (const offer of (acceptedOffers ?? []) as NeighborOfferRow[]) {
        if (!offer.pay_by) continue;
        if (new Date(offer.pay_by).getTime() > nowMs) continue;
        await admin
          .from("garage_neighbor_offers")
          .update({ status: "expired", updated_at: nowIso, pay_by: null })
          .eq("id", offer.id);
        if (/^[0-9a-f-]{36}$/i.test(offer.buyer_id)) {
          await insertNotification(admin, {
            recipientId: offer.buyer_id,
            actorId: offer.host_id,
            type: "general",
            title: "Offer expired",
            body: `${offer.listing_title || "Sale item"} — payment window ended. The item is back on the shelf.`,
          });
        }
        offersExpired += 1;
      }
    }
  } catch {
    /* pay_by column may be missing before migration 061 */
  }

  return {
    auctionsClosed,
    cascades,
    openSalesEnded,
    openSaleLotsResolved,
    openSaleCascades,
    offersExpired,
  };
}
