import {
  OPEN_SALE_HARD_AFTER_END_MS,
  OPEN_SALE_LIVE_MINUTES,
  OPEN_SALE_SOFT_CLOSE_MS,
  type OpenSaleEvent,
  type OpenSaleLiveMinutes,
  type OpenSaleLot,
  type OpenSaleStatus,
} from "./types";

const EVENTS_KEY = "evorios_open_sale_events";
export const OPEN_SALE_EVENTS_EVENT = "evorios-open-sale-events";

function readEvents(): OpenSaleEvent[] {
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as OpenSaleEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeEvents(events: OpenSaleEvent[]): void {
  try {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    window.dispatchEvent(new Event(OPEN_SALE_EVENTS_EVENT));
  } catch {
    /* private mode */
  }
}

function refreshStatus(event: OpenSaleEvent, now = Date.now()): OpenSaleStatus {
  if (event.status === "cancelled" || event.status === "ended") return event.status;
  const start = new Date(event.startsAt).getTime();
  const hard = new Date(event.hardEndsAt).getTime();
  const soft = new Date(event.endsAt).getTime();
  if (now >= hard || now >= soft) return "ended";
  if (now >= start) return "live";
  return "presale";
}

/** Recompute status from clocks (local). Call on load / tick. */
export function syncOpenSaleStatuses(now = Date.now()): OpenSaleEvent[] {
  const events = readEvents();
  let changed = false;
  const next = events.map((event) => {
    const status = refreshStatus(event, now);
    if (status === event.status) return event;
    changed = true;
    return { ...event, status };
  });
  if (changed) writeEvents(next);
  return next;
}

export function listOpenSaleEvents(): OpenSaleEvent[] {
  return syncOpenSaleStatuses();
}

export function getOpenSaleEvent(eventId: string): OpenSaleEvent | null {
  return listOpenSaleEvents().find((e) => e.id === eventId) ?? null;
}

/** Active = presale or live for this host (at most one). */
export function getActiveOpenSaleForHost(hostId: string): OpenSaleEvent | null {
  return (
    listOpenSaleEvents().find(
      (e) => e.hostId === hostId && (e.status === "presale" || e.status === "live"),
    ) ?? null
  );
}

export function getOpenSaleForListing(listingId: string): OpenSaleEvent | null {
  return (
    listOpenSaleEvents().find(
      (e) =>
        (e.status === "presale" || e.status === "live") &&
        e.lots.some((lot) => lot.listingId === listingId),
    ) ?? null
  );
}

export function getOpenSaleLot(
  event: OpenSaleEvent,
  listingId: string,
): OpenSaleLot | null {
  return event.lots.find((lot) => lot.listingId === listingId) ?? null;
}

/** Main garage card is inactive while listing is on an open (presale/live) sale. */
export function isListingOnOpenSale(listingId: string): boolean {
  return getOpenSaleForListing(listingId) != null;
}

export function buildOpenSaleWindow(input: {
  startsAt: Date;
  liveMinutes: OpenSaleLiveMinutes;
}): { startsAt: string; endsAt: string; hardEndsAt: string } {
  const live = OPEN_SALE_LIVE_MINUTES.includes(input.liveMinutes)
    ? input.liveMinutes
    : 30;
  const startsAt = input.startsAt.toISOString();
  const endsMs = input.startsAt.getTime() + live * 60_000;
  const endsAt = new Date(endsMs).toISOString();
  const hardEndsAt = new Date(endsMs + OPEN_SALE_HARD_AFTER_END_MS).toISOString();
  return { startsAt, endsAt, hardEndsAt };
}

export function createOpenSaleEvent(input: {
  hostId: string;
  startsAt: Date;
  liveMinutes: OpenSaleLiveMinutes;
  lots: OpenSaleLot[];
}): OpenSaleEvent | { error: string } {
  if (!input.hostId) return { error: "Host required" };
  if (input.lots.length === 0) return { error: "Pick at least one item" };
  if (getActiveOpenSaleForHost(input.hostId)) {
    return { error: "You already have an Open Sale — finish or cancel it first" };
  }
  for (const lot of input.lots) {
    if (lot.minBidUsd <= 0) return { error: "Min bid must be > 0" };
    if (lot.bidStepUsd <= 0) return { error: "Bid step must be > 0" };
    if (isListingOnOpenSale(lot.listingId)) {
      return { error: "An item is already on an Open Sale" };
    }
  }

  const window = buildOpenSaleWindow({
    startsAt: input.startsAt,
    liveMinutes: input.liveMinutes,
  });
  const now = Date.now();
  const status = refreshStatus(
    {
      id: "",
      hostId: input.hostId,
      ...window,
      status: "presale",
      lots: input.lots,
      createdAt: new Date().toISOString(),
    },
    now,
  );

  const event: OpenSaleEvent = {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `open-sale-${Date.now()}`,
    hostId: input.hostId,
    startsAt: window.startsAt,
    endsAt: window.endsAt,
    hardEndsAt: window.hardEndsAt,
    status,
    lots: input.lots,
    createdAt: new Date().toISOString(),
  };

  writeEvents([...readEvents(), event]);
  return event;
}

export function updateOpenSaleLots(
  eventId: string,
  lots: OpenSaleLot[],
): OpenSaleEvent | { error: string } {
  const events = readEvents();
  const idx = events.findIndex((e) => e.id === eventId);
  if (idx < 0) return { error: "Open Sale not found" };
  const current = events[idx];
  if (current.status === "ended" || current.status === "cancelled") {
    return { error: "Open Sale already closed" };
  }
  if (lots.length === 0) return { error: "Need at least one lot" };
  const next = { ...current, lots };
  events[idx] = next;
  writeEvents(events);
  return next;
}

export function cancelOpenSaleEvent(eventId: string): void {
  const events = readEvents();
  const idx = events.findIndex((e) => e.id === eventId);
  if (idx < 0) return;
  events[idx] = { ...events[idx], status: "cancelled" };
  writeEvents(events);
}

export function markOpenSaleEnded(eventId: string): void {
  const events = readEvents();
  const idx = events.findIndex((e) => e.id === eventId);
  if (idx < 0) return;
  if (events[idx].status === "cancelled") return;
  events[idx] = { ...events[idx], status: "ended" };
  writeEvents(events);
}

/** Extend soft endsAt when a bid lands in the soft-close window; never past hardEndsAt. */
export function maybeExtendOpenSaleSoftClose(
  eventId: string,
  now = Date.now(),
): OpenSaleEvent | null {
  const events = readEvents();
  const idx = events.findIndex((e) => e.id === eventId);
  if (idx < 0) return null;
  const event = events[idx];
  if (event.status !== "live" && refreshStatus(event, now) !== "live") return event;

  const endsMs = new Date(event.endsAt).getTime();
  const hardMs = new Date(event.hardEndsAt).getTime();
  if (now >= hardMs) return event;
  if (now >= endsMs) return event;

  if (endsMs - now > OPEN_SALE_SOFT_CLOSE_MS) return event;

  const extended = Math.min(now + OPEN_SALE_SOFT_CLOSE_MS, hardMs);
  if (extended <= endsMs) return event;
  const next = { ...event, endsAt: new Date(extended).toISOString() };
  events[idx] = next;
  writeEvents(events);
  return next;
}
