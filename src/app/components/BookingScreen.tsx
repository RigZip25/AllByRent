import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, MapPin, Truck, Package, Shield } from "lucide-react";
import { DEPOSIT_PROTECTION_LABEL } from "../../lib/brand";
import { getPublishedListingById } from "../../lib/listingStorage";
import { getListingDisplayTitle } from "../../lib/listingQr";
import { useAuth } from "../../hooks/AuthProvider";
import { parseUsdToCents } from "../../lib/insurance";
import {
  breakdownForListingBooking,
  deliverySummaryForListing,
  listingOffersDelivery,
  type RentalPriceBreakdown,
} from "../../lib/rentalPricing";
import {
  appendRentalBooking,
  createRentalRemote,
  toSupabaseRentalInsert,
  type FulfillmentMethod,
  type RentalBooking,
} from "../../lib/rentalsStorage";
import { createNotificationRemote } from "../../lib/notificationsStorage";
import { RentalPriceBreakdownView } from "../../components/rentals/RentalPriceBreakdown";
import { StripePaymentForm } from "../../components/payments/StripePaymentForm";
import { getStripeRequiredMessage, isPaymentsReady } from "../../lib/config/production";
import { removeStripeControllerIframes } from "../../lib/stripeCleanup";
import { createDepositPaymentIntent, createRentalPaymentIntent } from "../../lib/stripePayments";
import type { ListingDraft } from "../../screens/listing/types";

const GREEN = "#0D5C3A";

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function fulfillmentOptions(listing: ListingDraft): {
  id: FulfillmentMethod;
  label: string;
  description: string;
  disabled?: boolean;
}[] {
  const options: {
    id: FulfillmentMethod;
    label: string;
    description: string;
    disabled?: boolean;
  }[] = [];
  if (listing.handoff.inPerson) {
    options.push({
      id: "pickup",
      label: "In-person pickup",
      description: "Meet the host at their location",
    });
  }
  if (listing.handoff.contactless) {
    options.push({
      id: "contactless",
      label: "Contactless pickup",
      description: "Lockbox or porch — codes unlock at check-in",
    });
  }
  if (listingOffersDelivery(listing)) {
    options.push({
      id: "delivery",
      label: "Round-trip delivery",
      description:
        deliverySummaryForListing(listing) ??
        "Host delivers before start and picks up after end",
    });
  }
  return options;
}

export function BookingScreen({
  listingId,
  onBack,
  onConfirmed,
}: {
  listingId: string;
  onBack: () => void;
  onConfirmed: (bookingId: string) => void;
}) {
  const listing = useMemo(() => getPublishedListingById(listingId), [listingId]);
  if (!listing) {
    return (
      <div className="screen flex flex-col items-center justify-center bg-background px-6 text-center">
        <p className="font-semibold">Listing not found</p>
        <button type="button" onClick={onBack} className="mt-4 text-sm underline">
          Go back
        </button>
      </div>
    );
  }
  return (
    <BookingScreenLoaded listing={listing} onBack={onBack} onConfirmed={onConfirmed} />
  );
}

