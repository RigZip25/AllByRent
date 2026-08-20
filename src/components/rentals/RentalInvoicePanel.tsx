import { useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import {
  createEmptyInvoiceLine,
  createRentalInvoice,
  INVOICE_LINE_PRESETS,
  sumInvoiceLines,
  upsertInvoiceOnList,
  type RentalInvoice,
  type RentalInvoiceLine,
  type RentalInvoiceLineKind,
} from "../../lib/rentalInvoice";
import { assessLateReturnFee } from "../../lib/lateReturnFee";
import { createRentalInvoicePaymentIntent } from "../../lib/stripePayments";
import { isStripePaymentsEnabled } from "../../lib/stripeConfig";
import { formatUsd } from "../../lib/rentalPricing";
import { useMessages } from "../../lib/i18n/react";
import type { RentalBooking } from "../../lib/rentalsStorage";

const GREEN = "#0D5C3A";
const BORDER = "#E8E6E0";

function lineKindLabel(
  kind: RentalInvoiceLineKind,
  copy: ReturnType<typeof useMessages>["rentalDetail"],
): string {
  switch (kind) {
    case "fuel_topup":
      return copy.invoiceKindFuelTopup;
    case "fuel_fee":
      return copy.invoiceKindFuelFee;
    case "late_fee":
      return copy.invoiceKindLateFee;
    case "toll":
      return copy.invoiceKindToll;
    case "fine":
      return copy.invoiceKindFine;
    case "no_show":
      return copy.invoiceKindNoShow;
    case "damage":
      return copy.invoiceKindDamage;
    default:
      return copy.invoiceKindCustom;
  }
}

function PayInvoiceForm({
  onPaid,
  onCancel,
}: {
  onPaid: () => void;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const t = useMessages();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!stripe || !elements) return;
    setBusy(true);
    setError(null);
    const result = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });
    setBusy(false);
    if (result.error) {
      setError(result.error.message ?? t.rentalDetail.invoicePayFailed);
      return;
    }
    onPaid();
  };

  return (
    <div className="space-y-3">
      <PaymentElement />
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={busy || !stripe}
          onClick={() => void submit()}
          className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          style={{ backgroundColor: GREEN }}
        >
          {busy ? t.rentalDetail.invoicePaying : t.rentalDetail.invoicePayNow}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onCancel}
          className="rounded-xl border px-4 py-2.5 text-sm font-medium"
          style={{ borderColor: BORDER }}
        >
          {t.rentalDetail.close}
        </button>
      </div>
    </div>
  );
}

