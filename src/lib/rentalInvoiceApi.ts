import { getAccessToken } from "./stripePayments";
import { normalizeRentalInvoices, type RentalInvoice, type RentalInvoiceLine } from "./rentalInvoice";

/**
 * Raising and cancelling a charge on a rental.
 *
 * The panel used to write the invoice list straight into the rental row, which
 * the database no longer allows (migration 053) — and should not, since the
 * same door let the person being charged edit the charge. `/api/rentals/invoice`
 * checks that the caller is the host of that rental and writes it there.
 */

export type InvoiceApiResult =
  | { ok: true; invoices: RentalInvoice[]; invoice?: RentalInvoice }
  | { ok: false; reason: string };

async function post(body: Record<string, unknown>): Promise<InvoiceApiResult> {
  const token = await getAccessToken();
  if (!token) return { ok: false, reason: "Sign in required" };

  let payload: {
    ok?: boolean;
    error?: string;
    invoices?: unknown;
    invoice?: unknown;
  };
  let status = 0;
  try {
    const res = await fetch("/api/rentals/invoice", {
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
    return { ok: false, reason: payload.error ?? `Invoice failed (${status})` };
  }

  const invoices = normalizeRentalInvoices(payload.invoices);
  const invoice = payload.invoice ? normalizeRentalInvoices([payload.invoice])[0] : undefined;
  return { ok: true, invoices, invoice };
}

export function issueRentalInvoiceRemote(params: {
  rentalId: string;
  lines: RentalInvoiceLine[];
  note?: string;
}): Promise<InvoiceApiResult> {
  return post({
    rentalId: params.rentalId,
    action: "issue",
    note: params.note,
    lines: params.lines.map((line) => ({
      kind: line.kind,
      label: line.label,
      amountCents: line.amountCents,
    })),
  });
}

export function voidRentalInvoiceRemote(params: {
  rentalId: string;
  invoiceId: string;
}): Promise<InvoiceApiResult> {
  return post({ rentalId: params.rentalId, action: "void", invoiceId: params.invoiceId });
}
