/**
 * Host → renter invoice / fine builder for active & post-rental.
 * Line items (fuel, late, toll, fine, custom) + Stripe Connect payment scaffold.
 */

export type RentalInvoiceLineKind =
  | "fuel_topup"
  | "fuel_fee"
  | "late_fee"
  | "toll"
  | "fine"
  | "no_show"
  | "damage"
  | "custom";

export type RentalInvoiceLine = {
  id: string;
  kind: RentalInvoiceLineKind;
  /** Display label (host-entered or preset). */
  label: string;
  amountCents: number;
  note?: string;
};

export type RentalInvoiceStatus =
  | "draft"
  | "open"
  | "payment_pending"
  | "paid"
  | "void";

export type RentalInvoice = {
  id: string;
  rentalId: string;
  createdAt: string;
  updatedAt: string;
  createdByRole: "host";
  status: RentalInvoiceStatus;
  lines: RentalInvoiceLine[];
  /** Optional host note shown to renter. */
  note?: string;
  totalCents: number;
  stripePaymentIntentId?: string;
  paidAt?: string;
};

export const INVOICE_LINE_PRESETS: ReadonlyArray<{
  kind: RentalInvoiceLineKind;
  /** Default USD amount suggestion (null = host enters). */
  defaultAmountUsd: number | null;
}> = [
  { kind: "fuel_topup", defaultAmountUsd: null },
  { kind: "fuel_fee", defaultAmountUsd: 20 },
  { kind: "late_fee", defaultAmountUsd: null },
  { kind: "toll", defaultAmountUsd: null },
  { kind: "fine", defaultAmountUsd: null },
  { kind: "no_show", defaultAmountUsd: null },
  { kind: "damage", defaultAmountUsd: null },
  { kind: "custom", defaultAmountUsd: null },
] as const;

function newId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function sumInvoiceLines(lines: RentalInvoiceLine[]): number {
  return lines.reduce((sum, line) => sum + Math.max(0, Math.round(line.amountCents || 0)), 0);
}

export function createEmptyInvoiceLine(
  kind: RentalInvoiceLineKind = "custom",
  label = "",
  amountCents = 0,
): RentalInvoiceLine {
  const preset = INVOICE_LINE_PRESETS.find((p) => p.kind === kind);
  const cents =
    amountCents > 0
      ? Math.round(amountCents)
      : preset?.defaultAmountUsd != null
        ? Math.round(preset.defaultAmountUsd * 100)
        : 0;
  return {
    id: newId("line"),
    kind,
    label,
    amountCents: cents,
  };
}

export function createRentalInvoice(params: {
  rentalId: string;
  lines: RentalInvoiceLine[];
  note?: string;
}): RentalInvoice {
  const now = new Date().toISOString();
  const lines = params.lines
    .map((line) => ({
      ...line,
      amountCents: Math.max(0, Math.round(line.amountCents || 0)),
      label: line.label.trim() || line.kind,
    }))
    .filter((line) => line.amountCents >= 50 || line.kind === "custom");
  return {
    id: newId("inv"),
    rentalId: params.rentalId,
    createdAt: now,
    updatedAt: now,
    createdByRole: "host",
    status: "open",
    lines,
    note: params.note?.trim() || undefined,
    totalCents: sumInvoiceLines(lines),
  };
}

export function normalizeRentalInvoices(raw: unknown): RentalInvoice[] {
  if (!Array.isArray(raw)) return [];
  const out: RentalInvoice[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const r = row as Partial<RentalInvoice>;
    if (typeof r.id !== "string") continue;
    const lines = Array.isArray(r.lines)
      ? r.lines
          .filter((l): l is RentalInvoiceLine => Boolean(l && typeof l === "object"))
          .map((l) => ({
            id: typeof l.id === "string" ? l.id : newId("line"),
            kind: (l.kind as RentalInvoiceLineKind) || "custom",
            label: typeof l.label === "string" ? l.label : "Item",
            amountCents: Math.max(0, Math.round(Number(l.amountCents) || 0)),
            note: typeof l.note === "string" ? l.note : undefined,
          }))
      : [];
    out.push({
      id: r.id,
      rentalId: typeof r.rentalId === "string" ? r.rentalId : "",
      createdAt: typeof r.createdAt === "string" ? r.createdAt : new Date().toISOString(),
      updatedAt: typeof r.updatedAt === "string" ? r.updatedAt : new Date().toISOString(),
      createdByRole: "host",
      status: (r.status as RentalInvoiceStatus) || "open",
      lines,
      note: typeof r.note === "string" ? r.note : undefined,
      totalCents:
        typeof r.totalCents === "number" && Number.isFinite(r.totalCents)
          ? Math.max(0, Math.round(r.totalCents))
          : sumInvoiceLines(lines),
      stripePaymentIntentId:
        typeof r.stripePaymentIntentId === "string" ? r.stripePaymentIntentId : undefined,
      paidAt: typeof r.paidAt === "string" ? r.paidAt : undefined,
    });
  }
  return out;
}

export function upsertInvoiceOnList(
  list: RentalInvoice[] | null | undefined,
  invoice: RentalInvoice,
): RentalInvoice[] {
  const prev = Array.isArray(list) ? [...list] : [];
  const idx = prev.findIndex((i) => i.id === invoice.id);
  if (idx >= 0) {
    prev[idx] = invoice;
    return prev;
  }
  return [invoice, ...prev];
}

const INVOICE_STATUS_RANK: Record<RentalInvoiceStatus, number> = {
  draft: 0,
  open: 1,
  payment_pending: 2,
  void: 3,
  paid: 4,
};

/** Merge local + remote invoices; prefer paid / newer paidAt from either side. */
export function mergeRentalInvoices(
  local: RentalInvoice[] | null | undefined,
  remote: RentalInvoice[] | null | undefined,
): RentalInvoice[] {
  const map = new Map<string, RentalInvoice>();
  for (const inv of normalizeRentalInvoices(remote)) {
    map.set(inv.id, inv);
  }
  for (const inv of normalizeRentalInvoices(local)) {
    const prev = map.get(inv.id);
    if (!prev) {
      map.set(inv.id, inv);
      continue;
    }
    const localRank = INVOICE_STATUS_RANK[inv.status] ?? 0;
    const remoteRank = INVOICE_STATUS_RANK[prev.status] ?? 0;
    const status = localRank >= remoteRank ? inv.status : prev.status;
    const lines = inv.lines.length >= (prev.lines?.length ?? 0) ? inv.lines : prev.lines;
    map.set(inv.id, {
      ...prev,
      ...inv,
      status,
      lines,
      paidAt: inv.paidAt || prev.paidAt,
      stripePaymentIntentId: inv.stripePaymentIntentId || prev.stripePaymentIntentId,
      totalCents: inv.totalCents || prev.totalCents,
      note: inv.note || prev.note,
      updatedAt:
        (inv.updatedAt || "") >= (prev.updatedAt || "") ? inv.updatedAt : prev.updatedAt,
    });
  }
  return [...map.values()].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
}
