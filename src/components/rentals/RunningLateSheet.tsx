import { useEffect, useState } from "react";
import { useMessages } from "../../lib/i18n/react";
import { createNotificationRemote } from "../../lib/notificationsStorage";
import { updateBooking, type RentalBooking } from "../../lib/rentalsStorage";

const GREEN = "#0D5C3A";
const CTA = "#F59E0B";

/**
 * The renter's heads-up before a pickup.
 *
 * It used to raise an in-app notification on the sender's own phone — the one
 * person who already knew — while the host waited and the no-show clock ran.
 * The note goes on the rental now, which is what both sides read, and the
 * database gives the renter an hour of grace off the no-show when it lands.
 */
export function RunningLateSheet({
  open,
  booking,
  onClose,
  onSent,
}: {
  open: boolean;
  booking: RentalBooking;
  onClose: () => void;
  onSent: () => void;
}) {
  const { rentalCard: t, common } = useMessages();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open) setMessage(t.runningLateDefault);
  }, [open, t.runningLateDefault]);

  if (!open) return null;

  const send = async () => {
    setSending(true);
    const note = message.trim().slice(0, 500) || t.runningLateDefault;
    try {
      updateBooking(booking.id, {
        runningLateMessage: note,
        runningLateSentAt: new Date().toISOString(),
        runningLateAcknowledged: false,
      });
      await createNotificationRemote({
        recipientId: booking.counterpartyId,
        actorId: null,
        type: "general",
        title: t.runningLateNotifTitle,
        body: t.runningLateNotifBody(note),
        rentalId: booking.id,
        listingId: booking.listingId,
        // The host is the one who needs telling; a toast here would be the bug.
        skipLocal: true,
      });
    } finally {
      setSending(false);
      onSent();
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[85] flex items-end bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[400px] rounded-2xl bg-white p-5 mx-auto"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="text-[17px] font-bold" style={{ color: GREEN }}>
          {t.runningLateTitle(booking.counterpartyName)}
        </h2>
        <p className="mt-1 text-[13px] text-gray-500">{t.runningLateBody}</p>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          maxLength={500}
          className="mt-3 w-full rounded-xl border px-3 py-2 text-[14px]"
          style={{ borderColor: "#E8E6E0" }}
        />
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={sending}
            className="flex-1 rounded-xl border py-2.5 text-[14px] font-semibold text-gray-500 disabled:opacity-60"
          >
            {common.cancel}
          </button>
          <button
            type="button"
            onClick={() => void send()}
            disabled={sending}
            className="flex-1 rounded-xl py-2.5 text-[14px] font-bold text-white disabled:opacity-60"
            style={{ backgroundColor: CTA }}
          >
            {common.send}
          </button>
        </div>
      </div>
    </div>
  );
}
