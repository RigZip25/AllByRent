import { resolveCounterpartyId } from "./demoUserProfiles";

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
  insuranceIncluded: boolean;
  listingModes: ListingMode[];
  fulfillmentMethod?: FulfillmentMethod;
  deliveryAddress?: string;
  hostAddress?: string;
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
  qrCheckInCode?: string;
  runningLateMessage?: string;
  runningLateSentAt?: string;
  runningLateAcknowledged?: boolean;
  stripePayment?: boolean;
};

const RENTALS_KEY = "allbyrent_rental_bookings";
const RENTALS_VERSION_KEY = "allbyrent_rental_bookings_version";
const RENTALS_VERSION = "4";

const now = new Date();
const today = now.toISOString().slice(0, 10);
const pickupTodayStart = new Date(now);
pickupTodayStart.setHours(14, 0, 0, 0);
const pickupTodayEnd = new Date(now);
pickupTodayEnd.setHours(16, 0, 0, 0);
const pickupPast = new Date(now);
pickupPast.setMinutes(pickupPast.getMinutes() - 75);
const returnSoon = new Date(now);
returnSoon.setDate(returnSoon.getDate() + 2);
returnSoon.setHours(returnSoon.getHours() + 4);
const overdueStart = new Date(now);
overdueStart.setHours(overdueStart.getHours() - 6);
overdueStart.setMinutes(overdueStart.getMinutes() - 23);
const disputeDeadline = new Date(now);
disputeDeadline.setHours(disputeDeadline.getHours() + 36);
const completedRecent = new Date(now);
completedRecent.setDate(completedRecent.getDate() - 1);
const approvalDeadline = new Date(now);
approvalDeadline.setHours(approvalDeadline.getHours() + 18);

function cp(
  name: string,
  identity: boolean,
  phone: boolean,
): Pick<
  RentalBooking,
  "counterpartyId" | "counterpartyName" | "counterpartyIdentityVerified" | "counterpartyPhoneVerified"
> {
  return {
    counterpartyId: resolveCounterpartyId(name),
    counterpartyName: name,
    counterpartyIdentityVerified: identity,
    counterpartyPhoneVerified: phone,
  };
}

