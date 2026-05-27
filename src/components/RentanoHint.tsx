import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import rentanoImg from "../imports/No_back_rentano.png";

const PRIMARY_GREEN = "#0D5C3A";

export function RentanoHint({
  hint,
  className = "",
  size = 48,
  linkText,
  linkUrl,
  showTapLabel = false,
}: {
  hint: ReactNode;
  className?: string;
  size?: number;
  linkText?: string;
  linkUrl?: string;
  /** When true, shows “Tap Rentano for a hint” beside the avatar while collapsed. */
  showTapLabel?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const pointerDownRef = useRef<{ x: number; y: number; target: EventTarget | null } | null>(null);
  const hintId = useId();

  // Treat outside tap as dismiss, but ignore drag/scroll gestures.
  // This keeps page scrolling fluid while hint is open on touch devices.
  useEffect(() => {
    if (!open) return;

    const TAP_MOVE_THRESHOLD_PX = 8;

    const onPointerDown = (event: PointerEvent) => {
      pointerDownRef.current = { x: event.clientX, y: event.clientY, target: event.target };
    };

    const onPointerUp = (event: PointerEvent) => {
      const start = pointerDownRef.current;
      pointerDownRef.current = null;
      if (!start) return;

      const movedX = Math.abs(event.clientX - start.x);
      const movedY = Math.abs(event.clientY - start.y);
      const movedTooMuch = movedX > TAP_MOVE_THRESHOLD_PX || movedY > TAP_MOVE_THRESHOLD_PX;
      if (movedTooMuch) return;

      const root = rootRef.current;
      if (!root) return;
      const downInside = start.target instanceof Node ? root.contains(start.target) : false;
      const upInside = event.target instanceof Node ? root.contains(event.target) : false;
      if (!downInside && !upInside) {
        setOpen(false);
      }
    };

    const onPointerCancel = () => {
      pointerDownRef.current = null;
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("pointercancel", onPointerCancel);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("pointercancel", onPointerCancel);
    };
  }, [open]);

  // Fallback for older non-pointer environments.
  useEffect(() => {
    if (!open || "PointerEvent" in window) return;

    const close = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", close);
    return () => {
      document.removeEventListener("mousedown", close);
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [hint]);

  return (
    <div ref={rootRef} className={`relative ${className}`} style={{ zIndex: open ? 20 : undefined }}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={hintId}
          aria-label={open ? "Hide Rentano hint (currently open)" : "Show Rentano hint (currently closed)"}
          className="rentano-hint-button shrink-0 overflow-hidden rounded-full transition-transform active:scale-95"
          style={{
            ["--rentano-hint-size" as string]: `${size}px`,
            border: `2px solid ${PRIMARY_GREEN}`,
          }}
        >
          <img
            src={rentanoImg}
            alt=""
            className="h-full w-full object-cover"
            draggable={false}
          />
        </button>
        {(showTapLabel || !open) && !open ? (
          <p className="text-xs italic text-gray-500">Tap Rentano for tips</p>
        ) : null}
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            id={hintId}
            role="tooltip"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 right-0 top-full z-20 mt-2 rounded-2xl border px-3.5 py-2.5 shadow-sm"
            style={{ backgroundColor: "#F0FDF4", borderColor: PRIMARY_GREEN }}
          >
            <div className="mb-1.5 flex items-start justify-between gap-2">
              <div className="text-base italic leading-snug text-[#374151]">{hint}</div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close Rentano hint"
                className="shrink-0 rounded px-1 text-lg leading-none text-[#4B5563] transition-colors hover:text-[#111827]"
              >
                ×
              </button>
            </div>
            <p className="text-xs italic text-gray-500">Tap Rentano again to close</p>
            {linkText && linkUrl ? (
              <button
                type="button"
                onClick={() => window.open(linkUrl, "_blank")}
                className="mt-1.5 block cursor-pointer text-left text-sm font-medium text-green-700 underline not-italic"
              >
                {linkText}
              </button>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
