import { fetchListingByIdRemote, getPublishedListingById } from "./listingStorage";
import { getSupabaseClient, isSupabaseConfigured } from "./supabaseClient";

export type RentalStatus =
  | "pending_approval"
  | "pending_checkin"
  | "active"
  | "upcoming"
  | "overdue"
  | "no_show"
  | "disputed"
  | "completed"
  | "cancelled";

export type RentalRole = "renter" | "host";

export type ListingMode = "rent" | "rto";

export type FulfillmentMethod = "pickup" | "delivery" | "contactless";

export type DeliveryStatus = "scheduled" | "en_route" | "delivered";

export type RentalReview = {
  rating: number;
  leftAt: string;
};

export type RentalBooking = {
  id: string;
  role: RentalRole;
  status: RentalStatus;
  itemTitle: string;
  itemEmoji: string;
  /**
   * Stable per-physical-item QR token (demo/localStorage).
   * This replaces the older per-rental `qrCheckInCode` concept.
   */
  itemQrToken?: string;
  startDate: string;
  endDate: string;
  counterpartyId: string;
  counterpartyName: string;
  counterpartyIdentityVerified: boolean;
  counterpartyPhoneVerified: boolean;
  /** @deprecated migrated to counterpartyIdentityVerified */
  counterpartyVerified?: boolean;
  pickupLabel: string;
  totalUsd: number;
  /** Rental period subtotal before delivery and platform fee. */
  rentalSubtotalUsd?: number;
  /** Total delivery (round trip + heavy surcharge) when renter chose delivery. */
  deliveryFee?: number;
  /** Round-trip miles fee portion (excludes heavy surcharge). */
  deliveryRoundTripUsd?: number;
  /** Weight surcharge when heavy item + delivery. */
  heavySurchargeUsd?: number;
  /** Weight in lbs used for surcharge at booking time. */
  itemWeightLbs?: number;
  /** Pounds over threshold used for surcharge label. */
  poundsOverThreshold?: number;
  deliveryRequested?: boolean;
  /** Demo platform service fee portion of total. */
  serviceFeeUsd?: number;
  /** Optional insurance fee portion of total. */
  insuranceFeeUsd?: number;
  /** Copied from listing at booking time. */
  itemHeavy?: boolean;
  insuranceIncluded: boolean;
  listingModes: ListingMode[];
  fulfillmentMethod?: FulfillmentMethod;
  deliveryAddress?: string;
  hostAddress?: string;
  /** Exact pickup location — shared with confirmed renter before travel; not on public listing. */
  pickupAddress?: string;
  deliveryStatus?: DeliveryStatus;
  pickupWindowStart?: string;
  pickupWindowEnd?: string;
  pickupScheduledAt?: string;
  returnDueAt?: string;
  overdueSince?: string;
  disputeEvidenceDeadline?: string;
  disputeEscalated?: boolean;
  noShowMarkedAt?: string;
  completedAt?: string;
  review?: RentalReview | null;
  approvalDeadline?: string;
  paymentOnHold?: boolean;
  manualBooking?: boolean;
  /** Lockbox / gate codes and step-by-step access — revealed at check-in with pickup PIN only. */
  contactlessInstructions?: string;
  /** 6-digit PIN required for pickup confirmation (generated at pending_checkin). */
  pickupPin?: string;
  /** 6-digit PIN required for return confirmation (generated when active). */
  returnPin?: string;
  pickupConfirmedAt?: string;
  returnConfirmedAt?: string;
  qrCheckInCode?: string;
  runningLateMessage?: string;
  runningLateSentAt?: string;
  runningLateAcknowledged?: boolean;
  stripePayment?: boolean;
  /** Security deposit hold (Stripe manual-capture PI). */
  depositAmountCents?: number;
  depositStatus?: string;
  /** Source listing id for re-book flows. */
  listingId?: string;
};

