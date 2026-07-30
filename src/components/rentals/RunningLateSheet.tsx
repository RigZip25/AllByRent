import { useEffect, useState } from "react";
import { useMessages } from "../../lib/i18n/react";
import { pushInAppNotification } from "../../lib/inAppNotifications";
import { updateBooking } from "../../lib/rentalsStorage";

const GREEN = "#0D5C3A";
const CTA = "#F59E0B";

export function RunningLateSheet({
  open,
  bookingId,
  ownerName,
  onClose,
  onSent,
}: {
  open: boolean;
  bookingId: string;
  ownerName: string;
  onClose: () => void;
  onSent: () => void;
}) {
  const { rentalCard: t, common } = useMessages();
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (open) setMessage(t.runningLateDefault);
  }, [open, t.runningLateDefault]);

  if (!open) return null;

  const send = () => {
    updateBooking(bookingId, {
      runningLateMessage: message,
      runningLateSentAt: new Date().toISOString(),
      runningLateAcknowledged: false,
    });
    pushInAppNotification({
      type: "running_late",
      title: t.runningLateNotifTitle,
      body: t.runningLateNotifBody(message),
    });
    onSent();
    onClose();
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
          {t.runningLateTitle(ownerName)}
        </h2>
        <p className="mt-1 text-[13px] text-gray-500">{t.runningLateBody}</p>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          className="mt-3 w-full rounded-xl border px-3 py-2 text-[14px]"
          style={{ borderColor: "#E8E6E0" }}
        />
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border py-2.5 text-[14px] font-semibold text-gray-500"
          >
            {common.cancel}
          </button>
          <button
            type="button"
            onClick={send}
            className="flex-1 rounded-xl py-2.5 text-[14px] font-bold text-white"
            style={{ backgroundColor: CTA }}
          >
            {common.send}
          </button>
        </div>
      </div>
    </div>
  );
}
