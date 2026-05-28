import {
  ArrowLeft,
  ScanLine,
  Shield,
  MessageCircle,
  Phone,
  CheckCircle2,
  Clock,
  Lock,
  MapPin,
  ExternalLink,
  AlertTriangle,
  Upload,
} from "lucide-react";
import { useMemo, useState, useCallback } from "react";
import { useAuth } from "../../hooks/AuthProvider";
import {
  loadRentalBookings,
  updateBooking,
  getRenterPickupLocation,
  type RentalBooking,
} from "../../lib/rentalsStorage";
import { hasLocalReview, submitReviewRemote } from "../../lib/reviewsStorage";
import { ReviewPromptModal } from "../../components/reviews/ReviewPromptModal";
import { RentanoTip } from "../../components/RentanoTip";
import {
  addEvidenceRemote,
  fetchDisputeForRentalRemote,
  openDisputeRemote,
  type Dispute,
} from "../../lib/disputesStorage";
import { QrScanPanel, type QrScanPhase } from "../../components/rentals/QrScanPanel";
import { RentalPriceBreakdownView } from "../../components/rentals/RentalPriceBreakdown";
import {
  computeRentalPriceBreakdown,
  formatUsd,
  type RentalPriceBreakdown,
} from "../../lib/rentalPricing";