type SupabaseRentalRow = {
  id: string;
  listing_id: string;
  owner_id: string;
  renter_id: string;
  status: string;
  start_date: string;
  end_date: string;
  pickup_pin: string | null;
  return_pin: string | null;
  booking_mode: string | null;
  delivery_address: string | null;
  safely_policy_id?: string | null;
  insurance_fee_cents?: number;
  deposit_amount_cents?: number;
  stripe_payment_intent_id?: string | null;
  stripe_payment_status?: string | null;
  rental_total_cents?: number;
  pickup_at?: string | null;
  due_at?: string | null;
  created_at: string;
  updated_at: string;
};

const RENTALS_KEY = "allbyrent_rental_bookings";
const RENTALS_VERSION_KEY = "allbyrent_rental_bookings_version";
const RENTALS_VERSION = "10-production";

export function generatePin(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function slugifyTitle(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function seedItemQrToken(itemTitle: string): string {
  return `abr-item-${slugifyTitle(itemTitle)}`;
}

function ensurePinsAndQr(next: RentalBooking, prev?: RentalBooking | null): RentalBooking {
  const withQr: RentalBooking = {
    ...next,
    itemQrToken: next.itemQrToken ?? seedItemQrToken(next.itemTitle),
  };

  if (withQr.status === "pending_checkin") {
    return {
      ...withQr,
      pickupPin: withQr.pickupPin ?? generatePin(),
    };
  }

  if (withQr.status === "active" || withQr.status === "overdue") {
    return {
      ...withQr,
      returnPin: withQr.returnPin ?? generatePin(),
    };
  }

  return {
    ...withQr,
    pickupPin: withQr.pickupPin ?? prev?.pickupPin,
    returnPin: withQr.returnPin ?? prev?.returnPin,
  };
}

const RENTAL_STATUSES: RentalStatus[] = [
  "pending_approval",
  "pending_checkin",
  "active",
  "upcoming",
  "overdue",
  "no_show",
  "disputed",
  "completed",
  "cancelled",
];

function rowStatusToRentalStatus(status: string): RentalStatus {
  if (RENTAL_STATUSES.includes(status as RentalStatus)) {
    return status as RentalStatus;
  }
  return "pending_approval";
}

export function rentalBookingFromRemoteRow(
  row: SupabaseRentalRow,
  userId: string,
  listingTitle?: string,
): RentalBooking {
  const role: RentalRole = row.owner_id === userId ? "host" : "renter";
  const counterpartyId = role === "host" ? row.renter_id : row.owner_id;
  const fulfillmentMethod: FulfillmentMethod =
    row.booking_mode === "delivery"
      ? "delivery"
      : row.booking_mode === "contactless"
        ? "contactless"
        : "pickup";

  return normalizeBooking({
    id: row.id,
    role,
    status: rowStatusToRentalStatus(row.status),
    itemTitle: listingTitle?.trim() || "Rental item",
    itemEmoji: "📦",
    startDate: row.start_date,
    endDate: row.end_date,
    counterpartyId,
    counterpartyName: role === "host" ? "Renter" : "Host",
    counterpartyIdentityVerified: false,
    counterpartyPhoneVerified: false,
    listingId: row.listing_id,
    pickupLabel:
      fulfillmentMethod === "delivery"
        ? "Delivery"
        : fulfillmentMethod === "contactless"
          ? "Contactless"
          : "Pickup",
    totalUsd: Math.max(0, (row.rental_total_cents ?? 0) / 100),
    insuranceIncluded: Boolean(row.insurance_fee_cents && row.insurance_fee_cents > 0),
    listingModes: ["rent"],
    fulfillmentMethod,
    deliveryAddress: row.delivery_address ?? undefined,
    pickupPin: row.pickup_pin ?? undefined,
    returnPin: row.return_pin ?? undefined,
    depositAmountCents: row.deposit_amount_cents ?? undefined,
    stripePayment: Boolean(row.stripe_payment_intent_id),
  });
}

function normalizeBooking(raw: RentalBooking): RentalBooking {
  const counterpartyName =
    typeof raw.counterpartyName === "string" && raw.counterpartyName.trim()
      ? raw.counterpartyName
      : "Unknown";
  const identity =
    raw.counterpartyIdentityVerified ??
    raw.counterpartyVerified ??
    false;
  const phone = raw.counterpartyPhoneVerified ?? false;
  return {
    ...ensurePinsAndQr(raw),
    counterpartyName,
    counterpartyId: raw.counterpartyId ?? "",
    counterpartyIdentityVerified: identity,
    counterpartyPhoneVerified: phone,
    listingModes: raw.listingModes ?? ["rent"],
    insuranceIncluded: raw.insuranceIncluded ?? false,
    stripePayment: raw.stripePayment ?? true,
    fulfillmentMethod:
      raw.fulfillmentMethod ??
      (raw.pickupLabel.toLowerCase().includes("delivery") ? "delivery" : "pickup"),
    deliveryRequested:
      raw.deliveryRequested ??
      (raw.fulfillmentMethod === "delivery" ||
        raw.pickupLabel.toLowerCase().includes("delivery")),
    deliveryFee: raw.deliveryFee,
    deliveryRoundTripUsd: raw.deliveryRoundTripUsd,
    heavySurchargeUsd: raw.heavySurchargeUsd,
    itemWeightLbs: raw.itemWeightLbs,
    poundsOverThreshold: raw.poundsOverThreshold,
    rentalSubtotalUsd: raw.rentalSubtotalUsd,
    serviceFeeUsd: raw.serviceFeeUsd,
    itemHeavy: raw.itemHeavy ?? false,
  };
}

export function appendRentalBooking(booking: RentalBooking): RentalBooking[] {
  const bookings = loadRentalBookings();
  const next = [normalizeBooking(booking), ...bookings];
  saveRentalBookings(next);
  return next;
}

export function toSupabaseRentalInsert(params: {
  id: string;
  listingId: string;
  ownerId: string;
  renterId: string;
  status: string;
  startDate: string;
  endDate: string;
  bookingMode?: string;
  deliveryAddress?: string;
  pickupPin?: string;
  returnPin?: string;
  safelyPolicyId?: string | null;
  insuranceFeeCents?: number;
  depositAmountCents?: number;
  stripePaymentIntentId?: string | null;
  stripePaymentStatus?: string | null;
  rentalTotalCents?: number;
  pickupAt?: string | null;
  dueAt?: string | null;
}): Omit<SupabaseRentalRow, "created_at" | "updated_at"> {
  return {
    id: params.id,
    listing_id: params.listingId,
    owner_id: params.ownerId,
    renter_id: params.renterId,
    status: params.status,
    start_date: params.startDate,
    end_date: params.endDate,
    pickup_pin: params.pickupPin ?? null,
    return_pin: params.returnPin ?? null,
    booking_mode: params.bookingMode ?? null,
    delivery_address: params.deliveryAddress ?? null,
    safely_policy_id: params.safelyPolicyId ?? null,
    insurance_fee_cents: Math.max(0, Math.round(params.insuranceFeeCents ?? 0)),
    deposit_amount_cents: Math.max(0, Math.round(params.depositAmountCents ?? 0)),
    stripe_payment_intent_id: params.stripePaymentIntentId ?? null,
    stripe_payment_status: params.stripePaymentStatus ?? null,
    rental_total_cents: Math.max(0, Math.round(params.rentalTotalCents ?? 0)),
    pickup_at: params.pickupAt ?? null,
    due_at: params.dueAt ?? null,
  };
}

export async function createRentalRemote(row: Omit<SupabaseRentalRow, "created_at" | "updated_at">): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error("Database not configured");
  }
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Database not configured");
  }
  const { error } = await supabase.from("rentals").insert(row);
  if (error) throw error;
}

