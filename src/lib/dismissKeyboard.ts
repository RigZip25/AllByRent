import { Capacitor } from "@capacitor/core";
import { Keyboard } from "@capacitor/keyboard";

/** Blur focused input and hide the native soft keyboard when present. */
export async function dismissNativeKeyboard(): Promise<void> {
  if (typeof document !== "undefined") {
    const active = document.activeElement;
    if (active instanceof HTMLElement) {
      active.blur();
    }
  }

  if (!Capacitor.isNativePlatform()) return;

  try {
    await Keyboard.hide();
  } catch {
    /* Keyboard plugin unavailable */
  }
}
