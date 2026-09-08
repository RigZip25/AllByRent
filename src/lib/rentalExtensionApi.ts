import { getAccessToken } from "./stripePayments";
import { normalizeRentalInvoices, type RentalInvoice } from "./rentalInvoice";

/**
 * Asking for extra days on a running rental.
 *
 * The renter used to move the end date on their own device, taking days off a
 * calendar the host was still selling. `/api/rentals/extend` prices the days
 * from the host's listing and bills for them; the date moves when that invoice
 * is paid.
 */

export type ExtensionQuote = {
  newEndDate: string;
  extraDays: number;
  dailyRateCents: number;
  subtotalCents: number;
  serviceFeeCents: number;
  totalCents: number;
};

export type ExtensionResult =
  | {
      ok: true;
      quote: ExtensionQuote;
      /** True when there was nothing to pay and the dates already moved. */
      applied: boolean;
      invoices: RentalInvoice[];
    }
  | { ok: false; reason: string };

function normalizeQuote(raw: unknown): ExtensionQuote | null {
  if (!raw || typeof raw !== "object") return null;
  const q = raw as Record<string, unknown>;
  if (typeof q.newEndDate !== "string") return null;
  const num = (value: unknown) => Math.max(0, Math.round(Number(value) || 0));
  return {
    newEndDate: q.newEndDate,
    extraDays: num(q.extraDays),
    dailyRateCents: num(q.dailyRateCents),
    subtotalCents: num(q.subtotalCents),
    serviceFeeCents: num(q.serviceFeeCents),
    totalCents: num(q.totalCents),
  };
}

async function post(body: Record<string, unknown>): Promise<ExtensionResult> {
  const token = await getAccessToken();
  if (!token) return { ok: false, reason: "Sign in required" };

  let payload: {
    ok?: boolean;
    error?: string;
    applied?: boolean;
    quote?: unknown;
    invoices?: unknown;
  };
  let status = 0;
  try {
    const res = await fetch("/api/rentals/extend", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    status = res.status;
    payload = (await res.json()) as typeof payload;
  } catch {
    return { ok: false, reason: "Couldn't reach the server" };
  }

  if (status >= 400 || !payload.ok) {
    return { ok: false, reason: payload.error ?? `Extension failed (${status})` };
  }

  const quote = normalizeQuote(payload.quote);
  if (!quote) return { ok: false, reason: "The server sent a price we can't read" };

  return {
    ok: true,
    quote,
    applied: Boolean(payload.applied),
    invoices: normalizeRentalInvoices(payload.invoices),
  };
}

/** Price the extra days without committing to them. */
export function quoteRentalExtension(params: {
  rentalId: string;
  newEndDate: string;
}): Promise<ExtensionResult> {
  return post({ rentalId: params.rentalId, newEndDate: params.newEndDate, action: "quote" });
}

/** Raise the bill for the extra days. */
export function requestRentalExtension(params: {
  rentalId: string;
  newEndDate: string;
}): Promise<ExtensionResult> {
  return post({ rentalId: params.rentalId, newEndDate: params.newEndDate, action: "request" });
}