export async function fetchRentalsForUserRemote(userId: string): Promise<SupabaseRentalRow[]> {
  if (!isSupabaseConfigured()) {
    throw new Error("Database not configured");
  }
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Database not configured");
  }
  const { data, error } = await supabase
    .from("rentals")
    .select("*")
    .or(`owner_id.eq.${userId},renter_id.eq.${userId}`)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as SupabaseRentalRow[];
}

export async function syncRentalsFromRemote(userId: string): Promise<RentalBooking[]> {
  const rows = await fetchRentalsForUserRemote(userId);
  const bookings: RentalBooking[] = [];

  for (const row of rows) {
    const localListing = getPublishedListingById(row.listing_id);
    let title = localListing?.title;
    if (!title) {
      const remoteListing = await fetchListingByIdRemote(row.listing_id);
      title = remoteListing?.title;
    }
    bookings.push(rentalBookingFromRemoteRow(row, userId, title));
  }

  saveRentalBookings(bookings);
  return bookings;
}

export function loadRentalBookings(): RentalBooking[] {
  try {
    if (localStorage.getItem(RENTALS_VERSION_KEY) !== RENTALS_VERSION) {
      localStorage.removeItem(RENTALS_KEY);
      localStorage.setItem(RENTALS_VERSION_KEY, RENTALS_VERSION);
      return [];
    }
    const raw = localStorage.getItem(RENTALS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RentalBooking[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeBooking);
  } catch {
    return [];
  }
}

export function saveRentalBookings(bookings: RentalBooking[]): void {
  try {
    localStorage.setItem(RENTALS_KEY, JSON.stringify(bookings));
  } catch {
    /* ignore */
  }
}

export function updateBooking(
  id: string,
  patch: Partial<RentalBooking>,
): RentalBooking[] {
  const bookings = loadRentalBookings();
  const current = bookings.find((b) => b.id === id) ?? null;
  const next = bookings.map((b) => {
    if (b.id !== id) return b;
    const merged = { ...b, ...patch } as RentalBooking;
    return normalizeBooking(ensurePinsAndQr(merged, current));
  });
  saveRentalBookings(next);
  return next;
}

export function getPendingApprovalRequests(bookings: RentalBooking[]): RentalBooking[] {
  return bookings.filter((b) => b.role === "host" && b.status === "pending_approval");
}

export function getPendingApprovalWaiting(bookings: RentalBooking[]): RentalBooking[] {
  return bookings.filter((b) => b.role === "renter" && b.status === "pending_approval");
}

export function getActiveBookings(bookings: RentalBooking[]): RentalBooking[] {
  return bookings.filter((b) => {
    if (b.status === "pending_approval") return false;
    if (b.status === "no_show" && b.noShowMarkedAt) return false;
    return ["pending_checkin", "active", "overdue", "disputed", "no_show"].includes(b.status);
  });
}

export function getUpcomingBookings(bookings: RentalBooking[]): RentalBooking[] {
  return bookings.filter((b) => b.status === "upcoming");
}

export function getHistoryBookings(bookings: RentalBooking[]): RentalBooking[] {
  return bookings.filter(
    (b) =>
      b.status === "completed" ||
      b.status === "cancelled" ||
      (b.status === "no_show" && Boolean(b.noShowMarkedAt)),
  );
}

export function formatRentalDateRange(start: string, end: string): string {
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return `${start} – ${end}`;
  return `${s.toLocaleDateString(undefined, opts)} – ${e.toLocaleDateString(undefined, opts)}`;
}

export const RENTAL_STATUS_LABEL: Record<RentalStatus, string> = {
  pending_approval: "Awaiting approval",
  pending_checkin: "Confirmed",
  active: "Active",
  upcoming: "Upcoming",
  overdue: "Overdue",
  no_show: "No-show",
  disputed: "In dispute",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function isNoShowHistory(booking: RentalBooking): boolean {
  return Boolean(booking.noShowMarkedAt);
}

export function isDeliveryBooking(booking: RentalBooking): boolean {
  return booking.fulfillmentMethod === "delivery";
}

export function canRenterSeeHostAddress(booking: RentalBooking): boolean {
  return (
    booking.role === "renter" &&
    ["pending_checkin", "active", "overdue"].includes(booking.status)
  );
}

/** Pickup location visible to confirmed renter before check-in (not on public listing). */
export function getRenterPickupLocation(booking: RentalBooking): string | undefined {
  if (!canRenterSeeHostAddress(booking)) return undefined;
  if (booking.pickupAddress?.trim()) return booking.pickupAddress.trim();
  if (booking.fulfillmentMethod === "delivery" && booking.hostAddress?.trim()) {
    return booking.hostAddress.trim();
  }
  return undefined;
}
