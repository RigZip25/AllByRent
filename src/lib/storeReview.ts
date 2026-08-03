import { InAppReview } from "@capacitor-community/in-app-review";
import { isNativeApp } from "./nativeShell";

/**
 * Ask the OS to show the native App Store / Play review dialog.
 * Call after a clearly positive moment (successful listing, paid rental, etc.).
 * Platforms rate-limit how often the dialog can appear.
 */
export async function requestStoreReview(): Promise<boolean> {
  if (!isNativeApp()) return false;
  try {
    await InAppReview.requestReview();
    return true;
  } catch {
    return false;
  }
}
