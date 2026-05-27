import { useMemo, useState } from "react";
import { ArrowLeft, MapPin, Truck, Package } from "lucide-react";
import { getPublishedListingById } from "../../lib/listingStorage";
import { getListingDisplayTitle } from "../../lib/listingQr";
import {
  breakdownForListingBooking,
  deliverySummaryForListing,
  listingOffersDelivery,
  type RentalPriceBreakdown,
} from "../../lib/rentalPricing";
import {
  appendRentalBooking,
  type FulfillmentMethod,
  type RentalBooking,
} from "../../lib/rentalsStorage";
import { RentalPriceBreakdownView } from "../../components/rentals/RentalPriceBreakdown";
import type { ListingDraft } from "../../screens/listing/types";

const GREEN = "#0D5C3A";

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function demoListingFallback(): ListingDraft {
  return {
    id: "demo-dslr",
    listingStatus: "active",
    photos: [],
    videos: [],
    aiSuggestions: null,
    aiAnalysisPending: false,
    photoEnhancementPending: false,
    title: "DSLR Camera",
    category: "Electronics",
    subcategory: "Cameras",
    grade: "personal",
    condition: "good",
    description: "",
    replacementValue: "800",
    instructionsUrl: "",
    modes: { rent: true, sell: true, rentToOwn: true, gift: false },
    pricing: {
      dailyRate: "35",
      weeklyRate: "",
      monthlyRate: "",
      longTermEnabled: false,
      longTermMonthlyRate: "",
      salePrice: "",
      rtoTotalPrice: "",
      rtoPeriodMonths: "",
      securityDeposit: "",
      minimumPeriod: "1 day",
    },
    blockedDates: [],
    paused: false,
    handoff: {
      inPerson: true,
      inPersonDays: [],
      inPersonTimeStart: "09:00",
      inPersonTimeEnd: "17:00",
      inPersonWeekendTimeStart: "10:00",
      inPersonWeekendTimeEnd: "14:00",
      contactless: false,
      contactlessInstructions: "",
      delivery: true,
      itemHeavy: false,
      deliveryMaxMiles: 5,
      deliveryRoundTripFee: "12",
      deliveryPrices: [{ miles: 5, price: "12" }],
    },
    generateQR: true,
    qrToken: "demo-token",
    qrReady: true,
    qrPrintedConfirmed: true,
    verificationPhoto: null,
  };
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
  onConfirmed: () => void;
}) {
  const listing = useMemo(
    () => getPublishedListingById(listingId) ?? demoListingFallback(),
    [listingId],
  );
  const title = getListingDisplayTitle(listing) || listing.title || "Item";
  const options = useMemo(() => fulfillmentOptions(listing), [listing]);
  const defaultFulfillment =
    options.find((o) => !o.disabled)?.id ?? options[0]?.id ?? "pickup";

  const [rentalDays, setRentalDays] = useState(2);
  const [fulfillment, setFulfillment] = useState<FulfillmentMethod>(defaultFulfillment);
  const [deliveryAddress, setDeliveryAddress] = useState("");

  const deliveryRequested = fulfillment === "delivery";
  const breakdown: RentalPriceBreakdown = useMemo(
    () =>
      breakdownForListingBooking(listing, {
        rentalDays,
        deliveryRequested,
      }),
    [listing, rentalDays, deliveryRequested],
  );

  const startDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().slice(0, 10);
  }, []);
  const endDate = addDays(startDate, rentalDays - 1);

  const canConfirm =
    !deliveryRequested || deliveryAddress.trim().length > 0;

  const handleConfirm = () => {
    const pickupLabel =
      fulfillment === "delivery"
        ? `Delivery · ${listing.handoff.deliveryMaxMiles ?? 20} mi`
        : fulfillment === "contactless"
          ? "Contactless pickup"
          : "In-person pickup";

    const booking: RentalBooking = {
      id: `rent-${Date.now()}`,
      role: "renter",
      status: "pending_checkin",
      itemTitle: title,
      itemEmoji: "📷",
      startDate,
      endDate,
      counterpartyId: "john-davis",
      counterpartyName: "John Davis",
      counterpartyIdentityVerified: true,
      counterpartyPhoneVerified: true,
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
      insuranceIncluded: true,
      listingModes: listing.modes.rentToOwn ? ["rent", "rto"] : ["rent"],
      fulfillmentMethod: fulfillment,
      deliveryAddress: deliveryRequested ? deliveryAddress.trim() : undefined,
      contactlessInstructions: listing.handoff.contactlessInstructions || undefined,
      pickupWindowStart: new Date().toISOString(),
      stripePayment: true,
    };

    appendRentalBooking(booking);
    onConfirmed();
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

        <RentalPriceBreakdownView breakdown={breakdown} />
      </div>

      <div className="screen-footer bg-card/95 backdrop-blur-sm border-t border-border p-3 sm:p-4">
        <button
          type="button"
          disabled={!canConfirm}
          onClick={handleConfirm}
          className="w-full rounded-xl py-3.5 font-medium text-white transition-colors disabled:opacity-50"
          style={{ backgroundColor: GREEN }}
        >
          Confirm · ${breakdown.totalUsd.toFixed(2)} total
        </button>
      </div>
    </div>
  );
}
