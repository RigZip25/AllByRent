/**
 * Host earnings / tax statement ledger (v1).
 *
 * Assembled from app rental/booking records — not Stripe Balance Transactions.
 * Gap vs Stripe: Stripe processing fees, payout timing, and partial refunds are
 * not line-item accurate here. Use Stripe Dashboard / payouts as the source of
 * truth for bank deposits; this statement is a host-facing records ledger.
 */

import { getLocale } from "./i18n";
import type { AppLocale } from "./i18n/types";
import { getSearchCountryCode } from "./locationCountry";
import { currencyForCountry, formatMoney } from "./regionalDisplay";
import { getPlatformServiceFeeRate } from "./rentalPricing";
import {
  loadRentalBookings,
  type RentalBooking,
} from "./rentalsStorage";

export const STRIPE_DASHBOARD_URL = "https://dashboard.stripe.com/";

export type EarningsLedgerRow = {
  id: string;
  /** ISO date YYYY-MM-DD for filtering / CSV */
  dateIso: string;
  listingTitle: string;
  bookingId: string;
  status: RentalBooking["status"];
  /** Amount charged to the renter (gross). */
  gross: number;
  platformFee: number;
  /** Unknown in v1 — Stripe Balance Transaction fees not loaded. */
  stripeFee: number | null;
  refunds: number;
  delivery: number;
  /** Estimated host net after platform fee (destination charge model). */
  net: number;
};

export type EarningsStatementTotals = {
  gross: number;
  platformFee: number;
  stripeFee: number | null;
  refunds: number;
  delivery: number;
  net: number;
  rowCount: number;
};

export type EarningsStatement = {
  year: number;
  availableYears: number[];
  rows: EarningsLedgerRow[];
  totals: EarningsStatementTotals;
  currencyCode: string;
  countryCode: string;
  isUsMarket: boolean;
  /**
   * True when any included booking lacks an explicit serviceFeeUsd
   * (fee was derived from the platform rate).
   */
  feesPartiallyEstimated: boolean;
};

const LOCALE_BCP47: Record<AppLocale, string> = {
  en: "en-US",
  es: "es-ES",
  cs: "cs-CZ",
};

function roundMoney(n: number): number {
  return Math.round(Math.max(0, n) * 100) / 100;
}

function hostBookings(bookings: RentalBooking[]): RentalBooking[] {
  return bookings.filter((b) => b.role === "host");
}

function bookingEarnedAt(booking: RentalBooking): Date {
  const raw = booking.completedAt ?? `${booking.endDate}T12:00:00.000Z`;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? new Date(booking.endDate) : parsed;
}

function bookingEventDate(booking: RentalBooking): Date {
  if (booking.status === "cancelled") {
    const raw = booking.noShowMarkedAt ?? booking.endDate;
    const parsed = new Date(raw.includes("T") ? raw : `${raw}T12:00:00.000Z`);
    return Number.isNaN(parsed.getTime()) ? bookingEarnedAt(booking) : parsed;
  }
  return bookingEarnedAt(booking);
}

/** Platform application fee taken from the charge (matches Connect destination model). */
export function bookingPlatformFee(booking: RentalBooking): number {
  if (typeof booking.serviceFeeUsd === "number" && Number.isFinite(booking.serviceFeeUsd)) {
    return roundMoney(booking.serviceFeeUsd);
  }
  const rate = getPlatformServiceFeeRate();
  if (booking.totalUsd <= 0 || rate <= 0) return 0;
  return roundMoney(booking.totalUsd * (rate / (1 + rate)));
}

export function bookingGross(booking: RentalBooking): number {
  return roundMoney(booking.totalUsd);
}

export function bookingDelivery(booking: RentalBooking): number {
  return roundMoney(booking.deliveryFee ?? 0);
}

export function bookingRefunds(booking: RentalBooking): number {
  if (booking.status !== "cancelled") return 0;
  // Local ledger: treat cancelled paid bookings as full refund of the charge.
  if (booking.stripePayment || booking.paymentOnHold === false) {
    return bookingGross(booking);
  }
  return 0;
}

/** Host net after platform fee; cancelled → 0. Stripe processing fee not deducted (unknown). */
export function bookingHostNet(booking: RentalBooking): number {
  if (booking.status === "cancelled") return 0;
  if (booking.status !== "completed") return 0;
  return roundMoney(bookingGross(booking) - bookingPlatformFee(booking));
}

function shouldIncludeInStatement(booking: RentalBooking): boolean {
  if (booking.status === "completed") return true;
  if (booking.status === "cancelled") {
    return Boolean(booking.stripePayment) || booking.paymentOnHold === false;
  }
  return false;
}

function toLedgerRow(booking: RentalBooking): EarningsLedgerRow {
  const when = bookingEventDate(booking);
  const dateIso = Number.isNaN(when.getTime())
    ? booking.endDate.slice(0, 10)
    : when.toISOString().slice(0, 10);
  const gross = bookingGross(booking);
  const platformFee = bookingPlatformFee(booking);
  const refunds = bookingRefunds(booking);
  const delivery = bookingDelivery(booking);
  const net =
    booking.status === "completed"
      ? bookingHostNet(booking)
      : roundMoney(gross - platformFee - refunds);

  return {
    id: booking.id,
    dateIso,
    listingTitle: booking.itemTitle.trim() || booking.id,
    bookingId: booking.id,
    status: booking.status,
    gross,
    platformFee,
    stripeFee: null,
    refunds,
    delivery,
    net: Math.max(0, net),
  };
}

