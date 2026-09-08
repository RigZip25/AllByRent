import { useEffect } from "react";
import { pushOverlay, removeOverlay } from "./overlayBackStack";

/**
 * Escape, body scroll lock, and optional back-stack registration for custom
 * overlays that are not yet migrated to AccessibleBottomSheet (Stage 17 / X3).
 */
export function useAccessibleOverlay(
  open: boolean,
  onClose: () => void,
  overlayId?: string,
) {
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (overlayId) pushOverlay(overlayId, onClose);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      if (overlayId) removeOverlay(overlayId);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, overlayId]);
}
