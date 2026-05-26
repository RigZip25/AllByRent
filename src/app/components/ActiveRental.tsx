import {
  ArrowLeft,
  ScanLine,
  Shield,
  MessageCircle,
  Phone,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useMemo, useState, useCallback } from "react";
import {
  loadRentalBookings,
  updateBooking,
  type RentalBooking,
} from "../../lib/rentalsStorage";
import { QrScanPanel, type QrScanPhase } from "../../components/rentals/QrScanPanel";

export function ActiveRental({ onBack }: { onBack: () => void }) {
  const [scanOpen, setScanOpen] = useState(false);
  const [scanPhase, setScanPhase] = useState<QrScanPhase>("camera");
  const [notice, setNotice] = useState<string | null>(null);
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

  const mode: "pickup" | "return" =
    booking?.status === "pending_checkin" ? "pickup" : "return";

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
  }, [booking, mode]);

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
    </div>
  );
}
