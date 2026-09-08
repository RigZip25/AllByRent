/**
 * LIFO registry for modal/sheet overlays that should consume Back before
 * screen navigation (AuthGate, discard dialogs, location/phone/bid sheets).
 */

type OverlayEntry = {
  id: string;
  close: () => void;
};

const stack: OverlayEntry[] = [];

/** Register an open overlay. Replaces any prior entry with the same id. */
export function pushOverlay(id: string, close: () => void): void {
  const key = id.trim();
  if (!key) return;
  const existing = stack.findIndex((entry) => entry.id === key);
  if (existing >= 0) {
    stack.splice(existing, 1);
  }
  stack.push({ id: key, close });
}

/** Remove an overlay without calling close (component already closing). */
export function removeOverlay(id: string): void {
  const key = id.trim();
  if (!key) return;
  const index = stack.findIndex((entry) => entry.id === key);
  if (index >= 0) {
    stack.splice(index, 1);
  }
}

/**
 * Close the topmost overlay if any.
 * @returns true when an overlay consumed the back press
 */
export function popOverlay(): boolean {
  const top = stack.pop();
  if (!top) return false;
  try {
    top.close();
  } catch {
    /* ignore close failures */
  }
  return true;
}

export function hasOverlay(): boolean {
  return stack.length > 0;
}

/** Test helper — clear the module stack between cases. */
export function clearOverlayStackForTests(): void {
  stack.length = 0;
}