const DEMO_BOOKINGS: RentalBooking[] = [
  {
    id: "rent-pending-renter",
    role: "renter",
    status: "pending_approval",
    itemTitle: "GoPro Hero 12",
    itemEmoji: "🎥",
    startDate: "2026-05-28",
    endDate: "2026-05-30",
    ...cp("John Davis", true, true),
    pickupLabel: "In-person · Oak Park",
    totalUsd: 45,
    insuranceIncluded: true,
    listingModes: ["rent"],
    approvalDeadline: approvalDeadline.toISOString(),
    paymentOnHold: true,
    manualBooking: true,
    stripePayment: true,
  },
  {
    id: "rent-pending-host",
    role: "host",
    status: "pending_approval",
    itemTitle: "Table Saw",
    itemEmoji: "🪚",
    startDate: "2026-05-29",
    endDate: "2026-05-31",
    counterpartyId: "chris-t",
    counterpartyName: "Chris T.",
    counterpartyIdentityVerified: true,
    counterpartyPhoneVerified: false,
    pickupLabel: "Home pickup",
    totalUsd: 78,
    insuranceIncluded: true,
    listingModes: ["rent"],
    approvalDeadline: approvalDeadline.toISOString(),
    manualBooking: true,
    stripePayment: true,
  },
  {
    id: "rent-1",
    role: "renter",
    status: "pending_checkin",
    itemTitle: "Canon EOS R6 Kit",
    itemEmoji: "📷",
    startDate: today,
    endDate: "2026-05-28",
    ...cp("John Davis", true, true),
    pickupLabel: "In-person · Oak Park",
    totalUsd: 84,
    insuranceIncluded: true,
    listingModes: ["rent"],
    fulfillmentMethod: "pickup",
    pickupWindowStart: pickupTodayStart.toISOString(),
    pickupWindowEnd: pickupTodayEnd.toISOString(),
    pickupScheduledAt: pickupTodayStart.toISOString(),
    qrCheckInCode: "482917",
    stripePayment: true,
  },
  {
    id: "rent-delivery",
    role: "renter",
    status: "pending_checkin",
    itemTitle: "Pressure Washer 3000 PSI",
    itemEmoji: "💦",
    startDate: today,
    endDate: "2026-05-27",
    ...cp("Sam K.", false, true),
    pickupLabel: "Delivery · 5 mi",
    totalUsd: 55,
    insuranceIncluded: true,
    listingModes: ["rent"],
    fulfillmentMethod: "delivery",
    deliveryAddress: "742 Evergreen Terrace, Springfield",
    hostAddress: "1200 W Lake St, Chicago, IL 60607",
    deliveryStatus: "scheduled",
    stripePayment: true,
  },
  {
    id: "rent-2",
    role: "renter",
    status: "upcoming",
    itemTitle: "4-Person Camping Tent",
    itemEmoji: "⛺",
    startDate: "2026-06-02",
    endDate: "2026-06-05",
    ...cp("Maria S.", true, true),
    pickupLabel: "Contactless pickup",
    totalUsd: 120,
    insuranceIncluded: true,
    listingModes: ["rent"],
    fulfillmentMethod: "contactless",
    stripePayment: true,
  },
  {
    id: "rent-3",
    role: "host",
    status: "active",
    itemTitle: "Milwaukee M18 Drill Kit",
    itemEmoji: "🔧",
    startDate: "2026-05-24",
    endDate: "2026-05-27",
    ...cp("Chris T.", true, false),
    pickupLabel: "Your listing · Home pickup",
    totalUsd: 65,
    insuranceIncluded: true,
    listingModes: ["rent", "rto"],
    returnDueAt: returnSoon.toISOString(),
    qrCheckInCode: "193846",
    stripePayment: true,
  },
  {
    id: "rent-4",
    role: "host",
    status: "upcoming",
    itemTitle: "Pressure Washer 3000 PSI",
    itemEmoji: "💦",
    startDate: "2026-05-30",
    endDate: "2026-05-31",
    ...cp("Sam K.", false, false),
    pickupLabel: "Delivery · 5 mi",
    totalUsd: 55,
    insuranceIncluded: true,
    listingModes: ["rent"],
    fulfillmentMethod: "delivery",
    deliveryAddress: "742 Evergreen Terrace, Springfield",
    deliveryStatus: "scheduled",
    stripePayment: true,
  },
  {
    id: "rent-7",
    role: "renter",
    status: "overdue",
    itemTitle: "Kayak · 2-Person",
    itemEmoji: "🛶",
    startDate: "2026-05-20",
    endDate: "2026-05-24",
    ...cp("Pat R.", true, true),
    pickupLabel: "Lakefront dock",
    totalUsd: 72,
    insuranceIncluded: true,
    listingModes: ["rent"],
    returnDueAt: overdueStart.toISOString(),
    overdueSince: overdueStart.toISOString(),
    stripePayment: true,
  },
  {
    id: "rent-8",
    role: "host",
    status: "overdue",
    itemTitle: "Party Speaker PA",
    itemEmoji: "🔊",
    startDate: "2026-05-18",
    endDate: "2026-05-23",
    ...cp("Dana W.", true, true),
    pickupLabel: "Home pickup",
    totalUsd: 40,
    insuranceIncluded: true,
    listingModes: ["rent"],
    returnDueAt: overdueStart.toISOString(),
    overdueSince: overdueStart.toISOString(),
    stripePayment: true,
  },
  {
    id: "rent-9",
    role: "host",
    status: "no_show",
    itemTitle: "Lawn Aerator",
    itemEmoji: "🌿",
    startDate: today,
    endDate: today,
    ...cp("Mike L.", false, false),
    pickupLabel: "Driveway pickup",
    totalUsd: 35,
    insuranceIncluded: true,
    listingModes: ["rent"],
    pickupScheduledAt: pickupPast.toISOString(),
    pickupWindowStart: pickupPast.toISOString(),
    pickupWindowEnd: new Date(pickupPast.getTime() + 2 * 60 * 60 * 1000).toISOString(),
    stripePayment: true,
  },
  {
    id: "rent-10",
    role: "renter",
    status: "disputed",
    itemTitle: "DSLR Lens 24-70mm",
    itemEmoji: "📸",
    startDate: "2026-05-15",
    endDate: "2026-05-22",
    ...cp("Taylor H.", true, true),
    pickupLabel: "In-person",
    totalUsd: 58,
    insuranceIncluded: true,
    listingModes: ["rent", "rto"],
    disputeEvidenceDeadline: disputeDeadline.toISOString(),
    disputeEscalated: false,
    stripePayment: true,
  },
  {
    id: "rent-11",
    role: "host",
    status: "disputed",
    itemTitle: "Electric Bike",
    itemEmoji: "🚴",
    startDate: "2026-05-10",
    endDate: "2026-05-18",
    ...cp("Riley N.", true, true),
    pickupLabel: "Home pickup",
    totalUsd: 110,
    insuranceIncluded: true,
    listingModes: ["rto"],
    disputeEvidenceDeadline: disputeDeadline.toISOString(),
    disputeEscalated: true,
    stripePayment: true,
  },
  {
    id: "rent-5",
    role: "renter",
    status: "completed",
    itemTitle: "DJI Mini 3 Drone",
    itemEmoji: "🚁",
    startDate: "2026-04-10",
    endDate: "2026-04-12",
    ...cp("Lee P.", true, true),
    pickupLabel: "In-person",
    totalUsd: 95,
    insuranceIncluded: true,
    listingModes: ["rent"],
    completedAt: completedRecent.toISOString(),
    review: null,
    stripePayment: true,
  },
  {
    id: "rent-6",
    role: "host",
    status: "completed",
    itemTitle: "Beach Cruiser Bike",
    itemEmoji: "🚲",
    startDate: "2026-03-15",
    endDate: "2026-03-17",
    ...cp("Jordan M.", true, true),
    pickupLabel: "Home pickup",
    totalUsd: 48,
    insuranceIncluded: true,
    listingModes: ["rent"],
    completedAt: "2026-03-17T18:00:00.000Z",
    review: { rating: 5, leftAt: "2026-03-18T10:00:00.000Z" },
    stripePayment: true,
  },
  {
    id: "rent-12",
    role: "host",
    status: "no_show",
    itemTitle: "Projector 4K",
    itemEmoji: "📽️",
    startDate: "2026-02-01",
    endDate: "2026-02-03",
    ...cp("Sam K.", true, true),
    pickupLabel: "Contactless",
    totalUsd: 62,
    insuranceIncluded: true,
    listingModes: ["rent", "rto"],
    noShowMarkedAt: "2026-02-03T21:00:00.000Z",
    review: null,
    stripePayment: true,
  },
];

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
    ...raw,
    counterpartyName,
    counterpartyId: raw.counterpartyId ?? resolveCounterpartyId(counterpartyName),
    counterpartyIdentityVerified: identity,
    counterpartyPhoneVerified: phone,
    listingModes: raw.listingModes ?? ["rent"],
    insuranceIncluded: raw.insuranceIncluded ?? true,
    stripePayment: raw.stripePayment ?? true,
    fulfillmentMethod:
      raw.fulfillmentMethod ??
      (raw.pickupLabel.toLowerCase().includes("delivery") ? "delivery" : "pickup"),
  };
}