function sumTotals(rows: EarningsLedgerRow[]): EarningsStatementTotals {
  const totals = rows.reduce(
    (acc, row) => {
      acc.gross += row.gross;
      acc.platformFee += row.platformFee;
      acc.refunds += row.refunds;
      acc.delivery += row.delivery;
      acc.net += row.net;
      return acc;
    },
    { gross: 0, platformFee: 0, refunds: 0, delivery: 0, net: 0 },
  );
  return {
    gross: roundMoney(totals.gross),
    platformFee: roundMoney(totals.platformFee),
    stripeFee: null,
    refunds: roundMoney(totals.refunds),
    delivery: roundMoney(totals.delivery),
    net: roundMoney(totals.net),
    rowCount: rows.length,
  };
}

export function listEarningsStatementYears(
  bookings: RentalBooking[] = loadRentalBookings(),
  now = new Date(),
): number[] {
  const years = new Set<number>();
  years.add(now.getFullYear());
  for (const b of hostBookings(bookings).filter(shouldIncludeInStatement)) {
    const d = bookingEventDate(b);
    if (!Number.isNaN(d.getTime())) years.add(d.getFullYear());
  }
  return Array.from(years).sort((a, b) => b - a);
}

export function computeEarningsStatement(
  year: number,
  now = new Date(),
): EarningsStatement {
  const all = hostBookings(loadRentalBookings()).filter(shouldIncludeInStatement);
  const availableYears = listEarningsStatementYears(all, now);
  const selectedYear = availableYears.includes(year) ? year : availableYears[0] ?? now.getFullYear();

  let feesPartiallyEstimated = false;
  const rows = all
    .filter((b) => bookingEventDate(b).getFullYear() === selectedYear)
    .map((b) => {
      if (typeof b.serviceFeeUsd !== "number") feesPartiallyEstimated = true;
      return toLedgerRow(b);
    })
    .sort((a, b) => (a.dateIso < b.dateIso ? 1 : a.dateIso > b.dateIso ? -1 : 0));

  const countryCode = getSearchCountryCode();
  const { code: currencyCode } = currencyForCountry(countryCode);

  return {
    year: selectedYear,
    availableYears,
    rows,
    totals: sumTotals(rows),
    currencyCode,
    countryCode,
    isUsMarket: countryCode === "US",
    feesPartiallyEstimated,
  };
}

export function formatStatementMoney(amount: number): string {
  return formatMoney(amount);
}

export function formatStatementDate(dateIso: string, locale: AppLocale = getLocale()): string {
  const d = new Date(`${dateIso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return dateIso;
  try {
    return new Intl.DateTimeFormat(LOCALE_BCP47[locale] ?? "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(d);
  } catch {
    return dateIso;
  }
}

export type EarningsCsvLabels = {
  date: string;
  listing: string;
  bookingId: string;
  gross: string;
  platformFee: string;
  stripeFee: string;
  refunds: string;
  delivery: string;
  net: string;
  notAvailable: string;
};

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function buildEarningsStatementCsv(
  statement: EarningsStatement,
  labels: EarningsCsvLabels,
): string {
  const header = [
    labels.date,
    labels.listing,
    labels.bookingId,
    labels.gross,
    labels.platformFee,
    labels.stripeFee,
    labels.refunds,
    labels.delivery,
    labels.net,
    "Currency",
  ]
    .map(csvEscape)
    .join(",");

  const lines = statement.rows.map((row) =>
    [
      row.dateIso,
      row.listingTitle,
      row.bookingId,
      row.gross.toFixed(2),
      row.platformFee.toFixed(2),
      row.stripeFee == null ? labels.notAvailable : row.stripeFee.toFixed(2),
      row.refunds.toFixed(2),
      row.delivery.toFixed(2),
      row.net.toFixed(2),
      statement.currencyCode,
    ]
      .map((cell) => csvEscape(String(cell)))
      .join(","),
  );

  const totalsLine = [
    "",
    "TOTALS",
    "",
    statement.totals.gross.toFixed(2),
    statement.totals.platformFee.toFixed(2),
    labels.notAvailable,
    statement.totals.refunds.toFixed(2),
    statement.totals.delivery.toFixed(2),
    statement.totals.net.toFixed(2),
    statement.currencyCode,
  ]
    .map((cell) => csvEscape(String(cell)))
    .join(",");

  return [header, ...lines, totalsLine].join("\n");
}

export function downloadEarningsStatementCsv(
  statement: EarningsStatement,
  labels: EarningsCsvLabels,
  filename?: string,
): void {
  const csv = buildEarningsStatementCsv(statement, labels);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename ?? `earnings-statement-${statement.year}.csv`;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
