import type { OpenSaleEvent, OpenSaleLot } from "./types";
import { getSupabaseClient, isSupabaseConfigured } from "../supabaseClient";
import { createOpenSaleEvent as createOpenSaleEventLocal } from "./eventStorage";
import { placeOpenSaleCartBid as placeOpenSaleCartBidLocal } from "./bidCart";
import { mergeBidsFromRemote, type GarageBid } from "../garageShopStorage";

function supabaseReady(): boolean {
  return isSupabaseConfigured() && Boolean(getSupabaseClient());
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function writeLocalEvent(event: OpenSaleEvent): void {
  try {
    const raw = localStorage.getItem("evorios_open_sale_events");
    const list = raw ? (JSON.parse(raw) as OpenSaleEvent[]) : [];
    const without = list.filter(
      (e) => e.id !== event.id && !(e.hostId === event.hostId && (e.status === "presale" || e.status === "live")),
    );
    localStorage.setItem("evorios_open_sale_events", JSON.stringify([...without, event]));
    window.dispatchEvent(new Event("evorios-open-sale-events"));
  } catch {
    /* */
  }
}

type RemoteEventRow = {
  id: string;
  host_id: string;
  starts_at: string;
  ends_at: string;
  hard_ends_at: string;
  status: OpenSaleEvent["status"];
  created_at: string;
};

type RemoteLotRow = {
  event_id: string;
  listing_id: string;
  min_bid_cents: number;
  bid_step_cents: number;
  origin: OpenSaleLot["origin"];
};

function mapEvent(row: RemoteEventRow, lots: OpenSaleLot[]): OpenSaleEvent {
  return {
    id: row.id,
    hostId: row.host_id,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    hardEndsAt: row.hard_ends_at,
    status: row.status,
    lots,
    createdAt: row.created_at,
  };
}

/** Persist event on server (truth). Falls back to local when offline / no supabase. */
export async function createOpenSaleEventAuthoritative(input: {
  hostId: string;
  startsAt: Date;
  liveMinutes: 30 | 60;
  lots: OpenSaleLot[];
}): Promise<OpenSaleEvent | { error: string }> {
  const endsAt = new Date(input.startsAt.getTime() + input.liveMinutes * 60_000);
  const hardEndsAt = new Date(endsAt.getTime() + 15 * 60_000);

  if (supabaseReady()) {
    const supabase = getSupabaseClient()!;
    const { data, error } = await supabase.rpc("create_open_sale_event", {
      p_starts_at: input.startsAt.toISOString(),
      p_ends_at: endsAt.toISOString(),
      p_hard_ends_at: hardEndsAt.toISOString(),
      p_lots: input.lots.map((lot) => ({
        listingId: lot.listingId,
        minBidCents: Math.round(lot.minBidUsd * 100),
        bidStepCents: Math.round(lot.bidStepUsd * 100),
        origin: lot.origin,
      })),
    });

    if (error) {
      return { error: error.message || "Could not create Open Sale on server" };
    }
    const payload = data as {
      ok?: boolean;
      reason?: string;
      id?: string;
      status?: OpenSaleEvent["status"];
      startsAt?: string;
      endsAt?: string;
      hardEndsAt?: string;
    };
    if (!payload?.ok || !payload.id) {
      return { error: payload?.reason || "Could not create Open Sale" };
    }

    const event: OpenSaleEvent = {
      id: payload.id,
      hostId: input.hostId,
      startsAt: payload.startsAt ?? input.startsAt.toISOString(),
      endsAt: payload.endsAt ?? endsAt.toISOString(),
      hardEndsAt: payload.hardEndsAt ?? hardEndsAt.toISOString(),
      status: payload.status ?? "presale",
      lots: input.lots,
      createdAt: new Date().toISOString(),
    };
    writeLocalEvent(event);
    return event;
  }

  return createOpenSaleEventLocal({
    hostId: input.hostId,
    startsAt: input.startsAt,
    liveMinutes: input.liveMinutes,
    lots: input.lots,
  });
}

export async function placeOpenSaleBidAuthoritative(input: {
  eventId: string;
  listingId: string;
  hostId: string;
  title: string;
  amountUsd: number;
  photoThumbId?: string;
  photoId?: string;
  photoThumbStoragePath?: string;
  photoStoragePath?: string;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (supabaseReady() && isUuid(input.eventId) && isUuid(input.listingId)) {
    const supabase = getSupabaseClient()!;
    const { data, error } = await supabase.rpc("place_open_sale_bid", {
      p_event_id: input.eventId,
      p_listing_id: input.listingId,
      p_amount_cents: Math.round(input.amountUsd * 100),
      p_listing_title: input.title,
    });
    if (error) {
      return { ok: false, reason: error.message || "Bid failed on server" };
    }
    const payload = data as {
      ok?: boolean;
      reason?: string;
      amountCents?: number;
      endsAt?: string;
      bidderId?: string;
    };
    if (!payload?.ok) {
      return { ok: false, reason: payload?.reason || "Bid rejected" };
    }

    // Mirror bid + cart locally for this device UI.
    const bid: GarageBid = {
      listingId: input.listingId,
      hostId: input.hostId,
      amountUsd: (payload.amountCents ?? Math.round(input.amountUsd * 100)) / 100,
      placedAt: new Date().toISOString(),
      bidderId: payload.bidderId ?? "server",
    };
    mergeBidsFromRemote([bid]);

    if (payload.endsAt) {
      try {
        const raw = localStorage.getItem("evorios_open_sale_events");
        const list = raw ? (JSON.parse(raw) as OpenSaleEvent[]) : [];
        const next = list.map((e) =>
          e.id === input.eventId ? { ...e, endsAt: payload.endsAt as string } : e,
        );
        localStorage.setItem("evorios_open_sale_events", JSON.stringify(next));
        window.dispatchEvent(new Event("evorios-open-sale-events"));
      } catch {
        /* */
      }
    }

    // Keep device cart green/gray without re-validating against local clock.
    const local = placeOpenSaleCartBidLocal({
      ...input,
      amountUsd: bid.amountUsd,
    });
    if (!local.ok) {
      // Server accepted — force cart line.
      try {
        const cartRaw = localStorage.getItem("evorios_open_sale_cart");
        const lines = cartRaw ? (JSON.parse(cartRaw) as Array<Record<string, unknown>>) : [];
        const filtered = lines.filter((l) => l.listingId !== input.listingId);
        localStorage.setItem(
          "evorios_open_sale_cart",
          JSON.stringify([
            ...filtered,
            {
              eventId: input.eventId,
              listingId: input.listingId,
              hostId: input.hostId,
              title: input.title,
              amountUsd: bid.amountUsd,
              photoThumbId: input.photoThumbId,
              photoId: input.photoId,
              photoThumbStoragePath: input.photoThumbStoragePath,
              photoStoragePath: input.photoStoragePath,
              updatedAt: new Date().toISOString(),
            },
          ]),
        );
        window.dispatchEvent(new Event("evorios-open-sale-cart"));
      } catch {
        /* */
      }
    }
    return { ok: true };
  }

  const local = placeOpenSaleCartBidLocal(input);
  return local.ok ? { ok: true } : { ok: false, reason: local.reason };
}

export async function fetchOpenSaleEventsForHost(hostId: string): Promise<OpenSaleEvent[]> {
  if (!supabaseReady() || !isUuid(hostId)) return [];
  const supabase = getSupabaseClient()!;
  const { data: events, error } = await supabase
    .from("open_sale_events")
    .select("id, host_id, starts_at, ends_at, hard_ends_at, status, created_at")
    .eq("host_id", hostId)
    .in("status", ["presale", "live", "ended"])
    .order("created_at", { ascending: false })
    .limit(10);
  if (error || !events?.length) return [];

  const ids = events.map((e) => e.id as string);
  const { data: lots } = await supabase
    .from("open_sale_lots")
    .select("event_id, listing_id, min_bid_cents, bid_step_cents, origin")
    .in("event_id", ids);

  const lotsByEvent = new Map<string, OpenSaleLot[]>();
  for (const row of (lots ?? []) as RemoteLotRow[]) {
    const list = lotsByEvent.get(row.event_id) ?? [];
    list.push({
      listingId: row.listing_id,
      minBidUsd: row.min_bid_cents / 100,
      bidStepUsd: row.bid_step_cents / 100,
      origin: row.origin,
    });
    lotsByEvent.set(row.event_id, list);
  }

  return (events as RemoteEventRow[]).map((row) => mapEvent(row, lotsByEvent.get(row.id) ?? []));
}

/** Pull host events into local cache (shop / garage badges). */
export async function syncOpenSalesFromRemote(hostId: string): Promise<void> {
  const remote = await fetchOpenSaleEventsForHost(hostId);
  if (remote.length === 0) return;
  try {
    const raw = localStorage.getItem("evorios_open_sale_events");
    const local = raw ? (JSON.parse(raw) as OpenSaleEvent[]) : [];
    const byId = new Map(local.map((e) => [e.id, e]));
    for (const event of remote) byId.set(event.id, event);
    localStorage.setItem("evorios_open_sale_events", JSON.stringify([...byId.values()]));
    window.dispatchEvent(new Event("evorios-open-sale-events"));
  } catch {
    /* */
  }
}
