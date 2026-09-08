import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Invoices a host raises against a rental: fuel, tolls, a late return, damage.
 *
 * They live in the `rentals.rental_invoices` JSON column, and since migration
 * 053 that column is the server's: a participant who could write it could mark
 * their own invoice paid, or raise one for a thousand dollars in the other
 * person's name. Everything that creates or changes an invoice goes through
 * here, with the service role.
 */

export type InvoiceLineKind =
  | "fuel_topup"
  | "fuel_fee"
  | "late_fee"
  | "toll"
  | "fine"
  | "no_show"
  | "damage"
  | "extension"
  | "custom";

const LINE_KINDS: ReadonlySet<string> = new Set<InvoiceLineKind>([
  "fuel_topup",
  "fuel_fee",
  "late_fee",
  "toll",
  "fine",
  "no_show",
  "damage",
  "extension",
  "custom",
]);

/** A line under a dollar is a mistake; one over this is a dispute, not an invoice. */
const MIN_LINE_CENTS = 50;
const MAX_LINE_CENTS = 500_000;
const MAX_LINES = 12;
const MAX_INVOICES = 40;

export type InvoiceLineInput = {
  kind?: string;
  label?: string;
  amountCents?: number;
};

export type StoredInvoiceLine = {
  id: string;
  kind: InvoiceLineKind;
  label: string;
  amountCents: number;
};

export type StoredInvoice = {
  id: string;
  rentalId: string;
  createdAt: string;
  updatedAt: string;
  createdByRole: "host" | "system";
  status: "open" | "payment_pending" | "paid" | "void";
  lines: StoredInvoiceLine[];
  note?: string;
  totalCents: number;
  stripePaymentIntentId?: string;
  paidAt?: string;
  /** Set when paying this invoice is what moves the rental's end date. */
  extension?: { newEndDate: string; extraDays: number };
};

export function readInvoices(raw: unknown): StoredInvoice[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (entry): entry is StoredInvoice =>
      Boolean(entry) && typeof entry === "object" && typeof (entry as StoredInvoice).id === "string",
  );
}

export function sanitizeLines(input: InvoiceLineInput[] | undefined): StoredInvoiceLine[] {
  if (!Array.isArray(input)) return [];
  const out: StoredInvoiceLine[] = [];
  for (const line of input.slice(0, MAX_LINES)) {
    const kindRaw = typeof line?.kind === "string" ? line.kind : "custom";
    const kind = (LINE_KINDS.has(kindRaw) ? kindRaw : "custom") as InvoiceLineKind;
    const amount = Math.round(Number(line?.amountCents) || 0);
    if (amount < MIN_LINE_CENTS || amount > MAX_LINE_CENTS) continue;
    out.push({
      id: `line-${out.length}`,
      kind,
      label: (typeof line?.label === "string" && line.label.trim() ? line.label : kind)
        .trim()
        .slice(0, 120),
      amountCents: amount,
    });
  }
  return out;
}

export function sumLines(lines: StoredInvoiceLine[]): number {
  return lines.reduce((total, line) => total + line.amountCents, 0);
}

async function writeInvoices(
  admin: SupabaseClient,
  rentalId: string,
  invoices: StoredInvoice[],
): Promise<void> {
  await admin
    .from("rentals")
    .update({ rental_invoices: invoices.slice(0, MAX_INVOICES) })
    .eq("id", rentalId);
}

export type IssueInvoiceResult =
  | { ok: true; invoice: StoredInvoice; invoices: StoredInvoice[] }
  | { ok: false; error: string };

export async function issueRentalInvoice(
  admin: SupabaseClient,
  params: {
    rentalId: string;
    lines: InvoiceLineInput[];
    note?: string;
    createdByRole?: "host" | "system";
    extension?: { newEndDate: string; extraDays: number };
    /** Skip if an open invoice of this kind already exists (automation reruns). */
    onlyIfNoOpenKind?: InvoiceLineKind;
  },
): Promise<IssueInvoiceResult> {
  const lines = sanitizeLines(params.lines);
  if (lines.length === 0) return { ok: false, error: "No chargeable line on the invoice" };

  const { data: rental } = await admin
    .from("rentals")
    .select("id, rental_invoices")
    .eq("id", params.rentalId)
    .maybeSingle();
  if (!rental) return { ok: false, error: "Rental not found" };

  const existing = readInvoices(rental.rental_invoices);

  if (params.onlyIfNoOpenKind) {
    const already = existing.some(
      (invoice) =>
        invoice.status !== "void" &&
        invoice.lines?.some((line) => line.kind === params.onlyIfNoOpenKind),
    );
    if (already) return { ok: false, error: "An invoice for this already exists" };
  }

  const now = new Date().toISOString();
  const invoice: StoredInvoice = {
    id: `inv-${randomUUID()}`,
    rentalId: params.rentalId,
    createdAt: now,
    updatedAt: now,
    createdByRole: params.createdByRole ?? "host",
    status: "open",
    lines,
    note: params.note?.trim().slice(0, 500) || undefined,
    totalCents: sumLines(lines),
    extension: params.extension,
  };

  const invoices = [invoice, ...existing];
  await writeInvoices(admin, params.rentalId, invoices);
  return { ok: true, invoice, invoices };
}

export async function voidRentalInvoice(
  admin: SupabaseClient,
  params: { rentalId: string; invoiceId: string },
): Promise<{ ok: true; invoices: StoredInvoice[] } | { ok: false; error: string }> {
  const { data: rental } = await admin
    .from("rentals")
    .select("id, rental_invoices")
    .eq("id", params.rentalId)
    .maybeSingle();
  if (!rental) return { ok: false, error: "Rental not found" };

  const existing = readInvoices(rental.rental_invoices);
  const target = existing.find((invoice) => invoice.id === params.invoiceId);
  if (!target) return { ok: false, error: "Invoice not found on this rental" };
  // Money already taken is refunded, not voided.
  if (target.status === "paid") return { ok: false, error: "Invoice is already paid" };

  const invoices = existing.map((invoice) =>
    invoice.id === params.invoiceId
      ? { ...invoice, status: "void" as const, updatedAt: new Date().toISOString() }
      : invoice,
  );
  await writeInvoices(admin, params.rentalId, invoices);
  return { ok: true, invoices };
}