export function ActiveRental({ onBack }: { onBack: () => void }) {
  const auth = useAuth();
  const [scanOpen, setScanOpen] = useState(false);
  const [scanPhase, setScanPhase] = useState<QrScanPhase>("camera");
  const [notice, setNotice] = useState<string | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [bookings, setBookings] = useState<RentalBooking[]>(() => loadRentalBookings());

  const booking = useMemo<RentalBooking | null>(() => {
    const list = bookings;
    return (
      list.find((b) => b.status === "pending_checkin") ??
      list.find((b) => b.status === "active" || b.status === "overdue") ??
      list[0] ??
      null
    );
  }, [bookings]);

  const canDispute = Boolean(booking && (booking.status === "active" || booking.status === "overdue"));

  const refreshDispute = useCallback(() => {
    if (!booking) return;
    void fetchDisputeForRentalRemote(booking.id).then(setDispute);
  }, [booking]);

  const mode: "pickup" | "return" =
    booking?.status === "pending_checkin" ? "pickup" : "return";

  const overdueWarning =
    booking?.status === "overdue"
      ? "Overdue: late fees may apply. Confirm return as soon as the item is back with the owner."
      : null;

  const renterPickupLocation = useMemo(
    () => (booking ? getRenterPickupLocation(booking) : undefined),
    [booking],
  );

  const priceBreakdown = useMemo<RentalPriceBreakdown | null>(() => {
    if (!booking) return null;
    if (
      booking.rentalSubtotalUsd !== undefined &&
      booking.serviceFeeUsd !== undefined
    ) {
      const rentalDays = Math.max(
        1,
        Math.round(
          (new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) /
            (1000 * 60 * 60 * 24),
        ) + 1,
      );
      const daily =
        rentalDays > 0 ? (booking.rentalSubtotalUsd ?? 0) / rentalDays : booking.rentalSubtotalUsd ?? 0;
      const deliveryRoundTripUsd =
        booking.deliveryRoundTripUsd ??
        (booking.heavySurchargeUsd
          ? Math.max(0, (booking.deliveryFee ?? 0) - (booking.heavySurchargeUsd ?? 0))
          : booking.deliveryFee ?? 0);
      const heavySurchargeUsd = booking.heavySurchargeUsd ?? 0;
      return {
        rentalDays,
        dailyRateUsd: daily,
        rentalSubtotalUsd: booking.rentalSubtotalUsd ?? 0,
        deliveryRequested: Boolean(booking.deliveryRequested && (booking.deliveryFee ?? 0) > 0),
        deliveryRoundTripUsd,
        heavySurchargeUsd,
        poundsOverThreshold: booking.poundsOverThreshold ?? 0,
        itemWeightLbs: booking.itemWeightLbs,
        deliveryFeeUsd: booking.deliveryFee ?? 0,
        serviceFeeUsd: booking.serviceFeeUsd ?? 0,
        totalUsd: booking.totalUsd,
      };
    }
    const deliveryRoundTripUsd = booking.deliveryRoundTripUsd ?? booking.deliveryFee ?? 0;
    return computeRentalPriceBreakdown({
      dailyRateUsd: booking.totalUsd,
      rentalDays: 1,
      deliveryRequested: Boolean(booking.deliveryRequested),
      deliveryRoundTripUsd,
      heavySurchargeUsd: booking.heavySurchargeUsd ?? 0,
      itemWeightLbs: booking.itemWeightLbs,
    });
  }, [booking]);

  const pickupMapsUrl = renterPickupLocation
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(renterPickupLocation)}`
    : undefined;

  const alreadyConfirmed = useMemo(() => {
    if (!booking) return false;
    if (mode === "pickup") return booking.status !== "pending_checkin";
    return booking.status === "completed" || Boolean(booking.returnConfirmedAt);
  }, [booking, mode]);

  const openScanner = () => {
    setNotice(null);
    setScanPhase("camera");
    setScanOpen(true);
  };

  const closeScanner = () => {
    setScanOpen(false);
    setScanPhase("camera");
  };

  const confirm = useCallback(() => {
    if (!booking) return;
    const latest = loadRentalBookings().find((b) => b.id === booking.id);
    if (!latest) return;

    if (mode === "pickup") {
      if (latest.status !== "pending_checkin") {
        setNotice("Already confirmed pickup for this booking.");
        closeScanner();
        return;
      }
      updateBooking(latest.id, {
        status: "active",
        pickupConfirmedAt: new Date().toISOString(),
      });
      setBookings(loadRentalBookings());
      setNotice("Pickup confirmed. Your rental is now active.");
      closeScanner();
      return;
    }

    if (latest.status === "completed" || latest.returnConfirmedAt) {
      setNotice("Already confirmed return for this booking.");
      closeScanner();
      return;
    }
    updateBooking(latest.id, {
      status: "completed",
      completedAt: new Date().toISOString(),
      returnConfirmedAt: new Date().toISOString(),
    });
    setBookings(loadRentalBookings());
    setNotice("Return confirmed. Thanks!");
    closeScanner();
    if (auth.userId && latest.counterpartyId && !hasLocalReview(latest.id, auth.userId)) {
      setReviewOpen(true);
    }
  }, [booking, mode]);

  const timeLeftLabel = useMemo(() => {
    if (!dispute?.evidenceDeadline) return null;
    const ms = new Date(dispute.evidenceDeadline).getTime() - Date.now();
    if (Number.isNaN(ms)) return null;
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    return `${h}h ${m}m`;
  }, [dispute?.evidenceDeadline]);

  return (
    <div className="screen bg-background flex flex-col">
      <div className="shrink-0 z-10 bg-card/80 backdrop-blur-sm border-b border-border px-3 sm:px-4 py-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-semibold flex-1">Active Rental</h1>
      </div>

      <div className="screen-scroll flex-1 min-h-0 p-3 sm:p-4 space-y-5 sm:space-y-6">
        {notice ? (
          <div className="bg-card rounded-xl border border-border p-3 text-sm">
            {notice}
          </div>
        ) : null}
        {overdueWarning ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            {overdueWarning}
          </div>
        ) : null}
        {canDispute ? (
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-bold text-gray-900">Open a dispute</p>
                <p className="mt-1 text-[13px] leading-relaxed text-gray-600">
                  Upload photo evidence. A 48h countdown is visible to both sides. Deposit is frozen during evidence collection.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    refreshDispute();
                    setDisputeOpen(true);
                  }}
                  className="mt-3 w-full rounded-xl border py-2.5 text-[14px] font-semibold"
                  style={{ borderColor: "#FDE68A", backgroundColor: "#FFFBEB", color: "#92400E" }}
                >
                  {dispute ? "View dispute" : "Start dispute"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="relative aspect-video bg-muted flex items-center justify-center text-5xl">
            {booking?.itemEmoji ?? "📦"}
          </div>

          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h2 className="font-bold text-lg mb-1">
                  {booking?.itemTitle ?? "Rental item"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {booking
                    ? `Rental period: ${new Date(booking.startDate).toLocaleDateString()} – ${new Date(
                        booking.endDate,
                      ).toLocaleDateString()}`
                    : "Rental period"}
                </p>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {booking?.status === "pending_checkin"
                    ? "Pending check-in"
                    : booking?.status === "active"
                      ? "Active"
                      : booking?.status === "overdue"
                        ? "Overdue"
                        : booking?.status ?? "Booking"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20 rounded-xl p-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-32 h-32 bg-white rounded-xl flex items-center justify-center mb-4 border-2 border-primary/10">
              <ScanLine className="w-16 h-16 text-primary" />
            </div>

            <h3 className="font-bold text-lg mb-2">
              {mode === "pickup" ? "Scan to check in" : "Scan to return"}
            </h3>

            <p className="text-sm text-muted-foreground mb-6 leading-relaxed max-w-xs">
              {mode === "pickup"
                ? "Find the QR code on the item and scan it to confirm pickup. You’ll also need the 6‑digit pickup PIN."
                : "Scan the item QR to confirm return. You’ll also need the 6‑digit return PIN."}
            </p>

            <button
              type="button"
              onClick={openScanner}
              className="w-full bg-primary hover:bg-primary/90 text-white py-3.5 rounded-xl transition-colors font-medium flex items-center justify-center gap-2"
            >
              📷 Scan QR Code
            </button>
          </div>
        </div>

        {renterPickupLocation ? (
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-primary" />
              <h3 className="font-semibold">Pickup location</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {booking?.role === "host"
                ? "Exact address is shared only with your confirmed renter — not on the public listing."
                : "This address is only for you as the confirmed renter — it is not shown on the public listing."}
            </p>
            <p className="mt-3 text-sm font-medium leading-relaxed">{renterPickupLocation}</p>
            {pickupMapsUrl ? (
              <a
                href={pickupMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                Open in Maps
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : null}
          </div>
        ) : null}

        {booking?.fulfillmentMethod === "contactless" && mode === "pickup" ? (
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-primary" />
              <h3 className="font-semibold">Contactless access</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Step-by-step access instructions and codes unlock at check-in with PIN — not
              before. Use the pickup address above to get here; scan the item QR when you
              arrive.
            </p>
            {booking.role === "renter" ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Tap <span className="font-medium">Scan QR Code</span>, then enter the pickup PIN
                to view lockbox codes and access steps.
              </p>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                Share the pickup PIN only with this renter. They unlock access details during
                check-in — the address is already visible on their rental screen.
              </p>
            )}
          </div>
        ) : null}

        {priceBreakdown ? (
          <RentalPriceBreakdownView breakdown={priceBreakdown} compact />
        ) : null}

        {booking?.fulfillmentMethod === "delivery" ? (
          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="font-semibold mb-2">Round-trip delivery</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              One delivery fee covers bringing the item before the rental starts and picking it
              up after it ends — not split 50/50 and not one-way host delivery with renter return.
            </p>
            {booking.deliveryFee ? (
              <p className="mt-2 text-sm font-medium">
                Round-trip delivery: ${formatUsd(booking.deliveryFee)}
              </p>
            ) : null}
            {booking.deliveryAddress ? (
              <p className="mt-2 text-sm">
                <span className="font-medium">Drop-off:</span> {booking.deliveryAddress}
              </p>
            ) : null}
          </div>
        ) : null}

        {booking ? (
          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="font-semibold mb-2">Security</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              QR is tied to the physical item. Confirmation requires a stage-specific PIN to prevent random scans.
            </p>
            {booking.role === "host" ? (
              <div className="mt-3 rounded-lg bg-muted p-3 text-sm">
                <div className="font-medium">
                  {mode === "pickup" ? "Pickup PIN" : "Return PIN"}:{" "}
                  <span className="font-mono tracking-widest">
                    {mode === "pickup" ? booking.pickupPin ?? "—" : booking.returnPin ?? "—"}
                  </span>
                </div>
                <div className="text-muted-foreground text-xs mt-1">
                  Share this PIN only with the renter on this booking.
                </div>
              </div>
            ) : (
              <div className="mt-3 rounded-lg bg-muted p-3 text-sm">
                Ask the host for the{" "}
                <span className="font-medium">{mode === "pickup" ? "pickup" : "return"}</span>{" "}
                PIN, then enter it after scanning.
              </div>
            )}
          </div>
        ) : null}

        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold flex-1">Auto-Insurance</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-xs text-muted-foreground">
                Activates on check-in
              </span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Full coverage activates when you scan the QR code. Protects against
            accidental damage, theft, and loss during your rental period.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Owner contact</h3>

          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-sm font-medium text-primary">
                JD
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold">John Davis</span>
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">Verified owner</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button className="flex items-center justify-center gap-2 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors">
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Message</span>
              </button>

              <button className="flex items-center justify-center gap-2 py-2.5 border border-border hover:bg-muted rounded-lg transition-colors">
                <Phone className="w-4 h-4" />
                <span className="text-sm font-medium">Call</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-muted/50 rounded-xl p-4">
          <h3 className="font-semibold mb-2">Before you check in</h3>

          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Inspect the item for any existing damage</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Take photos if needed for your records</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Review the return date and location</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Ask the owner any questions you have</span>
            </li>
          </ul>
        </div>
      </div>

      {booking ? (
        <QrScanPanel
          open={scanOpen}
          phase={scanPhase}
          mode={mode}
          itemTitle={booking.itemTitle}
          itemEmoji={booking.itemEmoji}
          expectedCode={booking.itemQrToken}
          expectedPin={mode === "pickup" ? booking.pickupPin : booking.returnPin}
          contactlessInstructions={
            booking.fulfillmentMethod === "contactless"
              ? booking.contactlessInstructions
              : undefined
          }
          alreadyConfirmed={alreadyConfirmed}
          returnByLabel={booking.returnDueAt ? new Date(booking.returnDueAt).toLocaleString() : undefined}
          onClose={closeScanner}
          onScanned={() => setScanPhase("confirm")}
          onConfirm={confirm}
          onManualCode={() => setScanPhase("confirm")}
          onOwnerManualConfirm={() => setScanPhase("confirm")}
          isHost={booking.role === "host"}
        />
      ) : null}

      {booking && auth.userId ? (
        <ReviewPromptModal
          open={reviewOpen}
          title={`for ${booking.counterpartyName}`}
          onClose={() => setReviewOpen(false)}
          onSubmit={(rating, comment) => {
            void submitReviewRemote({
              rentalId: booking.id,
              reviewerId: auth.userId,
              revieweeId: booking.counterpartyId,
              role: booking.role === "renter" ? "renter" : "host",
              rating,
              comment,
            }).finally(() => setReviewOpen(false));
          }}
        />
      ) : null}

      {booking && auth.userId && disputeOpen ? (
        <div className="fixed inset-0 z-[96] flex items-end justify-center bg-black/45 p-4">
          <div className="w-full max-w-[420px] rounded-3xl border bg-white p-5 shadow-2xl" style={{ borderColor: "#E8E6E0" }}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-[18px] font-extrabold" style={{ color: "#0D5C3A" }}>
                  Dispute evidence
                </h2>
                <p className="mt-0.5 text-[13px] text-gray-500">
                  48h window · {timeLeftLabel ? `${timeLeftLabel} left` : "countdown running"}
                </p>
              </div>
              <button type="button" onClick={() => setDisputeOpen(false)} className="text-gray-500">
                ✕
              </button>
            </div>

            <div className="mt-3">
              <RentanoTip message="Rentano: Take clear photos of the item, any damage, and accessories. Include the QR sticker in one photo if possible." />
            </div>

            <div className="mt-3 rounded-2xl border bg-[#FFFBEB] p-3 text-[12px] text-amber-900" style={{ borderColor: "#FDE68A" }}>
              <strong>Deposit frozen</strong> while evidence is collected.
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  if (dispute) return;
                  void openDisputeRemote({ rentalId: booking.id, openedBy: auth.userId }).then((d) => {
                    setDispute(d);
                    updateBooking(booking.id, { status: "disputed", disputeEvidenceDeadline: d.evidenceDeadline, paymentOnHold: true });
                    setBookings(loadRentalBookings());
                  });
                }}
                className="flex-1 rounded-2xl px-4 py-3 text-[13px] font-bold text-white disabled:opacity-60"
                style={{ backgroundColor: "#0D5C3A" }}
                disabled={Boolean(dispute)}
              >
                {dispute ? "Dispute opened" : "Start dispute"}
              </button>
              <label
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl border bg-white px-4 py-3 text-[13px] font-semibold text-gray-700"
                style={{ borderColor: "#E8E6E0" }}
              >
                <Upload className="h-4 w-4" />
                Add photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (!file || !dispute) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      const dataUrl = typeof reader.result === "string" ? reader.result : null;
                      if (!dataUrl) return;
                      const side = booking.role === "renter" ? "renter" : "owner";
                      void addEvidenceRemote({ dispute, side, dataUrl }).then(setDispute);
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
            </div>

            {dispute ? (
              <div className="mt-4">
                <p className="text-[12px] font-semibold uppercase tracking-wide text-gray-400">Evidence</p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {[...(dispute.renterEvidence ?? []), ...(dispute.ownerEvidence ?? [])].slice(0, 6).map((src, idx) => (
                    <img key={idx} src={src} alt="" className="h-20 w-full rounded-xl object-cover" />
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-gray-400">Visible to both sides</p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
