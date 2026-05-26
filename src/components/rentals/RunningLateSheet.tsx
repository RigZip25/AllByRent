import { useState } from "react";
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
  const [message, setMessage] = useState("I'm running a bit late, be there soon.");

  if (!open) return null;

  const send = () => {
    updateBooking(bookingId, {
      runningLateMessage: message,
      runningLateSentAt: new Date().toISOString(),
      runningLateAcknowledged: false,
    });
    pushInAppNotification({
      type: "running_late",
      title: "Renter running late",
      body: `${message} — tap to acknowledge and pause no-show timer.`,
    });
    onSent();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[85] flex items-end bg-black/50 p-4">
      <div className="w-full max-w-[400px] rounded-2xl bg-white p-5 mx-auto">
        <h2 className="text-[17px] font-bold" style={{ color: GREEN }}>
          Send a message to {ownerName}?
        </h2>
        <p className="mt-1 text-[13px] text-gray-500">
          They&apos;ll get a push and in-app message. If they reply OK, the no-show timer resets.
        </p>
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
            Cancel
          </button>
          <button
            type="button"
            onClick={send}
            className="flex-1 rounded-xl py-2.5 text-[14px] font-bold text-white"
            style={{ backgroundColor: CTA }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
