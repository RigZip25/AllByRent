import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { pushOverlay, removeOverlay } from "../../lib/overlayBackStack";

type AccessibleBottomSheetProps = {
  open: boolean;
  onClose: () => void;
  /** Stable id for the overlay back stack. */
  overlayId: string;
  title: string;
  children: ReactNode;
  /** Optional labelled-by override; defaults to generated title id. */
  labelledBy?: string;
  className?: string;
  panelClassName?: string;
  showClose?: boolean;
  closeAriaLabel?: string;
};

/**
 * Bottom sheet with dialog semantics, Escape, scroll lock, and back-stack
 * registration. Focus moves to the panel on open and restores on close
 * (Stage 17 / X3).
 */
export function AccessibleBottomSheet({
  open,
  onClose,
  overlayId,
  title,
  children,
  labelledBy,
  className = "",
  panelClassName = "",
  showClose = true,
  closeAriaLabel = "Close",
}: AccessibleBottomSheetProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previousFocus.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    pushOverlay(overlayId, onClose);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    // Defer focus so the panel is in the DOM.
    const t = window.setTimeout(() => {
      panelRef.current?.focus();
    }, 0);
    return () => {
      window.clearTimeout(t);
      removeOverlay(overlayId);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
      previousFocus.current?.focus?.();
    };
  }, [open, onClose, overlayId]);

  if (!open) return null;

  const labelId = labelledBy ?? titleId;

  return (
    <div
      className={`fixed inset-0 z-[120] flex flex-col justify-end bg-black/45 ${className}`}
      role="presentation"
    >
      <button
        type="button"
        className="min-h-0 w-full flex-1 cursor-default"
        aria-label={closeAriaLabel}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        tabIndex={-1}
        className={`relative mx-auto flex max-h-[min(92dvh,720px)] w-full max-w-[430px] flex-col rounded-t-3xl border border-border bg-card shadow-2xl outline-none ${panelClassName}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <h2 id={titleId} className="text-[17px] font-bold text-gray-900">
            {title}
          </h2>
          {showClose ? (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
              aria-label={closeAriaLabel}
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          ) : null}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">
          {children}
        </div>
      </div>
    </div>
  );
}