export function RentalInvoicePanel({
  booking,
  onChange,
}: {
  booking: RentalBooking;
  onChange: (invoices: RentalInvoice[]) => void;
}) {
  const t = useMessages();
  const copy = t.rentalDetail;
  const invoices = booking.invoices ?? [];
  const isHost = booking.role === "host";
  const [builderOpen, setBuilderOpen] = useState(false);
  const [lines, setLines] = useState<RentalInvoiceLine[]>([
    createEmptyInvoiceLine("fuel_fee", "", 2000),
  ]);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [payClientSecret, setPayClientSecret] = useState<string | null>(null);
  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null);
  const [payBusy, setPayBusy] = useState(false);

  const stripePromise = useMemo(() => {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
    if (!key || !isStripePaymentsEnabled()) return null;
    return loadStripe(key);
  }, []);

  const totalCents = sumInvoiceLines(lines);

  const openBuilder = () => {
    if (booking.status === "overdue" && booking.lateReturnFee?.enabled) {
      const assessment = assessLateReturnFee({
        policy: booking.lateReturnFee,
        returnDueAt: booking.returnDueAt,
        endDate: booking.endDate,
      });
      if (assessment.pastGrace && assessment.feeCents >= 50) {
        setLines([
          createEmptyInvoiceLine(
            "late_fee",
            lineKindLabel("late_fee", copy),
            assessment.feeCents,
          ),
        ]);
      }
    }
    setBuilderOpen(true);
  };

  const addLine = (kind: RentalInvoiceLineKind) => {
    setLines((prev) => [
      ...prev,
      createEmptyInvoiceLine(kind, lineKindLabel(kind, copy)),
    ]);
  };

  const issueInvoice = () => {
    setError(null);
    const prepared = lines
      .map((line) => ({
        ...line,
        label: line.label.trim() || lineKindLabel(line.kind, copy),
        amountCents: Math.round(Number(line.amountCents) || 0),
      }))
      .filter((line) => line.amountCents >= 50);
    if (prepared.length === 0) {
      setError(copy.invoiceNeedLine);
      return;
    }
    const invoice = createRentalInvoice({
      rentalId: booking.id,
      lines: prepared,
      note,
    });
    if (invoice.totalCents < 50) {
      setError(copy.invoiceNeedLine);
      return;
    }
    onChange(upsertInvoiceOnList(invoices, invoice));
    setBuilderOpen(false);
    setLines([createEmptyInvoiceLine("custom", lineKindLabel("custom", copy))]);
    setNote("");
  };

  const startPay = async (invoice: RentalInvoice) => {
    setError(null);
    setPayBusy(true);
    const result = await createRentalInvoicePaymentIntent({
      rentalId: booking.id,
      invoiceId: invoice.id,
      amountCents: invoice.totalCents,
      note: invoice.note,
      lines: invoice.lines.map((l) => ({
        kind: l.kind,
        label: l.label,
        amountCents: l.amountCents,
      })),
    });
    setPayBusy(false);
    if (!result.ok) {
      setError(result.reason);
      // Still mark payment_pending locally when Stripe is unavailable — scaffold record.
      if (!isStripePaymentsEnabled()) {
        onChange(
          upsertInvoiceOnList(invoices, {
            ...invoice,
            status: "open",
            updatedAt: new Date().toISOString(),
          }),
        );
      }
      return;
    }
    onChange(
      upsertInvoiceOnList(invoices, {
        ...invoice,
        status: "payment_pending",
        stripePaymentIntentId: result.paymentIntentId,
        updatedAt: new Date().toISOString(),
      }),
    );
    setPayingInvoiceId(invoice.id);
    setPayClientSecret(result.clientSecret);
  };

  const markPaid = (invoiceId: string) => {
    const inv = invoices.find((i) => i.id === invoiceId);
    if (!inv) return;
    onChange(
      upsertInvoiceOnList(invoices, {
        ...inv,
        status: "paid",
        paidAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    );
    setPayClientSecret(null);
    setPayingInvoiceId(null);
  };

  const voidInvoice = (invoiceId: string) => {
    const inv = invoices.find((i) => i.id === invoiceId);
    if (!inv) return;
    onChange(
      upsertInvoiceOnList(invoices, {
        ...inv,
        status: "void",
        updatedAt: new Date().toISOString(),
      }),
    );
  };

  const canBuild =
    isHost &&
    (booking.status === "active" ||
      booking.status === "overdue" ||
      booking.status === "completed" ||
      booking.status === "disputed" ||
      booking.status === "no_show");

  if (!canBuild && invoices.length === 0) return null;

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3" style={{ borderColor: BORDER }}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold" style={{ color: GREEN }}>
            {copy.invoiceTitle}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{copy.invoiceBody}</p>
        </div>
        {canBuild ? (
          <button
            type="button"
            onClick={() => (builderOpen ? setBuilderOpen(false) : openBuilder())}
            className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
            style={{ backgroundColor: GREEN }}
          >
            {builderOpen ? copy.close : copy.invoiceCreate}
          </button>
        ) : null}
      </div>

      {builderOpen && canBuild ? (
        <div className="space-y-3 rounded-xl border bg-[#F7FBF8] p-3" style={{ borderColor: BORDER }}>
          <p className="text-xs font-semibold text-gray-700">{copy.invoiceAddLine}</p>
          <div className="flex flex-wrap gap-1.5">
            {INVOICE_LINE_PRESETS.map((preset) => (
              <button
                key={preset.kind}
                type="button"
                onClick={() => addLine(preset.kind)}
                className="rounded-full border bg-white px-2.5 py-1 text-[11px] font-medium text-gray-800"
                style={{ borderColor: BORDER }}
              >
                + {lineKindLabel(preset.kind, copy)}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {lines.map((line, idx) => (
              <div key={line.id} className="grid grid-cols-[1fr_88px_28px] gap-2 items-center">
                <input
                  value={line.label}
                  onChange={(e) => {
                    const label = e.target.value;
                    setLines((prev) =>
                      prev.map((l, i) => (i === idx ? { ...l, label } : l)),
                    );
                  }}
                  placeholder={lineKindLabel(line.kind, copy)}
                  className="rounded-lg border bg-white px-2.5 py-2 text-sm outline-none focus:border-[#0D5C3A]"
                  style={{ borderColor: BORDER }}
                />
                <input
                  type="number"
                  min={0.5}
                  step={0.01}
                  value={(line.amountCents / 100).toFixed(2)}
                  onChange={(e) => {
                    const usd = Number.parseFloat(e.target.value);
                    const amountCents = Number.isFinite(usd)
                      ? Math.max(0, Math.round(usd * 100))
                      : 0;
                    setLines((prev) =>
                      prev.map((l, i) => (i === idx ? { ...l, amountCents } : l)),
                    );
                  }}
                  className="rounded-lg border bg-white px-2 py-2 text-sm outline-none focus:border-[#0D5C3A]"
                  style={{ borderColor: BORDER }}
                />
                <button
                  type="button"
                  aria-label={copy.invoiceRemoveLine}
                  onClick={() => setLines((prev) => prev.filter((_, i) => i !== idx))}
                  className="text-sm text-gray-400 hover:text-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={copy.invoiceNotePlaceholder}
            rows={2}
            className="w-full rounded-lg border bg-white px-2.5 py-2 text-sm outline-none focus:border-[#0D5C3A]"
            style={{ borderColor: BORDER }}
          />

          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold">
              {copy.invoiceTotal}: ${formatUsd(totalCents / 100)}
            </p>
            <button
              type="button"
              onClick={issueInvoice}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: GREEN }}
            >
              {copy.invoiceSend}
            </button>
          </div>
        </div>
      ) : null}

      {error ? <p className="text-xs text-amber-800">{error}</p> : null}

      {invoices.length === 0 ? (
        <p className="text-sm text-muted-foreground">{copy.invoiceEmpty}</p>
      ) : (
        <ul className="space-y-2">
          {invoices.map((inv) => (
            <li
              key={inv.id}
              className="rounded-xl border bg-white p-3 space-y-2"
              style={{ borderColor: BORDER }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">
                    ${formatUsd(inv.totalCents / 100)} ·{" "}
                    <span className="font-normal text-muted-foreground">
                      {inv.status === "paid"
                        ? copy.invoiceStatusPaid
                        : inv.status === "void"
                          ? copy.invoiceStatusVoid
                          : inv.status === "payment_pending"
                            ? copy.invoiceStatusPending
                            : copy.invoiceStatusOpen}
                    </span>
                  </p>
                  <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                    {inv.lines.map((l) => (
                      <li key={l.id}>
                        {l.label || lineKindLabel(l.kind, copy)} — ${formatUsd(l.amountCents / 100)}
                      </li>
                    ))}
                  </ul>
                  {inv.note ? <p className="mt-1 text-xs text-gray-600">{inv.note}</p> : null}
                </div>
                <div className="flex flex-col gap-1">
                  {!isHost &&
                  (inv.status === "open" || inv.status === "payment_pending") &&
                  inv.totalCents >= 50 ? (
                    <button
                      type="button"
                      disabled={payBusy}
                      onClick={() => void startPay(inv)}
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                      style={{ backgroundColor: GREEN }}
                    >
                      {copy.invoicePayCta}
                    </button>
                  ) : null}
                  {isHost && (inv.status === "open" || inv.status === "payment_pending") ? (
                    <button
                      type="button"
                      onClick={() => voidInvoice(inv.id)}
                      className="rounded-lg border px-3 py-1.5 text-xs font-medium text-gray-600"
                      style={{ borderColor: BORDER }}
                    >
                      {copy.invoiceVoid}
                    </button>
                  ) : null}
                </div>
              </div>

              {payingInvoiceId === inv.id && payClientSecret && stripePromise ? (
                <Elements stripe={stripePromise} options={{ clientSecret: payClientSecret }}>
                  <PayInvoiceForm
                    onPaid={() => markPaid(inv.id)}
                    onCancel={() => {
                      setPayClientSecret(null);
                      setPayingInvoiceId(null);
                    }}
                  />
                </Elements>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {!isStripePaymentsEnabled() ? (
        <p className="text-[11px] text-muted-foreground">{copy.invoiceStripeScaffold}</p>
      ) : null}
    </div>
  );
}