function BookingScreenLoaded({
  listing,
  onBack,
  onConfirmed,
}: {
  listing: ListingDraft;
  onBack: () => void;
  onConfirmed: (bookingId: string) => void;
}) {
  const auth = useAuth();
  const title = getListingDisplayTitle(listing) || listing.title || "Item";
  const options = useMemo(() => fulfillmentOptions(listing), [listing]);
  const defaultFulfillment =
    options.find((o) => !o.disabled)?.id ?? options[0]?.id ?? "pickup";

  const [rentalDays, setRentalDays] = useState(2);
  const [fulfillment, setFulfillment] = useState<FulfillmentMethod>(defaultFulfillment);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentClientSecret, setPaymentClientSecret] = useState<string | null>(null);
  const [depositClientSecret, setDepositClientSecret] = useState<string | null>(null);
  const [pendingBookingId, setPendingBookingId] = useState<string | null>(null);
  const [pendingDepositCents, setPendingDepositCents] = useState(0);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);

  useEffect(() => {
    return () => {
      window.setTimeout(removeStripeControllerIframes, 0);
    };
  }, []);

  const startDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().slice(0, 10);
  }, []);
  const endDate = addDays(startDate, rentalDays - 1);

  const deliveryRequested = fulfillment === "delivery";
  const depositAmountCents = parseUsdToCents(listing.pricing.securityDeposit ?? "");

  const breakdown: RentalPriceBreakdown = useMemo(
    () =>
      breakdownForListingBooking(listing, {
        rentalDays,
        deliveryRequested,
        insuranceFeeUsd: 0,
      }),
    [listing, rentalDays, deliveryRequested],
  );

  const canConfirm = !deliveryRequested || deliveryAddress.trim().length > 0;

  const stripeCheckout =
    isPaymentsReady() && Boolean(auth.userId && listing.hostId);

  const buildBooking = (id: string): RentalBooking => {
    const pickupLabel =
      fulfillment === "delivery"
        ? `Delivery · ${listing.handoff.deliveryMaxMiles ?? 20} mi`
        : fulfillment === "contactless"
          ? "Contactless pickup"
          : "In-person pickup";

    return {
      id,
      role: "renter",
      status: "pending_approval",
      itemTitle: title,
      itemEmoji: "📷",
      startDate,
      endDate,
      counterpartyId: listing.hostId ?? "",
      counterpartyName: "Host",
      counterpartyIdentityVerified: false,
      counterpartyPhoneVerified: false,
      pickupLabel,
      rentalSubtotalUsd: breakdown.rentalSubtotalUsd,
      deliveryFee: breakdown.deliveryFeeUsd,
      deliveryRoundTripUsd: breakdown.deliveryRoundTripUsd,
      heavySurchargeUsd: breakdown.heavySurchargeUsd,
      itemWeightLbs: breakdown.itemWeightLbs ?? undefined,
      poundsOverThreshold:
        breakdown.heavySurchargeUsd > 0 ? breakdown.poundsOverThreshold : undefined,
      deliveryRequested: breakdown.deliveryRequested,
      serviceFeeUsd: breakdown.serviceFeeUsd,
      totalUsd: breakdown.totalUsd,
      itemHeavy: listing.handoff.itemHeavy,
      insuranceIncluded: false,
      listingModes: ["rent"],
      fulfillmentMethod: fulfillment,
      deliveryAddress: deliveryRequested ? deliveryAddress.trim() : undefined,
      contactlessInstructions: listing.handoff.contactlessInstructions || undefined,
      pickupWindowStart: new Date().toISOString(),
      stripePayment: stripeCheckout,
      paymentOnHold: stripeCheckout,
      depositAmountCents,
    };
  };

  const finalizeBooking = (id: string, booking: RentalBooking) => {
    if (auth.userId && listing.hostId) {
      void createNotificationRemote({
        recipientId: listing.hostId,
        actorId: auth.userId,
        type: "booking_request",
        title: "New booking request",
        body: `Someone wants to rent your ${title}.`,
      });
    }
    appendRentalBooking(booking);
    onConfirmed(id);
  };

  const persistRentalRow = (id: string, booking: RentalBooking) => {
    if (!auth.userId || !listing.hostId) return;
    const pickupAt = new Date(`${startDate}T14:00:00`).toISOString();
    const dueAt = new Date(`${endDate}T23:59:59`).toISOString();
    const row = toSupabaseRentalInsert({
      id,
      listingId: listing.id,
      ownerId: listing.hostId,
      renterId: auth.userId,
      status: booking.status,
      startDate,
      endDate,
      bookingMode: fulfillment,
      deliveryAddress: booking.deliveryAddress,
      pickupPin: booking.pickupPin,
      returnPin: booking.returnPin,
      safelyPolicyId: null,
      insuranceFeeCents: 0,
      depositAmountCents,
      rentalTotalCents: Math.round(breakdown.totalUsd * 100),
      pickupAt,
      dueAt,
      stripePaymentStatus: stripeCheckout ? "requires_payment_method" : undefined,
    });
    void createRentalRemote(row).catch((error) => {
      setPaymentError(error instanceof Error ? error.message : "Failed to save booking");
    });
  };

  const handleConfirm = () => {
    if (!stripeCheckout) {
      setPaymentError(getStripeRequiredMessage());
      return;
    }

    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `rent-${Date.now()}`;
    const booking = buildBooking(id);

    setConfirmBusy(true);
    setPaymentError(null);
    void (async () => {
      persistRentalRow(id, booking);

      const amountCents = Math.max(50, Math.round(breakdown.totalUsd * 100));
      const pi = await createRentalPaymentIntent({
        rentalId: id,
        listingId: listing.id,
        ownerId: listing.hostId!,
        amountCents,
      });

      if (!pi.ok) {
        setPaymentError(pi.reason);
        return;
      }

      setPendingBookingId(id);
      setPaymentClientSecret(pi.clientSecret);
    })().finally(() => setConfirmBusy(false));
  };

  const handlePaymentSuccess = () => {
    if (!pendingBookingId) return;
    const depositCents = depositAmountCents;
    setPaymentClientSecret(null);

    if (stripeCheckout && depositCents >= 50) {
      setPendingDepositCents(depositCents);
      setConfirmBusy(true);
      void createDepositPaymentIntent(pendingBookingId)
        .then((deposit) => {
          if (deposit.ok) {
            setDepositClientSecret(deposit.clientSecret);
            return;
          }
          setPaymentError(deposit.reason);
        })
        .finally(() => setConfirmBusy(false));
      return;
    }

    finalizeAfterPayment(pendingBookingId);
  };

  const finalizeAfterPayment = (id: string) => {
    const booking = buildBooking(id);
    finalizeBooking(id, {
      ...booking,
      paymentOnHold: false,
      depositStatus:
        pendingDepositCents >= 50 ? "held" : booking.depositAmountCents ? booking.depositStatus : undefined,
      depositAmountCents: pendingDepositCents >= 50 ? pendingDepositCents : booking.depositAmountCents,
    });
    setPendingBookingId(null);
    setDepositClientSecret(null);
    setPendingDepositCents(0);
  };

  const handleDepositSuccess = () => {
    if (!pendingBookingId) return;
    finalizeAfterPayment(pendingBookingId);
  };

  return (
    <div className="screen bg-background flex flex-col">
      <div className="shrink-0 z-10 bg-card/80 backdrop-blur-sm border-b border-border px-3 sm:px-4 py-3 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-semibold flex-1">Request booking</h1>
      </div>

      <div className="screen-scroll flex-1 min-h-0 p-4 space-y-5 pb-28">
        <div>
          <h2 className="text-lg font-bold">{title}</h2>
          {listing.handoff.itemHeavy ? (
            <span className="mt-2 inline-flex items-center gap-1 rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900">
              <Package className="h-3.5 w-3.5" aria-hidden />
              Heavy item
            </span>
          ) : null}
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-semibold mb-2">Rental length</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setRentalDays((d) => Math.max(1, d - 1))}
              className="h-9 w-9 rounded-lg border border-border text-lg font-bold"
            >
              −
            </button>
            <span className="min-w-[4rem] text-center font-semibold">
              {rentalDays} day{rentalDays === 1 ? "" : "s"}
            </span>
            <button
              type="button"
              onClick={() => setRentalDays((d) => Math.min(90, d + 1))}
              className="h-9 w-9 rounded-lg border border-border text-lg font-bold"
            >
              +
            </button>
          </div>
          {listing.pricing.longTermEnabled ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Tip: pick 30+ days to see monthly pricing.
            </p>
          ) : null}
          <p className="mt-2 text-xs text-muted-foreground">
            {new Date(startDate).toLocaleDateString()} –{" "}
            {new Date(endDate).toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold">How do you want the item?</p>
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              disabled={opt.disabled}
              onClick={() => setFulfillment(opt.id)}
              className={`w-full rounded-xl border p-4 text-left transition-colors ${
                opt.disabled
                  ? "cursor-not-allowed border-border bg-muted/40 opacity-60"
                  : fulfillment === opt.id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <div className="flex items-start gap-3">
                {opt.id === "delivery" ? (
                  <Truck className="w-5 h-5 shrink-0 text-primary mt-0.5" />
                ) : (
                  <MapPin className="w-5 h-5 shrink-0 text-primary mt-0.5" />
                )}
                <div>
                  <p className="font-medium">{opt.label}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{opt.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {deliveryRequested ? (
          <div className="rounded-xl border border-border bg-card p-4">
            <label className="text-sm font-semibold block mb-2">Delivery address</label>
            <input
              type="text"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Street, city, ZIP"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Round-trip delivery is one fee for drop-off before your rental starts and pickup
              after it ends.
            </p>
          </div>
        ) : null}

        {depositAmountCents >= 50 ? (
          <div className="flex gap-2 rounded-xl border border-[#0D5C3A]/20 bg-[#0D5C3A]/5 p-3 text-sm text-gray-800">
            <Shield className="h-5 w-5 shrink-0" style={{ color: GREEN }} aria-hidden />
            <p>
              <span className="font-semibold">{DEPOSIT_PROTECTION_LABEL}.</span> A{" "}
              <span className="font-semibold">${(depositAmountCents / 100).toFixed(2)}</span> card
              hold may be authorized after rental payment — released when the item is returned.
            </p>
          </div>
        ) : null}

        <RentalPriceBreakdownView breakdown={breakdown} />

        {depositClientSecret ? (
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm font-semibold mb-1">{DEPOSIT_PROTECTION_LABEL} hold</p>
            <p className="text-xs text-muted-foreground mb-3">
              We&apos;ll authorize ${(pendingDepositCents / 100).toFixed(2)} on your card. The hold
              is released when the owner confirms the item was returned in good condition.
            </p>
            {paymentError ? (
              <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
                {paymentError}
              </p>
            ) : null}
            <StripePaymentForm
              clientSecret={depositClientSecret}
              totalLabel={`$${(pendingDepositCents / 100).toFixed(2)} hold`}
              onSuccess={handleDepositSuccess}
              onError={setPaymentError}
            />
          </div>
        ) : null}

        {paymentClientSecret ? (
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm font-semibold mb-3">Card payment</p>
            {paymentError ? (
              <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
                {paymentError}
              </p>
            ) : null}
            <StripePaymentForm
              clientSecret={paymentClientSecret}
              totalLabel={`$${breakdown.totalUsd.toFixed(2)}`}
              onSuccess={handlePaymentSuccess}
              onError={setPaymentError}
            />
            <button
              type="button"
              className="mt-3 w-full text-center text-sm text-muted-foreground underline"
              onClick={() => {
                setPaymentClientSecret(null);
                setPendingBookingId(null);
                setPaymentError(null);
              }}
            >
              Back to booking details
            </button>
          </div>
        ) : null}
      </div>

      <div className="screen-footer bg-card/95 backdrop-blur-sm border-t border-border p-3 sm:p-4">
        {!paymentClientSecret && !depositClientSecret ? (
          <button
            type="button"
            disabled={!canConfirm || confirmBusy}
            onClick={handleConfirm}
            className="w-full rounded-xl py-3.5 font-medium text-white transition-colors disabled:opacity-50"
            style={{ backgroundColor: GREEN }}
          >
            {confirmBusy
              ? "Preparing payment…"
              : stripeCheckout
                ? `Continue to pay · $${breakdown.totalUsd.toFixed(2)}`
                : `Confirm · $${breakdown.totalUsd.toFixed(2)} total`}
          </button>
        ) : (
          <p className="text-center text-xs text-muted-foreground">
            {depositClientSecret
              ? "Authorize the deposit hold above to finish your request."
              : "Complete card payment above to submit your booking request."}
          </p>
        )}
      </div>
    </div>
  );
}
