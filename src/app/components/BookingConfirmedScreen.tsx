import { CheckCircle2, ChevronRight } from "lucide-react";

const GREEN = "#0D5C3A";
const BORDER = "#E8E6E0";

export function BookingConfirmedScreen({
  onHome,
  onRentals,
}: {
  onHome: () => void;
  onRentals: () => void;
}) {
  return (
    <div className="screen bg-background flex flex-col">
      <div className="screen-scroll flex-1 min-h-0 p-5 pb-24">
        <div
          className="mx-auto max-w-[420px] rounded-3xl border bg-white p-6 text-center"
          style={{ borderColor: BORDER }}
        >
          <CheckCircle2 className="mx-auto h-12 w-12" style={{ color: GREEN }} />
          <h1 className="mt-3 text-[20px] font-extrabold" style={{ color: GREEN }}>
            Booking request sent
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed text-gray-600">
            The owner gets notified and will confirm availability. You’ll see status updates in
            Rentals.
          </p>

          <div className="mt-5 grid gap-2">
            <button
              type="button"
              onClick={onRentals}
              className="flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-[14px] font-bold text-white"
              style={{ backgroundColor: GREEN }}
            >
              View Rentals
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onHome}
              className="w-full rounded-2xl border bg-white px-4 py-3 text-[14px] font-semibold text-gray-700"
              style={{ borderColor: BORDER }}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