export function loadRentalBookings(): RentalBooking[] {
  try {
    if (localStorage.getItem(RENTALS_VERSION_KEY) !== RENTALS_VERSION) {
      localStorage.setItem(RENTALS_KEY, JSON.stringify(DEMO_BOOKINGS));
      localStorage.setItem(RENTALS_VERSION_KEY, RENTALS_VERSION);
      return DEMO_BOOKINGS.map(normalizeBooking);
    }
    const raw = localStorage.getItem(RENTALS_KEY);
    if (!raw) {
      localStorage.setItem(RENTALS_KEY, JSON.stringify(DEMO_BOOKINGS));
      localStorage.setItem(RENTALS_VERSION_KEY, RENTALS_VERSION);
      return DEMO_BOOKINGS.map(normalizeBooking);
    }
    const parsed = JSON.parse(raw) as RentalBooking[];
    if (!Array.isArray(parsed)) {
      throw new Error("Invalid bookings data");
    }
    return parsed.map(normalizeBooking);
  } catch {
    localStorage.setItem(RENTALS_KEY, JSON.stringify(DEMO_BOOKINGS));
    localStorage.setItem(RENTALS_VERSION_KEY, RENTALS_VERSION);
    return DEMO_BOOKINGS.map(normalizeBooking);
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
  const next = bookings.map((b) => (b.id === id ? normalizeBooking({ ...b, ...patch }) : b));
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
